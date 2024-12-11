import "reflect-metadata";

export const ENTITY_METADATA_KEY = Symbol("entity");
export const COLUMN_METADATA_KEY = Symbol("column");
export const Table_Name_KEY = Symbol("name");

// 实体装饰器
export function Entity(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, tableName, target);
  };
}

// 列装饰器
export function Column(options: ColumnOptions): PropertyDecorator {
  return function (instance: any, propertyName: string | symbol) {
    if (instance == undefined) return;
    if (!options) options = {} as ColumnOptions;
    const col_name = options.name || propertyName.toString();
    const col_type = options.type || "VARCHAR";
    // const existingColumns = Reflect.getMetadata(COLUMN_METADATA_KEY, instance.constructor) || {};
    // const obj = instance.constructor;
    console.log("instance", instance);
    console.log("propertyName", propertyName);
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
  default?: any;
}
