import "reflect-metadata";

export const ENTITY_METADATA_KEY = Symbol("entity");
export const COLUMN_METADATA_KEY = Symbol("column");

// 实体装饰器
export function Entity(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, tableName, target);
  };
}

// 列装饰器
export function Column(type: string, options: ColumnOptions = {}) {
  return function (target: any, propertyKey: string) {
    const columns = Reflect.getMetadata(COLUMN_METADATA_KEY, target.constructor) || {};
    columns[propertyKey] = { type, ...options };
    Reflect.defineMetadata(COLUMN_METADATA_KEY, columns, target.constructor);
  };
}

interface ColumnOptions {
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
}
