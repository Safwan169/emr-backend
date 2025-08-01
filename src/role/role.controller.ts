import { successResponse } from 'src/common/response.handler';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('roles')
// @UseGuards(JwtAuthGuard, AdminGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.roleService.create(dto.role_name);
    return successResponse(role, 'Role created successfully', 201);
  }

  @Get()
  async findAll() {
    const roles = await this.roleService.findAll();
    return successResponse(roles, 'Roles fetched successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findById(Number(id));
    return successResponse(role, 'Role fetched successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    if (!dto.role_name) {
      throw new BadRequestException('role_name is required');
    }
    const updatedRole = await this.roleService.update(
      Number(id),
      dto.role_name,
    );
    return successResponse(updatedRole, 'Role updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedRole = await this.roleService.delete(Number(id));
    return successResponse(deletedRole, 'Role deleted successfully');
  }
}
