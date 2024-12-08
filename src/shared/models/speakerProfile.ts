import { DataTypes, Model, type Optional } from 'sequelize';
import database from '../../loaders/database';
import { Speaker } from './speaker'; // Assuming you have a Speaker model

// Define the attributes interface for the SpeakerProfile
export interface SpeakerProfileAttributes {
  id: string;
  speakerId: number;
  name: string;
  expertise: string[];
  pricePerSession: number;
  availability: {
    day: string;
    timeSlots: {
      startTime: string;
      endTime: string;
      booked: boolean;
    }[];
  }[];
  biography: string;
  rating: number;
  totalSessions: number;
}

// Some attributes are optional for creation
interface SpeakerProfileCreationAttributes
  extends Optional<
    SpeakerProfileAttributes,
    'id' | 'rating' | 'totalSessions'
  > {}

export class SpeakerProfile extends Model<
  SpeakerProfileAttributes,
  SpeakerProfileCreationAttributes
> {
  public id!: string;
  public speakerId!: number;
  public name!: string;
  public expertise!: string[];
  public pricePerSession!: number;
  public availability!: Array<{
    day: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      booked: boolean;
    }>;
  }>;
  public biography!: string;
  public rating!: number;
  public totalSessions!: number;
}

export async function initializeSpeakerProfileModel() {
  const sequelize = await database();

  SpeakerProfile.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `SP${Date.now()}`, // Generate unique profile ID
      },
      speakerId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
          model: 'speakers', // Make sure this matches your speakers table name
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expertise: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      pricePerSession: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      availability: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      biography: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'SpeakerProfile',
      tableName: 'speaker_profiles',
      timestamps: true,
    },
  );

  // Define the association
  SpeakerProfile.belongsTo(Speaker, {
    foreignKey: 'speakerId',
    as: 'speaker',
    onDelete: 'CASCADE',
  });

  Speaker.hasOne(SpeakerProfile, {
    foreignKey: 'speakerId',
    as: 'profile',
  });

  // Sync the model with the database
  await SpeakerProfile.sync({ alter: true });
}

// Service method to create or update speaker profile
// export async function createOrUpdateSpeakerProfile(
//   speakerId: number,
//   profileData: Partial<SpeakerProfileAttributes>
// ): Promise<SpeakerProfile> {
//     // Find existing profile or create new one
//     const [profile, created] = await SpeakerProfile.findOrCreate({
//       where: { speakerId },
//       defaults: {
//         speakerId,
//         name: profileData.name ?? '',
//         expertise: profileData.expertise ?? [],
//         pricePerSession: profileData.pricePerSession ?? 0,
//         availability: profileData.availability ?? [],
//         biography: profileData.biography ?? '',
//         rating: profileData.rating ?? 0,
//         totalSessions: profileData.totalSessions ?? 0
//       }
//     });

//     // If not created, update the existing profile
//     if (!created) {
//       await profile.update(profileData);
//     }
//     return profile;
// }

// Service method to get speaker profile
export async function getSpeakerProfile(
  speakerId: number,
): Promise<SpeakerProfile | null> {
  return await SpeakerProfile.findOne({
    where: { speakerId },
    include: ['speaker'], // Include associated speaker details if needed
  });
}
