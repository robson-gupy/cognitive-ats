import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

// Interface para o usuário retornado sem a senha
interface UserWithoutPassword {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  company: User['company'];
  departmentId: string | null;
  department: User['department'];
  roleId: string | null;
  role: User['role'];
  createdAt: Date;
  updatedAt: Date;
  createdJobs: User['createdJobs'];
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _, ...result } = user;
    return result as UserWithoutPassword;
  }
}
