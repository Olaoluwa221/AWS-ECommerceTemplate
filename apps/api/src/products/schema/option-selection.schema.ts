// products/schemas/option-selection.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OptionDefinition } from '../../option-definition/schema/option-definition.schema';

@Schema({ _id: false })
export class OptionSelection {
  @Prop({
    type: Types.ObjectId,
    ref: OptionDefinition.name,
    required: true,
  })
  optionDefinition: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  value: string;
}

export const OptionSelectionSchema =
  SchemaFactory.createForClass(OptionSelection);