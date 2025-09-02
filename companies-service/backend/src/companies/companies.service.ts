import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { generateUniqueSlug } from '../shared/utils/slug.util';

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

    // Verificar se o slug já existe (apenas se foi fornecido)
    if (createCompanyDto.slug) {
      const existingSlug = await this.companiesRepository.findOne({
        where: { slug: createCompanyDto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('Identificador legível já está em uso');
      }
    }

    // Se não foi fornecido um slug, gerar um baseado no nome
    if (!createCompanyDto.slug) {
      const allSlugs = await this.companiesRepository.find({
        select: ['slug'],
      });
      const existingSlugs = allSlugs.map((c) => c.slug);
      createCompanyDto.slug = generateUniqueSlug(
        null, // Sem prefixo para empresas
        createCompanyDto.name,
        existingSlugs,
      );
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

  async findBySlug(slug: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { slug },
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

  async checkSlugAvailability(slug: string): Promise<boolean> {
    const existingCompany = await this.companiesRepository.findOne({
      where: { slug },
    });

    // Retorna true se o slug estiver disponível (não encontrado)
    return !existingCompany;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
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

    // Se o slug estiver sendo atualizado, verificar se já existe
    if (updateCompanyDto.slug && updateCompanyDto.slug !== company.slug) {
      const existingSlug = await this.companiesRepository.findOne({
        where: { slug: updateCompanyDto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('Identificador legível já está em uso');
      }
    }

    // Se o slug não foi fornecido mas o nome foi alterado, gerar um novo slug
    if (
      !updateCompanyDto.slug &&
      updateCompanyDto.name &&
      updateCompanyDto.name !== company.name
    ) {
      const allSlugs = await this.companiesRepository.find({
        select: ['slug'],
      });
      const existingSlugs = allSlugs.map((c) => c.slug);
      updateCompanyDto.slug = generateUniqueSlug(
        null, // Sem prefixo para empresas
        updateCompanyDto.name,
        existingSlugs,
      );
    }

    Object.assign(company, updateCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
}
