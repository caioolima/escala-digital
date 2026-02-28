import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    deviceId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    timezone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    locale?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    platform?: string;

    @IsOptional()
    @IsString()
    @MaxLength(600)
    userAgent?: string;
}
