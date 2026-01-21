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
import { computed } from "vue";

defineOptions({
  name: "LangSelect"
});

const appStore = useAppStore();

const options = computed(() => {
  return Object.entries(appStore.langsMap).map(([key, value]) => ({
    value: key,
    label: value
  }));
});

const handleChange = (val: any) => {
  appStore.setLang(val as Lang);
};
</script>

<style scoped lang="scss"></style>
