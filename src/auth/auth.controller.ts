// import {
//   Controller,
//   Post,
//   Body,
//   HttpCode,
//   HttpStatus,
//   Res,
//   Headers,
//   Logger,
// } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { Response } from 'express';

// @Controller('Auth')
// export class AuthController {
//   private readonly logger = new Logger(AuthController.name);
//   constructor(private authService: AuthService) {}

//   //! Step 1 registration: send OTP
//   @Post('Register')
//   @HttpCode(HttpStatus.OK)
//   async sendOtpForRegistration(@Body() dto: any) {
//     this.logger.log(`📝 Sending registration OTP for email: ${dto.email}`);
//     return this.authService.sendOtpForRegistration(dto);
//   }

//   //! Step 2 registration: verify OTP & create user
//   @Post('Register/VerifyOTP')
//   @HttpCode(HttpStatus.CREATED)
//   async verifyOtpAndRegister(@Body() body: { email: string; otp: string }) {
//     this.logger.log(`📝 Verifying registration OTP for email: ${body.email}`);
//     return this.authService.verifyOtpAndRegister(body.email, body.otp);
//   }

//   //! Manual login password + send OTP
//   @Post('Login')
//   @HttpCode(HttpStatus.OK)
//   async login(@Body() dto: any, @Headers('user-agent') userAgent: string) {
//     this.logger.log(`Login attempt with User-Agent: ${userAgent}`);
//     return this.authService.login(dto);
//   }

//   //! Verify OTP for login
//   @Post('VerifyOTP')
//   @HttpCode(HttpStatus.OK)
//   async verifyOtp(
//     @Body('otp_code') otp_code: string,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const { user, access_token } = await this.authService.verifyOtp(otp_code);

//     res.cookie('access_token', access_token, {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: process.env.NODE_ENV === 'production',
//     });

//     return { user, access_token };
//   }

//   //! Resend OTP for login
//   @Post('ResendOTP')
//   @HttpCode(HttpStatus.OK)
//   async resendOtp() {
//     return this.authService.resendOtp();
//   }

//   //! Logout
//   @Post('Logout')
//   @HttpCode(HttpStatus.OK)
//   logout(@Res({ passthrough: true }) res: Response) {
//     res.clearCookie('access_token');
//     return { message: 'Logged out successfully' };
//   }
// }

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

@Controller('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚨 USER REGISTRATION, BY DEFAULT ROLE SET AS PATIENT
  // ═══════════════════════════════════════════════════════════════════════════
  //! Step 1 registration: send OTP
  @Post('Register')
  @HttpCode(HttpStatus.OK)
  async sendOtpForRegistration(@Body() dto: any) {
    this.logger.log(`📝 Sending registration OTP for email: ${dto.email}`);
    return this.authService.sendOtpForRegistration(dto);
  }

  //! Step 2 registration: verify OTP & create user
  @Post('Register/VerifyOTP')
  @HttpCode(HttpStatus.CREATED)
  async verifyOtpAndRegister(@Body() body: { email: string; otp: string }) {
    this.logger.log(`📝 Verifying registration OTP for email: ${body.email}`);
    return this.authService.verifyOtpAndRegister(body.email, body.otp);
  }

  //! Resend OTP for registration
  @Post('Register/ResendOTP')
  @HttpCode(HttpStatus.OK)
  async resendRegistrationOtp(@Body() body: { email: string }) {
    this.logger.log(`🔄 Resending registration OTP for email: ${body.email}`);
    return this.authService.resendRegistrationOtp(body.email);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚨 USER LOGIN, NO OTP
  // ═══════════════════════════════════════════════════════════════════════════
  //! Normal login with email & password (no OTP required)
  @Post('Login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: { email: string; password: string },
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(
      `🚀 Login attempt for email: ${dto.email} with User-Agent: ${userAgent}`,
    );

    const { user, access_token, message } = await this.authService.login(dto);

    //! Set JWT token in HTTP-only cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { user, access_token, message };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚨 USER LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════
  //! Logout
  @Post('Logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    this.logger.log('🚪 User logging out');
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚨 FORGOT PASSWORD FLOW
  // ═══════════════════════════════════════════════════════════════════════════
  //! Step 1: Send OTP for password reset
  @Post('ForgotPassword')
  @HttpCode(HttpStatus.OK)
  async sendForgotPasswordOtp(@Body() body: { email: string }) {
    this.logger.log(`🔑 Sending forgot password OTP for email: ${body.email}`);
    return this.authService.sendForgotPasswordOtp(body.email);
  }

  //! Step 2: Verify OTP for password reset
  @Post('ForgotPassword/VerifyOTP')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordOtp(@Body() body: { email: string; otp: string }) {
    this.logger.log(
      `🔍 Verifying forgot password OTP for email: ${body.email}`,
    );
    return this.authService.verifyForgotPasswordOtp(body.email, body.otp);
  }

  //! Step 3: Reset password with token
  @Post('ResetPassword')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { reset_token: string; new_password: string },
  ) {
    this.logger.log(`🔄 Resetting password with token`);
    return this.authService.resetPassword(body.reset_token, body.new_password);
  }

  //! Resend OTP for forgot password
  @Post('ForgotPassword/ResendOTP')
  @HttpCode(HttpStatus.OK)
  async resendForgotPasswordOtp(@Body() body: { email: string }) {
    this.logger.log(
      `🔄 Resending forgot password OTP for email: ${body.email}`,
    );
    return this.authService.resendForgotPasswordOtp(body.email);
  }
}
