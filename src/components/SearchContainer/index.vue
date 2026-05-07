<template>
  <div class="search-container">
    <el-row :gutter="gutter" type="flex">
      <!-- 单号模块独立列 -->
      <el-col
        v-if="hasOrderNumberSlot"
        :span="orderNumberSpan"
        class="order-number-col"
      >
        <slot name="order-number"></slot>
      </el-col>
      <el-col :span="24 - orderNumberSpan">
        <el-row :gutter="gutter">
          <!-- 其他搜索项 -->
          <template v-for="item in visibleSlots" :key="item.vnode">
            <el-col v-show="isExpanded || item.visible" v-bind="item.colProps">
              <component :is="item.vnode" />
            </el-col>
          </template>
        </el-row>
      </el-col>
    </el-row>

    <div class="operation-bar">
      <div class="operation-left">
        <slot name="action-left"></slot>
      </div>
      <div class="operation-right">
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
      </div>
    </div>
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
  throttleTimer: 300
});

const emit = defineEmits(["search", "reset"]);
const slots = useSlots();
const isExpanded = ref(false);
const TOTAL_SPAN = 24;

// 逻辑计算逻辑
const defaultItemSpan = computed(() => Math.floor(TOTAL_SPAN / props.cols));

// 单号模块相关计算
const hasOrderNumberSlot = computed(() => !!slots["order-number"]);
const orderNumberSpan = computed(() => {
  // 单号模块默认占据1列，可根据需要调整
  return Math.floor(TOTAL_SPAN / props.cols);
});

const visibleSlots = computed(() => {
  const rawSlots = (slots.default ? slots.default() : []) as VNode[];
  const flattened = rawSlots
    .flatMap((vnode) =>
      vnode.type === Symbol.for("v-fgt") ? (vnode.children as VNode[]) : [vnode]
    )
    .filter((vnode) => vnode.type !== Comment && vnode.type !== Text);

  let currentSpanSum = hasOrderNumberSlot.value ? orderNumberSpan.value : 0;

  return flattened.map((vnode) => {
    const span = (
      vnode.props?.span ? Number(vnode.props.span) : defaultItemSpan.value
    ) as number;
    currentSpanSum += span;
    return {
      vnode,
      span,
      visible: currentSpanSum <= props.rowNum * TOTAL_SPAN,
      colProps: { span }
    };
  });
});
const needsCollapse = computed(() => {
  const orderNumberSpanValue = hasOrderNumberSlot.value
    ? orderNumberSpan.value
    : 0;
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
</script>

<style scoped lang="scss">
.operation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.operation-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* 3. 展开收起按钮 - 极淡橘色背景 + 橘色图标 */
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
