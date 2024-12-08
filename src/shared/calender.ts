import { google } from 'googleapis';
import config from '../config';

export class CalendarService {
  private calendar: any;

  constructor() {
    // Use service account credentials
    const serviceAccountCredentials = {
      client_email: config.google.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: config.google.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      ),
    };

    const jwtClient = new google.auth.JWT(
      serviceAccountCredentials.client_email,
      undefined,
      serviceAccountCredentials.private_key,
      ['https://www.googleapis.com/auth/calendar'],
    );

    this.calendar = google.calendar({ version: 'v3', auth: jwtClient });
  }

  async generateCalendarInviteLink(eventDetails: {
    summary: string;
    startTime: string;
    endTime: string;
    description?: string;
  }) {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventDetails.summary,
      dates: `${new Date(eventDetails.startTime).toISOString().replace(/[-:]/g, '')}/${new Date(eventDetails.endTime).toISOString().replace(/[-:]/g, '')}`,
      details: eventDetails.description || '',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async createCalendarEvent(eventDetails: {
    summary: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }) {
    try {
      const event = {
        summary: eventDetails.summary,
        start: {
          dateTime: eventDetails.startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: 'UTC',
        },
        attendees: eventDetails.attendees.map(email => ({ email })),
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary', // Or a specific calendar ID
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
}
