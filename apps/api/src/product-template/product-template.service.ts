import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductTemplate, ProductTemplateDocument } from './schema/product-template.schema.js';
import { CreateProductTemplateDto } from './dto/create-product-template.dto.js';
import { OptionDefinitionService } from '../option-definition/option-definition.service.js';
import { UpdateProductTemplateDto } from './dto/update-product-template.dto.js';

@Injectable()
export class ProductTemplateService {
    constructor(
        @InjectModel(ProductTemplate.name)
        private readonly productTemplateModel: Model<ProductTemplateDocument>,
        private readonly optionDefinitionService: OptionDefinitionService,
    ) { }

    async create(
        createProductTemplateDto:
            CreateProductTemplateDto,
    ): Promise<ProductTemplateDocument> {
        const name = this.normalizeName(
            createProductTemplateDto.name,
        );

        const images = this.normalizeImages(
            createProductTemplateDto.images ?? [],
        );

        const options =
            await this.optionDefinitionService
                .resolveActiveIds(
                    createProductTemplateDto.options ??
                    [],
                );

        await this.validateUniqueName(name);

        const productTemplate =
            new this.productTemplateModel({
                name,
                images,
                options,
            });

        return this.saveProductTemplate(
            productTemplate,
        );
    }

    async findAll(): Promise<ProductTemplateDocument[]> {
        return this.productTemplateModel
            .find()
            .sort({
                isActive: -1,
                name: 1,
            })
            .exec();
    }

    async findById(
        id: string,
    ): Promise<ProductTemplateDocument> {
        return this.findByIdOrThrow(id);
    }

    async update(
        id: string,
        updateProductTemplateDto:
            UpdateProductTemplateDto,
    ): Promise<ProductTemplateDocument> {
        const productTemplate =
            await this.findByIdOrThrow(id);

        if (
            updateProductTemplateDto.name !==
            undefined
        ) {
            const name = this.normalizeName(
                updateProductTemplateDto.name,
            );

            if (name !== productTemplate.name) {
                await this.validateUniqueName(
                    name,
                    productTemplate._id,
                );
            }

            productTemplate.name = name;
        }

        if (
            updateProductTemplateDto.images !==
            undefined
        ) {
            productTemplate.images =
                this.normalizeImages(
                    updateProductTemplateDto.images,
                );
        }

        if (
            updateProductTemplateDto.options !==
            undefined
        ) {
            productTemplate.options =
                await this.optionDefinitionService
                    .resolveActiveIds(
                        updateProductTemplateDto.options,
                    );
        }

        return this.saveProductTemplate(
            productTemplate,
        );
    }

    async deactivate(
        id: string,
    ): Promise<ProductTemplateDocument> {
        const productTemplate =
            await this.findByIdOrThrow(id);

        if (!productTemplate.isActive) {
            return productTemplate;
        }

        productTemplate.isActive = false;

        return this.saveProductTemplate(
            productTemplate,
        );
    }

    async reactivate(
        id: string,
    ): Promise<ProductTemplateDocument> {
        const productTemplate =
            await this.findByIdOrThrow(id);

        if (productTemplate.isActive) {
            return productTemplate;
        }

        /*
         * Revalidate its options before allowing
         * reactivation. One may have been deactivated
         * while this template was inactive.
         */
        await this.optionDefinitionService
            .resolveActiveIds(
                productTemplate.options.map(
                    option => option.toString(),
                ),
            );

        productTemplate.isActive = true;

        return this.saveProductTemplate(
            productTemplate,
        );
    }

    async remove(
        id: string,
    ): Promise<void> {
        const productTemplate =
            await this.findByIdOrThrow(id);

        if (productTemplate.isActive) {
            throw new ConflictException(
                'Product template must be deactivated before it can be permanently deleted.',
            );
        }

        /*
         * Once Products are Mongo-backed, add:
         *
         * "Cannot delete while a Product references
         * this ProductTemplate."
         */

        await productTemplate.deleteOne();
    }

    private normalizeName(
        name: string,
    ): string {
        const normalizedName = name.trim();

        if (!normalizedName) {
            throw new BadRequestException(
                'Product template name cannot be empty.',
            );
        }

        return normalizedName;
    }

    private normalizeImages(
        images: string[],
    ): string[] {
        const normalizedImages =
            images.map(image => image.trim());

        if (
            normalizedImages.some(
                image => !image,
            )
        ) {
            throw new BadRequestException(
                'images cannot contain empty values.',
            );
        }

        if (
            new Set(normalizedImages).size !==
            normalizedImages.length
        ) {
            throw new BadRequestException(
                'images must contain unique values.',
            );
        }

        return normalizedImages;
    }

    private async validateUniqueName(
        name: string,
        excludeProductTemplateId?:
            Types.ObjectId,
    ): Promise<void> {
        const query: {
            name: string;
            _id?: {
                $ne: Types.ObjectId;
            };
        } = {
            name,
        };

        if (excludeProductTemplateId) {
            query._id = {
                $ne: excludeProductTemplateId,
            };
        }

        const existingProductTemplate =
            await this.productTemplateModel
                .exists(query);

        if (existingProductTemplate) {
            throw new ConflictException(
                `Product template "${name}" already exists.`,
            );
        }
    }

    private async findByIdOrThrow(
        id: string,
    ): Promise<ProductTemplateDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                `Invalid product template id "${id}".`,
            );
        }

        const productTemplate =
            await this.productTemplateModel
                .findById(id)
                .exec();

        if (!productTemplate) {
            throw new NotFoundException(
                `Product template with id "${id}" not found.`,
            );
        }

        return productTemplate;
    }

    private async saveProductTemplate(
        productTemplate:
            ProductTemplateDocument,
    ): Promise<ProductTemplateDocument> {
        try {
            return await productTemplate.save();
        } catch (error) {
            if (
                (error as { code?: number })
                    .code === 11000
            ) {
                throw new ConflictException(
                    `Product template "${productTemplate.name}" already exists.`,
                );
            }

            throw error;
        }
    }
}
