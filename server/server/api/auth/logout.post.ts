export default defineEventHandler((event) => {
  // 清除 auth_token cookie
  deleteCookie(event, "auth_token");

  return {
    success: true,
  };
});
