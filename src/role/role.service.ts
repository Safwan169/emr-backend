import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  private async seedDefaultRoles() {
    const defaultRoles = ['Patient', 'Doctor'];

    for (const roleName of defaultRoles) {
      const normalized = this.normalizeRoleName(roleName);
      const exists = await this.prisma.role.findUnique({
        where: { role_name: normalized },
      });

      if (!exists) {
        await this.prisma.role.create({ data: { role_name: normalized } });
        this.logger.log(`✅ Seeded role: "${normalized}"`);
      } else {
        this.logger.debug(`ℹ️ Role already exists: "${normalized}"`);
      }
    }
  }

  async create(role_name: string) {
    if (!role_name || role_name.trim().length === 0) {
      const errMsg = '🛑 role_name is required';
      this.logger.warn(errMsg);
      throw new ConflictException(errMsg);
    }

    await this.ensureRoleNameIsUnique(role_name);

    const normalizedName = this.normalizeRoleName(role_name);

    try {
      const role = await this.prisma.role.create({
        data: { role_name: normalizedName },
      });
      this.logger.log(`✅ Role created: ID ${role.id} ("${role.role_name}")`);
      return role;
    } catch (error) {
      this.logger.error(
        `🔥 Failed to create role: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('🔥 Failed to create role');
    }
  }

  async findAll() {
    this.logger.log('📋 Fetching all roles');
    try {
      return await this.prisma.role.findMany({
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      this.logger.error(
        `🔥 Failed to fetch roles: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('🔥 Failed to fetch roles');
    }
  }

  async findById(id: number) {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });

      if (!role) {
        this.logger.warn(`❌ Role not found: ID ${id}`);
        throw new NotFoundException('Role not found');
      }

      this.logger.debug(`🔍 Fetched role: ID ${id} ("${role.role_name}")`);
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `🔥 Failed to find role by ID: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('🔥 Failed to find role');
    }
  }

  async update(id: number, newName: string) {
    if (!newName || newName.trim().length === 0) {
      const errMsg = '🛑 role_name is required for update';
      this.logger.warn(errMsg);
      throw new ConflictException(errMsg);
    }

    await this.ensureRoleNameIsUnique(newName, id);

    await this.findById(id);

    const normalizedName = this.normalizeRoleName(newName);

    try {
      const updated = await this.prisma.role.update({
        where: { id },
        data: { role_name: normalizedName },
      });

      this.logger.log(`✏️ Role updated: ID ${id} → "${updated.role_name}"`);
      return updated;
    } catch (error) {
      this.logger.error(
        `🔥 Failed to update role: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('🔥 Failed to update role');
    }
  }

  async delete(id: number) {
    const role = await this.findById(id);

    const protectedRoles = ['super admin', 'patient'];

    if (protectedRoles.includes(role.role_name.toLowerCase())) {
      const errMsg = `🚫 '${role.role_name}' role cannot be deleted`;
      this.logger.warn(`${errMsg} - ID ${id} ("${role.role_name}")`);
      throw new ConflictException(errMsg);
    }

    try {
      const deleted = await this.prisma.role.delete({ where: { id } });
      this.logger.warn(
        `🗑️ Role deleted: ID ${id}, name: "${deleted.role_name}"`,
      );
      return deleted;
    } catch (error) {
      this.logger.error(
        `🔥 Failed to delete role: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('🔥 Failed to delete role');
    }
  }

  private normalizeRoleName(name: string): string {
    return name.trim().toLowerCase();
  }

  private async ensureRoleNameIsUnique(name: string, excludeId?: number) {
    const normalizedName = this.normalizeRoleName(name);

    const existing = await this.prisma.role.findUnique({
      where: { role_name: normalizedName },
    });

    if (existing && existing.id !== excludeId) {
      const errMsg = `🚫 Duplicate role name attempt: "${normalizedName}"`;
      this.logger.warn(errMsg);
      throw new ConflictException(`Role '${name}' already exists`);
    }
  }
}
