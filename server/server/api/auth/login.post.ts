import { UserModel } from "../../models/UserModel";
import { generateToken } from "../../utils/jwt";
import { H3Event } from "h3";
import { UserLoginDto, UserResponseDto } from "../../../common/types/user";
import { Logger } from "../../utils/logger";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { username, password } = await readBody<UserLoginDto>(event);

    // 参数验证
    if (!username || !password) {
      await Logger.warn("Login attempt with missing credentials");
      return createError({
        statusCode: 400,
        message: "Username and password are required",
      });
    }

    // 查询用户
    const user = UserModel.findByUsername(username);

    // 用户不存在
    if (!user) {
      await Logger.warn(`Login attempt with non-existent username: ${username}`);
      return createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    // 验证密码
    const isValidPassword = UserModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      await Logger.warn(`Failed login attempt for user: ${username}`);
      return createError({
        statusCode: 401,
        message: "Invalid username or password",
      });
    }

    await Logger.info(`User logged in successfully: ${username}`);

    // 生成 token
    const token = generateToken(user.id);

    // 设置 cookie
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 返回用户信息（不包含密码）
    const userResponse: UserResponseDto = {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    };

    return {
      success: true,
      user: userResponse,
    };
  } catch (error) {
    await Logger.error("Login error:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
