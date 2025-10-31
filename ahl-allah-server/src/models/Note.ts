import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface NoteAttributes {
  id: number;
  title: string;
  content: string;
  mohafezId: number;
  studentId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public mohafezId!: number;
  public studentId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public MohafezUser?: any;
  public NormalUser?: any;
}

Note.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mohafezId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MohafezUsers',
        key: 'mohafezId'
      }
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'NormalUsers',
        key: 'normalUserId'
      }
    }
  },
  {
    sequelize,
    tableName: 'Notes',
    timestamps: true,
    indexes: [
      {
        fields: ['mohafezId']
      },
      {
        fields: ['studentId']
      }
    ]
  }
);
