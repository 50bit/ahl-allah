import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types';

export interface UserAttributes {
  id: string;
  email: string;
  password?: string; // Optional for OAuth users
  name: string;
  country: string;
  city?: string;
  birthyear?: number; // Optional for OAuth users
  age?: number; // Optional for OAuth users
  gender?: string; // Optional for OAuth users
  roleId: UserRole;
  creationDate: Date;
  lastActivityDate: Date;
  resetPasswordOTP?: string;
  otpExpirationTime?: Date;
  phone?: string;
  phoneVerified?: boolean;
  normalUserId?: number;
  mohafezId?: number;
  // OAuth fields
  provider?: string; // 'google', 'apple', 'local'
  providerId?: string; // OAuth provider's user ID
  avatar?: string; // Profile picture URL
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password?: string;
  public name!: string;
  public country!: string;
  public city?: string;
  public birthyear?: number;
  public age?: number;
  public gender?: string;
  public roleId!: UserRole;
  public creationDate!: Date;
  public lastActivityDate!: Date;
  public resetPasswordOTP?: string;
  public otpExpirationTime?: Date;
  public phone?: string;
  public phoneVerified?: boolean;
  public normalUserId?: number;
  public mohafezId?: number;
  // OAuth fields
  public provider?: string;
  public providerId?: string;
  public avatar?: string;
  public isEmailVerified?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public NormalUser?: any;
  public MohafezUser?: any;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: true // Optional for OAuth users
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    birthyear: {
      type: DataTypes.INTEGER,
      allowNull: true // Optional for OAuth users
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true // Optional for OAuth users
    },
    gender: {
      type: DataTypes.STRING(100),
      allowNull: true // Optional for OAuth users
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: UserRole.NORMAL
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    lastActivityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    resetPasswordOTP: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    otpExpirationTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    normalUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NormalUsers',
        key: 'normalUserId'
      }
    },
    mohafezId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'MohafezUsers',
        key: 'mohafezId'
      }
    },
    // OAuth fields
    provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'local'
    },
    providerId: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'Users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['roleId']
      },
      {
        fields: ['normalUserId']
      },
      {
        fields: ['mohafezId']
      }
    ]
  }
);
