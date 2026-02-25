import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, courseId: string, dto: CreateReviewDto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        const review = await this.prisma.review.create({
            data: {
                ...dto,
                userId,
                courseId,
            },
            include: { user: { select: { name: true, avatarUrl: true } } }
        });

        // Update course average rating (simplified)
        const reviews = await this.prisma.review.findMany({ where: { courseId } });
        const avgRating = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length;

        await this.prisma.course.update({
            where: { id: courseId },
            data: { rating: parseFloat(avgRating.toFixed(1)) },
        });

        return review;
    }

    async findByCourse(courseId: string) {
        return this.prisma.review.findMany({
            where: { courseId },
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
}
