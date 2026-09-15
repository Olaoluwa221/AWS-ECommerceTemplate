import { Body, Controller, Delete, Get, Param, Patch, Post, } from '@nestjs/common';
import { CategoryService } from './category.service';
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

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update() { }

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
