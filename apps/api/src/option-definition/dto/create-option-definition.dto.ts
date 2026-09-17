import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateOptionDefinitionDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    displayName: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @ArrayUnique()
    values: string[];
}