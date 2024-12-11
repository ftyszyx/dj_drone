import { H3Event } from "h3";
import { UserLoginDto } from "~~/common/types/user";
import { userModel } from "~~/server/models/UserModel";
import { generateToken } from "~~/server/utils/jwt";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<UserLoginDto>(event);

    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: "用户名和密码不能为空",
      });
    }

    const user = userModel.findByUsername(body.username);
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "用户名或密码错误",
      });
    }

    const validPassword = await userModel.verifyPassword(user, body.password);
    if (!validPassword) {
      throw createError({
        statusCode: 401,
        message: "用户名或密码错误",
      });
    }

    const token = generateToken({ id: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
});
