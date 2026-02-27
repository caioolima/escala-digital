import { Module } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { TrailsController } from './trails.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
    imports: [PrismaModule, CoursesModule],
    controllers: [TrailsController],
    providers: [TrailsService],
})
export class TrailsModule { }
