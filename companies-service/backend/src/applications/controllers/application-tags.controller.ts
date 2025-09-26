import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApplicationTagsService } from '../services/application-tags.service';
import { CreateApplicationTagDto } from '../dto/create-application-tag.dto';
import { ApplicationTagResponseDto } from '../dto/application-tag-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('application-tags')
@UseGuards(JwtAuthGuard)
export class ApplicationTagsController {
  constructor(
    private readonly applicationTagsService: ApplicationTagsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createApplicationTagDto: CreateApplicationTagDto,
    @Request() req,
  ): Promise<ApplicationTagResponseDto> {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    if (!userId || !companyId) {
      throw new Error(
        'Dados de usuário não encontrados no token de autenticação',
      );
    }

    return this.applicationTagsService.create(
      createApplicationTagDto,
      userId,
      companyId,
    );
  }

  @Get('application/:applicationId')
  async findAllByApplication(
    @Param('applicationId') applicationId: string,
    @Request() req,
  ): Promise<ApplicationTagResponseDto[]> {
    const companyId = req.user.companyId;

    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.applicationTagsService.findAllByApplication(
      applicationId,
      companyId,
    );
  }

  @Get('tag/:tagId')
  async findAllByTag(
    @Param('tagId') tagId: string,
    @Request() req,
  ): Promise<ApplicationTagResponseDto[]> {
    const companyId = req.user.companyId;

    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.applicationTagsService.findAllByTag(tagId, companyId);
  }

  @Get('summary')
  async getTagsSummary(@Request() req): Promise<any[]> {
    const companyId = req.user.companyId;

    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.applicationTagsService.getApplicationTagsSummary(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApplicationTagResponseDto> {
    const companyId = req.user.companyId;

    if (!companyId) {
      throw new Error('CompanyId não encontrado no token de autenticação');
    }

    return this.applicationTagsService.findOne(id, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    if (!userId || !companyId) {
      throw new Error(
        'Dados de usuário não encontrados no token de autenticação',
      );
    }

    return this.applicationTagsService.remove(id, userId, companyId);
  }

  @Delete('application/:applicationId/tag/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByApplicationAndTag(
    @Param('applicationId') applicationId: string,
    @Param('tagId') tagId: string,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    if (!userId || !companyId) {
      throw new Error(
        'Dados de usuário não encontrados no token de autenticação',
      );
    }

    return this.applicationTagsService.removeByApplicationAndTag(
      applicationId,
      tagId,
      userId,
      companyId,
    );
  }
}
