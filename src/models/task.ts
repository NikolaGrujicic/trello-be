import { DataTypes, Model, Sequelize } from "sequelize";

export interface TaskAttributes {
  id?: number;
  title: string;
  description?: string;
  statusId: number;
  assignedUserId: number;
}

export class Task extends Model<TaskAttributes> {
  public id!: number;
  public title!: string;
  public description!: string | undefined;
  public statusId!: number;
  public assignedUserId!: number;
}

export default (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
    },
  );

  return Task;
};
