import "reflect-metadata";
import Database from "better-sqlite3";
import { ENTITY_METADATA_KEY, COLUMN_METADATA_KEY } from "../decorators/Entity";

export class BaseModel {
  protected static db: Database.Database;
  protected static entity: any;

  static init(db: Database.Database) {
    try {
      this.db = db;
      this.initTable();
    } catch (error) {
      console.error(`Failed to initialize ${this.constructor.name}:`, error);
      throw error;
    }
  }

  protected static getTableName(): string {
    return Reflect.getMetadata(ENTITY_METADATA_KEY, this.entity);
  }

  protected static getColumns(): Record<string, any> {
    return Reflect.getMetadata(COLUMN_METADATA_KEY, this.entity) || {};
  }

  protected static generateCreateTableSQL(): string {
    const tableName = this.getTableName();
    const columns = this.getColumns();

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

    return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
  }

  protected static initTable() {
    const sql = this.generateCreateTableSQL();
    this.db.exec(sql);
  }
}
