import { DataTypes, Model, Sequelize } from "sequelize";

export interface StatusAttributes {
  id?: number;
  name: string;
}

export class Status extends Model<StatusAttributes> {
  public id!: number;
  public name!: string;
}

export default (sequelize: Sequelize) => {
  Status.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Status",
      tableName: "statuses",
    },
  );

  return Status;
};
