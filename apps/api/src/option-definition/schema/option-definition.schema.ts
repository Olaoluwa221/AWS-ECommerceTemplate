import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OptionDefinitionDocument = HydratedDocument<OptionDefinition>;

@Schema({ timestamps: true })
export class OptionDefinition {
	@Prop({ required: true, trim: true, unique: true })
	name: string;

    @Prop({ required: true, trim: true})
    displayName: string;

	@Prop({
		type: [String],
		required: true,
		validate: {
			validator: (values: string[]) =>{
				const normalized = values.map(
					value => value.trim().toLowerCase(),
				);

				return (
					new Set(normalized).size === normalized.length
				);
			},
			message: 'values array must contain unique values.',
		},
	})
	values: string[];

	@Prop({ default: true })
	isActive: boolean;
}

export const OptionDefinitionSchema =
	SchemaFactory.createForClass(OptionDefinition);
