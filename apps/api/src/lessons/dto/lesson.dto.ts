import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    videoUrl: string;

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsNumber()
    order: number;
}

export class UpdateLessonDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsNumber()
    @IsOptional()
    order?: number;
}
