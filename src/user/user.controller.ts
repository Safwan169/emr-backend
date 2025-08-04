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
import { UpdateEmergencyContactDto } from './dto/emergency-contact.dto';

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
  @Get(':Id')
  async findOne(@Param('Id') Id: string) {
    try {
      const user = await this.userService.findOne(+Id);
      return successResponse(user, `🔍 User retrieved successfully`);
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to fetch user with ID: ${Id}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ✏️ UPDATE USER WITH PROFILE IMAGE
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':Id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profile_image', maxCount: 1 }]),
  )
  async update(
    @Param('Id') Id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
    },
  ) {
    try {
      const profileImageFile = files?.profile_image?.[0];

      const updatedUser = await this.userService.update(
        +Id,
        updateUserDto,
        profileImageFile,
      );

      return successResponse(
        updatedUser,
        `✅ User ID: ${Id} updated successfully`,
      );
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to update user with ID: ${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //=============================================================================================================================

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 GET EMERGENCY CONTACT BY USER ID
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':Id/EmergencyContact')
  async getEmergencyContact(@Param('Id') Id: string) {
    try {
      const emergencyContact = await this.userService.getEmergencyContact(+Id);
      return successResponse(
        emergencyContact,
        `🔍 Emergency contact retrieved successfully`,
      );
    } catch (error) {
      return errorResponse(
        error.message ||
          `❌ Failed to fetch emergency contact for user ID: ${Id}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ✏️ UPDATE/CREATE EMERGENCY CONTACT (UPSERT)
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':Id/EmergencyContact')
  async updateEmergencyContact(
    @Param('Id') Id: string,
    @Body() updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    try {
      const updatedEmergencyContact =
        await this.userService.updateEmergencyContact(
          +Id,
          updateEmergencyContactDto,
        );

      return successResponse(
        updatedEmergencyContact,
        `✅ Emergency contact updated successfully for user ID: ${Id}`,
      );
    } catch (error) {
      return errorResponse(
        error.message ||
          `❌ Failed to update emergency contact for user ID: ${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗑️ DELETE EMERGENCY CONTACT
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':Id/EmergencyContact')
  async deleteEmergencyContact(@Param('Id') Id: string) {
    try {
      await this.userService.deleteEmergencyContact(+Id);
      return successResponse(
        null,
        `🗑️ Emergency contact deleted successfully for user ID: ${Id}`,
      );
    } catch (error) {
      return errorResponse(
        error.message ||
          `❌ Failed to delete emergency contact for user ID: ${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //=============================================================================================================================

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗑️ DELETE USER
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':Id')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('Id') Id: string) {
    try {
      await this.userService.remove(+Id);
      return successResponse(null, `🗑️ User ID: ${Id} deleted successfully`);
    } catch (error) {
      return errorResponse(
        error.message || `❌ Failed to delete user with ID: ${Id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
