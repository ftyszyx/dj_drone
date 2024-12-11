import bcrypt from "bcryptjs";

export class UserModel extends BaseModel<User> {
  constructor() {
    super(new User());
  }

  initTable() {
    SqliteHelper.initOneDb(this.entity, this.Name);
    this.createDefaultAdmin();
  }

  // 创建默认管理员账户
  private createDefaultAdmin() {
    const admin = this.findByUsername("admin");
    if (!admin) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      SqliteHelper.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
    }
  }

  // 根据用户名查找用户
  findByUsername(username: string): User | undefined {
    return SqliteHelper.db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
  }

  // 创建用户
  create(username: string, password: string): User {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = SqliteHelper.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hashedPassword);

    return SqliteHelper.db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as User;
  }

  // 验证密码
  verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
