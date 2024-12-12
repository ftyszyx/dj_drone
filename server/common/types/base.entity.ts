export class BaseEntity {
  [key: string]: any;
  @Column({ type: "INTEGER", primary: true, unique: true })
  id: number = 0;
}

export enum EntityType {
  User = "user",
}

export type SearchField<T> = {
  [P in keyof T]?: any;
};

export interface WhereDef<T> {
  cond: SearchField<T>;
  andor?: "AND" | "OR";
  page?: number;
  page_size?: number;
}
