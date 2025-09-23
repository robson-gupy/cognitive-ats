import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
} from '@nestjs/common';
import { ApplicationsService } from '../services/applications.service';
import { InternalUpdateApplicationDto } from '../dto/internal-update-application.dto';

@Controller('internal/applications')
export class InternalCommunicationController {
  private readonly logger = new Logger(InternalCommunicationController.name);

  constructor(private readonly applicationsService: ApplicationsService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateApplicationField(
    @Param('id') id: string,
    @Body() updateDto: InternalUpdateApplicationDto,
  ) {
    this.logger.log(
      `Atualizando campo da application ${id}: ${JSON.stringify(updateDto)}`,
    );

    return this.applicationsService.updateFieldById(id, updateDto);
  }
}
