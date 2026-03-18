<template>
  <select-dropdown
    v-model="appStore.lang"
    :options="options"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app";
import SelectDropdown from "@/components/SelectDropdown/index.vue";
import { Lang } from "@/enums";

defineOptions({
  name: "LangSelect"
});

const appStore = useAppStore();

const options = [
  {
    value: Lang.zh,
    label: "简体中文"
  },
  {
    value: Lang.en,
    label: "English"
  },
  {
    value: Lang.fr,
    label: "Français"
  },
  {
    value: Lang.it,
    label: "Italiano"
  },
  {
    value: Lang.nl,
    label: "Nederlands"
  }
];
const handleChange = (val: any) => {
  appStore.setLang(val as Lang);
  // 如果是在登录页面，就不刷新页面
  if (location.pathname !== "/login") {
    location.reload();
  }
};
</script>

<style scoped lang="scss"></style>
