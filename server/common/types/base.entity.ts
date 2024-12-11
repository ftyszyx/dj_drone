export class BaseEntity {
  [key: string]: any;
  @Column({ type: "INTEGER", primary: true, unique: true })
  id: number = 0;
}

export enum EntityType {
  user = "user",
}
