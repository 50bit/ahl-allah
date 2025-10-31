import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { AgeGroup, Language, HefzMethod } from '../types';

export interface NormalUserAttributes {
  normalUserId: number;
  availableMinutes: number;
  ageGroup: AgeGroup;
  levelAtQuran: number;
  numberPerWeek: number;
  timeForEverytime: number;
  language: Language;
  methodForHefz: HefzMethod;
  isPaid: boolean;
  isFirstTime: boolean;
  mohafezId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NormalUserCreationAttributes extends Optional<NormalUserAttributes, 'normalUserId' | 'createdAt' | 'updatedAt'> {}

export class NormalUser extends Model<NormalUserAttributes, NormalUserCreationAttributes> implements NormalUserAttributes {
  public normalUserId!: number;
  public availableMinutes!: number;
  public ageGroup!: AgeGroup;
  public levelAtQuran!: number;
  public numberPerWeek!: number;
  public timeForEverytime!: number;
  public language!: Language;
  public methodForHefz!: HefzMethod;
  public isPaid!: boolean;
  public isFirstTime!: boolean;
  public mohafezId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public MohafezModel?: any;
  public Dependants?: any[];
}

NormalUser.init(
  {
    normalUserId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    availableMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ageGroup: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: AgeGroup.ADULT
    },
    levelAtQuran: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    numberPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    timeForEverytime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    language: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Language.ARABIC
    },
    methodForHefz: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: HefzMethod.VOICE
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isFirstTime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'NormalUsers',
    timestamps: true,
    indexes: [
      {
        fields: ['mohafezId']
      },
      {
        fields: ['ageGroup']
      },
      {
        fields: ['language']
      },
      {
        fields: ['isPaid']
      }
    ]
  }
);
