import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AddAddressDto } from './dto/add-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import { UserRole } from './enums/user-role.enum';

type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  isActive?: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  // Create a new user in the database.
  async create(createUserInput: CreateUserInput): Promise<UserDocument> {
    const user = new this.userModel(createUserInput);

    return user.save();
  }

  // Find a user by their unique identifier (ID).
  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Find a user by email, normalizing the email to lowercase and trimming whitespace.
  async findByEmail(email: string): Promise<UserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.userModel.findOne({ email: normalizedEmail }).exec();
  }

  // Find a user by email and include the password hash in the result.
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.userModel.findOne({ email: normalizedEmail }).select('+passwordHash').exec();
  }

  // Update a user's profile information based on their ID and the provided update data.
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
