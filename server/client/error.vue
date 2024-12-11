<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">{{ error.statusCode }}</h1>
      <p class="text-gray-600 mb-6">{{ error.message }}</p>
      <button @click="handleError" class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">返回首页</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});

const handleError = () => {
  clearError({ redirect: "/" });
};
</script>
