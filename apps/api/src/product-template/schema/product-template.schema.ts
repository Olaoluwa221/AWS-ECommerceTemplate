import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductTemplateDocument = HydratedDocument<ProductTemplate>;

@Schema({
  timestamps: true,
  collection: 'product_templates',
})
export class ProductTemplate {
    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ 
        type: [{ type: Types.ObjectId, ref: 'OptionDefinition',}],
        default: [], })
    options: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ProductTemplateSchema = SchemaFactory.createForClass(ProductTemplate);
