import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface OrganizationAttributes {
  organizationId: number;
  name: string;
  description?: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationCreationAttributes
  extends Optional<OrganizationAttributes, 'organizationId' | 'verified' | 'createdAt' | 'updatedAt'> {}

export class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes {
  public organizationId!: number;
  public name!: string;
  public description?: string;
  public verified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    organizationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'Organizations',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['verified'] }
    ]
  }
);

