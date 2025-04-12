import { Request, Response } from "express";
import { Task } from "../models";
import { TaskAttributes } from "../models/task";

interface AppError extends Error {
  statusCode?: number;
}

const handleError = (
  res: Response,
  error: unknown,
  defaultMessage: string,
  statusCode: number = 500,
) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  res.status(statusCode).json({ error: message });
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.findAll({
      include: ["Status", "User"],
    });
    res.json(tasks);
  } catch (error) {
    handleError(res, error, "Failed to fetch tasks");
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: ["Status", "User"],
    });
    if (!task) {
      const error: AppError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
    res.json(task);
  } catch (error) {
    const statusCode =
      error instanceof Error && (error as AppError).statusCode
        ? (error as AppError).statusCode
        : 500;
    handleError(res, error, "Failed to fetch task", statusCode);
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, statusId, assignedUserId } =
      req.body as TaskAttributes;

    if (!title || !statusId || !assignedUserId) {
      const error: AppError = new Error(
        "Missing required fields: title, statusId, or assignedUserId",
      );
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.create({
      title,
      description,
      statusId,
      assignedUserId,
    });
    res.status(201).json(task);
  } catch (error) {
    const statusCode =
      error instanceof Error && (error as AppError).statusCode
        ? (error as AppError).statusCode
        : 400;
    handleError(res, error, "Failed to create task", statusCode);
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      const error: AppError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const { title, description, statusId, assignedUserId } =
      req.body as Partial<TaskAttributes>;
    await task.update({
      title,
      description,
      statusId,
      assignedUserId,
    });

    res.json(task);
  } catch (error) {
    const statusCode =
      error instanceof Error && (error as AppError).statusCode
        ? (error as AppError).statusCode
        : 400;
    handleError(res, error, "Failed to update task", statusCode);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      const error: AppError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
    await task.destroy();
    res.status(204).send();
  } catch (error) {
    const statusCode =
      error instanceof Error && (error as AppError).statusCode
        ? (error as AppError).statusCode
        : 500;
    handleError(res, error, "Failed to delete task", statusCode);
  }
};
