import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtConfigModule } from '../auth/jwt.module';
import { S3Module } from '../shared/services/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    forwardRef(() => AuthModule),
    JwtConfigModule,
    S3Module,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
