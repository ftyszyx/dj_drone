import { User } from "~~/common/types/user";
import bcrypt from "bcryptjs";
import { BaseModel } from "../utils/BaseModel";

export class UserModel extends BaseModel {
  constructor() {
    super("users");
  }

  /**
   * 创建用户
   */
  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = this.create({
      username,
      password: hashedPassword,
    });
    return this.findOne({ id: result.lastInsertRowid }) as User;
  }

  /**
   * 通过用户名查找用户
   */
  findByUsername(username: string): User | undefined {
    return this.findOne({ username }) as User | undefined;
  }

  /**
   * 验证用户密码
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * 更新用户信息
   */
  updateUser(id: number, data: Partial<User>) {
    return this.update({ id }, data);
  }
}

// 导出单例
export const userModel = new UserModel();
