import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cron } from '@nestjs/schedule';
import { unlink } from 'fs/promises';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  private readonly SUPER_ADMIN_EMAIL = 'koushik101517@gmail.com';
  private readonly SUPER_ADMIN_ROLE_NAME = 'super admin';
  private readonly DEFAULT_SUPER_ADMIN_PASSWORD = '12345678';

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async onModuleInit() {
    const roleName = this.SUPER_ADMIN_ROLE_NAME.toLowerCase();

    // Check or create super admin role
    let superAdminRole = await this.prisma.role.findUnique({
      where: { role_name: roleName },
    });

    if (!superAdminRole) {
      superAdminRole = await this.prisma.role.create({
        data: { role_name: roleName },
      });
      this.logger.log(`✅ Role "${roleName}" created`);
    } else {
      this.logger.log(`❕ Role "${roleName}" already exists`);
    }

    // Check or create super admin user
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: this.SUPER_ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        this.DEFAULT_SUPER_ADMIN_PASSWORD,
        10,
      );

      const nextId = await this.getNextRoleId(roleName);

      // Calculate age string from DOB
      const dob = new Date('1970-01-01');
      const age = this.calculateAge(dob);

      await this.prisma.user.create({
        data: {
          user_id: nextId,
          first_name: 'Super',
          last_name: 'Admin',
          email: this.SUPER_ADMIN_EMAIL,
          password_hashed: hashedPassword,
          date_of_birth: dob,
          age,
          gender: 'male',
          role: { connect: { role_name: roleName } },
        },
      });

      this.logger.log(`✅ Super Admin created with ID: ${roleName}-${nextId}`);
    } else {
      this.logger.log(
        `❕ Super Admin user already exists with email: ${this.SUPER_ADMIN_EMAIL}`,
      );
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async ensureEmailIsUnique(email: string, excludeId?: number) {
    const normalizedEmail = this.normalizeEmail(email);

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing && existing.id !== excludeId) {
      const errMsg = `🚫 User with this email: (${normalizedEmail}) already exists`;
      this.logger.warn(errMsg);
      throw new ConflictException(`User with email (${email}) already exists`);
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { password, email, role_id, date_of_birth, ...rest } = createUserDto;

    if (!email || !password || !role_id) {
      this.logger.warn(
        '🛑 Missing required fields: email, password or role_id',
      );
      throw new BadRequestException('Email, password and role_id are required');
    }

    if (!date_of_birth) {
      this.logger.warn('🛑 Date of birth is required');
      throw new BadRequestException('Date of birth is required');
    }

    await this.ensureEmailIsUnique(email);

    const role = await this.prisma.role.findUnique({ where: { id: role_id } });
    if (!role) {
      this.logger.warn(`🛑 Role with ID ${role_id} not found`);
      throw new BadRequestException('Invalid role ID');
    }

    const nextUserId = await this.getNextRoleId(role.role_name);
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = this.normalizeEmail(email);

    const dobDate = new Date(date_of_birth);
    const age = this.calculateAge(dobDate);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email: normalizedEmail,
        password_hashed: hashedPassword,
        user_id: nextUserId,
        date_of_birth: dobDate,
        age,
        role: { connect: { id: role_id } },
      },
      include: {
        role: true,
        EmergencyContact: true,
        profile_image: true,
      },
    });

    this.logger.log(
      `✅ User created: ${role.role_name} ID #${nextUserId} with email: (${email})`,
    );

    return this.formatUser(user);
  }

  async getNextRoleId(roleName: string): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        role: {
          role_name: roleName,
        },
      },
    });

    return count + 1;
  }

  async findAll() {
    this.logger.log('📋 Fetching all users...');
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        EmergencyContact: true,
        profile_image: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return users.map(this.formatUser);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        EmergencyContact: true,
        profile_image: true,
      },
    });

    if (!user) {
      this.logger.warn(`⚠️ User not found: ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`🔍 Retrieved user: ID ${id}`);
    return this.formatUser(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    profileImageFile?: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        EmergencyContact: true,
        profile_image: true,
      },
    });

    if (!existingUser) {
      this.logger.warn(`⚠️ User not found: ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      await this.ensureEmailIsUnique(updateUserDto.email, id);
      updateUserDto.email = this.normalizeEmail(updateUserDto.email);
    }

    const data: any = { ...updateUserDto };

    // ═══════════════════════════════════════════════════════════════════════
    // 🔐 PASSWORD HANDLING
    // ═══════════════════════════════════════════════════════════════════════
    if (data.password) {
      data.password_hashed = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📅 DATE OF BIRTH & AGE HANDLING
    // ═══════════════════════════════════════════════════════════════════════
    if (data.date_of_birth) {
      data.date_of_birth = new Date(data.date_of_birth);
      data.age = this.calculateAge(data.date_of_birth);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🖼️ PROFILE IMAGE HANDLING
    // ═══════════════════════════════════════════════════════════════════════
    if (profileImageFile) {
      // Delete old profile image if exists
      if (existingUser.profile_image) {
        if (existingUser.profile_image.source === 'upload') {
          const filePath = `./uploads/${existingUser.profile_image.file_URL.split('/').pop()}`;
          try {
            await unlink(filePath);
            this.logger.log(
              `🗑️ Deleted old profile image from disk for userId=${id}`,
            );
          } catch (err) {
            this.logger.warn(
              `⚠️ Profile image delete error for userId=${id}: ${err.message}`,
            );
          }
        }
        await this.prisma.file.delete({
          where: { id: existingUser.profile_image.id },
        });
        this.logger.log(`🗑️ Deleted old profile image record for userId=${id}`);
      }

      // Upload new profile image
      const uploadedImage =
        await this.fileUploadService.handleUpload(profileImageFile);
      data.profile_image = { connect: { id: uploadedImage.id } };
      this.logger.log(
        `⬆️ Uploaded new profile image id=${uploadedImage.id} for userId=${id}`,
      );
    }

    // Handle external image URL if provided in DTO
    if ((data as any).profile_image_url && !profileImageFile) {
      // Delete old profile image if exists
      if (existingUser.profile_image) {
        if (existingUser.profile_image.source === 'upload') {
          const filePath = `./uploads/${existingUser.profile_image.file_URL.split('/').pop()}`;
          try {
            await unlink(filePath);
            this.logger.log(
              `🗑️ Deleted old profile image from disk for userId=${id}`,
            );
          } catch (err) {
            this.logger.warn(
              `⚠️ Profile image delete error for userId=${id}: ${err.message}`,
            );
          }
        }
        await this.prisma.file.delete({
          where: { id: existingUser.profile_image.id },
        });
        this.logger.log(`🗑️ Deleted old profile image record for userId=${id}`);
      }

      // Link external image
      const externalImage = await this.fileUploadService.handleExternalLink(
        (data as any).profile_image_url,
      );
      data.profile_image = { connect: { id: externalImage.id } };
      delete (data as any).profile_image_url;
      this.logger.log(
        `🔗 Linked external profile image id=${externalImage.id} for userId=${id}`,
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚨 EMERGENCY CONTACT HANDLING
    // ═══════════════════════════════════════════════════════════════════════
    const emergencyContactData = data.emergency_contact;
    if (emergencyContactData) delete data.emergency_contact;

    // ═══════════════════════════════════════════════════════════════════════
    // 💾 UPDATE USER
    // ═══════════════════════════════════════════════════════════════════════
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
        EmergencyContact: true,
        profile_image: true,
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🚨 UPDATE/CREATE EMERGENCY CONTACT
    // ═══════════════════════════════════════════════════════════════════════
    if (emergencyContactData) {
      if (existingUser.EmergencyContact) {
        await this.prisma.emergencyContact.update({
          where: { id: existingUser.EmergencyContact.id },
          data: { ...emergencyContactData, user_id: id },
        });
      } else {
        await this.prisma.emergencyContact.create({
          data: { ...emergencyContactData, user_id: id },
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📤 RETURN UPDATED USER WITH CONTACT & IMAGE
    // ═══════════════════════════════════════════════════════════════════════
    const userWithContactAndImage = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        EmergencyContact: true,
        profile_image: true,
      },
    });

    this.logger.log(`✏️ Updated user ID: ${id}`);
    return this.formatUser(userWithContactAndImage);
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        profile_image: true,
      },
    });

    if (!user) {
      this.logger.warn(`⚠️ User not found: ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role.role_name.toLowerCase() === this.SUPER_ADMIN_ROLE_NAME) {
      this.logger.warn(`🚫 Cannot delete Super Admin: ID ${id}`);
      throw new ConflictException('Super Admin user cannot be deleted');
    }

    // Delete profile image file if exists
    if (user.profile_image && user.profile_image.source === 'upload') {
      const filePath = `./uploads/${user.profile_image.file_URL.split('/').pop()}`;
      try {
        await unlink(filePath);
        this.logger.log(`🗑️ Deleted profile image from disk for userId=${id}`);
      } catch (err) {
        this.logger.warn(
          `⚠️ Profile image delete error for userId=${id}: ${err.message}`,
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`🗑️ Deleted user ID: ${id}`);
  }

  private formatUser(user: any) {
    return {
      // ═══════════════════════════════════════════════════════════════════════
      // 🆔 IDENTIFICATION
      // ═══════════════════════════════════════════════════════════════════════
      id: user.id,
      display_user_id: `${user.role.role_name}-${user.user_id}`,
      user_id: user.user_id,

      // ═══════════════════════════════════════════════════════════════════════
      // 👤 PERSONAL DETAILS
      // ═══════════════════════════════════════════════════════════════════════
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      date_of_birth: user.date_of_birth
        ? user.date_of_birth.toISOString().split('T')[0]
        : null,

      // ═══════════════════════════════════════════════════════════════════════
      // 🖼️ PROFILE IMAGE
      // ═══════════════════════════════════════════════════════════════════════
      profile_image: user.profile_image
        ? {
            id: user.profile_image.id,
            file_name: user.profile_image.file_name,
            file_URL: user.profile_image.file_URL,
            file_type: user.profile_image.file_type,
            source: user.profile_image.source,
          }
        : null,

      // ═══════════════════════════════════════════════════════════════════════
      // 🏥 MEDICAL INFORMATION
      // ═══════════════════════════════════════════════════════════════════════
      blood_group: user.blood_group,
      height_cm: user.height_cm,
      weight_lbs: user.weight_lbs,
      temperature: user.temperature,
      blood_pressure: user.blood_pressure,
      heart_bit_rate: user.heart_bit_rate,

      // ═══════════════════════════════════════════════════════════════════════
      // 📍 CONTACT & LOCATION
      // ═══════════════════════════════════════════════════════════════════════
      phone_number: user.phone_number,
      address: user.address,
      country: user.country,

      // ═══════════════════════════════════════════════════════════════════════
      // 👥 ROLE & PERMISSIONS
      // ═══════════════════════════════════════════════════════════════════════
      role: user.role
        ? {
            id: user.role.id,
            role_name: user.role.role_name,
          }
        : null,

      // ═══════════════════════════════════════════════════════════════════════
      // 🚨 EMERGENCY CONTACT
      // ═══════════════════════════════════════════════════════════════════════
      emergency_contact: user.EmergencyContact
        ? {
            first_name: user.EmergencyContact.first_name,
            last_name: user.EmergencyContact.last_name,
            phone: user.EmergencyContact.phone,
            relationship: user.EmergencyContact.relationship,
          }
        : null,

      // ═══════════════════════════════════════════════════════════════════════
      // ⏰ TIMESTAMPS
      // ═══════════════════════════════════════════════════════════════════════
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private calculateAge(dateOfBirth: Date): string {
    const now = new Date();
    let years = now.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = now.getMonth() - dateOfBirth.getMonth();
    const dayDiff = now.getDate() - dateOfBirth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }

    return years.toString();
  }

  // Cron job runs at midnight on 1st of every month to update all users' ages automatically
  @Cron('0 0 0 1 * *')
  async updateAllUsersAge() {
    this.logger.log('🔄 Running monthly age update for all users');

    const users = await this.prisma.user.findMany({
      select: { id: true, date_of_birth: true },
    });

    for (const user of users) {
      if (user.date_of_birth) {
        const newAge = this.calculateAge(user.date_of_birth);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { age: newAge },
        });
      }
    }

    this.logger.log(
      `✅ Monthly age update completed for ${users.length} users`,
    );
  }
}
