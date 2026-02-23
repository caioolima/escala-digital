import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { TrailsModule } from './trails/trails.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    TrailsModule,
    EnrollmentsModule,
  ],
})
export class AppModule { }
