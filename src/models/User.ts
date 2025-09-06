import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  country: string;
  city?: string;
  birthyear: number;
  age: number;
  gender: string;
  roleId: UserRole;
  creationDate: Date;
  lastActivityDate: Date;
  resetPasswordOTP?: string;
  otpExpirationTime?: Date;
  normalUserId?: number;
  mohafezId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public country!: string;
  public city?: string;
  public birthyear!: number;
  public age!: number;
  public gender!: string;
  public roleId!: UserRole;
  public creationDate!: Date;
  public lastActivityDate!: Date;
  public resetPasswordOTP?: string;
  public otpExpirationTime?: Date;
  public normalUserId?: number;
  public mohafezId?: number;
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
      allowNull: false
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
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(100),
      allowNull: false
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
