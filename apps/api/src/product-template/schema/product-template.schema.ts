import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type ProductTemplateDocument =
  HydratedDocument<ProductTemplate>;

@Schema({
  timestamps: true,
  collection: 'productTemplates',
})
export class ProductTemplate {
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  name: string;

  // propert to store links to images
  @Prop({
    type: [String],
    default: [],
  })
  images: string[];

  @Prop({
    default: true,
  })
  isActive: boolean;

  // property to store all optionDefinitions utilzied on this template
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'OptionDefinition',
      },
    ],
    default: [],
  })
  options: Types.ObjectId[];
}

export const ProductTemplateSchema =
  SchemaFactory.createForClass(
    ProductTemplate,
  );