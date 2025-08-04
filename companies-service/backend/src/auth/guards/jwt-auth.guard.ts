import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any) {
    // Se há erro na validação do token
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // Validar se o usuário tem os dados mínimos necessários
    if (!user.id || !user.email || !user.companyId) {
      throw new UnauthorizedException('Token inválido - dados do usuário incompletos');
    }

    return user;
  }
} 