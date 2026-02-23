import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @Post(':courseId')
    enroll(@CurrentUser() user: any, @Param('courseId') courseId: string) {
        return this.enrollmentsService.enroll(user.id, courseId);
    }

    @Get('me')
    getMyEnrollments(@CurrentUser() user: any) {
        return this.enrollmentsService.getMyEnrollments(user.id);
    }
}
