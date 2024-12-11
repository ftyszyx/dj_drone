<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const route = useRoute();

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    // 如果是根路径，重定向到登录页
    if (path === "/") {
      navigateTo("/login");
    }
  },
  { immediate: true }
);
</script>
