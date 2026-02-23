import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
} from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsString()
    @IsOptional()
    level?: string;
}

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsString()
    @IsOptional()
    level?: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;
}
