import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SafeUser } from '../auth/types/safe-user.types';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  @Patch('me')
  @UseGuards(AuthGuard)
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
