import { SES } from 'aws-sdk';
import config from '../config';

export class EmailService {
  private ses: SES;

  constructor() {
    // Configure AWS SES
    this.ses = new SES({
      region: config.AWS.AWS_REGION || 'ap-south-1',
      accessKeyId: config.AWS.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS.AWS_SECRET_ACCESS_KEY,
    });
  }

  async sendBookingConfirmation(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    const params: SES.SendEmailRequest = {
      Source: config.AWS.EMAIL_SENDER,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
        },
        Body: {
          Html: {
            Data: options.html,
          },
        },
      },
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      return result;
    } catch (error) {
      throw {
        statusCode: 500,
        message: 'Error sending email',
      };
    }
  }

  // Email template remains the same as in the previous example
  createUserBookingEmailTemplate(bookingDetails: {
    userName: string;
    speakerName: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    inviteLink: string;
  }) {
    return `
      <html>
        <body>
          <h1>Booking Confirmed!</h1>
          <p>Dear ${bookingDetails.userName},</p>
          <p>Your session with ${bookingDetails.speakerName} has been booked successfully.</p>
          <strong>Session Details:</strong>
          <ul>
            <li>Date: ${bookingDetails.sessionDate}</li>
            <li>Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
          </ul>
          <a href="${bookingDetails.inviteLink}">Add to Calendar</a>
        </body>
      </html>
    `;
  }

  createSpeakerBookingEmailTemplate(bookingDetails: {
    userName: string;
    speakerName: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    inviteLink: string;
  }) {
    return `
      <html>
        <body>
          <h1>New Session Booked!</h1>
          <p>Dear ${bookingDetails.speakerName},</p>
          <p>A new session has been booked with you by ${bookingDetails.userName}.</p>
          <strong>Session Details:</strong>
          <ul>
            <li>Date: ${bookingDetails.sessionDate}</li>
            <li>Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
            <li><a href="${bookingDetails.inviteLink}">Add to Calendar</a></li>
          </ul>
        </body>
      </html>
    `;
  }
}
