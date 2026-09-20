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

  ProductTemplateSchema.index(
    {
        name: 1,
    },
    {
        name: 'product_template_name_ci_unique',
        unique: true,
        collation: {
            locale: 'en',
            strength: 2,
        },
    },
);