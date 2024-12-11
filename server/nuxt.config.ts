// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import type { Nitro } from "nitropack";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  srcDir: "client",
  imports: {
    dirs: ["common/**"],
  },
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
  vite: {
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        // 启用实验性装饰器
        experimentalDecorators: true,
        strictNullChecks: false,
        emitDecoratorMetadata: true,
        paths: {
          "@common/*": ["../common/*"],
          "@server/*": ["../server/*"],
          "@types/*": ["../common/types/*"],
        },
      },
    },
  },
  nitro: {
    imports: {
      dirs: ["common/**"],
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          experimentalDecorators: true,
          strictNullChecks: false,
          emitDecoratorMetadata: true,
          paths: {
            "@common/*": ["../common/*"],
            "@server/*": ["../server/*"],
            "@types/*": ["../common/types/*"],
          },
        },
      },
    },
    moduleSideEffects: ["reflect-metadata"],
    logLevel: process.env.NODE_ENV === "development" ? 3 : 1,
    externals: {
      external: ["jsonwebtoken"],
    },
  },
  experimental: {
    asyncContext: true,
  },
  hooks: {
    "nitro:build:before": (nitro: Nitro) => {
      nitro.options.moduleSideEffects.push("reflect-metadata");
    },
  },
});
