import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { Address, AddressSchema } from '../../common/schema/address.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
})
export class User {
    // Property to store the unique identifier of the user
    @Prop({
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
    })
    userId: Types.ObjectId;

    // Property to store the first name of the user
    @Prop({ required: true, trim: true })
    firstName: string;

    // Property to store the last name of the user
    @Prop({ required: true, trim: true })
    lastName: string;

    // Property to store the email of the user
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    // Property to store the password hash of the user
    @Prop({ required: true, select: false })
    passwordHash: string;

    // Property to store the role of the user (admin or customer)
    @Prop({
        required: true,
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    // Property to store whether the user has opted in for marketing communications
    @Prop({
        type: Boolean,
        default: false
    })
    marketingOptIn: boolean;

    // Property to store the shipping addresses of the user
    @Prop({
        type: [AddressSchema],
        default: [],
    })
    shippingAddresses: Address[];

    // Property to store the billing address of the user (optional)
    @Prop({
        type: AddressSchema,
        default: null,
    })
    billingAddress?: Address | null;

    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
