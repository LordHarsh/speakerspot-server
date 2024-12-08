import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { ERRORS } from './errors';

AWS.config.update({
  region: config.AWS.AWS_REGION,
  accessKeyId: config.AWS.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS.AWS_SECRET_ACCESS_KEY,
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const otpStore: { [key: string]: { otp: string; expiresAt: number } } = {};

export class OtpService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public static createOTP(email: string, expirationMinutes = 10): string {
    const otp = OtpService.generateOTP();
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
    otpStore[email] = { otp, expiresAt };
    return otp;
  }

  public static verifyOTP(email: string, userProvidedOTP: string): boolean {
    const storedOtp = otpStore[email];
    if (!storedOtp || storedOtp.expiresAt < Date.now()) {
      throw {
        statusCode: ERRORS.OTP_EXPIRED.code,
        message: ERRORS.OTP_EXPIRED.message.error_description,
      };
    }

    const isValid = storedOtp.otp === userProvidedOTP;

    if (isValid) {
      delete otpStore[email];
    }
    return isValid;
  }

  public static async sendOTPEmail(email: string): Promise<void> {
    const otp = OtpService.createOTP(email);

    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <html>
                <body>
                  <h2>Your One-Time Password (OTP)</h2>
                  <p>Your OTP is: <strong>${otp}</strong></p>
                  <p>This OTP is valid for 10 minutes.</p>
                </body>
              </html>
            `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Your One-Time Password',
        },
      },
      Source: config.AWS.EMAIL_SENDER,
    };

    try {
      await ses.sendEmail(params).promise();
    } catch (error) {
      throw {
        statusCode: ERRORS.FAILED_OTP_EMAIL.code,
        message: ERRORS.FAILED_OTP_EMAIL.message.error_description,
      };
    }
  }

  public static async sendOTPEmailNodemailer(email: string): Promise<void> {
    // Generate OTP
    const otp = OtpService.createOTP(email);

    // Create a Nodemailer transporter using AWS SES
    const transporter = nodemailer.createTransport({
      SES: ses,
    });

    // Email options
    const mailOptions = {
      from: config.AWS.EMAIL_SENDER,
      to: email,
      subject: 'Your One-Time Password',
      html: `
        <html>
          <body>
            <h2>Your One-Time Password (OTP)</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
          </body>
        </html>
      `,
      text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw {
        statusCode: ERRORS.FAILED_OTP_EMAIL.code,
        message: ERRORS.FAILED_OTP_EMAIL.message.error_description,
      };
    }
  }
}
