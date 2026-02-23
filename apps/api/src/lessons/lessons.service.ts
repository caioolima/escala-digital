import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
    constructor(private prisma: PrismaService) { }

    async create(courseId: string, dto: CreateLessonDto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');
        return this.prisma.lesson.create({ data: { ...dto, courseId } });
    }

    async findAll(courseId: string) {
        return this.prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) throw new NotFoundException('Lesson not found');
        return lesson;
    }

    async update(id: string, dto: UpdateLessonDto) {
        await this.findOne(id);
        return this.prisma.lesson.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.lesson.delete({ where: { id } });
    }

    async markComplete(lessonId: string, userId: string) {
        return this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            create: { userId, lessonId, completed: true },
            update: { completed: true, watchedAt: new Date() },
        });
    }
}
