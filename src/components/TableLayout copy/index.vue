<template>
  <div class="table-layout">
    <div class="search-container">
      <el-form :model="searchFormModel" v-bind="mergeSearchFormConfig">
        <SearchContainer
          v-if="showSearch"
          v-bind="searchConfig"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #action-left>
            <slot name="action-left"></slot>
          </template>
          <template #order-number v-if="hasOrderNumberSlot">
            <slot name="order-number"></slot>
          </template>

          <slot name="search"></slot>
        </SearchContainer>
      </el-form>
    </div>
    <div
      class="table-toolbar"
      v-if="$slots['toolbar-left'] || $slots['toolbar-right']"
    >
      <div class="toolbar-left">
        <slot name="toolbar-left"></slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right"></slot>
      </div>
    </div>

    <div class="table-main">
      <el-table
        v-loading="loading"
        :data="data"
        height="100%"
        v-bind="mergeTableConfig"
        @cell-dblclick="handleCellDblClick"
        @selection-change="handleSelectionChange"
      >
        <slot name="columns"></slot>

        <template #empty>
          <el-empty
            :description="$t('gfuc.no_data_available' /** 暂无数据 **/)"
          />
        </template>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-bind="mergePaginationConfig"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, useSlots } from "vue";
import SearchContainer from "@/components/SearchContainer/index.vue";
import { useResetableRef } from "@/hooks/useResetableRef";
import type { TableLayoutProps } from "./types";
import { copyText } from "@/utils/index";
defineOptions({
  name: "TableLayout"
});

const slots = useSlots();

const hasOrderNumberSlot = computed(() => !!slots["order-number"]);

// 1. 使用 TS 定义 Props 及其默认值
const props = withDefaults(defineProps<TableLayoutProps>(), {
  data: () => [],
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  showSearch: true,
  searchFormModel: () => ({}),
  searchConfig: () => ({ cols: 3, rowNum: 1 }),
  tableConfig: () => ({}),
  paginationConfig: () => ({})
});

// 处理单元格双击事件
const handleCellDblClick = (row: any, column: any, cell: any, event: Event) => {
  const cellText = cell?.innerText || row[column.property] || "";

  if (cellText.trim()) {
    copyText(cellText).then((success) => {
      if (success) {
        // 可以添加复制成功的提示
        console.log("复制成功:", cellText);
      } else {
        console.error("复制失败");
      }
    });
  }
};

// 处理选择变化事件
const handleSelectionChange = (val: any) => {
  emit("selection-change", val);
};

// 2. 定义 Emits
const emit = defineEmits<{
  (e: "search"): void;
  (e: "reset"): void;
  (e: "update:currentPage", value: number): void;
  (e: "update:pageSize", value: number): void;
  (e: "update:searchFormModel", value: any): void;
  (e: "selection-change", value: any): void;
}>();

// 3. 初始化可重置的表单引用
const { state: initialForm, reset: resetForm } = useResetableRef(
  props.searchFormModel
);

// 3. 合并配置项 (计算属性自动推导类型)

const mergeSearchFormConfig = computed(() => ({
  labelPosition: "top" as const,
  ...props.searchFormConfig
}));
const mergeTableConfig = computed(() => ({
  border: false,
  stripe: false,
  size: "default" as const,
  ...props.tableConfig
}));

const mergePaginationConfig = computed(() => ({
  layout: "total, prev, pager, next, jumper, sizes",
  pageSizes: [10, 20, 50, 100],
  size: "default" as const,
  ...props.paginationConfig
}));

// 4. 事件处理
const handleSizeChange = (val: number) => {
  emit("update:pageSize", val);
  emit("search");
};

const handleCurrentChange = (val: number) => {
  emit("update:currentPage", val);
  emit("search");
};

const handleSearch = () => {
  emit("update:currentPage", 1);
  emit("search");
};

const handleReset = async () => {
  // 重置内部状态
  resetForm();
  await nextTick();

  // 将重置后的初始值同步给外部 (支持 v-model:searchFormModel)
  emit("update:searchFormModel", initialForm.value);
  emit("update:currentPage", 1);
  emit("reset");
  emit("search");
};
</script>

<style scoped>
.table-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-main {
  flex: 1;
  margin-top: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
