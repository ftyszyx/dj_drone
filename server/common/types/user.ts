import { Entity, Column } from "../../server/decorators/Entity";

@Entity("users")
export class User {
  @Column("INTEGER", { primary: true })
  id!: number;

  @Column("TEXT", { unique: true })
  username!: string;

  @Column("TEXT")
  password!: string;

  @Column("DATETIME", { default: "CURRENT_TIMESTAMP" })
  created_at!: Date;
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
