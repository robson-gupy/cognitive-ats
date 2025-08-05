import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      // Usar UsersService para buscar usuário (inclui validação de empresa)
      const user = await this.usersService.findOne(
        payload.sub,
        payload.companyId,
      );

      // Validar se o email no payload corresponde ao usuário
      if (payload.email !== user.email) {
        throw new UnauthorizedException(
          'Token inválido - email não corresponde',
        );
      }

      return {
        id: user.id,
        sub: user.id, // Adicionar 'sub' para compatibilidade
        email: user.email,
        companyId: user.companyId,
        roleId: user.roleId,
        roleCode: user.role?.code,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
