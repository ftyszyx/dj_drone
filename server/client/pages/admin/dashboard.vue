<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div v-for="stat in stats" :key="stat.title" class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm">{{ stat.title }}</h3>
        <p class="text-2xl font-semibold mt-2">{{ stat.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium mb-4">{{ $t("dashboard.recentActivity") }}</h2>
      <!-- 这里可以放置图表或数据表格 -->
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const stats = [
  { title: $t("dashboard.totalUsers"), value: "1,234" },
  { title: $t("dashboard.activeUsers"), value: "891" },
  { title: $t("dashboard.totalRevenue"), value: "¥12,345" },
];
</script>
