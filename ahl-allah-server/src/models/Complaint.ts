import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ComplaintAttributes {
  id: number;
  title: string;
  description: string;
  studentId: number;
  mohafezId: number;
  rating?: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComplaintCreationAttributes extends Optional<ComplaintAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Complaint extends Model<ComplaintAttributes, ComplaintCreationAttributes> implements ComplaintAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public studentId!: number;
  public mohafezId!: number;
  public rating?: number;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public Student?: any;
  public Mohafez?: any;
}

Complaint.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    tableName: 'Complaints',
    timestamps: true,
    indexes: [
      {
        fields: ['studentId']
      },
      {
        fields: ['mohafezId']
      },
      {
        fields: ['status']
      }
    ]
  }
);
