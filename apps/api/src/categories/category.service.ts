import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema.js';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>,
    ) { }

    // Create a category
    async create(
        createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryDocument> {
        const { name, slug } =
            this.prepareNameAndSlug(createCategoryDto.name);

        await this.validateUniqueSlug(name, slug);

        const parentCategory =
            await this.resolveParentCategory(
                createCategoryDto.parentCategory,
            );

        const category = new this.categoryModel({
            name,
            slug,
            description: this.normalizeDescription(
                createCategoryDto.description,
            ),
            parentCategory,
        });

        return this.saveCategory(category);
    }

    // Update a category
    async update(
        id: string,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryDocument> {
        const category = await this.findByIdOrThrow(id);

        if (updateCategoryDto.name !== undefined) {
            const { name, slug } =
                this.prepareNameAndSlug(updateCategoryDto.name);

            await this.validateUniqueSlug(
                name,
                slug,
                category._id,
            );

            category.name = name;
            category.slug = slug;
        }

        if (updateCategoryDto.description !== undefined) {
            category.description = this.normalizeDescription(
                updateCategoryDto.description,
            );
        }

        return this.saveCategory(category);
    }

    // Generate name and slug
    private prepareNameAndSlug(name: string): {
        name: string;
        slug: string;
    } {
        const normalizedName = name.trim();
        const slug = this.createSlug(normalizedName);

        if (!slug) {
            throw new BadRequestException(
                'Category name must contain letters or numbers.',
            );
        }

        return {
            name: normalizedName,
            slug,
        };
    }

    // Validate slug
    private async validateUniqueSlug(
        name: string,
        slug: string,
        excludeCategoryId?: Types.ObjectId,
    ): Promise<void> {
        const query: {
            slug: string;
            _id?: { $ne: Types.ObjectId };
        } = {
            slug,
        };

        if (excludeCategoryId) {
            query._id = {
                $ne: excludeCategoryId,
            };
        }

        const existingCategory =
            await this.categoryModel.exists(query);

        if (existingCategory) {
            throw new ConflictException(
                `Category "${name}" already exists.`,
            );
        }
    }

    //Ensure Parent category is valid
    private async resolveParentCategory(
        parentCategoryId?: string,
    ): Promise<Types.ObjectId | null> {
        if (!parentCategoryId) {
            return null;
        }

        const parentExists =
            await this.categoryModel.exists({
                _id: parentCategoryId,
            });

        if (!parentExists) {
            throw new NotFoundException(
                `Parent category with id ${parentCategoryId} not found.`,
            );
        }

        return new Types.ObjectId(parentCategoryId);
    }

    private async findByIdOrThrow(
        id: string,
    ): Promise<CategoryDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                `Invalid category id "${id}".`,
            );
        }

        const category =
            await this.categoryModel.findById(id);

        if (!category) {
            throw new NotFoundException(
                `Category with id "${id}" not found.`,
            );
        }

        return category;
    }

    private normalizeDescription(
        description?: string,
    ): string | undefined {
        return description?.trim() || undefined;
    }

    private async saveCategory(
        category: CategoryDocument,
    ): Promise<CategoryDocument> {
        try {
            return await category.save();
        } catch (error) {
            if ((error as { code?: number }).code === 11000) {
                throw new ConflictException(
                    `Category "${category.name}" already exists.`,
                );
            }

            throw error;
        }
    }

    // Private helper function to create a slug from a product name
    private createSlug(name: string): string {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    // Get all active categories in the database
    async findAllActive(): Promise<CategoryDocument[]> {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ name: 1 })
            .exec();

        const visibleCategories: CategoryDocument[] = [];

        for (const category of categories) {
            if (await this.isEffectivelyActive(category)) {
                visibleCategories.push(category);
            }
        }

        return visibleCategories;
    }

    // Get all categories in the database
    async findAllAdmin(): Promise<CategoryDocument[]> {
        return this.categoryModel
            .find()
            .sort({
                isActive: -1,
                name: 1,
            })
            .exec();
    }

    private async isEffectivelyActive(
        category: CategoryDocument,
    ): Promise<boolean> {
        if (!category.isActive) {
            return false;
        }

        let parentId = category.parentCategory;

        while (parentId) {
            const parent = await this.categoryModel
                .findById(parentId)
                .select('isActive parentCategory')
                .lean();

            if (!parent || !parent.isActive) {
                return false;
            }

            parentId = parent.parentCategory;
        }

        return true;
    }

    // Get a specific category using it's slug
    async findBySlug(slug: string): Promise<CategoryDocument> {
        const category = await this.categoryModel
            .findOne({
                slug: slug.toLowerCase(),
                isActive: true,
            })
            .exec();

        if (
            !category ||
            !(await this.isEffectivelyActive(category))
        ) {
            throw new NotFoundException(
                `Category "${slug}" not found.`,
            );
        }

        return category;
    }

    // Deactivate a category
    async deactivate(id: string): Promise<CategoryDocument> {
        const category = await this.findByIdOrThrow(id);

        if (!category) {
            throw new NotFoundException('Category not found.');
        }

        if (!category.isActive) {
            return category;
        }

        category.isActive = false;

        return category.save();
    }

    // Reactivate a category
    async reactivate(id: string): Promise<CategoryDocument> {
        const category = await this.findByIdOrThrow(id);

        if (!category) {
            throw new NotFoundException('Category not found.');
        }

        if (category.isActive) {
            return category;
        }

        category.isActive = true;

        return category.save();
    }

    // Delete a category permanently
    async remove(id: string): Promise<void> {
        // Validate MongoDB ObjectId before querying
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(
                `Invalid category id "${id}".`,
            );
        }

        // Make sure the category exists
        const category = await this.categoryModel
            .findById(id)
            .exec();

        if (!category) {
            throw new NotFoundException(
                `Category with id "${id}" not found.`,
            );
        }

        // Require deactivation before permanent deletion
        if (category.isActive) {
            throw new ConflictException(
                'Category must be deactivated before it can be permanently deleted.',
            );
        }

        // Don't allow deletion if other categories depend on it
        const childCategoryExists =
            await this.categoryModel.exists({
                parentCategory: category._id,
            });

        if (childCategoryExists) {
            throw new ConflictException(
                'Category cannot be deleted while it has child categories.',
            );
        }

        // Permanently remove the document
        await category.deleteOne();
    }
}
