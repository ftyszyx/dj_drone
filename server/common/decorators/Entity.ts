import "reflect-metadata";

export const COLUMN_METADATA_KEY = "column";
export const TABLE_NAME_KEY = "entityName";
export const COLUMN_NAME_KEY = "col_name";
export const COLUMN_TYPE_KEY = "col_type";

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

interface ColumnOptions {
  [key: string]: any;
  name?: string;
  type?: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  unique_index?: boolean;
  index?: string;
  default?: any;
}
