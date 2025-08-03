import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

interface PendingRegistration {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  date_of_birth: string;
  gender: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // For registration OTP: store OTP + user data keyed by email
  private pendingRegistrations = new Map<
    string,
    { otpCode: string; expiresAt: Date; registrationData: PendingRegistration }
  >();

  // For login OTP pending email (only one at a time for simplicity)
  private pendingLoginEmail: string | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // --- Registration OTP Step 1 ---
  async sendOtpForRegistration(userData: PendingRegistration) {
    const { email } = userData;

    this.logger.log(`📋 Sending OTP for registration email: ${email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn(`🛑 Registration failed: User already exists: ${email}`);
      throw new BadRequestException('User with this email already exists');
    }

    const existingOtpEntry = this.pendingRegistrations.get(email);
    if (existingOtpEntry && existingOtpEntry.expiresAt > new Date()) {
      this.logger.warn(
        `🚫 OTP send throttled for registration email: ${email}`,
      );
      throw new HttpException(
        'Please wait before requesting a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 min expiry

    this.pendingRegistrations.set(email, {
      otpCode,
      expiresAt,
      registrationData: userData,
    });

    await this.emailService.sendOtpEmail(email, otpCode);

    this.logger.log(`✅ OTP sent for registration email: ${email}`);

    return {
      message:
        'OTP sent to your email. Please verify to complete registration.',
      email_hint: this.maskEmail(email),
    };
  }

  // --- Registration OTP Step 2: verify OTP + create user ---
  async verifyOtpAndRegister(email: string, otp: string) {
    this.logger.log(`📋 Verifying OTP for registration email: ${email}`);

    const otpEntry = this.pendingRegistrations.get(email);
    if (!otpEntry) {
      this.logger.warn(`🛑 No pending registration found for email: ${email}`);
      throw new BadRequestException(
        'No pending registration found for this email.',
      );
    }
    if (otpEntry.expiresAt < new Date()) {
      this.pendingRegistrations.delete(email);
      this.logger.warn(`🛑 OTP expired for registration email: ${email}`);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }
    if (otpEntry.otpCode !== otp) {
      this.logger.warn(`🚫 Invalid OTP for registration email: ${email}`);
      throw new BadRequestException('Invalid OTP.');
    }

    // OTP valid → create user
    const { first_name, last_name, password, date_of_birth, gender } =
      otpEntry.registrationData;

    let role = await this.prisma.role.findUnique({
      where: { role_name: 'patient' },
    });
    if (!role) {
      role = await this.prisma.role.create({ data: { role_name: 'patient' } });
      this.logger.log(`✏️ Role 'patient' created`);
    }

    const lastUser = await this.prisma.user.findFirst({
      where: { role_id: role.id },
      orderBy: { user_id: 'desc' },
      select: { user_id: true },
    });
    const user_id = (lastUser?.user_id || 0) + 1;

    const hashedPassword = await bcrypt.hash(password, 10);

    const dobDate = new Date(date_of_birth);
    const age = this.calculateFormattedAge(dobDate);

    const user = await this.prisma.user.create({
      data: {
        user_id,
        first_name,
        last_name,
        email,
        password_hashed: hashedPassword,
        date_of_birth: dobDate,
        gender,
        age,
        role: { connect: { role_name: 'patient' } },
      },
      include: { role: true },
    });

    this.pendingRegistrations.delete(email);

    this.logger.log(`✅ User registered successfully with email: ${email}`);

    return {
      message: 'User registered successfully',
      user: this.formatUser(user),
    };
  }

  // --- Login with password + send OTP ---
  async login(dto: { email: string; password: string }) {
    this.logger.log(`📋 Login attempt for email: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      this.logger.warn(
        `❌ Login failed: No user found for email: ${dto.email}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hashed,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `🚫 Login failed: Incorrect password for email: ${dto.email}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const recentOtps = await this.prisma.otp.findMany({
      where: {
        user_id: user.id,
        created_at: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentOtps.length >= 3) {
      this.logger.warn(`🚫 Too many OTP requests for user ID: ${user.id}`);
      throw new HttpException(
        'Too many OTP requests. Please wait 2 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await this.prisma.otp.deleteMany({ where: { user_id: user.id } });

    await this.prisma.otp.create({
      data: {
        user_id: user.id,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    this.pendingLoginEmail = user.email;

    await this.emailService.sendOtpEmail(user.email, otpCode);

    this.logger.log(`✅ OTP sent for user email: ${user.email}`);

    return {
      message: 'OTP sent to your email. Please verify to complete login.',
      email_hint: this.maskEmail(user.email),
    };
  }

  // --- Verify OTP for login (manual login flow) ---
  async verifyOtp(otpCode: string) {
    if (!this.pendingLoginEmail) {
      this.logger.warn(`🛑 OTP verification failed: No pending login`);
      throw new BadRequestException(
        'No pending login found. Please login first.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: this.pendingLoginEmail },
      include: { role: true },
    });

    if (!user) {
      this.logger.warn(
        `❌ OTP verification failed: User not found with email ${this.pendingLoginEmail}`,
      );
      throw new UnauthorizedException('User not found');
    }

    if (!user?.role?.role_name) {
      throw new UnauthorizedException('User role not found');
    }

    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        user_id: user.id,
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      this.logger.warn(
        `🛑 OTP verification failed: Invalid or expired OTP for user ID ${user.id}`,
      );
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= 3) {
      this.logger.warn(
        `🛑 OTP verification failed: Max attempts exceeded for user ID ${user.id}`,
      );
      throw new BadRequestException(
        'Maximum OTP attempts exceeded. Please request a new OTP.',
      );
    }

    if (otpRecord.otp_code !== otpCode) {
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      this.logger.warn(
        `🚫 Invalid OTP entered for user ID ${user.id}. Attempts left: ${2 - otpRecord.attempts}`,
      );
      throw new BadRequestException(
        `Invalid OTP. ${2 - otpRecord.attempts} attempts remaining.`,
      );
    }

    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    this.pendingLoginEmail = null;

    const payload = {
      userId: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_name: user.role?.role_name,
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.log(`✅ User logged in successfully: ${user.email}`);

    return {
      user: this.formatUser(user),
      access_token,
      message: 'Login successful',
    };
  }

  // --- Resend OTP for login ---
  async resendOtp() {
    if (!this.pendingLoginEmail) {
      this.logger.warn(`🛑 Resend OTP failed: No pending login`);
      throw new BadRequestException(
        'No pending login found. Please login first.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: this.pendingLoginEmail },
    });

    if (!user) {
      this.logger.warn(
        `❌ Resend OTP failed: User not found with email ${this.pendingLoginEmail}`,
      );
      throw new UnauthorizedException('User not found');
    }

    const recentOtps = await this.prisma.otp.findMany({
      where: {
        user_id: user.id,
        created_at: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });

    if (recentOtps.length >= 1) {
      this.logger.warn(`🚫 Resend OTP throttled for user ID ${user.id}`);
      throw new HttpException(
        'Please wait 2 minutes before requesting a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpCode = this.generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await this.prisma.otp.updateMany({
      where: { user_id: user.id, used: false },
      data: { used: true },
    });

    await this.prisma.otp.create({
      data: { user_id: user.id, otp_code: otpCode, expires_at: expiresAt },
    });

    await this.emailService.sendOtpEmail(user.email, otpCode);

    this.logger.log(`✅ New OTP sent for user email: ${user.email}`);

    return {
      message: 'New OTP sent to your email.',
      email_hint: this.maskEmail(user.email),
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal =
      local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : local;
    return `${maskedLocal}@${domain}`;
  }

  private calculateFormattedAge(dob: Date): string {
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_of_birth: user.date_of_birth
        ? user.date_of_birth.toISOString().split('T')[0]
        : null,
      gender: user.gender,
      age: user.age,
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
