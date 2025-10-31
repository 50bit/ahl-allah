import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CallAttributes {
  id: number;
  studentId: number;
  mohafezId: number;
  callDate: Date;
  duration: number;
  status: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CallCreationAttributes extends Optional<CallAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  public id!: number;
  public studentId!: number;
  public mohafezId!: number;
  public callDate!: Date;
  public duration!: number;
  public status!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public Student?: any;
  public Mohafez?: any;
}

Call.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'NormalUsers',
        key: 'normalUserId'
      }
    },
    mohafezId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MohafezUsers',
        key: 'mohafezId'
      }
    },
    callDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'Calls',
    timestamps: true,
    indexes: [
      {
        fields: ['studentId']
      },
      {
        fields: ['mohafezId']
      },
      {
        fields: ['callDate']
      },
      {
        fields: ['status']
      }
    ]
  }
);
