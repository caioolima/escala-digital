import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { LessonsModule } from './lessons/lessons.module'
import { TrailsModule } from './trails/trails.module'
import { EnrollmentsModule } from './enrollments/enrollments.module'
import { ReviewsModule } from './reviews/reviews.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    TrailsModule,
    EnrollmentsModule,
    ReviewsModule,
  ],
})
export class AppModule { }