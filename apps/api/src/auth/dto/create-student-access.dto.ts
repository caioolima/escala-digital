import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateStudentAccessDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    name?: string;
}
