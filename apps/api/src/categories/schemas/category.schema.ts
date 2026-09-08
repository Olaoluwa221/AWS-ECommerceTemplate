import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
	@Prop({ required: true, trim: true, unique: true })
	name: string;

	@Prop({ required: true, trim: true, unique: true, lowercase: true })
	slug: string;

	@Prop({ trim: true })
	description?: string;

	@Prop({ type: Types.ObjectId, ref: 'Category', default: null })
	parentCategory?: Types.ObjectId | null;

	@Prop({ default: true })
	isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
