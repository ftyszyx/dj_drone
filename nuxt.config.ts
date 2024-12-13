export default defineNuxtConfig({
  serverMiddleware: [{ path: "/socket", handler: "~/server/socket" }],

  // 添加 protobufjs 到构建配置
  build: {
    transpile: ["protobufjs"],
  },
});
