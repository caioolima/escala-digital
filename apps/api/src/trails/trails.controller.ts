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
import { TrailsService } from './trails.service';
import { CreateTrailDto, UpdateTrailDto, AddCourseToTrailDto } from './dto/trail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('trails')
export class TrailsController {
    constructor(private readonly trailsService: TrailsService) { }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateTrailDto) {
        return this.trailsService.create(user.companyId, dto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.trailsService.findAll(user.companyId, user.id);
    }

    @Get('enrollments/me')
    getMyTrailEnrollments(@CurrentUser() user: any) {
        return this.trailsService.getMyTrailEnrollments(user.id);
    }

    @Post(':id/enroll')
    enroll(@CurrentUser() user: any, @Param('id') id: string) {
        return this.trailsService.enroll(user.id, user.companyId, id);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.trailsService.findOne(id, user.id);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTrailDto) {
        return this.trailsService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.trailsService.remove(id);
    }

    @Get(':id/progress')
    getProgress(@CurrentUser() user: any, @Param('id') id: string) {
        return this.trailsService.getProgress(id, user.id);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Post(':id/courses')
    addCourse(@Param('id') id: string, @Body() dto: AddCourseToTrailDto) {
        return this.trailsService.addCourse(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Delete(':id/courses/:courseId')
    removeCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
        return this.trailsService.removeCourse(id, courseId);
    }
}
