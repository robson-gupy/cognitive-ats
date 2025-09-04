import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthLoggingInterceptor } from './auth.interceptor';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    CompaniesModule,
    RolesModule,
    PassportModule,
    (() => {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      return JwtModule.register({
        secret: jwtSecret,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
      });
    })(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AdminAuthGuard,
    JwtAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthLoggingInterceptor,
    },
  ],
  exports: [AuthService, AdminAuthGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
