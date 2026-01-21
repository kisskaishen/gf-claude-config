<template>
  <select-dropdown
    v-model="appStore.timezone"
    :options="timezoneOptions"
    @change="handleSetTimezone"
    :show-arrow="false"
    searchable
  >
    <span class="menu-item timezone-item" v-if="currentTimezone">
      <img :src="currentTimezone.icon" class="flag-icon" alt="timezone" />
      {{ currentTimezone.label }}
    </span>

    <template #option="{ item }">
      <div class="timezone-option">
        <img :src="item.icon" class="flag-icon-small" />
        <span>{{ item.label }}</span>
      </div>
    </template>
  </select-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/store/app";
import SelectDropdown from "@/components/SelectDropdown/index.vue";

const appStore = useAppStore();

// 模拟数据
const timezoneOptions = computed(() =>
  Object.entries(appStore.timezonesMap).map(([key, value]) => {
    const fileName = key.split("/").join("_");

    return {
      label: value,
      value: key,
      // 使用 new URL 动态获取资源路径
      icon: new URL(`../../assets/timezones/${fileName}.png`, import.meta.url)
        .href
    };
  })
);

const currentTimezone = computed(() => {
  return timezoneOptions.value.find((item) => item.value === appStore.timezone);
});

const handleSetTimezone = (val: any) => {
  appStore.setTimezone(val);
};
</script>

<style scoped lang="scss">
.menu-item {
  display: flex;
  align-items: center;
  color: var(--text-color-tertiary);
}

.timezone-item {
  gap: 6px;

  .flag-icon {
    width: 25px;
    height: 15px;
  }
}

.timezone-option {
  display: flex;
  align-items: center;

  .flag-icon-small {
    width: 25px;
    height: 15px;
    margin-right: 8px;
  }
}
</style>
