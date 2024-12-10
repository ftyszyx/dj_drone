import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { join } from "path";

console.log("server start");
// 数据库连接
const db = new Database(join(process.cwd(), "data.db"));

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 检查是否存在默认管理员账户，如果不存在则创建
const adminUser = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminUser) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
}

export default db;
