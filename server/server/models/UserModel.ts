import bcrypt from "bcryptjs";

export class UserModel extends BaseModel<User> {
  constructor() {
    super(new User());
  }

  override initTable() {
    SqliteHelper.initOneDb(this.entity);
    this.createDefaultAdmin();
  }

  // 创建默认管理员账户
  private createDefaultAdmin() {
    const admin = this.findByUsername("admin");
    if (!admin) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_INIT_PASSWORD, 10);
      this.AddOne({ username: "admin", password: hashedPassword });
    }
  }

  // 根据用户名查找用户
  findByUsername(username: string): User | undefined {
    return this.GetOne({ cond: { username } });
  }

  // 创建用户
  create(username: string, password: string): User | null {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = this.AddOne({ username, password: hashedPassword });
    return result;
  }

  // 验证密码
  verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  override AfterChange() {}

  override fixEntityIn(_entity: User): void {}

  override fixEntityOut(_entity: User): void {}

  override BeforeAdd(_entity: User): void {
    _entity.created_at = Math.floor(Date.now() / 1000);
  }
}
