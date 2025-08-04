import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  findAll(@Request() req) {
    const userCompanyId = req.user.companyId;
    return this.usersService.findAll(userCompanyId);
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const userCompanyId = req.user.companyId;
    return this.usersService.findOne(id, userCompanyId);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userCompanyId = req.user.companyId;
    return this.usersService.update(id, updateUserDto, userCompanyId);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const userCompanyId = req.user.companyId;
    await this.usersService.remove(id, userCompanyId);
    return { message: 'Usuário excluído com sucesso' };
  }
} 