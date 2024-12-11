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

  initOneDb(obj: BaseEntity): boolean {
    const tableName = obj[TABLE_NAME_KEY] as string;
    Logger.info(`Initializing table ${tableName}...`);
    const tableExistsQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`;
    const tableExists = this._db.prepare(tableExistsQuery).all();
    if (tableExists.length > 0) {
      Logger.info(`Table ${tableName} already exists`);
      return true;
    }
    Logger.info(`Table ${tableName} does not exist, creating...`);
    let table_desc = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    let index_desc = "";
    const keys = Reflect.ownKeys(obj);
    Logger.info(`Table ${tableName} keys:`, keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const col_name = Reflect.getMetadata(COLUMN_NAME_KEY, obj, key);
      const col_type = Reflect.getMetadata(COLUMN_TYPE_KEY, obj, key);
      console.log("col_name", col_name, col_type);
      const isprimary = Reflect.getMetadata("primary", obj, key);
      if (!col_type) continue;
      table_desc += `${col_name} ${col_type}`;
      if (isprimary) {
        table_desc += " PRIMARY KEY autoincrement";
      }
      const default_value = Reflect.getMetadata("default", obj, key);
      if (default_value != undefined || default_value != null) {
        table_desc += ` DEFAULT '${default_value}' `;
      }
      if (Reflect.getMetadata("unique", obj, key)) {
        table_desc += " UNIQUE";
      }
      if (Reflect.getMetadata("notNull", obj, key)) {
        table_desc += " NOT NULL";
      }
      if (i < keys.length - 1) {
        table_desc += ",";
      }
      table_desc += "\n";
      const index_name = Reflect.getMetadata("index_name", obj, key);
      if (index_name) {
        const unique_index = Reflect.getMetadata("unique_index", obj, key);
        index_desc += `CREATE ${unique_index ? "UNIQUE" : ""} INDEX IF NOT EXISTS ${index_name} ON ${tableName} (${col_name});\n`;
      }
    }
    table_desc += ");";
    const sql_str = table_desc + "\n" + index_desc;
    Logger.info("Executing SQL:", sql_str);
    this._db.exec(sql_str);
    return true;
  }
}

export const SqliteHelper = new SqliteHelperClass();
