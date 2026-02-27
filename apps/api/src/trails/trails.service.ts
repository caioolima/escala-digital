import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrailDto, UpdateTrailDto, AddCourseToTrailDto } from './dto/trail.dto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class TrailsService {
    constructor(private prisma: PrismaService, private coursesService: CoursesService) { }

    async create(companyId: string, dto: CreateTrailDto) {
        return this.prisma.trail.create({ data: { ...dto, companyId } });
    }

    async findAll(companyId: string) {
        return this.prisma.trail.findMany({
            where: { companyId },
            include: {
                courses: {
                    include: { course: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    async findOne(id: string) {
        const trail = await this.prisma.trail.findUnique({
            where: { id },
            include: {
                courses: {
                    include: {
                        course: {
                            include: { lessons: { select: { id: true, title: true, duration: true, order: true } } },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!trail) throw new NotFoundException('Trail not found');
        return trail;
    }

    async update(id: string, dto: UpdateTrailDto) {
        await this.findOne(id);
        return this.prisma.trail.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.trail.delete({ where: { id } });
    }

    async addCourse(trailId: string, dto: AddCourseToTrailDto) {
        const count = await this.prisma.trailCourse.count({ where: { trailId } });
        return this.prisma.trailCourse.create({
            data: { trailId, courseId: dto.courseId, order: dto.order ?? count + 1 },
        });
    }

    async removeCourse(trailId: string, courseId: string) {
        return this.prisma.trailCourse.delete({
            where: { trailId_courseId: { trailId, courseId } },
        });
    }

    async getProgress(trailId: string, userId: string) {
        const trail = await this.prisma.trail.findUnique({
            where: { id: trailId },
            include: { courses: { include: { course: true }, orderBy: { order: 'asc' } } },
        });
        if (!trail) throw new NotFoundException('Trail not found');

        const courseEntries = (trail.courses || []).map((tc: any) => tc.course).filter(Boolean);
        const totalCourses = courseEntries.length;

        // For each course, reuse CoursesService.getProgress
        const progresses = await Promise.all(courseEntries.map(async (c: any) => {
            try {
                const p = await this.coursesService.getProgress(c.id, userId);
                return { courseId: c.id, percentage: p.percentage ?? 0, total: p.total ?? 0, completed: p.completed ?? 0 };
            } catch {
                return { courseId: c.id, percentage: 0, total: 0, completed: 0 };
            }
        }));

        const completedCourses = progresses.filter(p => p.percentage === 100).length;
        const percentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

        return {
            trailId: trail.id,
            totalCourses,
            completedCourses,
            percentage,
            courses: progresses,
        };
    }
}
