import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar se já existe um role com o mesmo código
    const existingRole = await this.rolesRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existingRole) {
      throw new ConflictException('Já existe um role com este código');
    }

    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<Role[]> {
    return await this.rolesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException('Role não encontrado');
    }

    return role;
  }

  async findByCode(code: string): Promise<Role | null> {
    return await this.rolesRepository.findOne({
      where: { code, isActive: true },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Se estiver atualizando o código, verificar se já existe outro com o mesmo código
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.rolesRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existingRole) {
        throw new ConflictException('Já existe um role com este código');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // Verificar se há usuários associados ao role
    if (role.users && role.users.length > 0) {
      throw new ConflictException(
        'Não é possível excluir um role que possui usuários associados',
      );
    }

    await this.rolesRepository.remove(role);
  }

  async deactivate(id: string): Promise<Role> {
    const role = await this.findOne(id);
    role.isActive = false;
    return await this.rolesRepository.save(role);
  }

  // Método para criar roles padrão
  async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'Administrador',
        code: RoleType.ADMIN,
        description: 'Acesso completo ao sistema',
      },
      {
        name: 'Recrutador',
        code: RoleType.RECRUITER,
        description: 'Acesso para gerenciar candidatos e vagas',
      },
      {
        name: 'Gestor',
        code: RoleType.MANAGER,
        description: 'Acesso para gerenciar equipes e processos',
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.findByCode(roleData.code);
      if (!existingRole) {
        await this.create(roleData);
      }
    }
  }
}
