import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { JobStage } from '../../jobs/entities/job-stage.entity';
import { ApplicationStageHistory } from '../entities/application-stage-history.entity';
import { ChangeApplicationStageDto } from '../dto/change-application-stage.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ApplicationStageService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(JobStage)
    private jobStagesRepository: Repository<JobStage>,
    @InjectRepository(ApplicationStageHistory)
    private applicationStageHistoryRepository: Repository<ApplicationStageHistory>,
  ) {}

  async changeStage(
    applicationId: string,
    jobId: string,
    companyId: string,
    changeStageDto: ChangeApplicationStageDto,
    user: User,
  ): Promise<Application> {
    // Buscar a aplicação
    const application = await this.applicationsRepository.findOne({
      where: {
        id: applicationId,
        jobId,
        companyId,
      },
      relations: ['currentStage'],
    });

    if (!application) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    // Verificar se a nova etapa existe e pertence à vaga
    const newStage = await this.jobStagesRepository.findOne({
      where: {
        id: changeStageDto.toStageId,
        jobId,
      },
    });

    if (!newStage) {
      throw new BadRequestException('Etapa não encontrada ou não pertence a esta vaga');
    }

    // Verificar se não está tentando mudar para a mesma etapa
    if (application.currentStageId === changeStageDto.toStageId) {
      throw new BadRequestException('A aplicação já está nesta etapa');
    }

    // Criar registro no histórico
    const historyEntry = this.applicationStageHistoryRepository.create({
      applicationId,
      jobId,
      companyId,
      fromStageId: application.currentStageId,
      toStageId: changeStageDto.toStageId,
      changedById: user.id,
      notes: changeStageDto.notes,
    });

    await this.applicationStageHistoryRepository.save(historyEntry);

    // Atualizar a etapa corrente da aplicação

    application.currentStageId = changeStageDto.toStageId;

    // Forçar uma atualização direta no banco para garantir que os dados estão persistidos
    console.log('Executando update direto no banco para currentStageId:', changeStageDto.toStageId);
    await this.applicationsRepository
      .createQueryBuilder()
      .update(Application)
      .set({ currentStageId: changeStageDto.toStageId })
      .where('id = :id', { id: applicationId })
      .execute();
    console.log('Update direto executado com sucesso');
    
    // Retornar a aplicação atualizada com as relações
    const updatedApplication = await this.applicationsRepository.findOne({
      where: { 
        id: applicationId,
        jobId,
        companyId,
      },
      relations: ['currentStage', 'stageHistory', 'stageHistory.fromStage', 'stageHistory.toStage', 'stageHistory.changedBy'],
    });

    if (!updatedApplication) {
      throw new NotFoundException('Aplicação não encontrada após atualização');
    }

    console.log('Aplicação retornada com currentStageId:', updatedApplication.currentStageId);
    return updatedApplication;
  }

  async getStageHistory(
    applicationId: string,
    jobId: string,
    companyId: string,
  ): Promise<ApplicationStageHistory[]> {
    // Verificar se a aplicação existe
    const application = await this.applicationsRepository.findOne({
      where: {
        id: applicationId,
        jobId,
        companyId,
      },
    });

    if (!application) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    // Buscar histórico de mudanças de etapa
    return this.applicationStageHistoryRepository.find({
      where: {
        applicationId,
        jobId,
        companyId,
      },
      relations: ['fromStage', 'toStage', 'changedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getApplicationsByStage(
    jobId: string,
    companyId: string,
    stageId: string,
  ): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: {
        jobId,
        companyId,
        currentStageId: stageId,
      },
      relations: ['currentStage', 'resume'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
