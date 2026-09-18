import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto.js';

export class UpdateCategoryDto extends PartialType(
  PickType(CreateCategoryDto, ['name', 'description'] as const),
) {}