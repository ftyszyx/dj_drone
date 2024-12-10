import { verifyToken } from "~~/server/utils/jwt";

export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie("auth_token");

  // 如果路径以 /admin 开头且没有token，重定向到登录页
  if (to.path.startsWith("/admin")) {
    if (!token.value) {
      return navigateTo("/login");
    }

    // 验证 token
    const decoded = verifyToken(token.value);
    if (!decoded) {
      // token 无效，清除 cookie
      token.value = null;
      return navigateTo("/login");
    }
  }
});
