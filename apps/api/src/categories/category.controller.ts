import { Body, Controller, Delete, Get, Param, Patch, Post, } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Public } from '../auth/decorators/public.decorator.js';

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
  findAllActive() {
    return this.categoryService.findAllActive();
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.categoryService.findAllAdmin();
  }

  @Get(':slug')
  @Public()
  findBySlug(
    @Param('slug') slug: string
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

  // Update a category
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // Dectivate a category
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.categoryService.deactivate(id);
  }

  // Reactivate a category
  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN)
  reactivate(@Param('id') id: string) {
    return this.categoryService.reactivate(id);
  }

  // Totally delete a category
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
