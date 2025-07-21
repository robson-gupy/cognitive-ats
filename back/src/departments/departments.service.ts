import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Verificar se já existe um departamento com o mesmo código
    const existingDepartment = await this.departmentsRepository.findOne({
      where: { code: createDepartmentDto.code }
    });

    if (existingDepartment) {
      throw new ConflictException('Já existe um departamento com este código');
    }

    const department = this.departmentsRepository.create(createDepartmentDto);
    return await this.departmentsRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentsRepository.find({
      relations: ['company'],
      order: { name: 'ASC' }
    });
  }

  async findByCompany(companyId: string): Promise<Department[]> {
    return await this.departmentsRepository.find({
      where: { companyId, isActive: true },
      relations: ['company'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['company', 'users']
    });

    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Se estiver atualizando o código, verificar se já existe outro com o mesmo código
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingDepartment = await this.departmentsRepository.findOne({
        where: { code: updateDepartmentDto.code }
      });

      if (existingDepartment) {
        throw new ConflictException('Já existe um departamento com este código');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return await this.departmentsRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    
    // Verificar se há usuários associados ao departamento
    if (department.users && department.users.length > 0) {
      throw new ConflictException('Não é possível excluir um departamento que possui usuários associados');
    }

    await this.departmentsRepository.remove(department);
  }

  async deactivate(id: string): Promise<Department> {
    const department = await this.findOne(id);
    department.isActive = false;
    return await this.departmentsRepository.save(department);
  }
} 