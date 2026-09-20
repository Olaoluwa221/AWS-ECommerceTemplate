import {
    ArrayUnique,
    IsArray,
    IsMongoId,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateProductTemplateDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsMongoId({ each: true })
    options?: string[];
}