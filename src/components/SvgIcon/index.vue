<template>
  <svg
    aria-hidden="true"
    class="svg-icon"
    :style="{ width: width ?? size, height: height ?? size }"
  >
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
defineOptions({
  name: "SvgIcon"
});

const props = defineProps({
  prefix: {
    type: String,
    default: "icon"
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "currentColor"
  },
  size: {
    type: String,
    default: "1em"
  },
  width: {
    type: String,
    default: undefined
  },
  height: {
    type: String,
    default: undefined
  }
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  overflow: hidden;
  vertical-align: -0.15em; /* 因icon大小被设置为1em，因次通过该样式微调对齐 */
  outline: none;
  fill: currentcolor; /* 建议使用 currentColor 以便随文字颜色变化 */
}
</style>
