import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class Verify2FADto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @Length(6, 6)
    code: string;

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
