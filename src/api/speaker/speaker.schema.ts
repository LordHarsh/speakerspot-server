import { z } from 'zod';

// Time Slot Schema
const TimeSlotSchema = z
  .object({
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
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM')
      .refine(
        time => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours >= 9 && hours <= 16; // Between 9 AM and 4 PM
        },
        { message: 'Time must be between 9 AM and 4 PM' },
      ),
    booked: z.boolean().optional().default(false),
  })
  .refine(
    data => {
      const start = parseTime(data.startTime);
      const end = parseTime(data.endTime);
      return end > start && end - start === 3600000; // Exactly 1 hour difference
    },
    {
      message:
        'Time slots must be exactly 1 hour long and end after start time',
    },
  );

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(0, 0, 0, hours, minutes).getTime();
}

// Availability Schema
const AvailabilitySchema = z.object({
  day: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, 'At least one time slot is required'),
});

// Create/Update Profile Schema
export const SpeakerProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  expertise: z.array(z.string()).min(1, 'At least one expertise is required'),
  pricePerSession: z.number().positive('Price must be a positive number'),
  availability: z.array(AvailabilitySchema).optional(),
  biography: z.string().optional(),
});

// Availability Update Schema
export const AvailabilityUpdateSchema = z.object({
  availability: z
    .array(AvailabilitySchema)
    .min(1, 'Availability cannot be empty'),
});

// Pricing Update Schema
export const PricingUpdateSchema = z.object({
  pricePerSession: z.number().positive('Price must be a positive number'),
});

// List Speakers Query Schema
export const ListSpeakersQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(25),
  expertise: z.string().optional(),
});

export type Availability = z.infer<typeof AvailabilitySchema>;
export type AvailabilityUpdate = z.infer<typeof AvailabilityUpdateSchema>;
export type PricingUpdate = z.infer<typeof PricingUpdateSchema>;
export type ListSpeakersQuery = z.infer<typeof ListSpeakersQuerySchema>;
