import { BaseModel } from "../utils/BaseModel";
import bcrypt from "bcryptjs";
import { User } from "../../common/types/user";
import Database from "better-sqlite3";

export class UserModel extends BaseModel {
  protected static entity = User;

  // 初始化
  static async init(db: Database.Database) {
    super.init(db);
    await this.createDefaultAdmin();
  }

  // 创建默认管理员账户
  private static createDefaultAdmin() {
    const admin = this.findByUsername("admin");
    if (!admin) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      this.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
    }
  }

  // 根据用户名查找用户
  static findByUsername(username: string): User | undefined {
    return this.db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
  }

  // 创建用户
  static create(username: string, password: string): User {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = this.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hashedPassword);

    return this.db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as User;
  }

  // 验证密码
  static verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
