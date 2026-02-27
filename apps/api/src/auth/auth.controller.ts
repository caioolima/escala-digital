import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('2fa/verify')
    verifyTwoFactor(@Body() dto: Verify2FADto) {
        return this.authService.verifyTwoFactorCode(dto.userId, dto.code);
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
}
