import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Interface para tipar o request com user do JWT
interface JwtRequest extends Request {
  user: {
    sub: string;
    email: string;
    companyId: string;
    [key: string]: any;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post('register')
  async register(
    @Body() registerData: { company: CreateCompanyDto; user: CreateUserDto },
  ) {
    const { company: companyData, user: userData } = registerData;

    // Criar empresa primeiro
    const company = await this.companiesService.create(companyData);

    // Criar usuário associado à empresa
    userData.companyId = company.id;
    const user = await this.usersService.create(userData);
    const { password: _, ...result } = user;

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
  async getProfile(@Request() req: JwtRequest) {
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

    const { password: _, ...result } = user;

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
    @Request() req: JwtRequest,
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

    const { password: _, ...result } = updatedUser;

    return {
      ...result,
      roleCode: result.role?.code,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: JwtRequest,
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
