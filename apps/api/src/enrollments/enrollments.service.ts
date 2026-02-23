import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
    constructor(private prisma: PrismaService) { }

    async enroll(userId: string, courseId: string) {
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) throw new ConflictException('Already enrolled');
        return this.prisma.enrollment.create({ data: { userId, courseId } });
    }

    async getMyEnrollments(userId: string) {
        return this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        lessons: { select: { id: true } },
                        _count: { select: { lessons: true } },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });
    }
}
