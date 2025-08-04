import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Validar se o usuário tem os dados necessários
    if (!user.id || !user.companyId) {
      throw new UnauthorizedException('Dados do usuário inválidos');
    }

    // Buscar o role do usuário para incluir o código no payload
    let roleCode: string | null = null;
    if (user.roleId) {
      try {
        const role = await this.rolesService.findOne(user.roleId);
        roleCode = role.code;
      } catch (error) {
        // Role não encontrado, continuar sem roleCode
      }
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      companyId: user.companyId,
      roleId: user.roleId,
      roleCode: roleCode
    };
    
    const token = this.jwtService.sign(payload);
    
    const response = {
      access_token: token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
        roleId: user.roleId,
        roleCode: roleCode || undefined,
      },
    };
    
    return response;
  }
} 