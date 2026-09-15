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

    // Create a new category in the database
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

        let parentCategory: Types.ObjectId | null = null;

        if (createCategoryDto.parentCategory) {
            const parentExists = await this.categoryModel.exists({
                _id: createCategoryDto.parentCategory,
            });

            if (!parentExists) {
                throw new NotFoundException(
                    `Parent category with id ${createCategoryDto.parentCategory} not found.`,
                );
            }

            parentCategory = new Types.ObjectId(
                createCategoryDto.parentCategory,
            );
        }


        const category = new this.categoryModel({
            name,
            slug,
            description:
                createCategoryDto.description?.trim() || undefined,
            parentCategory,
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

    // Private helper function to create a slug from a product name
    private createSlug(name: string): string {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Get all categories in the database
    async findAll(): Promise<CategoryDocument[]> {
        return this.categoryModel
            .find({ isActive: true })
            .sort({ name: 1 })
            .exec();
    }

    // Get a specific category using it's slug
    async findBySlug(slug: string): Promise<CategoryDocument> {
        const category = await this.categoryModel
            .findOne({
                slug: slug.toLowerCase(),
                isActive: true,
            })
            .exec();

        if (!category) {
            throw new NotFoundException(
                `Category "${slug}" not found.`,
            );
        }

        return category;
    }

    // Deactivate a category
    async deactivate(id: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(id);

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
        const category = await this.categoryModel.findById(id);

        if (!category) {
            throw new NotFoundException('Category not found.');
        }

        if (category.isActive) {
            return category;
        }

        category.isActive = true;

        return category.save();
    }

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
    // // Get a specific category using it's id
    // async findById(id: string | Types.ObjectId){
    //     return this.categoryModel.findById(id).exec;
    // }
}
