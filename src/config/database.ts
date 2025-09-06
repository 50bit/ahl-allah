import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || '156.67.31.172',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'HefzQuranDB',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'ArkPro@2024',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export default sequelize;
