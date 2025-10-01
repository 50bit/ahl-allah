import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PhoneOtpAttributes {
  id: number;
  phone: string;
  otpHash: string;
  purpose: 'login' | 'link';
  expiresAt: Date;
  attemptsUsed: number;
  resendCount: number;
  lastSentAt: Date;
  consumed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PhoneOtpCreationAttributes extends Optional<PhoneOtpAttributes, 'id' | 'attemptsUsed' | 'resendCount' | 'lastSentAt' | 'consumed' | 'createdAt' | 'updatedAt'> {}

export class PhoneOtp extends Model<PhoneOtpAttributes, PhoneOtpCreationAttributes> implements PhoneOtpAttributes {
  public id!: number;
  public phone!: string;
  public otpHash!: string;
  public purpose!: 'login' | 'link';
  public expiresAt!: Date;
  public attemptsUsed!: number;
  public resendCount!: number;
  public lastSentAt!: Date;
  public consumed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PhoneOtp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    otpHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('login', 'link'),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    attemptsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    resendCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    consumed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'PhoneOtps',
    timestamps: true,
    indexes: [
      { fields: ['phone'] },
      { fields: ['expiresAt'] },
      { fields: ['consumed'] }
    ]
  }
);

export default PhoneOtp;

