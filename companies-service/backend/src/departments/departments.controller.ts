import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    if (companyId) {
      return this.departmentsService.findByCompany(companyId);
    }
    return this.departmentsService.findAll();
  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(id);
    return { message: 'Departamento excluído com sucesso' };
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.departmentsService.deactivate(id);
  }
}
