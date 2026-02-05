<script setup lang="ts">
import { RouterView } from "vue-router";
import { getElementLang } from "./lang";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
</script>

<template>
  <el-config-provider size="large" :locale="getElementLang(appStore.lang)">
    <RouterView />
  </el-config-provider>
</template>

<style scoped></style>
