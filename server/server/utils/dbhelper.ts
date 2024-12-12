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

  private _runSql(sql: string) {
    if (process.env.SQL_LOG == "true") {
      Logger.info("Executing SQL:", sql);
    }
    return this._db.exec(sql);
  }

  private _runSqlALL2(sql: string): any[] {
    if (process.env.SQL_LOG == "true") {
      Logger.info("Executing SQL:", sql);
    }
    const res = this._db.prepare(sql).all();
    return res as any[];
  }

  private _runsqlGet2(sql: string): any {
    if (process.env.SQL_LOG == "true") {
      Logger.info("Executing SQL:", sql);
    }
    const res = this._db.prepare(sql).get();
    return res as any;
  }

  private _runSqlGet<T extends BaseEntity>(obj: BaseEntity, sql: string): T {
    if (process.env.SQL_LOG == "true") {
      Logger.info("Executing SQL:", sql);
    }
    const res = this._db.prepare(sql).get();
    return this.SqlRes2Entity(obj, [res])[0] as T;
  }

  private _runSqlAll<T extends BaseEntity>(obj: BaseEntity, sql: string): T[] {
    if (process.env.SQL_LOG == "true") {
      Logger.info("Executing SQL:", sql);
    }
    const res = this._db.prepare(sql).all();
    return this.SqlRes2Entity(obj, res);
  }

  private SqlRes2Entity<T extends BaseEntity>(obj: BaseEntity, res: any[]): T[] {
    const new_fun = obj.constructor as new (...args: any[]) => T;
    const keys = Reflect.ownKeys(obj) as string[];
    const res_items: T[] = [];
    for (let i = 0; i < res.length; i++) {
      const resitem = new new_fun() as any;
      for (const key of keys) {
        const col_name = Reflect.getMetadata(COLUMN_NAME_KEY, obj, key);
        if (col_name) {
          const col_value = res[i][col_name];
          if (col_value) {
            resitem[key] = col_value;
          }
        }
      }
      res_items.push(resitem);
    }
    return res_items;
  }

  private getColumnValue(obj: BaseEntity, key: string, value: any): string {
    const col_type: ColumnType = Reflect.getMetadata(COLUMN_TYPE_KEY, obj, key);
    const category = GetColumnTypeCategory(col_type);
    const isprimary = Reflect.getMetadata("primary", obj, key);
    const default_value = Reflect.getMetadata("default", obj, key);
    if (col_type) {
      if (value === undefined || value === null) {
        if (default_value != undefined || default_value != null || isprimary) return undefined;
        else return `''`;
      } else if (category == "number") {
        return `${value.toString()}`;
      } else {
        const res = value.toString();
        return `'${res}'`;
      }
    }
    return null;
  }

  private buildWhereClause<T extends BaseEntity>(obj: T, where: WhereDef<T>): string {
    const keys = Object.keys(where.cond);
    if (where == null) return "1=1";
    const search_conds: string[] = [];
    Object.keys(where.cond).every((key) => {
      const value = where.cond[key];
      if (value == null) return true;
      const col_value = this.getColumnValue(obj, key, value);
      if (col_value) {
        search_conds.push(` ${key} = ${col_value} `);
      }
      return true;
    });
    return search_conds.join(where.andor || " AND ");
  }

  public GetOne<T extends BaseEntity>(obj: T, where: WhereDef<T>): T | undefined {
    const sql = `SELECT * FROM ${obj[TABLE_NAME_KEY]} WHERE ${this.buildWhereClause(obj, where)} LIMIT 1`;
    return this._runSqlGet<T>(obj, sql);
  }

  public GetMany<T extends BaseEntity>(obj: T, where: WhereDef<T>): T[] {
    let sql = `SELECT * FROM ${obj[TABLE_NAME_KEY]} WHERE ${this.buildWhereClause(obj, where)} `;
    if (where.page && where.page_size) {
      sql += `LIMIT ${where.page_size} OFFSET ${(where.page - 1) * where.page_size}`;
    }
    return this._runSqlAll<T>(obj, sql);
  }

  public GetCount<T extends BaseEntity>(obj: T, where: WhereDef<T>): number {
    const keystr = "COUNT(*)";
    const sql = `SELECT ${keystr} FROM ${obj[TABLE_NAME_KEY]} WHERE ${this.buildWhereClause(obj, where)}`;
    const res = this._runSqlALL2(sql);
    if (res) return res[0][keystr] as number;
    else return 0;
  }

  private getAddOneSql<T extends BaseEntity>(obj: T, keys: string[]): string {
    let sql_str = "";
    const key_arr = [];
    const value_arr = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let element = obj[key];
      const col_value = this.getColumnValue(obj, key, element);
      if (col_value !== null && col_value !== undefined) {
        key_arr.push(key);
        value_arr.push(col_value);
      }
    }
    sql_str += ` (${key_arr.join(",")}) values (${value_arr.join(",")}) `;
    return sql_str;
  }

  public AddOne<T extends BaseEntity>(obj: T): T {
    let sql = `INSERT INTO ${obj[TABLE_NAME_KEY]} ${this.getAddOneSql(obj, Object.keys(obj))} RETURNING *`;
    return this._runSqlGet<T>(obj, sql);
  }

  public AddMany<T extends BaseEntity>(objs: T[]) {
    if (objs.length == 0) return;
    const obj = objs[0];
    const table_name = obj[TABLE_NAME_KEY];
    let sql_str = "Insert into " + table_name;
    const keys = Reflect.ownKeys(obj);
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      sql_str += this.getAddOneSql(obj, keys as string[]);
      if (i < objs.length - 1) {
        sql_str += ",\n";
      }
    }
    sql_str += ";\n";
    this._runSql(sql_str);
  }

  public UpdateOneById<T extends BaseEntity>(entity: T, obj_old: any, obj_new: any): T | null {
    if (!obj_new.id) {
      Logger.error("update entity id is null");
      return null;
    }
    const keys = Reflect.ownKeys(entity);
    keys.splice(keys.indexOf("id"), 1);
    let sql_str = this._getupdateOneSql(entity, obj_old, obj_new, keys as string[]);
    if (sql_str.trim().length == 0) return null;
    return this._runSqlGet<T>(entity, sql_str);
  }

  private getKeyValuePairByCompare(entity: BaseEntity, obj_old: any, obj_new: any, keys: string[]): string {
    const changelist = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let element = obj_new[key];
      const old_value = obj_old[key];
      if (element == undefined || element == null) continue;
      if (old_value == element) continue;
      const col_value = this.getColumnValue(entity, key, element);
      if (col_value) {
        changelist.push(`${key}=${col_value}`);
      }
    }
    return changelist.join(",");
  }

  protected getKeyvaluePairByMyself(entity: BaseEntity, obj: any, keys: string[]): string {
    const changelist = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let element = obj[key];
      if (element == undefined || element == null) continue;
      const col_value = this.getColumnValue(entity, key, element);
      if (col_value) {
        changelist.push(`${key}=${col_value}`);
      }
    }
    return changelist.join(",");
  }

  private _getupdateOneSql<T extends BaseEntity>(entity: T, obj_old: any, obj: any, keys: string[]): string {
    const table_name = entity[TABLE_NAME_KEY];
    let sql_str = "update " + table_name + " set ";
    const update_sql = this.getKeyValuePairByCompare(entity, obj_old, obj, keys as string[]);
    if (update_sql.trim().length == 0) {
      Logger.info("no update value");
      return "";
    }
    sql_str += update_sql;
    sql_str += ` where id=${obj.id}`;
    sql_str += ` RETURNING *`;
    return sql_str;
  }

  public UpdateManyById(entity: BaseEntity, objs: any[]): void {
    let sql_str_arr = [];
    const keys = Reflect.ownKeys(entity);
    const table_name = entity[TABLE_NAME_KEY];
    keys.splice(keys.indexOf("id"), 1);
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];
      let sql_str = "update " + table_name + " set ";
      const update_sql = this.getKeyvaluePairByMyself(entity, obj, keys as string[]);
      if (update_sql.trim().length == 0) continue;
      sql_str += update_sql;
      sql_str += ` where id=${obj.id}`;
      sql_str_arr.push(sql_str);
    }
    this._runSql(sql_str_arr.join(";"));
  }

  public BegineTrancation() {
    this._runSql("BEGIN TRANSACTION");
  }

  public CommitTrancation() {
    this._runSql("COMMIT TRANSACTION");
  }

  public RollbackTrancation() {
    this._runSql("ROLLBACK TRANSACTION");
  }

  public AbortTrancation() {
    this._runSql("ABORT TRANSACTION");
  }

  public DelMany(obj: BaseEntity, where: WhereDef<BaseEntity>): void {
    const table_name = obj[TABLE_NAME_KEY];
    let sql_str = `delete from ${table_name} where `;
    sql_str += this.buildWhereClause(obj, where);
    this._runSql(sql_str);
  }

  initOneDb(obj: BaseEntity): boolean {
    const tableName = obj[TABLE_NAME_KEY] as string;
    Logger.info(`Initializing table ${tableName}...`);
    const tableExistsQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`;
    const tableExists = this._runSqlALL2(tableExistsQuery);
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
      const category = GetColumnTypeCategory(col_type);
      console.log("col_name", col_name, col_type);
      const isprimary = Reflect.getMetadata("primary", obj, key);
      if (!col_type) continue;
      table_desc += `${col_name} ${col_type}`;
      if (isprimary) {
        table_desc += " PRIMARY KEY autoincrement";
      }
      const default_value = Reflect.getMetadata("default", obj, key);
      if (default_value != undefined || default_value != null) {
        if (category == "number") {
          table_desc += ` DEFAULT ${default_value} `;
        } else {
          table_desc += ` DEFAULT '${default_value}' `;
        }
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
    this._runSql(sql_str);
    return true;
  }
}

export const SqliteHelper = new SqliteHelperClass();
