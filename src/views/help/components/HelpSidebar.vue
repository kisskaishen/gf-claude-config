<template>
  <div class="w-72 flex-shrink-0">
    <!-- 分类导航 -->
    <div class="p-5 mb-4 bg-white rounded-lg shadow-sm">
      <h3 class="mb-3 text-base font-medium text-text-regular">
        {{ $t("web.gfuc.help_center") }}
      </h3>
      <div class="space-y-1">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors"
          :class="
            activeCategory === category.id
              ? 'bg-primary-light text-primary font-medium'
              : 'text-text-secondary hover:bg-bg-light'
          "
          @click="handleCategoryClick(category.id)"
        >
          <span
            class="inline-flex items-center justify-center w-6 h-6 mr-2 rounded"
            :class="
              activeCategory === category.id ? 'text-primary' : 'text-info'
            "
          >
            <svg-icon :name="category.icon" width="18" height="18" />
          </span>
          <span>{{ $t(category.i18nKey) }}</span>
        </div>
      </div>
    </div>

    <!-- 联系客服 -->
    <div class="p-5 bg-white rounded-lg shadow-sm">
      <h3 class="mb-3 text-base font-medium text-text-regular">
        {{ $t("web.gfuc.help_contact") }}
      </h3>
      <p class="mb-4 text-sm text-text-tertiary">
        {{ $t("web.gfuc.help_contact_desc") }}
      </p>
      <div class="space-y-3">
        <el-button type="primary" class="w-full" @click="handleContact">
          {{ $t("web.gfuc.help_online_service") }}
        </el-button>
        <div class="flex items-center text-sm text-text-secondary">
          <svg
            class="w-4 h-4 mr-2 text-info"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>support@gofoparcels.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HelpCategory } from "../types";

defineProps<{
  categories: HelpCategory[];
  activeCategory?: string;
}>();

const emit = defineEmits<{
  (e: "selectCategory", categoryId: string): void;
}>();

const handleCategoryClick = (categoryId: string) => {
  emit("selectCategory", categoryId);
};

const handleContact = () => {
  window.open("mailto:support@gofoparcels.com");
};
</script>

<style scoped lang="scss">
.bg-primary-light {
  background-color: rgb(252 76 2 / 10%);
}
</style>
