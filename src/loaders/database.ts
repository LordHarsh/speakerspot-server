import { Sequelize } from 'sequelize';
import config from '../config';
import LoggerInstance from './logger';

let sequelizeInstance: Sequelize;

async function initializeDatabase(): Promise<Sequelize> {
  try {
    const sequelize = new Sequelize(config.POSTGRESQL_URI, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: config.POSTGRESQL_SSL === 'true',
          rejectUnauthorized: true,
          ca: config.POSTGRESQL_SSL,
        },
      },
    });

    // Test the connection
    await sequelize.authenticate();
    LoggerInstance.info('✌️ PostgreSQL connection established successfully');

    return sequelize;
  } catch (error) {
    LoggerInstance.error('Unable to connect to the database:', error);
    throw error;
  }
}

export default async (): Promise<Sequelize> => {
  if (!sequelizeInstance) {
    sequelizeInstance = await initializeDatabase();
  }
  return sequelizeInstance;
};

export { Sequelize };
