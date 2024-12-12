export default defineNuxtPlugin((_nuxtApp) => {
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const token = useCookie("auth_token").value;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
  });
});
