<script setup lang="ts">
import { UserLoginDto, LoginResponse } from "~/types/auth";

const username = ref("");
const password = ref("");

const login = async () => {
  try {
    const loginData: UserLoginDto = {
      username: username.value,
      password: password.value,
    };

    const { data, error } = await useFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: loginData,
    });

    if (error.value) {
      // 处理错误
      console.error(error.value);
      return;
    }

    // 处理登录成功
    console.log("登录成功：", data.value);
  } catch (err) {
    console.error("登录失败：", err);
  }
};
</script>

<template>
  <div>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>
