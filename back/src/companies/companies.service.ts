import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Verificar se o CNPJ já existe
    const existingCompany = await this.companiesRepository.findOne({
      where: { cnpj: createCompanyDto.cnpj },
    });
    
    if (existingCompany) {
      throw new ConflictException('CNPJ já está cadastrado');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return await this.companiesRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }
    
    return company;
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    return await this.companiesRepository.findOne({
      where: { cnpj },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    // Se o CNPJ estiver sendo atualizado, verificar se já existe
    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { cnpj: updateCompanyDto.cnpj },
      });
      
      if (existingCompany) {
        throw new ConflictException('CNPJ já está cadastrado');
      }
    }

    Object.assign(company, updateCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
} 