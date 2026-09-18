import { Body, Controller, Patch, } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { SafeUser } from '../auth/types/safe-user.types.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: SafeUser,
    @Body() updateUserDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      user.id,
      updateUserDto,
    );
  }
}
