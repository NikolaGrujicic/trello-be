import * as dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import app from "../src/index";
import { sequelize, Status, User, Task } from "../src/models";

let statusId: number;
let userId: number;

async function syncWithRetry(maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.sync({ force: true, logging: false });
      return;
    } catch (error: any) {
      console.error(`Sync attempt ${attempt} failed:`, error.message || error);
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

beforeAll(async () => {
  await syncWithRetry();
  const statuses = await Status.bulkCreate(
    [{ name: "Todo" }, { name: "In Progress" }, { name: "Done" }],
    { logging: false },
  );
  const user = await User.create({ username: "testuser" }, { logging: false });
  statusId = statuses[0].id;
  userId = user.id;
});

beforeEach(async () => {
  await Task.destroy({ where: {}, logging: false });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Task API", () => {
  describe("POST /api/tasks", () => {
    it("should create a task with valid inputs", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Test Task",
        description: "Test Description",
        statusId,
        assignedUserId: userId,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("Test Task");
      expect(res.body.description).toBe("Test Description");
    });

    it("should return 400 when creating a task without a title", async () => {
      const res = await request(app).post("/api/tasks").send({
        description: "No title task",
        statusId,
        assignedUserId: userId,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(
        "Missing required fields: title, statusId, or assignedUserId",
      );
    });

    it("should return 400 for invalid statusId", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Invalid Status Task",
        description: "Invalid status",
        statusId: 999,
        assignedUserId: userId,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/foreign key/i);
    });

    it("should return 400 for invalid assignedUserId", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Invalid User Task",
        description: "Invalid user",
        statusId,
        assignedUserId: 999,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/foreign key/i);
    });
  });

  describe("GET /api/tasks", () => {
    it("should get all tasks with associations", async () => {
      await Task.create(
        {
          title: "Sample Task",
          description: "Sample Desc",
          statusId,
          assignedUserId: userId,
        },
        { logging: false },
      );
      const res = await request(app).get("/api/tasks");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("title", "Sample Task");
      expect(res.body[0].Status).toHaveProperty("name", "Todo");
      expect(res.body[0].User).toHaveProperty("username", "testuser");
    });

    it("should return empty array when no tasks exist", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should get a task by id with associations", async () => {
      const task = await Task.create(
        {
          title: "Single Task",
          description: "Single Desc",
          statusId,
          assignedUserId: userId,
        },
        { logging: false },
      );
      const res = await request(app).get(`/api/tasks/${task.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("Single Task");
      expect(res.body.Status).toHaveProperty("name", "Todo");
      expect(res.body.User).toHaveProperty("username", "testuser");
    });

    it("should return 404 for non-existent task", async () => {
      const res = await request(app).get("/api/tasks/999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await Task.create(
        {
          title: "Update Task",
          description: "Update Desc",
          statusId,
          assignedUserId: userId,
        },
        { logging: false },
      );
      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: "Updated Task" });
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("Updated Task");
    });

    it("should return 404 when updating a non-existent task", async () => {
      const res = await request(app)
        .put("/api/tasks/999")
        .send({ title: "Updated Task" });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await Task.create(
        {
          title: "Delete Task",
          description: "Delete Desc",
          statusId,
          assignedUserId: userId,
        },
        { logging: false },
      );
      const res = await request(app).delete(`/api/tasks/${task.id}`);
      expect(res.statusCode).toBe(204);
    });

    it("should return 404 when deleting a non-existent task", async () => {
      const res = await request(app).delete("/api/tasks/999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  describe("Global Error Handling", () => {
    it("should handle unhandled errors with 500 status", async () => {
      jest
        .spyOn(Task, "findAll")
        .mockRejectedValueOnce(new Error("Unexpected DB error"));
      const res = await request(app).get("/api/tasks");
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Unexpected DB error" });
      jest.spyOn(Task, "findAll").mockRestore();
    });
  });
});
