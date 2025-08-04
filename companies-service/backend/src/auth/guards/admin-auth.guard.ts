import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new ForbiddenException('Token não fornecido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userRoleCode = payload.roleCode;

      if (!userRoleCode || userRoleCode !== 'ADMIN') {
        throw new ForbiddenException('Acesso negado: apenas administradores podem acessar este recurso');
      }

      // Adicionar informações completas do usuário ao request
      request.user = {
        id: payload.sub || payload.id,
        companyId: payload.companyId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        roleCode: payload.roleCode,
      };
      
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Token inválido');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 