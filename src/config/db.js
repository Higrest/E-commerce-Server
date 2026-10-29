import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'postgres';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const useSsl = process.env.DB_SSL === 'true';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        keepalives: true,
        keepalives_idle: 30
      }
    : {
        keepalives: true,
        keepalives_idle: 30
      },
  pool: {
    max: 1,
    min: 0,
    idle: 10000,
    acquire: 30000
  },
  define: {
    underscored: true,
    timestamps: true
  }
});
