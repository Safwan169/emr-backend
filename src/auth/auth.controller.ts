import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  // Step 1 registration: send OTP
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async sendOtpForRegistration(@Body() dto: any) {
    this.logger.log(`📝 Sending registration OTP for email: ${dto.email}`);
    return this.authService.sendOtpForRegistration(dto);
  }

  // Step 2 registration: verify OTP & create user
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  async verifyOtpAndRegister(@Body() body: { email: string; otp: string }) {
    this.logger.log(`📝 Verifying registration OTP for email: ${body.email}`);
    return this.authService.verifyOtpAndRegister(body.email, body.otp);
  }

  // Manual login password + send OTP
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: any, @Headers('user-agent') userAgent: string) {
    this.logger.log(`Login attempt with User-Agent: ${userAgent}`);
    return this.authService.login(dto);
  }

  // Verify OTP for login
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('otp_code') otp_code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.verifyOtp(otp_code);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { user, access_token };
  }

  // Resend OTP for login
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp() {
    return this.authService.resendOtp();
  }

  // Logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
