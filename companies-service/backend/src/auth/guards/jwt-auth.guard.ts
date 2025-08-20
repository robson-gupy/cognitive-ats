import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard {
  constructor(private moduleRef: ModuleRef) {}

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') return undefined;

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return undefined;

    const [type, token] = parts;
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const jwtService = this.moduleRef.get(JwtService, { strict: false });
      const payload = await jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Adicionar o payload do JWT ao request
      request.user = payload;
      return true;
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
