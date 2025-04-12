import { Sequelize } from "sequelize";
import StatusModel from "./status";
import UserModel from "./user";
import TaskModel from "./task";

const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
  dialect: "postgres",
  logging: false,
});

const Status = StatusModel(sequelize);
const User = UserModel(sequelize);
const Task = TaskModel(sequelize);

Task.belongsTo(Status, { foreignKey: "statusId", as: "Status" });
Task.belongsTo(User, { foreignKey: "assignedUserId", as: "User" });

export { sequelize, Status, User, Task };
