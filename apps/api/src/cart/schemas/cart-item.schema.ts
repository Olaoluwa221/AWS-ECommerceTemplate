import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class CartItem {

    // Property to store the unique identifier of the product variant associated with the cart item
    @Prop({
        type: Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
    })
    productVariantId: Types.ObjectId;

    // Property to store the quantity of the product variant in the cart
    @Prop({
        required: true,
        min: 1,
        default: 1,
    })
    quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);