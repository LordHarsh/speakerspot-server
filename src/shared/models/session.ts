import { DataTypes, Model, type Optional } from 'sequelize';
import database from '../../loaders/database';
import { SpeakerProfile } from './speakerProfile';
import { User } from './user'; // Assuming you have a User model

// Define the attributes interface for the Session
export interface SessionAttributes {
  id: string;
  speakerProfileId: string;
  userId: number;
  day: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  price: number;
}

// Some attributes are optional for creation
interface SessionCreationAttributes
  extends Optional<SessionAttributes, 'id' | 'status'> {}

export class Session extends Model<
  SessionAttributes,
  SessionCreationAttributes
> {
  public id!: string;
  public speakerProfileId!: string;
  public userId!: number;
  public day!: string;
  public startTime!: string;
  public endTime!: string;
  public status!: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  public price!: number;
}

export async function initializeSessionModel() {
  const sequelize = await database();

  Session.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `S${Date.now()}`, // Generate unique session ID
      },
      speakerProfileId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'speaker_profiles',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PENDING',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Session',
      tableName: 'sessions',
      timestamps: true,
    },
  );

  // Define associations
  Session.belongsTo(SpeakerProfile, {
    foreignKey: 'speakerProfileId',
    as: 'speakerProfile',
  });

  Session.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Sync the model with the database
  await Session.sync({ alter: true });
}
