import { Body, Controller, Delete, Get, Param, Patch, Post, } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(
      createCategoryDto,
    );
  }

  @Get()
  @Public()
  findAll() {
    return this.categoryService.findAll();
   }

  @Get(':slug')
  @Public()
  findBySlug(
    @Param('slug') slug:string
  ) {
    return this.categoryService.findBySlug(slug);
  }

  // @Get(':id')
  // @Public()
  // findById(
  //   @Param('id') id:string
  // ) { 
  //   return this.categoryService.findById(id);
  // }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update() { }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove() { }
}
