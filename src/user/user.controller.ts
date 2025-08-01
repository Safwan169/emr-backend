import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { successResponse, errorResponse } from '../common/response.handler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return successResponse(
        user,
        'User created successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      return errorResponse(
        error.message || 'Failed to create user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return successResponse(users, 'Users fetched successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(+id);
      return successResponse(user, 'User fetched successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'Failed to fetch user',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updated = await this.userService.update(+id, updateUserDto);
      return successResponse(updated, 'User updated successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'User update failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    try {
      await this.userService.remove(+id);
      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'User deletion failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
