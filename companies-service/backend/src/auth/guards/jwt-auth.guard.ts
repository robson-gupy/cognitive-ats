import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../users/entities/user.entity';

// Interface para o usuário autenticado
interface AuthenticatedUser {
  id: string;
  email: string;
  companyId: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: AuthenticatedUser | null,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    // Se há erro na validação do token
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // Validar se o usuário tem os dados mínimos necessários
    if (!user.id || !user.email || !user.companyId) {
      throw new UnauthorizedException(
        'Token inválido - dados do usuário incompletos',
      );
    }

    return user as TUser;
  }
}
