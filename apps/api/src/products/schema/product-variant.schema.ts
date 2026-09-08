import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { Product } from './product.schema';
import {
  OptionSelection,
  OptionSelectionSchema,
} from './option-selection.schema';

export type ProductVariantDocument = HydratedDocument<ProductVariant>;

// Enum to represent the available fulfillment methods for a product variant
export enum AvailableFulfillmentMethod {
  PICKUP_ONLY = 'Pickup_Only',
  DELIVERY_ONLY = 'Delivery_Only',
  BOTH = 'Both',
}

@Schema({
  timestamps: true,
  collection: 'product_variants',
})
export class ProductVariant {
  @Prop({ required: true, trim: true })
  title: string;

  // Reference to the associated product
  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  product: Types.ObjectId;

  // Property to store the sku of the product variant
  @Prop({ required: true, trim: true })
  sku: string;

  // Property to store the option selections for the product variant
  @Prop({
    type: [OptionSelectionSchema],
    default: [],
  })
  optionSelections: OptionSelection[];

  // Property to store the base price of the product variant
  @Prop({ required: true, min: 0 })
  basePrice: number;

  // Property to store the stock quantity of the product variant
  @Prop({ required: true, default: 0, min: 0 })
  stock: number;

  // Property to store the image reference of the product variant
  @Prop({ type: [String], default: [] })
  images: string[];

  // Property to store the fulfillment method of the product variant
  @Prop({
    type: String,
    enum: AvailableFulfillmentMethod,
    default: AvailableFulfillmentMethod.BOTH,
  })
  availableFulfillmentMethod: AvailableFulfillmentMethod;

  // Property to indicate whether the product variant is active or not
  @Prop({ default: true })
  isActive: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);


