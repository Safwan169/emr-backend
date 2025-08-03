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

@Controller('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return successResponse(
      user,
      'User created successfully',
      HttpStatus.CREATED,
    );
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

  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    try {
      const user = await this.userService.findOne(+ID);
      return successResponse(user, 'User fetched successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'Failed to fetch user',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':ID')
  async update(@Param('ID') ID: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updated = await this.userService.update(+ID, updateUserDto);
      return successResponse(updated, 'User updated successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'User update failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':ID')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('ID') ID: string) {
    try {
      await this.userService.remove(+ID);
      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      return errorResponse(
        error.message || 'User deletion failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
