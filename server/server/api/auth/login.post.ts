import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { username, password } = await readBody<UserLoginReq>(event);

    // 参数验证
    if (!username || !password) {
      Logger.warn("Login attempt with missing credentials");
      return createError({
        statusCode: ApiStatus.FORM_ERROR,
        message: "Username and password are required",
      });
    }

    // 查询用户
    const user = g_userModel.findByUsername(username);

    // 用户不存在
    if (!user) {
      Logger.warn(`Login attempt with non-existent username: ${username}`);
      return createError({
        statusCode: ApiStatus.USER_NOT_FOUND,
        message: "Invalid username or password",
      });
    }

    // 验证密码
    const isValidPassword = g_userModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      Logger.warn(`Failed login attempt for user: ${username}`);
      return createError({
        statusCode: ApiStatus.USER_PASSWORD_ERROR,
        message: "Invalid username or password",
      });
    }

    Logger.info(`User logged in successfully: ${username}`);

    // 生成 token
    const token = generateToken(user.id);

    user.password = undefined;
    // 返回用户信息（不包含密码）
    const userResponse: UserLoginRes = {
      token: token,
      user: user,
    };
    return {
      success: true,
      data: userResponse,
    };
  } catch (error) {
    Logger.error("Login error:", error);
    return createError({
      statusCode: ApiStatus.ERROR,
      message: "Internal server error",
    });
  }
});
