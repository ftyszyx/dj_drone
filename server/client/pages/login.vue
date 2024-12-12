<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <!-- Logo或标题区域 -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">{{ $t("login.title") }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ $t("login.welcome") }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- 用户名输入框 -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ $t("login.username") }}
            </label>
            <div class="mt-1 relative">
              <input
                v-model="form.username"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('login.usernamePlaceholder')"
              />
            </div>
          </div>

          <!-- 密码输入框 -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ $t("login.password") }}
            </label>
            <div class="mt-1 relative">
              <input
                v-model="form.password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('login.passwordPlaceholder')"
              />
            </div>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input type="checkbox" v-model="form.remember" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label class="ml-2 block text-sm text-gray-900">
                {{ $t("login.rememberMe") }}
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                {{ $t("login.forgotPassword") }}
              </a>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {{ $t("login.error") }}
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ loading ? $t("login.loggingIn") : $t("login.submit") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = false;

    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        username: form.username,
        password: form.password,
      },
    }) as ApiResp<UserLoginRes>;

    if (response.success) {
      // 如果选择了记住我，设置更长的 cookie 过期时间
      const authToken = useCookie("auth_token", {
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      if (form.remember) {
        authToken.value = response.data.token;
      }
      await navigateTo("/admin/dashboard");
    }
  } catch (err) {
    error.value = true;
    console.error("Login failed:", err);
  } finally {
    loading.value = false;
  }
};
</script>
