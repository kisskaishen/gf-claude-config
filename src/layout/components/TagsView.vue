<template>
  <div ref="containerRef" class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in visibleTags"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        :class="isActive(tag) ? 'active' : ''"
        class="tags-view-item"
        @contextmenu.prevent="handleRightClick(tag, $event)"
      >
        <div class="tags-view-item-title" :title="getI18nTitle(tag.meta)">
          {{ getI18nTitle(tag.meta) }}
        </div>
        <el-icon
          v-if="!isAffix(tag)"
          class="close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>

      <!-- 更多按钮 -->
      <el-popover
        v-if="hiddenTags.length > 0"
        placement="bottom"
        :width="140"
        :show-arrow="false"
        trigger="click"
        popper-class="tags-view-more-popper"
      >
        <template #reference>
          <div class="tags-view-item more-btn">
            <el-icon><MoreFilled /></el-icon>
          </div>
        </template>
        <div class="more-tags-list">
          <div
            v-for="tag in hiddenTags"
            :key="tag.path"
            class="more-tag-item"
            :class="{ active: isActive(tag) }"
            @click="handleTagClick(tag)"
            @contextmenu.prevent="handleRightClick(tag, $event)"
          >
            {{ getI18nTitle(tag.meta) }}
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 右键菜单 -->
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon><Refresh /></el-icon>
        {{ $t("gfuc.refresh" /** 刷新 **/) }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <el-icon><Close /></el-icon> {{ $t("gfuc.close" /** 关闭 **/) }}
      </li>
      <li @click="closeOthersTags">
        <el-icon><CircleClose /></el-icon>
        {{ $t("gfuc.close_others" /** 关闭其他 **/) }}
      </li>
      <li @click="closeAllTags">
        <el-icon><CircleClose /></el-icon>
        {{ $t("gfuc.close_all" /** 关闭所有 **/) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTagsViewStore, type TagView } from "@/store/tagsView";
import {
  Close,
  Refresh,
  CircleClose,
  MoreFilled
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();

const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
const TAG_WIDTH = 140;
const MORE_WIDTH = 50;

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref<TagView>({} as TagView);
const affixTags = ref<TagView[]>([]);

const filterAffixTags = (routes: readonly any[], basePath = "/") => {
  let tags: TagView[] = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath =
        route.path.startsWith("/") || basePath === "/"
          ? basePath + route.path
          : basePath + "/" + route.path;
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      } as any);
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
};

const initTags = () => {
  const affixTagsResult = filterAffixTags(router.options.routes);
  affixTags.value = affixTagsResult;
  for (const tag of affixTagsResult) {
    // 必须有 tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(tag as any);
    }
  }
};

const visitedViews = computed(() => {
  // 确保 affix 标签排在最前面
  return [...tagsViewStore.visitedViews].sort((a, b) => {
    const aAffix = a.meta && a.meta.affix;
    const bAffix = b.meta && b.meta.affix;
    if (aAffix && !bAffix) return -1;
    if (!aAffix && bAffix) return 1;
    return 0;
  });
});

// 计算可见和隐藏的标签
const visibleTags = computed(() => {
  const maxCount = Math.floor((containerWidth.value - MORE_WIDTH) / TAG_WIDTH);
  if (visitedViews.value.length <= maxCount) {
    return visitedViews.value;
  }

  // 确保当前激活的标签在可见列表中
  const activeIndex = visitedViews.value.findIndex((tag) => isActive(tag));

  if (activeIndex >= maxCount && activeIndex !== -1) {
    // 如果激活标签在隐藏区域，将其与可见区域的最后一个交换（或者直接切片包含它）
    // 这里简单处理：取前 maxCount-1 个，再加上当前激活的
    const result = visitedViews.value.slice(0, maxCount - 1);
    const activeTag = visitedViews.value[activeIndex];
    if (activeTag) {
      result.push(activeTag);
    }
    return result;
  }

  return visitedViews.value.slice(0, maxCount);
});

const hiddenTags = computed(() => {
  const visiblePaths = new Set(visibleTags.value.map((t) => t.path));
  return visitedViews.value.filter((tag) => !visiblePaths.has(tag.path));
});

const isActive = (tag: TagView) => {
  return tag.path === route.path;
};

const isAffix = (tag: TagView) => {
  return tag.meta && tag.meta.affix;
};

const handleTagClick = (tag: TagView) => {
  router.push({ path: tag.path, query: tag.query });
};

const refreshSelectedTag = (view: TagView) => {
  tagsViewStore.delCachedView(view).then(() => {
    const { fullPath } = route;
    nextTick(() => {
      router.replace({
        path: "/redirect" + fullPath
      });
    });
  });
};

const closeSelectedTag = (view: TagView) => {
  const index = visitedViews.value.findIndex((v) => v.path === view.path);
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      const nextView = visitedViews[index] || visitedViews[index - 1];
      if (nextView) {
        router.push({ path: nextView.path, query: nextView.query });
      } else {
        router.push("/");
      }
    }
  });
};

const closeOthersTags = () => {
  router.push(selectedTag.value);
  tagsViewStore.delOthersViews(selectedTag.value);
};

const closeAllTags = () => {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return;
    }
    toLastView(visitedViews, route as any);
  });
};

const toLastView = (visitedViews: TagView[], view: TagView) => {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.path);
  } else {
    if (view.name === "Home") {
      router.replace({ path: "/redirect" + view.path });
    } else {
      router.push("/");
    }
  }
};

const handleRightClick = (tag: TagView, e: MouseEvent) => {
  const menuMinWidth = 105;
  const offsetLeft = containerRef.value?.getBoundingClientRect().left || 0;
  const offsetTop = containerRef.value?.getBoundingClientRect().top || 0;

  const mouseLeft = e.clientX - offsetLeft;
  const mouseTop = e.clientY - offsetTop;

  const maxLeft = (containerRef.value?.offsetWidth || 0) - menuMinWidth;

  if (mouseLeft > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = mouseLeft;
  }

  top.value = mouseTop + 30;
  visible.value = true;
  selectedTag.value = tag;
};

const closeMenu = () => {
  visible.value = false;
};

// 监听容器宽度变化
let resizeObserver: ResizeObserver | null = null;

const handleResize = (entries: ResizeObserverEntry[]) => {
  for (const entry of entries) {
    containerWidth.value = entry.contentRect.width;
  }
};

const getI18nTitle = (meta: any) => {
  if (meta?.i18n) {
    return t(meta.i18n);
  }
  return meta?.title;
};

watch(route, () => {
  if (route.name) {
    tagsViewStore.addView(route);
  }
});

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeMenu);
  } else {
    document.body.removeEventListener("click", closeMenu);
  }
});

onMounted(() => {
  initTags();
  console.log("route", route.name, route);

  if (route.name) {
    tagsViewStore.addView(route);
  }

  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth;
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped lang="scss">
.tags-view-container {
  position: relative;
  width: 100%;
  height: 100%;

  .tags-view-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .tags-view-item {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
    justify-content: center;
    max-width: 180px;
    height: 100%;
    padding: 0 16px;
    font-size: var(--font-size-base);
    color: var(--text-color-tertiary);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s;

    .tags-view-item-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.more-btn {
      width: 50px;
    }

    &:hover {
      color: var(--color-primary);
      background-color: #fc4c0233;
    }

    &.active {
      color: var(--color-primary);
      background-color: #fc4c0233;

      &::after {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        content: "";
        background-color: var(--color-primary);
      }

      .close-icon {
        display: block;
      }
    }

    .close-icon {
      display: none;
      font-size: 16px;
      font-weight: 500;
    }

    &:hover .close-icon {
      display: block;
    }
  }

  .contextmenu {
    position: absolute;
    z-index: 3000;
    padding: 5px 0;
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    list-style-type: none;
    background: #fff;
    border-radius: 4px;
    box-shadow: 2px 2px 3px 0 rgb(0 0 0 / 30%);

    li {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 7px 16px;
      margin: 0;
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
        background: #f5f7fa;
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.more-tags-list {
  max-height: 400px;
  padding: 4px 0;
  overflow-y: auto;

  .more-tag-item {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    font-size: var(--font-size-base);
    color: var(--text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--color-primary);
    }

    &.active {
      color: var(--color-primary);
    }
  }
}
</style>
