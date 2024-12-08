import LoggerInstance from '../../loaders/logger';
import { Session } from './session';
import { Speaker } from './speaker';
import { SpeakerProfile } from './speakerProfile';
import { User } from './user';

const models: { [key: string]: any } = {
  user: User,
  speaker: Speaker,
  speakerProfile: SpeakerProfile,
  session: Session,
};

export const getModel = async (modelName: string) => {
  try {
    const model = models[modelName] || null;
    if (!model)
      throw {
        statusCode: 500,
        message: 'Model not found',
      };
    return model;
  } catch (error: any) {
    throw {
      statusCode: error?.statusCode || 500,
      message: error?.message || 'Model not found',
    };
  }
};
