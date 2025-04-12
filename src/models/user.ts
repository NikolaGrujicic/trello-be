import { DataTypes, Model, Sequelize } from "sequelize";

export interface UserAttributes {
  id?: number;
  username: string;
}

export class User extends Model<UserAttributes> {
  public id!: number;
  public username!: string;
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    },
  );

  return User;
};
