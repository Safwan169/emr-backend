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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { successResponse, errorResponse } from '../common/response.handler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 CREATE USER
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return successResponse(
        user,
        '✅ User created successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      return errorResponse(
        error.message || '❌ Failed to create user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 GET ALL USERS
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return successResponse(
        users,
        `📋 Successfully fetched ${users.length} users`,
      );
    } catch (error) {
      return errorResponse(
        error.message || '❌ Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 GET SINGLE USER
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':ID')
  async findOne(@Param('ID') ID: string) {
    try {
      const user = await this.userService.findOne(+ID);
      return successResponse(user, `🔍 User retrieved successfully`);
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to fetch user with ID: ${ID}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ✏️ UPDATE USER WITH PROFILE IMAGE
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':ID')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profile_image', maxCount: 1 }]),
  )
  async update(
    @Param('ID') ID: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
    },
  ) {
    try {
      const profileImageFile = files?.profile_image?.[0];

      const updatedUser = await this.userService.update(
        +ID,
        updateUserDto,
        profileImageFile,
      );

      return successResponse(
        updatedUser,
        `✅ User ID: ${ID} updated successfully`,
      );
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to update user with ID: ${ID}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗑️ DELETE USER
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':ID')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('ID') ID: string) {
    try {
      await this.userService.remove(+ID);
      return successResponse(null, `🗑️ User ID: ${ID} deleted successfully`);
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to delete user with ID: ${ID}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
