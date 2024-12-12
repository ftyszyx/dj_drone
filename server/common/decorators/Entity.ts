import "reflect-metadata";

export type ColumnType =
  | "BIGINT" //   signed eight-byte integer
  | "INT" //string of 1s and 0s
  | "BLOB" //variable-length binary data
  | "BOOLEAN" //ogical boolean (true/false)
  | "DATE" //calendar date (year, month day)
  | "DOUBLE" //double precision floating-point number
  | "TIMESTAMP"
  | "TINYINT"
  | "INTEGER"
  | "TEXT"
  | "VARCHAR"
  | "VARCHAR[]";

export type ColumnTypeCatgory = "number" | "string" | "boolean" | "object" | "array" | "unkown";

export function GetColumnTypeCategory(type: ColumnType): ColumnTypeCatgory {
  if (type == "BIGINT" || type == "INT" || type == "DOUBLE" || type == "TINYINT" || type == "INTEGER") {
    return "number";
  }
  if (type == "VARCHAR" || type == "BLOB" || type == "TIMESTAMP" || type == "DATE") {
    return "string";
  }
  if (type == "VARCHAR[]") {
    return "array";
  }
  if (type == "BOOLEAN") {
    return "boolean";
  }
  return "unkown";
}

export const COLUMN_METADATA_KEY = "column";
export const TABLE_NAME_KEY = "entityName";
export const COLUMN_NAME_KEY = "col_name";
export const COLUMN_TYPE_KEY = "col_type";
export const API_PROPERTY_KEY = "api_property";

// 实体装饰器
export function Entity(tableName: string) {
  return function (target: Function) {
    target.prototype[TABLE_NAME_KEY] = tableName;
  };
}

// 列装饰器
export function Column(options: ColumnOptions): PropertyDecorator {
  return function (instance: any, propertyName: string | symbol) {
    if (instance == undefined) return;
    if (!options) options = {} as ColumnOptions;
    const col_name = options.name || propertyName.toString();
    const col_type = options.type || "VARCHAR";
    // console.log("instance", instance, "col_name", col_name, "col_type", col_type, "propertyName", propertyName);
    Reflect.defineMetadata(COLUMN_NAME_KEY, col_name, instance, propertyName);
    Reflect.defineMetadata(COLUMN_TYPE_KEY, col_type, instance, propertyName);
    for (const key in options) {
      try {
        Reflect.defineMetadata(key, options[key], instance, propertyName);
      } catch (error: any) {
        console.error("Column decorator error:", key, error.message, error);
      }
    }
  };
}

export function APIProperty(): PropertyDecorator {
  return function (instance: any, propertyName: string | symbol) {
    if (instance == undefined) return;
    Reflect.defineMetadata(API_PROPERTY_KEY, true, instance, propertyName);
  };
}

interface ColumnOptions {
  [key: string]: any;
  name?: string;
  type?: ColumnType;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  unique_index?: boolean;
  index?: string;
  default?: any;
}
