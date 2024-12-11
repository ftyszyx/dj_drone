import { Entity, Column } from "../decorators/Entity";
import { BaseEntity } from "./base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "TEXT", unique: true })
  username: string = "";

  @Column({ type: "TEXT" })
  password: string = "";

  @Column({ type: "INTEGER", default: 0 })
  created_at: number = 0;
}

// 登录请求DTO
export interface UserLoginDto {
  username: string;
  password: string;
}

// 用户响应DTO（不包含密码）
export interface UserResponseDto {
  id: number;
  username: string;
  created_at: Date;
}
