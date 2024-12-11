import { UserModel } from "../models/UserModel";
import Database from "better-sqlite3";
import { join } from "path";
import { Logger } from "./logger";

class AppBootstrap {
  private static db: Database.Database;
  private static isInitialized = false;

  static async init() {
    if (this.isInitialized) {
      await Logger.warn("Application is already initialized");
      return;
    }

    if (process.client) {
      return;
    }

    try {
      await Logger.info("Initializing application...");

      // 初始化数据库连接
      await this.initDatabase();

      // 初始化所有模型
      await this.initModels();

      this.isInitialized = true;
      await Logger.info("Application initialized successfully");
    } catch (error) {
      await Logger.error("Failed to initialize application:", error);
      this.isInitialized = false;
    }
  }

  private static async initDatabase() {
    await Logger.info("Initializing database connection...");
    try {
      const dbPath = join(process.cwd(), "data.db");
      this.db = new Database(dbPath);
      await Logger.info("Database connection established at:", dbPath);
    } catch (error) {
      await Logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  private static async initModels() {
    await Logger.info("Initializing models...");
    try {
      // 初始化用户模型
      await UserModel.init(this.db);

      // 这里可以添加其他模型的初始化
      // await OtherModel.init(this.db);

      await Logger.info("Models initialized successfully");
    } catch (error) {
      await Logger.error("Failed to initialize models:", error);
      throw error;
    }
  }

  static getDatabase(): Database.Database {
    if (!this.isInitialized) {
      throw new Error("Application is not initialized");
    }
    return this.db;
  }

  static async shutdown() {
    if (this.db) {
      await Logger.info("Closing database connection...");
      this.db.close();
      this.isInitialized = false;
      await Logger.info("Database connection closed");
    }
  }
}

// 导出单例
export { AppBootstrap };

// 在进程退出时关闭数据库连接
process.on("beforeExit", async () => {
  await AppBootstrap.shutdown();
});
