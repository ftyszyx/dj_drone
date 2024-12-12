<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"></div>
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium mb-4">{{ $t("dashboard.recentActivity") }}</h2>
      test
      <!-- 这里可以放置图表或数据表格 -->
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});
</script>
