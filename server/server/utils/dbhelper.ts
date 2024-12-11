import Database from "better-sqlite3";
import { BaseEntity } from "~~/common/types/base.entity";
import path from "path";

class SqliteHelperClass {
  private _db: Database.Database;
  constructor() {}
  get db() {
    if (!this._db) {
      throw new Error("Database connection not initialized");
    }
    return this._db;
  }

  init() {
    Logger.info("Initializing database connection...");
    try {
      const dbPath = path.join(process.cwd(), "data.db");
      this._db = new Database(dbPath);
      Logger.info("Database connection established at:", dbPath);
    } catch (error) {
      Logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  close() {
    if (this._db) {
      this._db.close();
    }
  }

  initOneDb(oj: BaseEntity, talbleName: string): Promise<boolean> {
    const columns = Reflect.getMetadata(COLUMN_METADATA_KEY, oj) || {};
    const columnDefinitions = Object.entries(columns)
      .map(([name, config]) => {
        const { type, primary, unique, nullable, default: defaultValue } = config;
        let definition = `${name} ${type}`;

        if (primary) definition += " PRIMARY KEY";
        if (unique) definition += " UNIQUE";
        if (!nullable) definition += " NOT NULL";
        if (defaultValue !== undefined) {
          definition += ` DEFAULT ${defaultValue}`;
        }

        return definition;
      })
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
    this._db.exec(sql);
    return true;
  }
}

export const SqliteHelper = new SqliteHelperClass();
