import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AddAddressDto } from './dto/add-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';

type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role?: string;
  isActive?: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async updateProfile(
    id: string | Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async addShippingAddress(
    id: string | Types.ObjectId,
    addressDto: AddAddressDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // TODO: validate address payload and append to shippingAddresses.
    user.shippingAddresses.push({ ...addressDto } as any);
    return user.save();
  }

  async updateShippingAddress(
    id: string | Types.ObjectId,
    addressId: string | Types.ObjectId,
    updateAddressDto: UpdateAddressDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // TODO: locate address by addressId and patch its fields.
    user.shippingAddresses = user.shippingAddresses.map((address) => {
      if (String(address.addressId ?? '') !== String(addressId)) {
        return address;
      }

      return { ...address, ...updateAddressDto } as any;
    });

    return user.save();
  }

  async removeShippingAddress(
    id: string | Types.ObjectId,
    addressId: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // TODO: filter out the shipping address matching addressId.
    user.shippingAddresses = user.shippingAddresses.filter(
      (address) => String(address.addressId ?? '') !== String(addressId),
    );

    return user.save();
  }

  async setBillingAddress(
    id: string | Types.ObjectId,
    addressDto: AddAddressDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // TODO: assign proper billingAddress object.
    user.billingAddress = { ...addressDto } as any;
    return user.save();
  }

  async delete(id: string | Types.ObjectId): Promise<UserDocument | null> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // TODO: decide whether to hard delete or soft delete.
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
