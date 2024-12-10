export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("auth_token");

  // 如果路径以 /admin 开头且没有token，重定向到登录页
  if (to.path.startsWith("/admin") && !token.value) {
    return navigateTo("/login");
  }
});
