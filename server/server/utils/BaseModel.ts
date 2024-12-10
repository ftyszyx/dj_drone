import db from "./db";
import { Database } from "better-sqlite3";

export class BaseModel {
  protected tableName: string;
  protected db: Database;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = db;
  }

  /**
   * 查找单条记录
   */
  findOne(where: Record<string, any>) {
    const keys = Object.keys(where);
    const whereClause = keys.map((key) => `${key} = ?`).join(" AND ");
    const values = Object.values(where);

    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    return this.db.prepare(sql).get(...values);
  }

  /**
   * 查找多条记录
   */
  find(where: Record<string, any> = {}) {
    if (Object.keys(where).length === 0) {
      return this.db.prepare(`SELECT * FROM ${this.tableName}`).all();
    }

    const keys = Object.keys(where);
    const whereClause = keys.map((key) => `${key} = ?`).join(" AND ");
    const values = Object.values(where);

    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    return this.db.prepare(sql).all(...values);
  }

  /**
   * 插入记录
   */
  create(data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
    const result = this.db.prepare(sql).run(...values);
    return result;
  }

  /**
   * 更新记录
   */
  update(where: Record<string, any>, data: Record<string, any>) {
    const updateKeys = Object.keys(data);
    const updateValues = Object.values(data);
    const updateClause = updateKeys.map((key) => `${key} = ?`).join(", ");

    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    const whereClause = whereKeys.map((key) => `${key} = ?`).join(" AND ");

    const sql = `UPDATE ${this.tableName} SET ${updateClause} WHERE ${whereClause}`;
    return this.db.prepare(sql).run(...updateValues, ...whereValues);
  }

  /**
   * 删除记录
   */
  delete(where: Record<string, any>) {
    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys.map((key) => `${key} = ?`).join(" AND ");

    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
    return this.db.prepare(sql).run(...values);
  }

  /**
   * 自定义查询
   */
  query(sql: string, params: any[] = []) {
    return this.db.prepare(sql).all(...params);
  }
}
