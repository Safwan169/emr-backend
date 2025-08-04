// import { Injectable, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class EmailService {
//   private transporter;
//   private readonly logger = new Logger(EmailService.name);

//   constructor() {
//     const smtpUser = process.env.SMTP_USER;
//     const smtpPass = process.env.SMTP_PASS;

//     if (!smtpUser || !smtpPass) {
//       this.logger.error('SMTP credentials not found in environment variables');
//       throw new Error('SMTP configuration is missing');
//     }

//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST || 'smtp.gmail.com',
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: false,
//       auth: {
//         user: smtpUser,
//         pass: smtpPass,
//       },
//     });

//     this.verifyConnection();
//   }

//   private async verifyConnection() {
//     try {
//       await this.transporter.verify();
//       this.logger.log('✅ Email service connection verified successfully');
//     } catch (error) {
//       this.logger.error('❌ Email service connection failed:', error);
//     }
//   }

//   // Send OTP email (valid 2 minutes)
//   async sendOtpEmail(email: string, otpCode: string): Promise<void> {
//     try {
//       const mailOptions = {
//         from: process.env.SMTP_FROM || 'noreply@yourapp.com',
//         to: email,
//         subject: 'Your OTP Code - Valid for 2 Minutes',
//         html: `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//             <meta charset="UTF-8" />
//             <meta name="viewport" content="width=device-width, initial-scale=1" />
//             <title>OTP Verification</title>
//             <style>
//               body {
//                 margin: 0;
//                 padding: 0;
//                 background-color: #f9fafc;
//                 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
//                   Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//                 color: #333333;
//               }
//               .container {
//                 max-width: 600px;
//                 margin: 30px auto;
//                 background: #ffffff;
//                 border-radius: 12px;
//                 box-shadow: 0 4px 15px rgba(0,0,0,0.1);
//                 overflow: hidden;
//               }
//               .header {
//                 background: linear-gradient(90deg, #0052cc, #007bff);
//                 padding: 25px;
//                 text-align: center;
//                 color: white;
//                 font-size: 22px;
//                 font-weight: 700;
//                 letter-spacing: 1px;
//               }
//               .content {
//                 padding: 40px 30px;
//                 text-align: center;
//               }
//               .otp-code {
//                 font-size: 48px;
//                 font-weight: 700;
//                 background: #007bff;
//                 color: white;
//                 padding: 20px 40px;
//                 border-radius: 10px;
//                 letter-spacing: 8px;
//                 display: inline-block;
//                 margin: 30px 0;
//                 user-select: all;
//               }
//               .info {
//                 font-size: 16px;
//                 margin-bottom: 30px;
//                 line-height: 1.5;
//                 color: #555555;
//               }
//               .footer {
//                 background: #f0f2f5;
//                 text-align: center;
//                 padding: 20px 15px;
//                 font-size: 12px;
//                 color: #999999;
//                 user-select: none;
//               }
//               .footer a {
//                 color: #007bff;
//                 text-decoration: none;
//               }
//               @media (max-width: 480px) {
//                 .otp-code {
//                   font-size: 36px;
//                   padding: 15px 25px;
//                   letter-spacing: 5px;
//                 }
//                 .content {
//                   padding: 30px 20px;
//                 }
//               }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <div class="header">OTP Verification Code</div>
//               <div class="content">
//                 <p class="info">
//                   Use the code below to complete your login or verification process.
//                 </p>
//                 <div class="otp-code">${otpCode}</div>
//                 <p class="info">
//                   This code is valid for <strong>2 minutes</strong>. Please do not share it with anyone.
//                 </p>
//                 <p class="info" style="font-size:14px; color:#888;">
//                   If you did not request this code, please ignore this email.
//                 </p>
//               </div>
//               <div class="footer">
//                 &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
//               </div>
//             </div>
//           </body>
//           </html>
//         `,
//       };

//       await this.transporter.sendMail(mailOptions);
//       this.logger.log(`✅ OTP sent to email: ${email}`);
//     } catch (error) {
//       this.logger.error(`❌ Failed to send OTP email to ${email}:`, error);
//       throw new Error('Failed to send OTP email');
//     }
//   }

//   // Send login verification email with token link (valid 2 minutes)
//   async sendLoginVerificationEmail(
//     email: string,
//     token: string,
//   ): Promise<void> {
//     try {
//       const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-login?token=${token}`;

//       const mailOptions = {
//         from: process.env.SMTP_FROM || 'noreply@yourapp.com',
//         to: email,
//         subject: 'Login Verification',
//         html: `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//             <meta charset="UTF-8" />
//             <meta name="viewport" content="width=device-width, initial-scale=1" />
//             <title>Login Verification</title>
//             <style>
//               body {
//                 margin: 0;
//                 padding: 0;
//                 background-color: #f9fafc;
//                 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
//                   Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//                 color: #333333;
//               }
//               .container {
//                 max-width: 600px;
//                 margin: 30px auto;
//                 background: #ffffff;
//                 border-radius: 12px;
//                 box-shadow: 0 4px 15px rgba(0,0,0,0.1);
//                 overflow: hidden;
//               }
//               .header {
//                 background: linear-gradient(90deg, #0052cc, #007bff);
//                 padding: 25px;
//                 text-align: center;
//                 color: white;
//                 font-size: 22px;
//                 font-weight: 700;
//                 letter-spacing: 1px;
//               }
//               .content {
//                 padding: 40px 30px;
//                 text-align: center;
//               }
//               .btn-verify {
//                 display: inline-block;
//                 background-color: #007bff;
//                 color: white;
//                 padding: 14px 40px;
//                 border-radius: 8px;
//                 font-size: 16px;
//                 font-weight: 700;
//                 text-decoration: none;
//                 margin: 30px 0;
//                 transition: background-color 0.3s ease;
//               }
//               .btn-verify:hover {
//                 background-color: #0056b3;
//               }
//               .info {
//                 font-size: 16px;
//                 margin-bottom: 20px;
//                 line-height: 1.5;
//                 color: #555555;
//               }
//               .footer {
//                 background: #f0f2f5;
//                 text-align: center;
//                 padding: 20px 15px;
//                 font-size: 12px;
//                 color: #999999;
//                 user-select: none;
//               }
//               @media (max-width: 480px) {
//                 .btn-verify {
//                   padding: 12px 30px;
//                   font-size: 14px;
//                 }
//                 .content {
//                   padding: 30px 20px;
//                 }
//               }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <div class="header">Login Verification</div>
//               <div class="content">
//                 <p class="info">
//                   Someone attempted to log in to your account. If this was you, please click the button below to complete your login.
//                 </p>
//                 <a href="${verificationLink}" class="btn-verify" target="_blank" rel="noopener noreferrer">Verify Login</a>
//                 <p class="info">
//                   This link is valid for <strong>2 minutes</strong>.
//                 </p>
//                 <p class="info" style="font-size:14px; color:#888;">
//                   If you did not attempt to log in, please ignore this email.
//                 </p>
//               </div>
//               <div class="footer">
//                 &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
//               </div>
//             </div>
//           </body>
//           </html>
//         `,
//       };

//       await this.transporter.sendMail(mailOptions);
//       this.logger.log(`✅ Login verification email sent to ${email}`);
//     } catch (error) {
//       this.logger.error(
//         `❌ Failed to send login verification email to ${email}:`,
//         error,
//       );
//       throw new Error('Failed to send login verification email');
//     }
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface UserRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  age?: string | null;
  role_name: string;
  user_id: number;
  created_at: Date;
}

interface UserCreationData extends UserRegistrationData {
  password: string;
  display_user_id: string;
}

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
      this.logger.log(
        `[📨 Email service connection verify] ✅ Email service connection verified successfully`,
      );
    } catch (error) {
      this.logger.error(
        `[📨 Email service connection verify] ❌ Email service connection failed:`,
        error,
      );
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
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`[🔐 OTP Email] ✅ OTP sent to email: ${email}`);
    } catch (error) {
      this.logger.error(
        `[🔐 OTP Email] ❌ Failed to send OTP email to ${email}:`,
        error,
      );
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
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[🛡️ Login Verification] ✅ Login verification email sent to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `[🛡️ Login Verification] ❌ Failed to send login verification email to ${email}:`,
        error,
      );
    }
  }

  // Send registration notification to admin
  async sendAdminRegistrationNotification(
    userData: UserRegistrationData,
  ): Promise<void> {
    try {
      const adminEmail = process.env.SUPER_ADMIN_EMAIL;
      if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL not configured in environment variables');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: adminEmail,
        subject: `New User Registration - ${userData.first_name} ${userData.last_name}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>New User Registration</title>
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
                background: linear-gradient(90deg, #28a745, #20c997);
                padding: 25px;
                text-align: center;
                color: white;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 1px;
              }
              .content {
                padding: 40px 30px;
              }
              .user-info {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e9ecef;
              }
              .info-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              .info-label {
                font-weight: 600;
                color: #495057;
                min-width: 120px;
              }
              .info-value {
                color: #212529;
                text-align: right;
                flex: 1;
              }
              .role-badge {
                background: #007bff;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .title {
                font-size: 18px;
                color: #333333;
                margin-bottom: 15px;
                text-align: center;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
              }
              @media (max-width: 480px) {
                .info-row {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
                }
                .info-value {
                  text-align: left;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">🎉 New User Registered</div>
              <div class="content">
                <p class="title">
                  <strong>${userData.first_name} ${userData.last_name}</strong> has successfully registered as a patient!
                </p>
                <div class="user-info">
                  <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${userData.first_name} ${userData.last_name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${userData.email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Patient ID:</span>
                    <span class="info-value">#${userData.user_id}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Role:</span>
                    <span class="info-value">
                      <span class="role-badge">${userData.role_name}</span>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">${userData.date_of_birth}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${userData.gender}</span>
                  </div>
                  ${
                    userData.age
                      ? `
                  <div class="info-row">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${userData.age}</span>
                  </div>
                  `
                      : ''
                  }
                  <div class="info-row">
                    <span class="info-label">Registered At:</span>
                    <span class="info-value">${userData.created_at.toLocaleString()}</span>
                  </div>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                  This is an automated notification from your application.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[🧑‍💼 Admin Notification] ✅ Admin registration notification sent for user: ${userData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `[🧑‍💼 Admin Notification] ❌ Failed to send admin registration notification for ${userData.email}:`,
        error,
      );
    }
  }

  // Send welcome email to newly registered user
  async sendWelcomeEmail(userData: UserRegistrationData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: userData.email,
        subject: `Welcome to Our Platform, ${userData.first_name} ${userData.last_name}!`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Welcome to Our Platform</title>
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
                background: linear-gradient(90deg, #6f42c1, #e83e8c);
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
              .welcome-message {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .user-details {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                text-align: left;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e9ecef;
              }
              .detail-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              .detail-label {
                font-weight: 600;
                color: #495057;
              }
              .detail-value {
                color: #212529;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(90deg, #6f42c1, #e83e8c);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 25px 0;
                transition: transform 0.2s ease;
              }
              .cta-button:hover {
                transform: translateY(-2px);
              }
              .info-text {
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                margin: 20px 0;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
              }
              @media (max-width: 480px) {
                .detail-row {
                  flex-direction: column;
                  gap: 5px;
                }
                .content {
                  padding: 30px 20px;
                }
                .welcome-message {
                  font-size: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">🎉 Welcome Aboard!</div>
              <div class="content">
                <div class="welcome-message">
                  Thank you for registering, ${userData.first_name}!
                </div>
                <p class="info-text">
                  Your account has been successfully created. We're excited to have you join our community!
                </p>
                
                <div class="user-details">
                  <h3 style="margin-top: 0; color: #333; text-align: center;">Your Account Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${userData.first_name} ${userData.last_name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${userData.email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Patient ID:</span>
                    <span class="detail-value">#${userData.user_id}</span>
                  </div>
                  ${
                    userData.age
                      ? `
                  <div class="detail-row">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${userData.age}</span>
                  </div>
                  `
                      : ''
                  }
                  <div class="detail-row">
                    <span class="detail-label">Account Type:</span>
                    <span class="detail-value" style="text-transform: capitalize;">${userData.role_name}</span>
                  </div>
                </div>

                <p class="info-text">
                  You can now log in to your account and start exploring all the features we have to offer. 
                  If you have any questions or need assistance, feel free to contact our support team.
                </p>

                <p style="font-size: 14px; color: #888; margin-top: 30px;">
                  If you didn't create this account, please contact us immediately.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.<br>
                Need help? Contact us at <a href="mailto:support@safedrops.com" style="color: #6f42c1;">support@safedrops.com</a>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[👋 Welcome Email] ✅ Welcome email sent to user: ${userData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `[👋 Welcome Email] ❌ Failed to send welcome email to ${userData.email}:`,
        error,
      );
    }
  }

  // NEW: Send admin notification when user is created by admin
  async sendAdminUserCreationNotification(
    userData: UserCreationData,
  ): Promise<void> {
    try {
      const adminEmail = process.env.SUPER_ADMIN_EMAIL;
      if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL not configured in environment variables');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: adminEmail,
        subject: `User Created Successfully - ${userData.first_name} ${userData.last_name}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>User Created Successfully</title>
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
                background: linear-gradient(90deg, #17a2b8, #007bff);
                padding: 25px;
                text-align: center;
                color: white;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 1px;
              }
              .content {
                padding: 40px 30px;
              }
              .user-info {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e9ecef;
              }
              .info-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              .info-label {
                font-weight: 600;
                color: #495057;
                min-width: 120px;
              }
              .info-value {
                color: #212529;
                text-align: right;
                flex: 1;
              }
              .role-badge {
                background: #007bff;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              }
              .title {
                font-size: 18px;
                color: #333333;
                margin-bottom: 15px;
                text-align: center;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
              }
              @media (max-width: 480px) {
                .info-row {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
                }
                .info-value {
                  text-align: left;
                }
                .content {
                  padding: 30px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">👤 User Created</div>
              <div class="content">
                <p class="title">
                  New user <strong>${userData.first_name} ${userData.last_name}</strong> has been successfully created!
                </p>
                <div class="user-info">
                  <div class="info-row">
                    <span class="info-label">Full Name:</span>
                    <span class="info-value">${userData.first_name} ${userData.last_name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${userData.email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Doctor ID:</span>
                    <span class="info-value">${userData.user_id}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Role:</span>
                    <span class="info-value">
                      <span class="role-badge">${userData.role_name}</span>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">${userData.date_of_birth}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${userData.gender}</span>
                  </div>
                  ${
                    userData.age
                      ? `
                  <div class="info-row">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${userData.age}</span>
                  </div>
                  `
                      : ''
                  }
                  <div class="info-row">
                    <span class="info-label">Created At:</span>
                    <span class="info-value">${userData.created_at.toLocaleString()}</span>
                  </div>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
                  The user has been notified via email with their login credentials.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[⚙️ Admin Created User] ✅ Email sent to ${userData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `[⚙️ Admin Created User] ❌ Error sending email: ${error.message}`,
      );
    }
  }

  async sendUserAccountCreationEmail(
    userData: UserCreationData,
  ): Promise<void> {
    try {
      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourapp.com',
        to: userData.email,
        subject: `Your Account Has Been Created, ${userData.first_name}!`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Your Account Has Been Created</title>
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
                background: linear-gradient(90deg, #17a2b8, #007bff);
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
              .welcome-message {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
                font-weight: 600;
              }
              .user-details {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                text-align: left;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e9ecef;
              }
              .detail-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }
              .detail-label {
                font-weight: 600;
                color: #495057;
              }
              .detail-value {
                color: #212529;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(90deg, #17a2b8, #007bff);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 25px 0;
                transition: transform 0.2s ease;
              }
              .cta-button:hover {
                transform: translateY(-2px);
              }
              .info-text {
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                margin: 20px 0;
              }
              .warning-text {
                font-size: 14px;
                color: #dc3545;
                margin: 20px 0;
                font-weight: 500;
              }
              .footer {
                background: #f0f2f5;
                text-align: center;
                padding: 20px 15px;
                font-size: 12px;
                color: #999999;
              }
              @media (max-width: 480px) {
                .detail-row {
                  flex-direction: column;
                  gap: 5px;
                }
                .content {
                  padding: 30px 20px;
                }
                .welcome-message {
                  font-size: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">🎉 Your Account Has Been Created!</div>
              <div class="content">
                <div class="welcome-message">
                  Welcome, ${userData.first_name}!
                </div>
                <p class="info-text">
                  Your account has been successfully created by our administration team. You can now log in using the credentials below.
                </p>
                
                <div class="user-details">
                  <h3 style="margin-top: 0; color: #333; text-align: center;">Your Account Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${userData.first_name} ${userData.last_name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${userData.email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">User ID:</span>
                    <span class="detail-value">${userData.display_user_id}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Temporary Password:</span>
                    <span class="detail-value">${userData.password}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Account Type:</span>
                    <span class="detail-value" style="text-transform: capitalize;">${userData.role_name}</span>
                  </div>
                </div>

                <p class="warning-text">
                  Please change your temporary password after your first login for security purposes.
                </p>

                <p class="info-text">
                  If you have any questions or need assistance, feel free to contact our support team.
                </p>

                <p style="font-size: 14px; color: #888; margin-top: 30px;">
                  If you didn't expect this account to be created, please contact us immediately.
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Safedrops Canada Inc. All rights reserved.<br>
                Need help? Contact us at <a href="mailto:support@safedrops.com" style="color: #007bff;">support@safedrops.com</a>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `[👤 User Account Created] ✅ User account creation email sent to: ${userData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `[👤 User Account Created] ❌ Failed to send user account creation email to ${userData.email}:`,
        error,
      );
    }
  }
}
