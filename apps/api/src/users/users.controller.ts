import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }
}
