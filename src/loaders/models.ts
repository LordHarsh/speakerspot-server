import { initializeSessionModel } from '../shared/models/session';
import { initializeSpeakerModel } from '../shared/models/speaker';
import { initializeSpeakerProfileModel } from '../shared/models/speakerProfile';
import { initializeUserModel } from '../shared/models/user';

export default async (): Promise<void> => {
  await initializeUserModel();
  await initializeSpeakerModel();
  await initializeSpeakerProfileModel();
  await initializeSessionModel();
};
