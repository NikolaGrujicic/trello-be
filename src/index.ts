import * as dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response, NextFunction } from "express";
import { sequelize, Status, User } from "./models";
import routes from "./routes";

interface AppError extends Error {
  statusCode?: number;
}

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", routes);

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message}`, err.stack);
  res.status(statusCode).json({ error: message });
});

const initializeDatabase = async (retries = 3, delay = 1000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.sync({ force: process.env.NODE_ENV !== "production" });

      const statusCount = await Status.count();
      if (statusCount === 0) {
        await Status.bulkCreate([
          { name: "Todo" },
          { name: "In Progress" },
          { name: "Done" },
        ]);
      }

      const userCount = await User.count();
      if (userCount === 0) {
        await User.bulkCreate([{ username: "user1" }, { username: "user2" }]);
      }

      console.log("Database initialized successfully");
      return;
    } catch (err) {
      console.error(`Database sync attempt ${attempt} failed:`, err);
      if (attempt === retries) {
        throw new Error(
          `Failed to initialize database after ${retries} attempts`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const startServer = () => {
  const server = app.listen(PORT, async () => {
    try {
      await initializeDatabase();
      console.log(`Server running on port ${PORT}`);
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  });

  const shutdown = () => {
    console.log("Shutting down server...");
    server.close(async () => {
      await sequelize.close();
      console.log("Server and database connections closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
};

if (require.main === module) {
  startServer();
}

export default app;
