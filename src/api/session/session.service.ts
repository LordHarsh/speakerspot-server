import { Op, where } from 'sequelize';
import { BookingNotificationService } from '../../shared/bookingEmail';
import { ERRORS } from '../../shared/errors';
import { getModel } from '../../shared/models';
import { Session } from '../../shared/models/session';
import { Speaker } from '../../shared/models/speaker';
import { SpeakerProfile } from '../../shared/models/speakerProfile';
import { User } from '../../shared/models/user';
import type { Availability } from '../speaker/speaker.schema';

export async function bookSessionHandler(
  speakerProfileId: string,
  userId: number,
  day: string,
  startTime: string,
): Promise<Session> {
  const speakerProfile = await SpeakerProfile.findOne({
    where: { id: speakerProfileId },
  });
  if (!speakerProfile) {
    throw {
      statusCode: ERRORS.SPEAKER_NOT_FOUND.code,
      message: ERRORS.SPEAKER_NOT_FOUND.message.error_description,
    };
  }

  // Check if the time slot is available
  const dayAvailability = speakerProfile.availability.find(
    avail => avail.day === day,
  );

  if (!dayAvailability) {
    throw {
      statusCode: ERRORS.TIME_SLOT_NOT_AVAILABLE.code,
      message: ERRORS.TIME_SLOT_NOT_AVAILABLE.message.error_description,
    };
  }

  const timeSlot = dayAvailability.timeSlots.find(
    slot => slot.startTime === startTime && !slot.booked,
  );

  if (!timeSlot) {
    throw {
      statusCode: ERRORS.TIME_SLOT_NOT_AVAILABLE.code,
      message: ERRORS.TIME_SLOT_NOT_AVAILABLE.message.error_description,
    };
  }
  // Check for existing bookings in the same time slot
  const existingSession = await Session.findOne({
    where: {
      speakerProfileId,
      day,
      startTime,
      status: {
        [Op.notIn]: ['CANCELLED'],
      },
    },
  });
  if (existingSession) {
    throw {
      statusCode: ERRORS.TIME_SLOT_NOT_AVAILABLE.code,
      message: ERRORS.TIME_SLOT_NOT_AVAILABLE.message.error_description,
    };
  }

  // Create the session
  const session = await Session.create({
    speakerProfileId,
    userId,
    day,
    startTime,
    endTime: timeSlot.endTime,
    status: 'CONFIRMED',
    price: speakerProfile.pricePerSession,
  });
  // Update the availability in the speaker profile
  const updatedAvailability = speakerProfile.availability.map(avail => {
    if (avail.day === day) {
      return {
        ...avail,
        timeSlots: avail.timeSlots.map(slot =>
          slot.startTime === startTime ? { ...slot, booked: true } : slot,
        ),
      };
    }
    return avail;
  });
  await speakerProfile.update({ availability: updatedAvailability });
  const speaker = await Speaker.findByPk(speakerProfile.speakerId);
  const user = await User.findByPk(userId);
  if (!speaker || !user) {
    throw {
      statusCode: ERRORS.USER_NOT_FOUND.code,
      message: ERRORS.USER_NOT_FOUND.message.error_description,
    };
  }
  const booking = new BookingNotificationService();
  const calenderId = await booking.processBookingNotification({
    user,
    speaker,
    session,
  });
  return session;
}

export async function getAllSpeakersWithAvailability() {
  try {
    const SpeakerModel = await getModel('speaker');
    const speakersWithAvailability = await SpeakerModel.findAll({
      include: [
        {
          model: SpeakerProfile,
          as: 'profile',
          attributes: [
            'id',
            'availability',
            'name',
            'expertise',
            'pricePerSession',
            'rating',
          ],
        },
      ],
      attributes: ['id'], // You can add more speaker attributes if needed
      raw: false, // Ensures we get Sequelize model instances
    });

    // Optional: Transform the result to extract only available time slots
    const formattedSpeakers = speakersWithAvailability
      .filter((speaker: any) => speaker.profile?.id)
      .map((speaker: any) => ({
        speakerId: speaker.profile?.id,
        name: speaker.profile?.name,
        expertise: speaker?.profile?.expertise,
        pricePerSession: speaker?.profile?.pricePerSession,
        rating: speaker?.profile?.rating,
        availableTimeSlots:
          speaker?.profile?.availability?.flatMap(
            (dayAvailability: Availability) =>
              dayAvailability.timeSlots
                .filter(slot => !slot.booked)
                .map(slot => ({
                  day: dayAvailability.day,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
          ) || [],
      }));

    return formattedSpeakers;
  } catch (error) {
    throw {
      status: 500,
      message: `Error fetching speakers availability: ${error}`,
    };
  }
}

export async function getUserSessionsHandler(
  userId: number,
): Promise<Session[]> {
  return await Session.findAll({
    where: { userId },
    include: [
      {
        model: SpeakerProfile,
        as: 'speakerProfile',
        attributes: ['speakerId', 'name', 'expertise', 'pricePerSession'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function removeSession(
  sessionId: string,
  userId: number,
): Promise<void> {
  const session = await Session.findOne({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw {
      statusCode: ERRORS.SESSION_NOT_FOUND.code,
      message: ERRORS.SESSION_NOT_FOUND.message.error_description,
    };
  }

  // Update session status
  await session.update({ status: 'CANCELLED' });

  // Find and update the speaker profile to unblock the time slot
  const speakerProfile = await SpeakerProfile.findByPk(
    session.speakerProfileId,
  );

  if (speakerProfile) {
    const updatedAvailability = speakerProfile.availability.map(avail => {
      if (avail.day === session.day) {
        return {
          ...avail,
          timeSlots: avail.timeSlots.map(slot =>
            slot.startTime === session.startTime
              ? { ...slot, booked: false }
              : slot,
          ),
        };
      }
      return avail;
    });

    await speakerProfile.update({ availability: updatedAvailability });
  }
}
