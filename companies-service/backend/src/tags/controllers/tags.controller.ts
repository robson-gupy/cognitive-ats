import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagResponseDto } from '../dto/tag-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTagDto: CreateTagDto,
    @Request() req,
  ): Promise<TagResponseDto> {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.tagsService.create(createTagDto, companyId);
  }

  @Get()
  async findAll(@Request() req): Promise<TagResponseDto[]> {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.tagsService.findAll(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<TagResponseDto> {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.tagsService.findOne(id, companyId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req,
  ): Promise<TagResponseDto> {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.tagsService.update(id, updateTagDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.tagsService.remove(id, companyId);
  }
}
