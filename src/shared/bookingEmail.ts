import { CalendarService } from './calender';
import { EmailService } from './email';
import type { Session } from './models/session';
import type { Speaker } from './models/speaker';
import type { User } from './models/user';

function getNextDateForDay(dayOfWeek: string): Date {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const targetDayIndex = days.findIndex(
    day => day.toLowerCase() === dayOfWeek.toLowerCase(),
  );

  if (targetDayIndex === -1) {
    throw new Error(`Invalid day: ${dayOfWeek}`);
  }

  const today = new Date();
  const currentDayIndex = today.getDay();

  // Calculate days until next target day
  let daysUntilNextDay = targetDayIndex - currentDayIndex;
  if (daysUntilNextDay <= 0) {
    daysUntilNextDay += 7;
  }

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNextDay);
  return nextDate;
}

function combineDayAndTime(day: string, time: string): Date {
  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    throw new Error(`Invalid time format: ${time}. Use HH:MM format.`);
  }

  // Get the next occurrence of the specified day
  const nextDate = getNextDateForDay(day);

  // Split time into hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  // Set the time on the date
  nextDate.setHours(hours, minutes, 0, 0);

  return nextDate;
}

export class BookingNotificationService {
  private calendarService: CalendarService;
  private emailService: EmailService;

  constructor() {
    this.calendarService = new CalendarService();
    this.emailService = new EmailService();
  }

  async processBookingNotification(bookingDetails: {
    user: User;
    speaker: Speaker;
    session: Session;
  }) {
    try {
      // Create calendar event
      const startTime = combineDayAndTime(
        bookingDetails.session.day,
        bookingDetails.session.startTime,
      );
      const endTime = combineDayAndTime(
        bookingDetails.session.day,
        bookingDetails.session.endTime,
      );
      // const calendarEvent = await this.calendarService.createCalendarEvent({
      //     summary: `Speaking Session with ${bookingDetails.speaker.firstName + ' ' + bookingDetails.speaker.lastName}`,
      //     startTime,
      //     endTime,
      //     attendees: [
      //         bookingDetails.user.email,
      //         bookingDetails.speaker.email
      //     ]
      // });

      const inviteLink = await this.calendarService.generateCalendarInviteLink({
        summary: `Speaking Session with ${`${bookingDetails.speaker.firstName} ${bookingDetails.speaker.lastName}`}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `A speaking session with ${`${bookingDetails.speaker.firstName} ${bookingDetails.speaker.lastName}`} has been scheduled by ${`${bookingDetails.user.firstName} ${bookingDetails.user.lastName}`}.`,
      });
      await Promise.all([
        this.emailService.sendBookingConfirmation({
          to: bookingDetails.user.email,
          subject: 'Booking Confirmation',
          html: this.emailService.createUserBookingEmailTemplate({
            userName: `${bookingDetails.user.firstName} ${bookingDetails.user.lastName}`,
            speakerName: `${bookingDetails.speaker.firstName} ${bookingDetails.speaker.lastName}`,
            sessionDate: bookingDetails.session.startTime,
            startTime: bookingDetails.session.startTime,
            endTime: bookingDetails.session.endTime,
            inviteLink,
          }),
        }),
        this.emailService.sendBookingConfirmation({
          to: bookingDetails.speaker.email,
          subject: 'New Session Booked',
          html: this.emailService.createSpeakerBookingEmailTemplate({
            userName: `${bookingDetails.user.firstName} ${bookingDetails.user.lastName}`,
            speakerName: `${bookingDetails.speaker.firstName} ${bookingDetails.speaker.lastName}`,
            sessionDate: bookingDetails.session.startTime,
            startTime: bookingDetails.session.startTime,
            endTime: bookingDetails.session.endTime,
            inviteLink,
          }),
        }),
      ]);
      return {
        emailsSent: true,
      };
    } catch (error) {
      throw {
        statusCode: 500,
        message: 'Error processing booking notification',
      };
    }
  }
}
