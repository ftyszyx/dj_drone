import en from "./locales/en.json";
import zh from "./locales/zh.json";

export default defineI18nConfig(() => ({
  legacy: false, // 是否兼容之前
  fallbackLocale: "en", // 区配不到的语言就用en
  messages: {
    en,
    zh,
  },
}));
