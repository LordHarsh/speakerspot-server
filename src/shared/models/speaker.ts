import { DataTypes, Model } from 'sequelize';
import database from '../../loaders/database';
import LoggerInstance from '../../loaders/logger';

export class Speaker extends Model {
  public id!: number;
  public userName!: string;
  public firstName!: string;
  public lastName!: string;
  public verified!: boolean;
  public verifiedAt!: Date;
  public email!: string;
  public phoneNo!: string;
  public password!: string;
  public isDeleted!: boolean;
}

// Initialize the Speaker Model
export async function initializeSpeakerModel() {
  const sequelize = await database();
  Speaker.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      phoneNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Speaker',
      tableName: 'speakers',
      timestamps: true,
    },
  );

  // Sync the model with the database
  await Speaker.sync({ alter: true });
}
