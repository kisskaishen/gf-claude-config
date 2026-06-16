<template>
  <div class="search-container">
    <el-row :gutter="gutter" align="top">
      <el-col :span="24">
        <el-row :gutter="gutter" align="top">
          <!-- 其他搜索项 -->
          <template v-for="item in visibleSlots" :key="item.vnode">
            <el-col v-show="isExpanded || item.visible" v-bind="item.colProps">
              <component :is="item.vnode" />
            </el-col>
          </template>

          <!-- 操作按钮 - 在最后一行末尾展示 -->
          <el-col
            :span="operationColSpan"
            :offset="operationOffset"
            class="operation-col"
          >
            <slot name="action-left"></slot>
            <el-button class="btn-reset" :icon="Refresh" @click="handleReset">
              {{ $t("gfuc.reset" /** 重置 **/) }}
            </el-button>
            <el-button
              class="btn-search"
              type="primary"
              :icon="Search"
              :loading="loading"
              @click="throttledSearch"
            >
              {{ $t("gfuc.search" /** 搜索 **/) }}
            </el-button>
            <el-button
              v-if="isAutoLayout && needsCollapse"
              class="btn-expand"
              @click="isExpanded = !isExpanded"
            >
              <el-icon>
                <ArrowUp v-if="isExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, type VNode, Comment, Text } from "vue";
import { ArrowDown, ArrowUp, Search, Refresh } from "@element-plus/icons-vue";
import { throttle } from "lodash-es";
import type { SearchContainerProps } from "./types";
defineOptions({
  name: "SearchContainer"
});

// Props 定义
const props = withDefaults(defineProps<SearchContainerProps>(), {
  loading: false,
  isAutoLayout: true,
  rowNum: 1,
  cols: 3,
  gutter: 12,
  throttleTimer: 300,
  operationCols: 2
});

const emit = defineEmits(["search", "reset"]);
const slots = useSlots();
const isExpanded = ref(false);
const TOTAL_SPAN = 24;

// 逻辑计算逻辑
const defaultItemSpan = computed(() => Math.floor(TOTAL_SPAN / props.cols));

const visibleSlots = computed(() => {
  const rawSlots = (slots.default ? slots.default() : []) as VNode[];
  const flattened = rawSlots
    .flatMap((vnode) =>
      vnode.type === Symbol.for("v-fgt") ? (vnode.children as VNode[]) : [vnode]
    )
    .filter((vnode) => vnode.type !== Comment && vnode.type !== Text);

  let currentSpanSum = 0;
  const limit = isExpanded.value
    ? props.rowNum * TOTAL_SPAN
    : props.rowNum * TOTAL_SPAN - defaultItemSpan.value * props.operationCols;

  return flattened.map((vnode) => {
    const span = (
      vnode.props?.span ? Number(vnode.props.span) : defaultItemSpan.value
    ) as number;
    currentSpanSum += span;
    return {
      vnode,
      span,
      visible: currentSpanSum <= limit,
      colProps: { span }
    };
  });
});
const needsCollapse = computed(() => {
  const orderNumberSpanValue = 0;
  const otherSlotsSpan = visibleSlots.value.reduce(
    (sum, item) => sum + item.span,
    0
  );
  const totalSpan = orderNumberSpanValue + otherSlotsSpan;
  return totalSpan > props.rowNum * TOTAL_SPAN;
});

const throttledSearch = throttle(() => emit("search"), props.throttleTimer, {
  trailing: false
});
const handleReset = () => emit("reset");

// 操作按钮固定占 operationCols 列
const operationColSpan = computed(() =>
  Math.min(defaultItemSpan.value * props.operationCols, TOTAL_SPAN)
);

// 操作按钮偏移量
// - 如果当前行剩余空间足够，按钮跟在表单项尾部
// - 如果剩余空间不足，新开一行并放到行尾
const operationOffset = computed(() => {
  const shownItems = visibleSlots.value.filter(
    (item) => isExpanded.value || item.visible
  );
  const totalSpan = shownItems.reduce((sum, item) => sum + item.span, 0);
  const lastRowSpan = totalSpan % TOTAL_SPAN;
  const remaining = TOTAL_SPAN - lastRowSpan;

  // 一行放不下按钮时，新开一行，按钮靠右
  if (remaining < operationColSpan.value) {
    return TOTAL_SPAN - operationColSpan.value;
  }

  // 否则在表单项所在行的尾部
  return TOTAL_SPAN - operationColSpan.value - lastRowSpan;
});
</script>

<style scoped lang="scss">
.operation-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  // 和 el-form-item 的内容区高度对齐
  min-height: 32px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

/* 展开收起按钮 - 极淡橘色背景 + 橘色图标 */
.btn-expand {
  width: 40px;
  font-size: 20px;
  font-weight: 500;
  color: #ff4500;
  background-color: #fc4c020d;
  border-color: #fc4c020d;

  &:hover {
    color: #ff4500;
    background-color: #fc4c020d;
    border-color: #fc4c020d;
  }
}
</style>
