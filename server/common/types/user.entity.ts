import { Entity, Column } from "../decorators/Entity";
import { BaseEntity } from "./base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "TEXT", unique: true })
  username: string = "";

  @Column({ type: "TEXT" })
  password: string = "";

  @Column({ type: "INTEGER", default: 0 })
  @APIProperty()
  created_at: number = 0;
}

// 登录请求DTO
export interface UserLoginReq {
  username: string;
  password: string;
}

export interface UserLoginRes {
  token: string;
  user: User;
}
