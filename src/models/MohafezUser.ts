import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { EjazaEnum, Language } from '../types';

export interface MohafezUserAttributes {
  mohafezId: number;
  arabicName?: string;
  summery: string;
  ejaza: string;
  myEjazaEnum: EjazaEnum;
  degree: number;
  imagePath?: string;
  isAvailable: boolean;
  freeDaysCount: number;
  totalHoursCount: number;
  language: Language;
  phoneNumber?: string;
  whatsappPhoneNumber?: string;
  getPaid: boolean;
  schedule?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MohafezUserCreationAttributes extends Optional<MohafezUserAttributes, 'mohafezId' | 'createdAt' | 'updatedAt'> {}

export class MohafezUser extends Model<MohafezUserAttributes, MohafezUserCreationAttributes> implements MohafezUserAttributes {
  public mohafezId!: number;
  public arabicName?: string;
  public summery!: string;
  public ejaza!: string;
  public myEjazaEnum!: EjazaEnum;
  public degree!: number;
  public imagePath?: string;
  public isAvailable!: boolean;
  public freeDaysCount!: number;
  public totalHoursCount!: number;
  public language!: Language;
  public phoneNumber?: string;
  public whatsappPhoneNumber?: string;
  public getPaid!: boolean;
  public schedule?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public Students?: any[];
  public User?: any;
}

MohafezUser.init(
  {
    mohafezId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    arabicName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    summery: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ejaza: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    myEjazaEnum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: EjazaEnum.QURAN
    },
    degree: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    imagePath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    freeDaysCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalHoursCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    language: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Language.ARABIC
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    whatsappPhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    getPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    schedule: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'MohafezUsers',
    timestamps: true,
    indexes: [
      {
        fields: ['isAvailable']
      },
      {
        fields: ['language']
      },
      {
        fields: ['myEjazaEnum']
      }
    ]
  }
);
