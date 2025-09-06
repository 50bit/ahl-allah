import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SessionAttributes {
  id: number;
  name: string;
  admidUid: string;
  maxMembers: number;
  members: number;
  level: number;
  language: number;
  timePerSession: number;
  summary: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public name!: string;
  public admidUid!: string;
  public maxMembers!: number;
  public members!: number;
  public level!: number;
  public language!: number;
  public timePerSession!: number;
  public summary!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public SessionTime?: any[];
  public User?: any;
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    admidUid: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    members: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    language: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    timePerSession: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'Sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['level']
      },
      {
        fields: ['language']
      }
    ]
  }
);
