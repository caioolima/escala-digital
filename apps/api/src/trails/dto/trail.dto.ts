import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrailDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;
}

export class UpdateTrailDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;
}

export class AddCourseToTrailDto {
    @IsString()
    @IsNotEmpty()
    courseId: string;

    @IsOptional()
    order?: number;
}
