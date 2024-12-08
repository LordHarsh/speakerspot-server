import { Op } from 'sequelize';
import { ERRORS } from '../../shared/errors';
import { Speaker } from '../../shared/models/speaker';
import {
  SpeakerProfile,
  type SpeakerProfileAttributes,
} from '../../shared/models/speakerProfile';
import { Availability } from './speaker.schema';

export async function createOrUpdateSpeakerProfile(
  speakerId: number,
  profileData: Partial<SpeakerProfileAttributes>,
): Promise<SpeakerProfile> {
  if (!speakerId) {
    throw { statusCode: 401, message: 'Unauthorized' };
  }
  const [profile, created] = await SpeakerProfile.findOrCreate({
    where: { speakerId },
    defaults: {
      speakerId,
      name: profileData.name ?? '',
      expertise: profileData.expertise ?? [],
      pricePerSession: profileData.pricePerSession ?? 0,
      availability: profileData.availability ?? [],
      biography: profileData.biography ?? '',
      rating: profileData.rating ?? 0,
      totalSessions: profileData.totalSessions ?? 0,
    },
  });

  if (!created) {
    await profile.update(profileData);
  }
  return profile;
}

export async function getSpeakerProfile(
  speakerId: number,
): Promise<SpeakerProfile | null> {
  return await SpeakerProfile.findOne({
    where: { speakerId },
    include: ['speaker'],
  });
}

export async function updateSpeakerAvailability(
  speakerId: number,
  availability: {
    day: string;
    timeSlots: { startTime: string; endTime: string; booked: boolean }[];
  }[],
): Promise<void> {
  const profile = await getSpeakerProfile(speakerId);
  if (!profile) {
    throw {
      statusCode: ERRORS.SPEAKER_PROFILE_NOT_FOUND.code,
      message: ERRORS.SPEAKER_PROFILE_NOT_FOUND.message.error_description,
    };
  }
  await profile.update({ availability });
}

export const listAllSpeakers = async (
  page: number,
  limit: number,
  expertise: string[],
): Promise<{
  speakers: SpeakerProfile[];
  total: number;
  totalPages: number;
}> => {
  const whereClause = expertise
    ? { expertise: { [Op.contains]: [expertise || []] } }
    : {};
  const { count, rows } = await SpeakerProfile.findAndCountAll({
    where: whereClause,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
  });
  return {
    speakers: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
};

export const updateSpeakerPricing = async (
  speakerId: number,
  pricePerSession: number,
): Promise<void> => {
  const profile = await getSpeakerProfile(speakerId);
  if (!profile) {
    throw {
      statusCode: ERRORS.SPEAKER_PROFILE_NOT_FOUND.code,
      message: ERRORS.SPEAKER_PROFILE_NOT_FOUND.message.error_description,
    };
  }
  await profile.update({ pricePerSession });
};
