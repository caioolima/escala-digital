import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Role } from '../common/enums';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('courses/:courseId/lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Post()
    create(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto) {
        return this.lessonsService.create(courseId, dto);
    }

    @Get()
    findAll(@Param('courseId') courseId: string) {
        return this.lessonsService.findAll(courseId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(id);
    }

    @Post(':id/complete')
    markComplete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.lessonsService.markComplete(id, user.id);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.lessonsService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }
}
