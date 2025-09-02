import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagResponseDto } from '../dto/tag-response.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(
    createTagDto: CreateTagDto,
    companyId: string,
  ): Promise<TagResponseDto> {
    // Verificar se já existe uma tag com o mesmo label na empresa
    const existingTag = await this.tagRepository.findOne({
      where: { label: createTagDto.label, companyId },
    });

    if (existingTag) {
      throw new ConflictException('Já existe uma tag com este nome na empresa');
    }

    const tag = this.tagRepository.create({
      ...createTagDto,
      companyId,
      color: createTagDto.color || '#3B82F6',
      textColor: createTagDto.textColor || '#FFFFFF',
    });

    const savedTag = await this.tagRepository.save(tag);
    return this.mapToResponseDto(savedTag);
  }

  async findAll(companyId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.find({
      where: { companyId },
      order: { label: 'ASC' },
    });

    return tags.map((tag) => this.mapToResponseDto(tag));
  }

  async findOne(id: string, companyId: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({
      where: { id, companyId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    return this.mapToResponseDto(tag);
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    companyId: string,
  ): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({
      where: { id, companyId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    // Se estiver atualizando o label, verificar se já existe outro com o mesmo nome
    if (updateTagDto.label && updateTagDto.label !== tag.label) {
      const existingTag = await this.tagRepository.findOne({
        where: { label: updateTagDto.label, companyId },
      });

      if (existingTag) {
        throw new ConflictException(
          'Já existe uma tag com este nome na empresa',
        );
      }
    }

    Object.assign(tag, updateTagDto);
    const updatedTag = await this.tagRepository.save(tag);
    return this.mapToResponseDto(updatedTag);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id, companyId },
    });

    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    await this.tagRepository.remove(tag);
  }

  private mapToResponseDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      label: tag.label,
      companyId: tag.companyId,
      color: tag.color,
      textColor: tag.textColor,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
