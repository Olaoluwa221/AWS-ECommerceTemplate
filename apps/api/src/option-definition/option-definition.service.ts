import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
    Model,
    Types,
} from 'mongoose';

import { CreateOptionDefinitionDto } from './dto/create-option-definition.dto';
import { UpdateOptionDefinitionDto } from './dto/update-option-definition.dto';
import { OptionDefinition, OptionDefinitionDocument } from './schema/option-definition.schema';

@Injectable()
export class OptionDefinitionService {
    constructor(
        @InjectModel(OptionDefinition.name)
        private readonly optionDefinitionModel:
            Model<OptionDefinitionDocument>,
    ) { }

    // Clean up the input, check it, and save the new option definition.
    async create(
        createOptionDefinitionDto: CreateOptionDefinitionDto,
    ): Promise<OptionDefinitionDocument> {
        const name = this.normalizeName(
            createOptionDefinitionDto.name,
        );

        const displayName = this.normalizeDisplayName(
            createOptionDefinitionDto.displayName,
        );

        const allowedValues = this.normalizeAllowedValues(
            createOptionDefinitionDto.allowedValues,
        );

        await this.validateUniqueName(name);

        const optionDefinition =
            new this.optionDefinitionModel({
                name,
                key: name,
                displayName,
                allowedValues,
            });

        return this.saveOptionDefinition(optionDefinition);
    }

    // Update only the fields provided.
    async update(
        id: string,
        updateOptionDefinitionDto: UpdateOptionDefinitionDto,
    ): Promise<OptionDefinitionDocument> {
        const optionDefinition =
            await this.findByIdOrThrow(id);

        if (
            updateOptionDefinitionDto.displayName !==
            undefined
        ) {
            optionDefinition.displayName =
                this.normalizeDisplayName(
                    updateOptionDefinitionDto.displayName,
                );
        }

        if (
            updateOptionDefinitionDto.allowedValues !==
            undefined
        ) {
            optionDefinition.allowedValues =
                this.normalizeAllowedValues(
                    updateOptionDefinitionDto.allowedValues,
                );
        }

        return this.saveOptionDefinition(
            optionDefinition,
        );
    }

    // List the option definitions in display-name order.
    async findAll(): Promise<OptionDefinitionDocument[]> {
        return this.optionDefinitionModel
            .find()
            .sort({
                displayName: 1,
                isActive: -1,
            })
            .exec();
    }

    // Look up an option definition by name and fail clearly when it is missing.
    async findByName(
        name: string,
    ): Promise<OptionDefinitionDocument> {
        const normalizedName = this.normalizeName(name);

        const optionDefinition =
            await this.optionDefinitionModel
                .findOne({
                    name: normalizedName,
                })
                .exec();

        if (!optionDefinition) {
            throw new NotFoundException(
                `Option definition "${normalizedName}" not found.`,
            );
        }

        return optionDefinition;
    }

    // Mark an option definition inactive without removing its data.
    async deactivate(id: string): Promise<OptionDefinitionDocument> {
        const optionDefinition = await this.findByIdOrThrow(id);

        if (!optionDefinition.isActive) {
            return optionDefinition;
        }

        optionDefinition.isActive = false;
        return this.saveOptionDefinition(optionDefinition);
    }

    // Make a previously inactive option definition available again.
    async reactivate(id: string): Promise<OptionDefinitionDocument> {
        const optionDefinition = await this.findByIdOrThrow(id);

        if (optionDefinition.isActive) {
            return optionDefinition;
        }

        optionDefinition.isActive = true;
        return this.saveOptionDefinition(optionDefinition);
    }

    // Permanently remove an inactive option definition.
    async remove(id: string): Promise<void> {
        const optionDefinition = await this.findByIdOrThrow(id);

        if (optionDefinition.isActive) {
            throw new ConflictException(
                'Option definition must be deactivated before it can be permanently deleted.',
            );
        }

        await optionDefinition.deleteOne();
    }

    // Turn a name into a consistent identifier and reject names with no usable characters.
    private normalizeName(name: string): string {
        const normalizedName = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!normalizedName) {
            throw new BadRequestException(
                'Option definition name must contain letters or numbers.',
            );
        }

        return normalizedName;
    }

    // Remove surrounding whitespace and make sure a display name was provided.
    private normalizeDisplayName(
        displayName: string,
    ): string {
        const normalizedDisplayName =
            displayName.trim();

        if (!normalizedDisplayName) {
            throw new BadRequestException(
                'Display name cannot be empty.',
            );
        }

        return normalizedDisplayName;
    }

    // Clean up the allowed values and make sure they are non-empty and unique.
    private normalizeAllowedValues(
        values: string[],
    ): string[] {
        const normalizedValues = values.map(
            value => value.trim(),
        );

        if (
            normalizedValues.some(
                value => value.length === 0,
            )
        ) {
            throw new BadRequestException(
                'allowedValues cannot contain empty values.',
            );
        }

        // Treat values with different casing as duplicates, but keep the original casing.
        const comparisonValues =
            normalizedValues.map(
                value => value.toLowerCase(),
            );

        const uniqueValues =
            new Set(comparisonValues);

        if (
            uniqueValues.size !==
            normalizedValues.length
        ) {
            throw new BadRequestException(
                'allowedValues must contain unique values.',
            );
        }

        return normalizedValues;
    }

    // Make sure this name is not already used by another option definition.
    private async validateUniqueName(
        name: string,
        excludeOptionDefinitionId?: Types.ObjectId,
    ): Promise<void> {
        const query: {
            name: string;
            _id?: {
                $ne: Types.ObjectId;
            };
        } = {
            name,
        };

        if (excludeOptionDefinitionId) {
            query._id = {
                $ne: excludeOptionDefinitionId,
            };
        }

        const existingOptionDefinition =
            await this.optionDefinitionModel.exists(
                query,
            );

        if (existingOptionDefinition) {
            throw new ConflictException(
                `Option definition "${name}" already exists.`,
            );
        }
    }

    // Check the ID and return the matching option definition.
    private async findByIdOrThrow(
        id: string,
    ): Promise<OptionDefinitionDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                `Invalid option definition id "${id}".`,
            );
        }

        const optionDefinition =
            await this.optionDefinitionModel
                .findById(id)
                .exec();

        if (!optionDefinition) {
            throw new NotFoundException(
                `Option definition with id "${id}" not found.`,
            );
        }

        return optionDefinition;
    }

    // Save the document and turn duplicate-name errors into a useful API response.
    private async saveOptionDefinition(
        optionDefinition: OptionDefinitionDocument,
    ): Promise<OptionDefinitionDocument> {
        try {
            return await optionDefinition.save();
        } catch (error) {
            if (
                (error as { code?: number }).code ===
                11000
            ) {
                throw new ConflictException(
                    `Option definition "${optionDefinition.name}" already exists.`,
                );
            }

            throw error;
        }
    }
}