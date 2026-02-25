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
        const courses = await this.prisma.course.findMany({
            where: {
                companyId,
                ...(onlyPublished && { published: true }),
            },
            include: {
                lessons: { select: { id: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return courses.map(course => ({
            ...course,
            lessonsCount: course.lessons.length,
            studentsCount: course._count.enrollments,
            status: 'available', // Default status, logic can be added later
        }));
    }

    async findOne(id: string, companyId: string, userId?: string) {
        const course = await this.prisma.course.findFirst({
            where: { id, companyId },
            include: {
                modules: {
                    include: { lessons: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' },
                },
                lessons: { orderBy: { order: 'asc' } },
                tags: true,
                _count: { select: { enrollments: true } },
                reviews: {
                    include: { user: { select: { name: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                enrollments: {
                    include: { user: { select: { name: true, avatarUrl: true } } },
                    orderBy: { enrolledAt: 'desc' },
                    take: 10,
                }
            },
        });
        if (!course) throw new NotFoundException('Course not found');

        let isEnrolled = false;
        let hasReviewed = false;
        if (userId) {
            const [enrollment, review] = await Promise.all([
                this.prisma.enrollment.findUnique({
                    where: { userId_courseId: { userId, courseId: id } }
                }),
                this.prisma.review.findFirst({
                    where: { userId, courseId: id }
                })
            ]);
            isEnrolled = !!enrollment;
            hasReviewed = !!review;
        }

        return {
            ...course,
            lessonsCount: course.lessons.length,
            studentsCount: course._count.enrollments,
            enrolledStudents: course.enrollments.map((e: any) => ({
                name: e.user.name,
                avatarUrl: e.user.avatarUrl
            })),
            isEnrolled,
            hasReviewed,
            status: 'available',
        };
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

        const completedLessons = await this.prisma.lessonProgress.findMany({
            where: { userId, lessonId: { in: course.lessons.map((l) => l.id) }, completed: true },
            select: { lessonId: true }
        });

        const completedCount = completedLessons.length;
        const percentage = course.lessons.length > 0
            ? Math.round((completedCount / course.lessons.length) * 100)
            : 0;

        return {
            total: course.lessons.length,
            completed: completedCount,
            percentage,
            completedLessonIds: completedLessons.map(lp => lp.lessonId)
        };
    }
}
