export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie("auth_token");

  // 如果路径以 /admin 开头且没有token，重定向到登录页
  if (to.path.startsWith("/admin")) {
    if (!token.value) {
      return navigateTo("/login");
    }
  }
});
