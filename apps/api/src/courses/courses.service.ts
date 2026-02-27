import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { MailService } from '../mail/mail.service';
import { Role } from '../common/enums';

@Injectable()
export class CoursesService {
    private readonly logger = new Logger(CoursesService.name);

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async create(userId: string, companyId: string, dto: CreateCourseDto) {
        const created = await this.prisma.course.create({
            data: {
                ...dto,
                companyId,
            },
        });

        if (created.published) {
            void this.notifyStudentsAboutNewCourse(companyId, created.title);
        }

        return created;
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
        const existing = await this.prisma.course.findFirst({
            where: { id, companyId },
            select: { id: true, title: true, published: true },
        });
        if (!existing) throw new NotFoundException('Course not found');

        const updated = await this.prisma.course.update({
            where: { id },
            data: dto,
        });

        const shouldNotifyNewCourse = !existing.published && Boolean(updated.published);
        if (shouldNotifyNewCourse) {
            void this.notifyStudentsAboutNewCourse(companyId, updated.title);
        }

        return updated;
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

    private async notifyStudentsAboutNewCourse(companyId: string, courseTitle: string) {
        try {
            const students = await this.prisma.user.findMany({
                where: { companyId, role: Role.STUDENT },
                select: { email: true, name: true, notifications: true },
            });

            const recipients = students.filter((student) => {
                if (!student.notifications || typeof student.notifications !== 'object' || Array.isArray(student.notifications)) {
                    return true;
                }
                const notifications = student.notifications as Record<string, unknown>;
                return notifications.newCoursesEmail !== false;
            });

            const results = await Promise.allSettled(
                recipients.map((student) =>
                    this.mailService.sendNewCourseEmail(student.email, student.name, courseTitle),
                ),
            );

            const failedCount = results.filter((result) => result.status === 'rejected').length;
            if (failedCount > 0) {
                this.logger.warn(`Failed to deliver ${failedCount}/${recipients.length} new-course emails for "${courseTitle}".`);
            }
        } catch (error) {
            this.logger.error(`Failed to process new-course notifications for "${courseTitle}".`, error as any);
        }
    }
}
