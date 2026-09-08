import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Product {
    
    // Property to store the name of the product
	@Prop({ required: true, trim: true })
	name!: string;

    // Property to store the slug of the product
	@Prop({ required: true, unique: true, lowercase: true, trim: true })
	slug!: string;

    // Property to store the description of the product
	@Prop({ trim: true })
	description!: string;

    // Property to store the reference to the product template
	@Prop({ 
        required: true,
        type: Types.ObjectId, 
        ref: 'ProductTemplate', 
    })
	productTemplate!: Types.ObjectId;

    // Property to store the category IDs for the product
    @Prop({
        type: [{type: Types.ObjectId, ref: 'Category',}],
        default: [],
    })
    categoryArray!: Types.ObjectId[];
	
    // Property to store the image keys for the product
    @Prop({
    type: [String],
    default: [],
  })
  imageKeys: string[];

    // Property to store the status of the product
    @Prop({
        type: String,
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    })
    status!: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
