import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(
  PickType(CreateCategoryDto, ['name', 'description'] as const),
) {}