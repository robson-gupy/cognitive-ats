import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private rolesService: RolesService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Criar roles padrão se não existirem
    await this.rolesService.createDefaultRoles();

    // Criar empresa primeiro
    const companyData: CreateCompanyDto = {
      name: registerDto.companyName,
      corporateName: registerDto.corporateName,
      cnpj: registerDto.cnpj,
      businessArea: registerDto.businessArea,
      description: registerDto.companyDescription,
    };

    const company = await this.companiesService.create(companyData);

    // Buscar role de Administrador
    const adminRole = await this.rolesService.findByCode('ADMIN');
    if (!adminRole) {
      throw new Error('Role de Administrador não encontrado');
    }

    // Criar usuário vinculado à empresa com role de Administrador
    const userData: CreateUserDto = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      companyId: company.id,
      roleId: adminRole.id,
    };

    const user = await this.usersService.create(userData);
    const { password, ...result } = user;

    return {
      message: 'Empresa e usuário registrados com sucesso!',
      company,
      user: result,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Validar se temos os dados necessários do usuário
    if (!req.user || !req.user.sub || !req.user.companyId) {
      throw new UnauthorizedException(
        'Token inválido - dados do usuário ausentes',
      );
    }

    // Buscar dados completos do usuário
    const user = await this.usersService.findOne(
      req.user.sub,
      req.user.companyId,
    );

    // Validar se o email do usuário encontrado corresponde ao email no token
    if (user.email !== req.user.email) {
      throw new UnauthorizedException('Token inválido - email não corresponde');
    }

    const { password, ...result } = user;

    // Adicionar roleCode para compatibilidade com o frontend
    const response = {
      ...result,
      roleCode: result.role?.code,
    };

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Validar se temos os dados necessários do usuário
    if (!req.user || !req.user.sub || !req.user.companyId) {
      throw new UnauthorizedException(
        'Token inválido - dados do usuário ausentes',
      );
    }

    // Atualizar perfil do usuário
    const updatedUser = await this.usersService.updateOwnProfile(
      req.user.sub,
      req.user.companyId,
      updateProfileDto,
    );

    const { password, ...result } = updatedUser;

    return {
      ...result,
      roleCode: result.role?.code,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Validar se temos os dados necessários do usuário
    if (!req.user || !req.user.sub || !req.user.companyId) {
      throw new UnauthorizedException(
        'Token inválido - dados do usuário ausentes',
      );
    }

    // Alterar senha do usuário
    await this.usersService.changePassword(
      req.user.sub,
      req.user.companyId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return { message: 'Senha alterada com sucesso!' };
  }
}
