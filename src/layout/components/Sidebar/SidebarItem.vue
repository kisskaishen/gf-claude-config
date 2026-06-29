<template>
  <div v-if="!item.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item)">
      <el-menu-item :index="resolvePath(onlyOneChild.path)">
        <template v-if="onlyOneChild.meta?.icon || item.meta?.icon">
          <svg-icon :name="onlyOneChild.meta?.icon || item.meta?.icon" />
        </template>
        <template #title>
          <span
            class="sidebar-title"
            :title="getI18nTitle(onlyOneChild.meta)"
            >{{ getI18nTitle(onlyOneChild.meta) }}</span
          >
        </template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="item.path">
      <template #title>
        <template v-if="item.meta?.icon">
          <svg-icon
            :name="item.meta?.icon"
            :width="item.meta?.width || '20px'"
            :height="item.meta?.height || '24px'"
          />
        </template>
        <span class="sidebar-title" :title="getI18nTitle(item.meta)">{{
          getI18nTitle(item.meta)
        }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  item: RouteRecordRaw;
  basePath: string;
}>();

const onlyOneChild = ref<any>(null);

// 判断是否只有一个可显示的子路由
function hasOneShowingChild(
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw
) {
  const showingChildren = children.filter((item) => !item.meta?.hidden);

  if (showingChildren.length === 1) {
    // 只有一个可见子路由时，直接展示子级，但继承父级的 icon
    onlyOneChild.value = {
      ...showingChildren[0],
      meta: {
        ...showingChildren[0].meta,
        icon: showingChildren[0].meta?.icon || parent.meta?.icon,
        width: showingChildren[0].meta?.width || parent.meta?.width,
        height: showingChildren[0].meta?.height || parent.meta?.height
      }
    };
    return true;
  }
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "" };
    return true;
  }
  return false;
}

// 解析路径（简单处理，可根据需求增强）
function resolvePath(routePath: string) {
  if (routePath.startsWith("/")) return routePath;
  if (!routePath) return props.basePath;

  return `${props.basePath}/${routePath}`.replace(/\/+/g, "/");
}

// 获取i18n翻译
function getI18nTitle(meta: any) {
  if (meta?.i18n) {
    return t(meta.i18n);
  }
  return meta?.title;
}
</script>
<style lang="scss" scoped>
.sidebar-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.svg-icon {
  margin-right: 6px;
  font-size: 20px;
}

/* 菜单选中时图标颜色跟随文字 */
:deep(.el-menu-item.is-active svg) {
  fill: var(--el-menu-active-color) !important;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title svg) {
  fill: var(--el-menu-active-color) !important;
}
</style>
