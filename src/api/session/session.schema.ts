import { z } from 'zod';

// Booking Schema
export const SessionBookingSchema = z.object({
  speakerProfileId: z.string().min(1, 'Speaker Profile ID is required'),
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM')
    .refine(
      time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours >= 9 && hours < 16; // Between 9 AM and 4 PM
      },
      { message: 'Time must be between 9 AM and 4 PM' },
    ),
});

export type SessionBooking = z.infer<typeof SessionBookingSchema>;
