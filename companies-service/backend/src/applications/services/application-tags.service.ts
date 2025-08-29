import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationTag } from '../entities/application-tag.entity';
import { Application } from '../entities/application.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { User } from '../../users/entities/user.entity';
import { CreateApplicationTagDto } from '../dto/create-application-tag.dto';
import { ApplicationTagResponseDto } from '../dto/application-tag-response.dto';

@Injectable()
export class ApplicationTagsService {
  constructor(
    @InjectRepository(ApplicationTag)
    private readonly applicationTagRepository: Repository<ApplicationTag>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createApplicationTagDto: CreateApplicationTagDto, userId: string, companyId: string): Promise<ApplicationTagResponseDto> {
    // Verificar se a application existe e pertence à empresa
    const application = await this.applicationRepository.findOne({
      where: { id: createApplicationTagDto.applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application não encontrada');
    }

    // Verificar se a tag existe e pertence à empresa
    const tag = await this.tagRepository.findOne({
      where: { id: createApplicationTagDto.tagId, companyId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    // Verificar se já existe a associação
    const existingApplicationTag = await this.applicationTagRepository.findOne({
      where: {
        applicationId: createApplicationTagDto.applicationId,
        tagId: createApplicationTagDto.tagId,
      },
    });

    if (existingApplicationTag) {
      throw new ConflictException('Esta tag já foi adicionada à application');
    }

    // Criar a associação
    const applicationTag = this.applicationTagRepository.create({
      applicationId: createApplicationTagDto.applicationId,
      tagId: createApplicationTagDto.tagId,
      addedByUserId: userId,
    });

    const savedApplicationTag = await this.applicationTagRepository.save(applicationTag);
    return this.mapToResponseDto(savedApplicationTag);
  }

  async findAllByApplication(applicationId: string, companyId: string): Promise<ApplicationTagResponseDto[]> {
    // Verificar se a application existe e pertence à empresa
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application não encontrada');
    }

    // Buscar todas as tags da application com dados relacionados
    const applicationTags = await this.applicationTagRepository.find({
      where: { applicationId },
      relations: ['tag', 'addedByUser'],
      order: { createdAt: 'DESC' },
    });

    return applicationTags.map(tag => this.mapToResponseDto(tag));
  }

  async findAllByTag(tagId: string, companyId: string): Promise<ApplicationTagResponseDto[]> {
    // Verificar se a tag existe e pertence à empresa
    const tag = await this.tagRepository.findOne({
      where: { id: tagId, companyId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    // Buscar todas as applications que usam esta tag
    const applicationTags = await this.applicationTagRepository.find({
      where: { tagId },
      relations: ['application', 'application.job', 'addedByUser'],
      order: { createdAt: 'DESC' },
    });

    return applicationTags.map(tag => this.mapToResponseDto(tag));
  }

  async findOne(id: string, companyId: string): Promise<ApplicationTagResponseDto> {
    const applicationTag = await this.applicationTagRepository.findOne({
      where: { id },
      relations: ['tag', 'application', 'application.job', 'addedByUser'],
    });

    if (!applicationTag) {
      throw new NotFoundException('ApplicationTag não encontrada');
    }

    // Verificar se a tag pertence à empresa
    if (applicationTag.tag.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado a esta tag');
    }

    return this.mapToResponseDto(applicationTag);
  }

  async remove(id: string, userId: string, companyId: string): Promise<void> {
    const applicationTag = await this.applicationTagRepository.findOne({
      where: { id },
      relations: ['tag'],
    });

    if (!applicationTag) {
      throw new NotFoundException('ApplicationTag não encontrada');
    }

    // Verificar se a tag pertence à empresa
    if (applicationTag.tag.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado a esta tag');
    }

    // Verificar se o usuário pode remover (opcional: apenas quem adicionou ou admin)
    if (applicationTag.addedByUserId !== userId) {
      // Aqui você pode adicionar lógica para verificar se é admin
      // Por enquanto, apenas quem adicionou pode remover
    }

    await this.applicationTagRepository.remove(applicationTag);
  }

  async removeByApplicationAndTag(applicationId: string, tagId: string, userId: string, companyId: string): Promise<void> {
    const applicationTag = await this.applicationTagRepository.findOne({
      where: { applicationId, tagId },
      relations: ['tag'],
    });

    if (!applicationTag) {
      throw new NotFoundException('ApplicationTag não encontrada');
    }

    // Verificar se a tag pertence à empresa
    if (applicationTag.tag.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado a esta tag');
    }

    await this.applicationTagRepository.remove(applicationTag);
  }

  async getApplicationTagsSummary(companyId: string): Promise<any[]> {
    // Resumo de tags mais usadas na empresa
    const tagUsage = await this.applicationTagRepository
      .createQueryBuilder('at')
      .leftJoin('at.tag', 'tag')
      .select('tag.id', 'tagId')
      .addSelect('tag.label', 'tagLabel')
      .addSelect('tag.color', 'tagColor')
      .addSelect('tag.textColor', 'tagTextColor')
      .addSelect('COUNT(at.id)', 'usageCount')
      .where('tag.companyId = :companyId', { companyId })
      .groupBy('tag.id')
      .addGroupBy('tag.label')
      .addGroupBy('tag.color')
      .addGroupBy('tag.textColor')
      .orderBy('usageCount', 'DESC')
      .getRawMany();

    return tagUsage;
  }

  private mapToResponseDto(applicationTag: ApplicationTag): ApplicationTagResponseDto {
    const response: ApplicationTagResponseDto = {
      id: applicationTag.id,
      applicationId: applicationTag.applicationId,
      tagId: applicationTag.tagId,
      addedByUserId: applicationTag.addedByUserId,
      createdAt: applicationTag.createdAt,
    };

    // Adicionar dados relacionados se disponíveis
    if (applicationTag.tag) {
      response.tag = {
        id: applicationTag.tag.id,
        label: applicationTag.tag.label,
        color: applicationTag.tag.color,
        textColor: applicationTag.tag.textColor,
      };
    }

    if (applicationTag.application) {
      response.application = {
        id: applicationTag.application.id,
        candidateName: applicationTag.application.firstName 
          ? `${applicationTag.application.firstName} ${applicationTag.application.lastName || ''}`.trim()
          : undefined,
        jobTitle: applicationTag.application.job?.title,
      };
    }

    if (applicationTag.addedByUser) {
      response.addedByUser = {
        id: applicationTag.addedByUser.id,
        firstName: applicationTag.addedByUser.firstName,
        lastName: applicationTag.addedByUser.lastName,
        email: applicationTag.addedByUser.email,
      };
    }

    return response;
  }
}
