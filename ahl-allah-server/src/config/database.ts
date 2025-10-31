import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ahl_allah_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // ssl: process.env.NODE_ENV === 'production' ? {
    //   require: true,
    //   rejectUnauthorized: false
    // } : false
    ssl: false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export default sequelize;
