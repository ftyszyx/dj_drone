export default defineNuxtConfig({
  // 设置源代码目录
  srcDir: "server",

  serverMiddleware: [{ path: "/socket", handler: "~/socket" }],

  // 添加 protobufjs 到构建配置
  build: {
    transpile: ["protobufjs"],
  },
});
