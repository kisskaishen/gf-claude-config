---
title: Vue 3 组件开发约定
description: Vue 3 组件的文件结构、代码模板、Props/Emits、样式和命名规范
tags: [Vue, 组件, 编码规范, SFC]
type: standard
priority: high
scope: src/**/*.vue
---

# Vue 3 组件开发约定

## 文件结构

### 组件目录

每个可复用组件应放在 `src/components/<ComponentName>/` 目录下：

```
src/components/
├── PageContainer/
│   ├── index.vue        # 组件主文件
│   └── types.ts         # 类型定义（可选）
├── SearchContainer/
│   ├── index.vue
│   └── types.ts
└── ...
```

- 组件主文件始终命名为 `index.vue`
- 如有复杂类型定义，提取到 `types.ts`

### 页面组件

页面组件放在 `src/views/<feature>/` 下，直接以功能命名：

```
src/views/
├── order/
│   ├── list.vue
│   ├── detail.vue
│   └── single.vue
├── home/
│   └── index.vue
└── ...
```

## 代码模板

所有组件使用 `<script setup lang="ts">`（Composition API + TypeScript）：

```vue
<script setup lang="ts">
defineOptions({ name: "ComponentName" });

// Props
interface ComponentNameProps {
  title: string;
  count?: number;
}
const props = withDefaults(defineProps<ComponentNameProps>(), {
  count: 0
});

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string | number): void;
}>();

// Composition
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
</script>

<template>
  <div class="component-name">
    {{ t("gfuc.some_key" /** 中文注释 **/) }}
  </div>
</template>

<style lang="scss" scoped>
.component-name {
  // 样式
}
</style>
```

## Props 定义

**推荐** — TypeScript 泛型 + `withDefaults`：

```typescript
interface TableLayoutProps {
  data?: any[];
  loading?: boolean;
  total?: number;
  pageNum?: number;
  pageSize?: number;
}
const props = withDefaults(defineProps<TableLayoutProps>(), {
  data: () => [],
  loading: false,
  total: 0,
  pageNum: 1,
  pageSize: 20
});
```

**简单场景可选用** — Options API 风格：

```typescript
defineProps({
  fixedHeight: { type: Boolean, default: true }
});
```

## Emits 定义

**推荐** — TypeScript 调用签名风格（支持类型校验）：

```typescript
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "change", value: string | number): void;
}>();
```

**简单场景可选用** — 字符串数组风格：

```typescript
const emit = defineEmits(["search", "reset"]);
```

## 模板约定

1. 使用 Element Plus 组件时保持 `el-` 前缀
2. 自定义 SVG 图标使用 `<svg-icon name="icon-name" />`
3. i18n 文本在双花括号内添加注释说明默认文本：
   ```html
   {{ $t("gfuc.search" /** 搜索 **/) }}
   ```
4. 组件插槽命名使用 kebab-case

## 样式约定

1. 使用 `<style lang="scss" scoped>` 限定作用域
2. 组件根元素 class 名与组件名一致（kebab-case）
3. 如需覆盖 Element Plus 内部样式，使用 `:deep()`：
   ```scss
   :deep(.el-table__body) { ... }
   ```
4. 优先使用 CSS 变量：`var(--color-primary)`、`var(--bg-color)` 等
5. Tailwind CSS 用于布局和间距，SCSS 用于复杂样式

## 命名规则

| 类型                   | 规则                  | 示例                          |
| ---------------------- | --------------------- | ----------------------------- |
| 组件名 (defineOptions) | PascalCase            | `PageContainer`, `ProTable`   |
| 文件名                 | PascalCase (组件目录) | `SearchContainer/index.vue`   |
| 页面文件               | kebab-case            | `order-list.vue`              |
| 组件根 class           | kebab-case            | `.page-container`             |
| 插槽名                 | kebab-case            | `<slot name="action-left" />` |
