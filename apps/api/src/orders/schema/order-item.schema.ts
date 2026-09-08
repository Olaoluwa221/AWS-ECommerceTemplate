import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum OrderItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',

  SHIPPED = 'shipped',
  DELIVERED = 'delivered',

  CANCELLED = 'cancelled',

  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  PREPARING_FOR_PICKUP = 'preparing_for_pickup',
}

export enum RefundStatus {
  NONE = 'none',
  PENDING = 'pending',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  REJECTED = 'rejected',
}

export enum DeliveryMethod {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}
@Schema({
  _id: true,
})
export class OrderItem {
    // Property to store the unique identifier of the product variant associated with the order item
  @Prop({
    type: Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  })
  productVariantId: Types.ObjectId;

  // Property to store the method of fulfillment for this order item (delivery or pickup)
  @Prop({
    required: true,
    enum: DeliveryMethod,
  })
  deliveryMethod: DeliveryMethod;

  // Property to store the quantity of the product variant in the order for this method of fulfillment
  @Prop({
    required: true,
    min: 1,
  })
  quantity: number;

  // Property to store the unit price of the product variant at the time of the order
  @Prop({
    required: true,
    min: 0,
  })
  unitPrice: number;
}   

export const OrderItemSchema =
  SchemaFactory.createForClass(OrderItem);