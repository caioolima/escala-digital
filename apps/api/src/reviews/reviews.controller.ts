import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post(':courseId')
    @UseGuards(JwtAuthGuard)
    async create(
        @Param('courseId') courseId: string,
        @Body() dto: CreateReviewDto,
        @Req() req: any,
    ) {
        return this.reviewsService.create(req.user.id, courseId, dto);
    }

    @Get('course/:courseId')
    async findByCourse(@Param('courseId') courseId: string) {
        return this.reviewsService.findByCourse(courseId);
    }
}
