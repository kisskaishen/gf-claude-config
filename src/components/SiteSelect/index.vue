<template>
  <select-dropdown
    v-model="appStore.site"
    :options="options"
    @change="handleSetSite"
  />
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app";
import SelectDropdown from "@/components/SelectDropdown/index.vue";
import { computed } from "vue";
defineOptions({
  name: "SiteSelect"
});

const appStore = useAppStore();

const options = computed(() => {
  return Object.entries(appStore.sitesMap).map(([key, value]) => ({
    value: key,
    label: value
  }));
});

const handleSetSite = (val: any) => {
  appStore.setSite(val);
  window.location.reload();
};
</script>

<style scoped lang="scss"></style>
