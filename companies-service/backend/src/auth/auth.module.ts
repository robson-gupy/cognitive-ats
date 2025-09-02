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
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
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
