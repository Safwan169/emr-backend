import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  // Constants for default super admin user creation
  private readonly SUPER_ADMIN_EMAIL = 'fibbitto06@gmail.com';
  private readonly SUPER_ADMIN_ROLE_NAME = 'super admin';
  private readonly DEFAULT_SUPER_ADMIN_PASSWORD = '12345678';

  constructor(private readonly prisma: PrismaService) {}

  // Lifecycle hook to initialize super admin role & user on module init
  async onModuleInit() {
    const normalizedRoleName = this.SUPER_ADMIN_ROLE_NAME.toLowerCase();

    // Check or create super admin role
    let superAdminRole = await this.prisma.role.findUnique({
      where: { role_name: normalizedRoleName },
    });

    if (!superAdminRole) {
      superAdminRole = await this.prisma.role.create({
        data: { role_name: normalizedRoleName },
      });
      this.logger.log(`✅ Role "${normalizedRoleName}" created`);
    } else {
      this.logger.log(`❕ Role "${normalizedRoleName}" already exists`);
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

      await this.prisma.user.create({
        data: {
          first_name: 'Super',
          last_name: 'Admin',
          email: this.SUPER_ADMIN_EMAIL,
          password_hashed: hashedPassword,
          role: { connect: { role_name: normalizedRoleName } },
        },
      });

      this.logger.log(
        `✅ Super Admin user created and attached to role "${normalizedRoleName}"`,
      );
    } else {
      this.logger.log(`❕ Super Admin user already exists`);
    }
  }

  // Create new user with hashed password & connected role
  async create(createUserDto: CreateUserDto) {
    const { password, role_id, date_of_birth, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const dob = new Date(date_of_birth);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        date_of_birth: dob,
        password_hashed: hashedPassword,
        role: { connect: { id: role_id } },
      },
      include: { role: true },
    });

    this.logger.log(`✅ User created: ${user.email}`);

    return this.formatUser(user);
  }

  // Retrieve all users, ordered by newest first
  async findAll() {
    this.logger.log('📋 Fetched all users');
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { created_at: 'desc' },
    });

    return users.map(this.formatUser);
  }

  // Retrieve a single user by id
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      this.logger.warn(`⚠️ User not found with ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`🔍 User retrieved: ID ${id}`);
    return this.formatUser(user);
  }

  // Update user details including optional password hashing
  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      this.logger.warn(`⚠️ User not found with ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password_hashed = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    this.logger.log(`✏️ User updated: ID ${id}`);
    return this.formatUser(updatedUser);
  }

  // Remove user by id with protection for super admin
  async remove(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existingUser) {
      this.logger.warn(`⚠️ User not found with ID ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (
      existingUser.role &&
      existingUser.role.role_name.toLowerCase() === this.SUPER_ADMIN_ROLE_NAME
    ) {
      this.logger.warn(
        `🚫 Attempt to delete Super Admin user: ID ${id} (${existingUser.email})`,
      );
      this.logger.warn(`🚫 Super Admin user cannot be deleted`);
      throw new ConflictException('Super Admin user cannot be deleted');
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`🗑️ User deleted: ID ${id}, email: ${existingUser.email}`);
  }

  // Helper to format user data consistently
  private formatUser(user: any) {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_of_birth: user.date_of_birth
        ? user.date_of_birth.toISOString().split('T')[0]
        : null,
      gender: user.gender,
      role: user.role
        ? {
            id: user.role.id,
            role_name: user.role.role_name,
          }
        : null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
