import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RefreshTokenAttributes {
  id: number;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'revoked' | 'createdAt' | 'updatedAt'> {}

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: number;
  public userId!: string;
  public tokenHash!: string;
  public expiresAt!: Date;
  public revoked!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'RefreshTokens',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['expiresAt'] },
      { fields: ['revoked'] }
    ]
  }
);

export default RefreshToken;


