export class BaseEntity {
  [key: symbol]: any;
  @Column({ type: "INTEGER", primary: true, unique: true })
  id: number = 0;
}

export enum EntityType {
  user = "user",
}
