import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize('postgres', 'postgres.fuvdflymvikxyelbiusl', 'werperEmb80123', {
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
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
