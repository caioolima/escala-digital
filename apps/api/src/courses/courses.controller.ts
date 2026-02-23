import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { Role } from '../common/enums';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateCourseDto) {
        return this.coursesService.create(user.id, user.companyId, dto);
    }

    @Get()
    findAll(
        @CurrentUser() user: any,
        @Query('published') published?: string,
    ) {
        const onlyPublished = user.role === Role.STUDENT || published === 'true';
        return this.coursesService.findAll(user.companyId, onlyPublished);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.coursesService.findOne(id, user.companyId);
    }

    @Get(':id/progress')
    getProgress(@CurrentUser() user: any, @Param('id') id: string) {
        return this.coursesService.getProgress(id, user.id);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateCourseDto,
    ) {
        return this.coursesService.update(id, user.companyId, dto);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.CREATOR)
    @Delete(':id')
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.coursesService.remove(id, user.companyId);
    }
}
