import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se o email já existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }

  async findAll(userCompanyId: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: { companyId: userCompanyId },
      relations: ['company', 'role'],
    });
  }

  async findOne(id: string, userCompanyId: string): Promise<User> {
    // Validar se o ID é válido
    if (!id || id === 'undefined' || id === 'null') {
      throw new UnauthorizedException('ID do usuário inválido');
    }

    // Validar se o companyId é válido
    if (
      !userCompanyId ||
      userCompanyId === 'undefined' ||
      userCompanyId === 'null'
    ) {
      throw new UnauthorizedException('CompanyId inválido');
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário pertence à mesma empresa
    if (user.companyId !== userCompanyId) {
      throw new ForbiddenException(
        'Acesso negado: usuário não pertence à sua empresa',
      );
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'companyId',
        'roleId',
        'createdAt',
        'updatedAt',
      ],
      relations: ['company', 'role'],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    userCompanyId: string,
  ): Promise<User> {
    const user = await this.findOne(id, userCompanyId);

    // Verificar se o email já existe (se estiver sendo atualizado)
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se a senha estiver sendo atualizada, fazer hash
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async updateOwnProfile(
    userId: string,
    userCompanyId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOne(userId, userCompanyId);

    // Verificar se o email já existe (se estiver sendo atualizado)
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Atualizar apenas os campos permitidos
    user.firstName = updateProfileDto.firstName;
    user.lastName = updateProfileDto.lastName;
    user.email = updateProfileDto.email;

    return await this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    userCompanyId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findOne(userId, userCompanyId);

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Verificar se a nova senha é diferente da atual
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual',
      );
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await this.usersRepository.save(user);
  }

  async remove(id: string, userCompanyId: string): Promise<void> {
    const user = await this.findOne(id, userCompanyId);
    await this.usersRepository.remove(user);
  }
}
