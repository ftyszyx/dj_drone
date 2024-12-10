<template>
  <div>
    <h1 class="text-3xl font-bold underline">{{ $t("hello") }}</h1>
    <p>{{ $t("message.welcome") }}</p>
    <select v-model="locale">
      <option v-for="locale in locales" :key="locale.code" :value="locale.code">{{ locale.name }}</option>
    </select>
  </div>
</template>
<script setup lang="ts">
const { locale, locales } = useI18n();
</script>
