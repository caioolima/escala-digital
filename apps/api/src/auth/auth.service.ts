import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { CreateStudentAccessDto } from './dto/create-student-access.dto';
import { Role } from '../common/enums';

type PreferencesObj = Record<string, any>;
type TwoFactorChallenge = {
    codeHash: string;
    expiresAt: string;
    attempts: number;
    lastSentAt: string;
};

type DeviceContext = {
    deviceId?: string;
    timezone?: string;
    locale?: string;
    platform?: string;
    userAgent?: string;
    ip?: string;
};

type TrustedDeviceView = {
    id: string;
    deviceName: string;
    platform: string | null;
    timezone: string | null;
    locale: string | null;
    ipPrefix: string | null;
    trustedAt: string;
    lastSeenAt: string;
    expiresAt: string;
    isCurrent: boolean;
};

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(dto: RegisterDto) {
        const company = await this.prisma.company.findUnique({
            where: { slug: dto.companySlug },
        });
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                companyId: company.id,
            },
        });

        return this.signToken(user.id, user.email, user.role, user.name);
    }

    async login(dto: LoginDto, deviceContext?: DeviceContext) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (this.isTwoFactorEnabled(user.preferences)) {
            const isTrusted = await this.isTrustedDevice(user.id, deviceContext);
            if (isTrusted) {
                return this.signToken(user.id, user.email, user.role, user.name);
            }

            const challengeResult = await this.createAndStoreTwoFactorChallenge(user.id, user.preferences);
            await this.mailService.sendTwoFactorCodeEmail(user.email, user.name, challengeResult.code);
            return {
                requires2FA: true,
                userId: user.id,
                email: user.email,
                role: user.role,
                ...(process.env.NODE_ENV !== 'production' ? { devCode: challengeResult.code } : {}),
            };
        }

        return this.signToken(user.id, user.email, user.role, user.name);
    }

    async createStudentAccess(creatorId: string, dto: CreateStudentAccessDto) {
        const creator = await this.prisma.user.findUnique({
            where: { id: creatorId },
            select: {
                id: true,
                role: true,
                companyId: true,
                company: { select: { name: true } },
            },
        });
        if (!creator || creator.role !== Role.CREATOR) {
            throw new ForbiddenException('Only creators can create student access');
        }

        const normalizedEmail = dto.email.trim().toLowerCase();
        const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const fallbackName = this.deriveNameFromEmail(normalizedEmail);

        const student = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                name: dto.name?.trim() || fallbackName,
                password: hashedPassword,
                role: Role.STUDENT,
                companyId: creator.companyId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyId: true,
                createdAt: true,
            },
        });

        await this.mailService.sendStudentWelcomeAccessEmail({
            to: student.email,
            studentName: student.name,
            companyName: creator.company?.name || 'sua empresa',
            temporaryPassword,
        });

        return {
            ok: true,
            student,
        };
    }

    async verifyTwoFactorCode(userId: string, code: string, deviceContext?: DeviceContext) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, name: true, preferences: true },
        });
        if (!user) throw new UnauthorizedException('Invalid 2FA session');

        const preferences = this.asPreferencesObject(user.preferences);
        const security = this.asPreferencesObject(preferences.security);
        const challenge = security.twoFactor as TwoFactorChallenge | undefined;
        if (!challenge?.codeHash || !challenge?.expiresAt) {
            throw new UnauthorizedException('2FA code not found');
        }

        if (new Date(challenge.expiresAt).getTime() < Date.now()) {
            await this.clearTwoFactorChallenge(user.id, preferences);
            throw new UnauthorizedException('2FA code expired');
        }

        if ((challenge.attempts ?? 0) >= 5) {
            throw new ForbiddenException('Too many invalid 2FA attempts');
        }

        const valid = await bcrypt.compare(code, challenge.codeHash);
        if (!valid) {
            await this.updateTwoFactorAttempts(user.id, preferences, (challenge.attempts ?? 0) + 1);
            throw new UnauthorizedException('Invalid 2FA code');
        }

        await this.clearTwoFactorChallenge(user.id, preferences);
        await this.rememberTrustedDevice(user.id, deviceContext);
        return this.signToken(user.id, user.email, user.role, user.name);
    }

    async resendTwoFactorCode(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, preferences: true },
        });
        if (!user) throw new UnauthorizedException('Invalid 2FA session');

        const preferences = this.asPreferencesObject(user.preferences);
        const security = this.asPreferencesObject(preferences.security);
        const existing = security.twoFactor as TwoFactorChallenge | undefined;
        if (existing?.lastSentAt) {
            const elapsedMs = Date.now() - new Date(existing.lastSentAt).getTime();
            if (elapsedMs < 30_000) {
                throw new BadRequestException('Please wait before requesting another code');
            }
        }

        const challengeResult = await this.createAndStoreTwoFactorChallenge(user.id, user.preferences);
        await this.mailService.sendTwoFactorCodeEmail(user.email, user.name, challengeResult.code);
        return {
            ok: true,
            ...(process.env.NODE_ENV !== 'production' ? { devCode: challengeResult.code } : {}),
        };
    }

    async updateProfile(userId: string, dto: { name?: string; email?: string; avatarUrl?: string }) {
        const data: any = {};
        if (dto.name) data.name = dto.name;
        if (dto.email) data.email = dto.email;
        if (dto.avatarUrl) data.avatarUrl = dto.avatarUrl;

        const updated = await this.prisma.user.update({ where: { id: userId }, data });
        // return sanitized user (no password)
        const { password, ...rest } = updated as any;
        return rest;
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                preferences: true,
                notifications: true,
                role: true,
                companyId: true,
                createdAt: true,
                updatedAt: true,
                company: { select: { name: true } },
            },
        });

        if (!user) throw new ForbiddenException('User not found');

        return {
            ...user,
            company: user.company?.name,
        };
    }

    async getCompanyStats(companyId: string) {
        const studentsCount = await this.prisma.user.count({
            where: {
                companyId,
                role: Role.STUDENT,
            },
        });

        return { studentsCount };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        if (!currentPassword || !newPassword) throw new BadRequestException('Passwords required');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ForbiddenException('User not found');

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) throw new ForbiddenException('Current password does not match');

        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        return { ok: true };
    }

    async getSettings(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { preferences: true, notifications: true } });
        return user || { preferences: null, notifications: null };
    }

    async updateSettings(userId: string, body: any) {
        const data: any = {};
        if (body.preferences) data.preferences = body.preferences;
        if (body.notifications) data.notifications = body.notifications;
        const updated = await this.prisma.user.update({ where: { id: userId }, data, select: { preferences: true, notifications: true } });
        return updated;
    }

    async getTrustedDevicesForUser(userId: string, context?: DeviceContext): Promise<TrustedDeviceView[]> {
        await this.prisma.trustedDevice.deleteMany({
            where: {
                userId,
                expiresAt: { lt: new Date() },
            },
        });

        const currentDeviceHash = context?.deviceId?.trim() ? this.hashValue(context.deviceId.trim()) : undefined;
        const devices = await this.prisma.trustedDevice.findMany({
            where: { userId },
            orderBy: { lastSeenAt: 'desc' },
        });

        return devices.map((device) => ({
            id: device.id,
            deviceName: device.deviceName || 'Dispositivo confiavel',
            platform: device.platform,
            timezone: device.timezone,
            locale: device.locale,
            ipPrefix: device.ipPrefix,
            trustedAt: device.trustedAt.toISOString(),
            lastSeenAt: device.lastSeenAt.toISOString(),
            expiresAt: device.expiresAt.toISOString(),
            isCurrent: Boolean(currentDeviceHash && currentDeviceHash === device.deviceHash),
        }));
    }

    async revokeTrustedDeviceForUser(userId: string, trustedDeviceId: string) {
        const deleted = await this.prisma.trustedDevice.deleteMany({
            where: {
                id: trustedDeviceId,
                userId,
            },
        });
        if (deleted.count === 0) {
            throw new NotFoundException('Trusted device not found');
        }
        return { ok: true };
    }

    private signToken(userId: string, email: string, role: string, name: string) {
        const payload = { sub: userId, email, role, name };
        return {
            access_token: this.jwtService.sign(payload),
            role,
        };
    }

    private asPreferencesObject(input: unknown): PreferencesObj {
        if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
        return { ...(input as PreferencesObj) };
    }

    private isTwoFactorEnabled(preferences: unknown): boolean {
        const prefs = this.asPreferencesObject(preferences);
        const security = this.asPreferencesObject(prefs.security);
        return Boolean(prefs.enable2FA ?? security.enable2FA ?? false);
    }

    private generateTwoFactorCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private hashValue(input: string): string {
        return createHash('sha256').update(input).digest('hex');
    }

    private ipPrefix(ip?: string): string | undefined {
        if (!ip) return undefined;
        const normalized = ip.replace('::ffff:', '').trim();
        if (!normalized) return undefined;

        if (normalized.includes(':')) {
            return normalized.split(':').slice(0, 4).join(':');
        }

        const parts = normalized.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}`;
        }

        return normalized;
    }

    private async isTrustedDevice(userId: string, context?: DeviceContext): Promise<boolean> {
        const deviceId = context?.deviceId?.trim();
        if (!deviceId) return false;

        const deviceHash = this.hashValue(deviceId);
        const userAgentHash = context?.userAgent?.trim() ? this.hashValue(context.userAgent.trim()) : undefined;
        const trustedDevice = await this.prisma.trustedDevice.findFirst({
            where: {
                userId,
                deviceHash,
                expiresAt: { gt: new Date() },
            },
        });
        if (!trustedDevice) return false;

        if (trustedDevice.userAgentHash && userAgentHash && trustedDevice.userAgentHash !== userAgentHash) {
            return false;
        }

        await this.prisma.trustedDevice.update({
            where: { id: trustedDevice.id },
            data: {
                lastSeenAt: new Date(),
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60_000),
                ipPrefix: this.ipPrefix(context?.ip) ?? trustedDevice.ipPrefix,
                timezone: context?.timezone?.trim() || trustedDevice.timezone,
                locale: context?.locale?.trim() || trustedDevice.locale,
                platform: context?.platform?.trim() || trustedDevice.platform,
                userAgentHash: userAgentHash || trustedDevice.userAgentHash,
                deviceName: this.resolveDeviceName(context) || trustedDevice.deviceName,
            },
        });
        return true;
    }

    private async rememberTrustedDevice(userId: string, context?: DeviceContext): Promise<void> {
        const deviceId = context?.deviceId?.trim();
        if (!deviceId) return;

        const deviceHash = this.hashValue(deviceId);
        const userAgentHash = context?.userAgent?.trim() ? this.hashValue(context.userAgent.trim()) : undefined;
        const now = new Date();
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60_000);

        await this.prisma.trustedDevice.upsert({
            where: {
                userId_deviceHash: {
                    userId,
                    deviceHash,
                },
            },
            update: {
                userAgentHash,
                deviceName: this.resolveDeviceName(context),
                platform: context?.platform?.trim() || undefined,
                timezone: context?.timezone?.trim() || undefined,
                locale: context?.locale?.trim() || undefined,
                ipPrefix: this.ipPrefix(context?.ip),
                trustedAt: now,
                lastSeenAt: now,
                expiresAt,
            },
            create: {
                userId,
                deviceHash,
                userAgentHash,
                deviceName: this.resolveDeviceName(context),
                platform: context?.platform?.trim() || undefined,
                timezone: context?.timezone?.trim() || undefined,
                locale: context?.locale?.trim() || undefined,
                ipPrefix: this.ipPrefix(context?.ip),
                trustedAt: now,
                lastSeenAt: now,
                expiresAt,
            },
        });

        const extraDevices = await this.prisma.trustedDevice.findMany({
            where: { userId },
            orderBy: { lastSeenAt: 'desc' },
            skip: 10,
            select: { id: true },
        });
        if (extraDevices.length > 0) {
            await this.prisma.trustedDevice.deleteMany({
                where: {
                    id: { in: extraDevices.map((item) => item.id) },
                    userId,
                },
            });
        }
    }

    private resolveDeviceName(context?: DeviceContext): string | undefined {
        const platform = context?.platform?.trim();
        const userAgent = context?.userAgent || '';
        if (!platform && !userAgent) return undefined;

        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
        const browser =
            /Edg\//i.test(userAgent) ? 'Edge' :
                /Chrome\//i.test(userAgent) ? 'Chrome' :
                    /Firefox\//i.test(userAgent) ? 'Firefox' :
                        /Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent) ? 'Safari' :
                            /OPR\//i.test(userAgent) ? 'Opera' :
                                'Navegador';

        const deviceType = isMobile ? 'Mobile' : 'Desktop';
        return `${deviceType} - ${platform || 'Unknown'} - ${browser}`;
    }

    private generateTemporaryPassword() {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        const symbols = '!@#$%';
        let base = '';
        for (let i = 0; i < 10; i++) {
            base += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        const suffix = symbols[Math.floor(Math.random() * symbols.length)];
        return `${base}${suffix}`;
    }

    private deriveNameFromEmail(email: string) {
        const local = email.split('@')[0] || 'Aluno';
        const clean = local.replace(/[._-]+/g, ' ').trim();
        if (!clean) return 'Aluno';
        return clean
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join(' ');
    }

    private async createAndStoreTwoFactorChallenge(userId: string, preferencesInput: unknown) {
        const code = this.generateTwoFactorCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
        const lastSentAt = new Date().toISOString();

        const preferences = this.asPreferencesObject(preferencesInput);
        const security = this.asPreferencesObject(preferences.security);
        const nextPreferences = {
            ...preferences,
            security: {
                ...security,
                twoFactor: { codeHash, expiresAt, attempts: 0, lastSentAt },
            },
        };

        await this.prisma.user.update({
            where: { id: userId },
            data: { preferences: nextPreferences },
        });

        return { code };
    }

    private async updateTwoFactorAttempts(userId: string, preferencesInput: unknown, attempts: number) {
        const preferences = this.asPreferencesObject(preferencesInput);
        const security = this.asPreferencesObject(preferences.security);
        const challenge = this.asPreferencesObject(security.twoFactor);
        const nextPreferences = {
            ...preferences,
            security: {
                ...security,
                twoFactor: { ...challenge, attempts },
            },
        };
        await this.prisma.user.update({ where: { id: userId }, data: { preferences: nextPreferences } });
    }

    private async clearTwoFactorChallenge(userId: string, preferencesInput: unknown) {
        const preferences = this.asPreferencesObject(preferencesInput);
        const security = this.asPreferencesObject(preferences.security);
        const nextSecurity = { ...security };
        delete nextSecurity.twoFactor;
        const nextPreferences = {
            ...preferences,
            security: nextSecurity,
        };
        await this.prisma.user.update({ where: { id: userId }, data: { preferences: nextPreferences } });
    }
}

