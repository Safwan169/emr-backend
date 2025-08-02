import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      this.logger.error('SMTP credentials not found in environment variables');
      throw new Error('SMTP configuration is missing');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service connection verified successfully');
    } catch (error) {
      this.logger.error('❌ Email service connection failed:', error);
    }
  }

  // Send OTP email (valid 2 minutes)
  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: email,
        subject: 'Your OTP Code - Valid for 2 Minutes',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>OTP Verification</title>
            <style>
              body {
                margin: 0; 
                padding: 0; 
                background-color: #f9fafc; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(90deg, #0052cc, #007bff);
                padding: 25px;
                text-align: center;
                color: white;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 1px;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .otp-code {
                font-size: 48px;
                font-weight: 700;
                background: #007bff;
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                letter-spacing: 8px;
                display: inline-block;
                margin: 30px 0;
                user-select: all;
              }
              .info {
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.5;
                color: #555555;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
                user-select: none;
              }
              .footer a {
                color: #007bff;
                text-decoration: none;
              }
              @media (max-width: 480px) {
                .otp-code {
                  font-size: 36px;
                  padding: 15px 25px;
                  letter-spacing: 5px;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">OTP Verification Code</div>
              <div class="content">
                <p class="info">
                  Use the code below to complete your login or verification process.
                </p>
                <div class="otp-code">${otpCode}</div>
                <p class="info">
                  This code is valid for <strong>2 minutes</strong>. Please do not share it with anyone.
                </p>
                <p class="info" style="font-size:14px; color:#888;">
                  If you did not request this code, please ignore this email.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP email to ${email}:`, error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Send login verification email with token link (valid 2 minutes)
  async sendLoginVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-login?token=${token}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: email,
        subject: 'Login Verification',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Login Verification</title>
            <style>
              body {
                margin: 0; 
                padding: 0; 
                background-color: #f9fafc; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(90deg, #0052cc, #007bff);
                padding: 25px;
                text-align: center;
                color: white;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 1px;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .btn-verify {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 14px 40px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 700;
                text-decoration: none;
                margin: 30px 0;
                transition: background-color 0.3s ease;
              }
              .btn-verify:hover {
                background-color: #0056b3;
              }
              .info {
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.5;
                color: #555555;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
                user-select: none;
              }
              @media (max-width: 480px) {
                .btn-verify {
                  padding: 12px 30px;
                  font-size: 14px;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">Login Verification</div>
              <div class="content">
                <p class="info">
                  Someone attempted to log in to your account. If this was you, please click the button below to complete your login.
                </p>
                <a href="${verificationLink}" class="btn-verify" target="_blank" rel="noopener noreferrer">Verify Login</a>
                <p class="info">
                  This link is valid for <strong>2 minutes</strong>.
                </p>
                <p class="info" style="font-size:14px; color:#888;">
                  If you did not attempt to log in, please ignore this email.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Login verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send login verification email to ${email}:`,
        error,
      );
      throw new Error('Failed to send login verification email');
    }
  }
}
