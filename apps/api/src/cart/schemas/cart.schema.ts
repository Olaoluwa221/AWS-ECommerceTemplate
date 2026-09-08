import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { CartItem, CartItemSchema } from './cart-item.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  userId?: Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
    select: false,
  })
  guestId?: string;

  @Prop({
    type: [CartItemSchema],
    default: [],
  })
  items: CartItem[];

  
  createdAt: Date;

  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

/*
 * A registered user may only have one cart.
 */
CartSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $type: 'objectId' },
    },
  },
);

/*
 * Each guest session may only have one cart.
 */
CartSchema.index(
  { guestId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      guestId: { $type: 'string' },
    },
  },
);

/*
 * Every cart must belong to exactly ONE owner:
 *
 * Registered:
 *   userId = ObjectId
 *   guestId = undefined
 *
 * Guest:
 *   userId = undefined
 *   guestId = string
 *
 * Having both or neither is invalid.
 */
CartSchema.pre('validate', function () {
  const hasUserId = this.userId != null;

  const hasGuestId =
    typeof this.guestId === 'string' &&
    this.guestId.trim().length > 0;

  if (hasUserId === hasGuestId) {
    throw new Error(
      'Cart must belong to either a user or a guest, but not both.',
    );
  }
});