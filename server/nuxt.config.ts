// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  srcDir: "client",
  serverDir: "server",
  devtools: { enabled: true },
  modules: ["@nuxtjs/i18n"],
  css: ["@/assets/css/main.css", "@/assets/css/tailwind_output.css"],
  i18n: {
    vueI18n: "./i18n.config.ts",
    locales: [
      {
        code: "en",
        name: "English",
      },
      {
        code: "zh",
        name: "中文",
      },
    ],
    defaultLocale: "zh",
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          "@common/*": ["../common/*"],
          "@server/*": ["../server/*"],
          "@types/*": ["../common/types/*"],
        },
      },
    },
  },
  nitro: {
    // moduleSideEffects: ["reflect-metadata"],
    logLevel: process.env.NODE_ENV === "development" ? 3 : 1,
    externals: {
      external: ["jsonwebtoken"],
    },
  },
  experimental: {
    asyncContext: true,
  },
});
