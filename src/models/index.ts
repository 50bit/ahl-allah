import sequelize from '../config/database';
import { User } from './User';
import { MohafezUser } from './MohafezUser';
import { NormalUser } from './NormalUser';
import { Session } from './Session';
import { Note } from './Note';
import { Complaint } from './Complaint';
import { Call } from './Call';

// Define associations
User.belongsTo(NormalUser, {
  foreignKey: 'normalUserId',
  as: 'NormalUser'
});

User.belongsTo(MohafezUser, {
  foreignKey: 'mohafezId',
  as: 'MohafezUser'
});

NormalUser.belongsTo(MohafezUser, {
  foreignKey: 'mohafezId',
  as: 'MohafezModel'
});

MohafezUser.hasMany(NormalUser, {
  foreignKey: 'mohafezId',
  as: 'Students'
});

Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User'
});

Note.belongsTo(MohafezUser, {
  foreignKey: 'mohafezId',
  as: 'MohafezUser'
});

Note.belongsTo(NormalUser, {
  foreignKey: 'studentId',
  as: 'NormalUser'
});

Complaint.belongsTo(NormalUser, {
  foreignKey: 'studentId',
  as: 'Student'
});

Complaint.belongsTo(MohafezUser, {
  foreignKey: 'mohafezId',
  as: 'Mohafez'
});

Call.belongsTo(NormalUser, {
  foreignKey: 'studentId',
  as: 'Student'
});

Call.belongsTo(MohafezUser, {
  foreignKey: 'mohafezId',
  as: 'Mohafez'
});

// Export models
export {
  sequelize,
  User,
  MohafezUser,
  NormalUser,
  Session,
  Note,
  Complaint,
  Call
};

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
