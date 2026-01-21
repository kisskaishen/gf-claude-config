<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { getElementLang } from "./lang";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";

const appStore = useAppStore();
const userStore = useUserStore();

onMounted(async () => {
  // 如果已登录且本地未设置过偏好，尝试从云端同步
  if (userStore.token && !appStore.hasSetPreference) {
    await appStore.fetchPreferences();
  }
});
</script>

<template>
  <el-config-provider size="large" :locale="getElementLang(appStore.lang)">
    <RouterView />
  </el-config-provider>
</template>

<style scoped></style>
