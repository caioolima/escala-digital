import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, companyId: string, dto: CreateCourseDto) {
        return this.prisma.course.create({
            data: {
                ...dto,
                companyId,
            },
        });
    }

    async findAll(companyId: string, onlyPublished = false) {
        return this.prisma.course.findMany({
            where: {
                companyId,
                ...(onlyPublished && { published: true }),
            },
            include: {
                lessons: { select: { id: true, title: true, order: true, duration: true } },
                tags: true,
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, companyId: string) {
        const course = await this.prisma.course.findFirst({
            where: { id, companyId },
            include: {
                lessons: { orderBy: { order: 'asc' } },
                tags: true,
                _count: { select: { enrollments: true } },
            },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async update(id: string, companyId: string, dto: UpdateCourseDto) {
        await this.findOne(id, companyId);
        return this.prisma.course.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, companyId: string) {
        await this.findOne(id, companyId);
        return this.prisma.course.delete({ where: { id } });
    }

    async getProgress(courseId: string, userId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { lessons: true },
        });
        if (!course) throw new NotFoundException('Course not found');

        const completedLessons = await this.prisma.lessonProgress.count({
            where: { userId, lessonId: { in: course.lessons.map((l) => l.id) }, completed: true },
        });

        return {
            total: course.lessons.length,
            completed: completedLessons,
            percentage: course.lessons.length > 0
                ? Math.round((completedLessons / course.lessons.length) * 100)
                : 0,
        };
    }
}
