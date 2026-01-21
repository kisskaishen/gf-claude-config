<template>
  <el-table v-bind="props" ref="elTableRef" class="pro-table-inner">
    <slot></slot>

    <el-table-column
      v-if="actions && actions.length > 0"
      label="操作"
      fixed="right"
      v-bind="actionColumnConfig"
    >
      <template #default="{ row }">
        <div class="action-btns">
          <template v-for="(btn, index) in actions" :key="index">
            <template v-if="!btn.hidden?.(row)">
              <el-tooltip v-if="btn.icon" :content="btn.title" placement="top">
                <el-button link type="primary" @click.stop="btn.handle(row)">
                  <el-icon><component :is="btn.icon" /></el-icon>
                </el-button>
              </el-tooltip>

              <el-button
                v-else
                link
                type="primary"
                @click.stop="btn.handle(row)"
              >
                {{ btn.title }}
              </el-button>
            </template>
          </template>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TableInstance } from "element-plus";
import type { ProTableProps } from "./types";

defineOptions({
  name: "ProTable",
  inheritAttrs: false
});

const props = defineProps<ProTableProps>();

const elTableRef = ref<TableInstance>();

// 暴露 el-table 的方法（如 clearSelection 等）
defineExpose({
  elTableRef
});
</script>

<style scoped>
.action-btns {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
