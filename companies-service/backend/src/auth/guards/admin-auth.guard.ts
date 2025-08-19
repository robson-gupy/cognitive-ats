import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se o usuário tem roleCode e se é ADMIN
    if (!user.roleCode || user.roleCode !== 'ADMIN') {
      throw new ForbiddenException(
        'Acesso negado: apenas administradores podem acessar este recurso',
      );
    }

    return true;
  }
}
