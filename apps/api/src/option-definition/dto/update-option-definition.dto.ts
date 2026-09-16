import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class UpdateOptionDefinitionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  allowedValues?: string[];
}