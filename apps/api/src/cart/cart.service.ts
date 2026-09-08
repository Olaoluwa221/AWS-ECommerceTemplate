import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {}

  async findOrCreateByUserId(
    userId: string | Types.ObjectId,
  ): Promise<CartDocument> {
    void userId;
    throw new NotImplementedException('Find or create a user cart');
  }

  async findOrCreateByGuestId(guestId: string): Promise<CartDocument> {
    void guestId;
    throw new NotImplementedException('Find or create a guest cart');
  }

  async addItem(
    cartId: string | Types.ObjectId,
    productVariantId: string | Types.ObjectId,
    quantity: number,
  ): Promise<CartDocument> {
    void cartId;
    void productVariantId;
    void quantity;
    throw new NotImplementedException('Add an item to a cart');
  }

  async updateQuantity(
    cartId: string | Types.ObjectId,
    productVariantId: string | Types.ObjectId,
    quantity: number,
  ): Promise<CartDocument> {
    void cartId;
    void productVariantId;
    void quantity;
    throw new NotImplementedException('Update a cart item quantity');
  }

  async removeItem(
    cartId: string | Types.ObjectId,
    productVariantId: string | Types.ObjectId,
  ): Promise<CartDocument> {
    void cartId;
    void productVariantId;
    throw new NotImplementedException('Remove an item from a cart');
  }

  async mergeGuestCartIntoUserCart(
    guestId: string,
    userId: string | Types.ObjectId,
  ): Promise<CartDocument> {
    void guestId;
    void userId;
    throw new NotImplementedException('Merge a guest cart into a user cart');
  }
}
