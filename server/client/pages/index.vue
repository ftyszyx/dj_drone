<template>
  <div>
    <h1>Welcome</h1>
  </div>
</template>

<script setup>
// 重定向到登录页面
onMounted(() => {
  navigateTo("/login");
});
</script>
