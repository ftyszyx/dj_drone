import db from "~~/server/utils/db";
import bcrypt from "bcryptjs";
import { generateToken } from "~~/server/utils/jwt";

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);

    // 参数验证
    if (!username || !password) {
      return createError({
        statusCode: 400,
        message: "Username and password are required",
      });
    }

    // 查询用户
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    // 用户不存在
    if (!user) {
      return createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // 生成 token
    const token = generateToken(user.id);

    // 设置 cookie
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
