import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Resend2FADto } from './dto/resend-2fa.dto';
import { CreateStudentAccessDto } from './dto/create-student-access.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../common/enums';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.authService.login(dto, this.buildDeviceContext(dto, req));
    }

    @Post('2fa/verify')
    verifyTwoFactor(@Body() dto: Verify2FADto, @Req() req: Request) {
        return this.authService.verifyTwoFactorCode(dto.userId, dto.code, this.buildDeviceContext(dto, req));
    }

    @Post('2fa/resend')
    resendTwoFactor(@Body() dto: Resend2FADto) {
        return this.authService.resendTwoFactorCode(dto.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.CREATOR)
    @Post('students/access')
    createStudentAccess(@CurrentUser() user: any, @Body() dto: CreateStudentAccessDto) {
        return this.authService.createStudentAccess(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('company/stats')
    getCompanyStats(@CurrentUser() user: any) {
        return this.authService.getCompanyStats(user.companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateProfile(@CurrentUser() user: any, @Body() dto: any) {
        return this.authService.updateProfile(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/password')
    async changePassword(@CurrentUser() user: any, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/settings')
    async getSettings(@CurrentUser() user: any) {
        return this.authService.getSettings(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/settings')
    async updateSettings(@CurrentUser() user: any, @Body() body: any) {
        return this.authService.updateSettings(user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/trusted-devices')
    async getTrustedDevices(@CurrentUser() user: any, @Req() req: Request) {
        return this.authService.getTrustedDevicesForUser(user.id, this.buildDeviceContext({}, req));
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/trusted-devices/:deviceId')
    async revokeTrustedDevice(@CurrentUser() user: any, @Param('deviceId') deviceId: string) {
        return this.authService.revokeTrustedDeviceForUser(user.id, deviceId);
    }

    private buildDeviceContext(
        dto: Partial<Pick<LoginDto, 'deviceId' | 'timezone' | 'locale' | 'platform' | 'userAgent'>>,
        req: Request,
    ) {
        const forwarded = req.headers['x-forwarded-for'];
        const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
        const socketIp = req.ip || req.socket?.remoteAddress || '';
        const ip = (forwardedIp || socketIp || '').trim() || undefined;
        const headerUserAgent = req.headers['user-agent'];
        const userAgent = (dto.userAgent || (Array.isArray(headerUserAgent) ? headerUserAgent[0] : headerUserAgent) || '').trim() || undefined;

        return {
            deviceId: dto.deviceId?.trim() || undefined,
            timezone: dto.timezone?.trim() || undefined,
            locale: dto.locale?.trim() || undefined,
            platform: dto.platform?.trim() || undefined,
            userAgent,
            ip,
        };
    }
}
