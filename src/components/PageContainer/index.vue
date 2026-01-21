<template>
  <div class="page-container" :class="{ 'is-fixed': fixedHeight }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "PageContainer"
});
defineProps({
  fixedHeight: {
    type: Boolean,
    default: true,
    description: "是否固定高度为父容器剩余高度"
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;

  &.is-fixed {
    display: flex;
    flex-direction: column;

    /* 
      计算公式：
      100vh (视口高度)
      - var(--header-height) (头部高度)
      - var(--tags-height) (标签栏高度)
      - 16px (layout-main 的 padding-top)
    */
    height: calc(100vh - var(--header-height) - var(--tags-height) - 16px);
    overflow: hidden;
  }
}
</style>
