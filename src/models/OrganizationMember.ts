import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrgRole } from '../types';

export interface OrganizationMemberAttributes {
  organizationMemberId: number;
  organizationId: number;
  userId: string;
  orgRole: OrgRole; // 1=ADMIN, 2=MEMBER
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationMemberCreationAttributes
  extends Optional<OrganizationMemberAttributes, 'organizationMemberId' | 'createdAt' | 'updatedAt'> {}

export class OrganizationMember
  extends Model<OrganizationMemberAttributes, OrganizationMemberCreationAttributes>
  implements OrganizationMemberAttributes {
  public organizationMemberId!: number;
  public organizationId!: number;
  public userId!: string;
  public orgRole!: OrgRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrganizationMember.init(
  {
    organizationMemberId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Organizations', key: 'organizationId' },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    },
    orgRole: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: OrgRole.MEMBER
    }
  },
  {
    sequelize,
    tableName: 'OrganizationMembers',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['organizationId', 'userId'] },
      { fields: ['orgRole'] }
    ]
  }
);

