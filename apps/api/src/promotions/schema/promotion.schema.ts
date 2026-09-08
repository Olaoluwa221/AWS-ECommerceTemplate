import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;

@Schema({
  timestamps: true,
})
export class Promotion {
  // Unique identifier for the promotion.
  @Prop({
    type: Types.ObjectId,
    default: () => new Types.ObjectId(),
  })
  promotionId: Types.ObjectId;

  // Display name of the promotion.
  @Prop({ required: true, trim: true })
  name: string;

  // Description of the promotion and its benefits.
  @Prop({ required: true, trim: true })
  description: string;

  // Conditions and rules customers must meet to use the promotion.
  @Prop({ required: true, trim: true })
  terms: string;

  // Categories whose products are eligible for benefit from the promotion.
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  categoryIds: Types.ObjectId[];

  // Indicates whether the promotion is currently available.
  @Prop({ default: true })
  isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);