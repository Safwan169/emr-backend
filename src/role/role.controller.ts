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

@Controller('Roles')
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

  @Get(':Id')
  async findOne(@Param('Id') Id: string) {
    const role = await this.roleService.findById(Number(Id));
    return successResponse(role, 'Role fetched successfully');
  }

  @Put(':Id')
  async update(@Param('Id') Id: string, @Body() dto: UpdateRoleDto) {
    if (!dto.role_name) {
      throw new BadRequestException('role_name is required');
    }
    const updatedRole = await this.roleService.update(
      Number(Id),
      dto.role_name,
    );
    return successResponse(updatedRole, 'Role updated successfully');
  }

  @Delete(':Id')
  async remove(@Param('Id') Id: string) {
    const deletedRole = await this.roleService.delete(Number(Id));
    return successResponse(deletedRole, 'Role deleted successfully');
  }
}
