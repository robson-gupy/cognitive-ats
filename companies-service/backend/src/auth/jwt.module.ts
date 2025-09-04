import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
  exports: [JwtModule],
})
export class JwtConfigModule {}
