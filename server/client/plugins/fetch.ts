import { ApiStatus } from "~~/common/types/api.status";
export default defineNuxtPlugin((_nuxtApp) => {
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const token = useCookie("auth_token").value;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        } as Headers;
      }
    },
    onResponse({ response }) {
      console.log("get response", response);
      if (response.status == ApiStatus.SUCCESS) return;
      if (response.status == ApiStatus.NOT_LOGIN) {
        useRouter().push("/login");
      }
    },
  });
});
