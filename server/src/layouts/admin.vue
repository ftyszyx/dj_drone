<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-4 border-b">
        <h1 class="text-xl font-bold">管理系统</h1>
      </div>
      <nav class="p-4">
        <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path" class="block py-2 px-4 hover:bg-gray-100 rounded">
          {{ item.title }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航栏 -->
      <header class="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
        <div>
          <h2 class="text-lg font-medium">{{ currentPage }}</h2>
        </div>
        <div class="flex items-center space-x-4">
          <select v-model="$i18n.locale" class="border rounded px-2 py-1">
            <option v-for="locale in $i18n.locales" :key="locale.code" :value="locale.code">
              {{ locale.name }}
            </option>
          </select>
          <button class="text-gray-600 hover:text-gray-800">
            {{ $t("common.logout") }}
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const { $i18n } = useNuxtApp();

const menuItems = [
  { path: "/admin/dashboard", title: $t("menu.dashboard") },
  { path: "/admin/users", title: $t("menu.users") },
  { path: "/admin/settings", title: $t("menu.settings") },
];

const route = useRoute();
const currentPage = computed(() => {
  return menuItems.find((item) => item.path === route.path)?.title || "";
});
</script>
