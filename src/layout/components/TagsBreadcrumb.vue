<template>
  <el-breadcrumb separator=">">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span
        class="breadcrumb-text"
        v-if="index === breadcrumbs.length - 1 || item.redirect"
        :class="
          index === breadcrumbs.length - 1 ? 'current-page' : 'parent-text'
        "
        :title="getI18nTitle(item.meta)"
      >
        {{ getI18nTitle(item.meta) }}
      </span>
      <span
        v-else
        class="breadcrumb-text parent-link"
        @click.prevent="handleLink(item)"
        :title="getI18nTitle(item.meta)"
      >
        {{ getI18nTitle(item.meta) }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, type RouteLocationMatched } from "vue-router";
import { useI18n } from "vue-i18n";
// --- 面包屑逻辑 ---
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const breadcrumbs = computed<RouteLocationMatched[]>(() => {
  let matched = route.matched.filter((item) => item.meta && item.meta.title);
  return matched.filter(
    (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
  );
});

const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect as string);
    return;
  }
  router.push(path);
};

const getI18nTitle = (meta: any) => {
  if (meta?.i18n) {
    return t(meta.i18n);
  }
  return meta?.title;
};
</script>
<style scoped lang="scss">
.breadcrumb-text {
  display: inline-block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-breadcrumb__inner) {
  font-size: var(--font-size-base);

  .current-page {
    font-weight: 400;
    color: var(--text-color-primary);
    cursor: default;
  }

  .parent-text {
    font-weight: 400;
    color: var(--text-color-tertiary);
    cursor: default;
  }

  .parent-link {
    font-weight: 400;
    color: var(--text-color-secondary);
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: var(--color-primary);
    }
  }
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: var(--text-color-tertiary);
}
</style>
