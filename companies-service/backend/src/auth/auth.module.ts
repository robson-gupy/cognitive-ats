import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { JwtConfigModule } from './jwt.module';
import { AuthLoggingInterceptor } from './auth.interceptor';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    CompaniesModule,
    RolesModule,
    PassportModule,
    JwtConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AdminAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthLoggingInterceptor,
    },
  ],
  exports: [AuthService, AdminAuthGuard],
})
export class AuthModule {}
