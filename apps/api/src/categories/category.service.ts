import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
        const name = createCategoryDto.name;
        const slug = this.createSlug(name)

        // Validate slug format
        if (!slug) {
            throw new BadRequestException(
                'Category name must contain letters or numbers.',
            );
        }

        //Validate unique category
        const existingCategory = await this.categoryModel.exists({
            slug,
        });

        if (existingCategory) {
            throw new ConflictException(
                `Category "${name}" already exists.`,
            );
        }

        let parentCategoryId: Types.ObjectId | null = null;

        if (createCategoryDto.parentCategory) {
            const parentExists = await this.categoryModel.exists({
                _id: createCategoryDto.parentCategory,
            });

            if (!parentExists) {
                throw new NotFoundException(
                    `Parent category with id ${createCategoryDto.parentCategory} not found.`,
                );
            }

            parentCategoryId = new Types.ObjectId(
                createCategoryDto.parentCategory,
            );
        }


        const category = new this.categoryModel({
            name,
            slug,
            description:
                createCategoryDto.description?.trim() || undefined,
            parentCategoryId,
        });

        try {
            return await category.save();
        } catch (error) {
            if ((error as { code?: number }).code === 11000) {
                throw new ConflictException(
                    `Category "${name}" already exists.`,
                );
            }

            throw error;
        }
    }

    private createSlug(name: string): string {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
