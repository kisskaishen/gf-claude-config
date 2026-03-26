# PageContainer 组件

## 作用

PageContainer 是一个页面容器组件，用于包裹页面内容，提供统一的布局和样式。它具有以下特点：

- 提供固定高度的布局选项，确保内容区域在视口中正确显示
- 支持加载状态的显示
- 提供统一的内边距和背景样式
- 响应式设计，适应不同屏幕尺寸

## 组件属性

| 属性名      | 类型    | 默认值 | 描述                         |
| ----------- | ------- | ------ | ---------------------------- |
| fixedHeight | Boolean | true   | 是否固定高度为父容器剩余高度 |
| loading     | Boolean | false  | 是否显示加载状态             |

## 使用示例

### 基本用法

```vue
<template>
  <PageContainer>
    <div>页面内容</div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from "./index.vue";
</script>
```

### 带加载状态

```vue
<template>
  <PageContainer :loading="isLoading">
    <div>页面内容</div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PageContainer from "./index.vue";

const isLoading = ref(true);

// 模拟加载完成
setTimeout(() => {
  isLoading.value = false;
}, 2000);
</script>
```

### 不固定高度

```vue
<template>
  <PageContainer :fixedHeight="false">
    <div>页面内容</div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from "./index.vue";
</script>
```

## 样式说明

- 默认情况下，组件会设置最小高度为 `calc(100vh - var(--header-height) - var(--tags-height) - 16px)`
- 当 `fixedHeight` 为 true 时，会设置固定高度为相同的计算值，并隐藏溢出内容
- 组件使用白色背景，圆角边框，以及 24px 的内边距
- 组件使用 flex 布局，当 `fixedHeight` 为 true 时，子元素会垂直排列

## 注意事项

- 组件依赖 `--header-height` 和 `--tags-height` CSS 变量来计算高度，请确保这些变量在使用组件的环境中已经定义
- 当 `fixedHeight` 为 true 时，组件会设置 `overflow: hidden`，如果内容超出容器高度，可能会被截断
