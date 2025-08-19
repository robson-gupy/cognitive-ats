import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  validate(payload: any): any {
    // Aqui você pode adicionar validações adicionais se necessário
    // Por exemplo, verificar se o usuário ainda existe no banco
    return {
      id: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
    };
  }
}
