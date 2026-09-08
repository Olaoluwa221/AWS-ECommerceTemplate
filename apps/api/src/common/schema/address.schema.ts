import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
    @Prop({
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
    })
    addressId: Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
    })
    addressLine1: string;

    @Prop({
        trim: true,
    })
    addressLine2?: string;

    @Prop({
        required: true,
        trim: true,
    })
    city: string;

    @Prop({
        required: true,
        trim: true,
    })
    state: string;

    @Prop({
        required: true,
        trim: true,
    })
    postalCode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);