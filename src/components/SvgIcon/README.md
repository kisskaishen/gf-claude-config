# SvgIcon 组件

## 作用

SvgIcon 是一个用于显示 SVG 图标的组件，通过引用 SVG 符号来显示图标。它支持自定义图标大小、颜色等属性。

## 功能

- 支持通过名称引用 SVG 图标
- 支持自定义图标颜色
- 支持自定义图标大小
- 支持分别设置图标宽度和高度

## 组件属性

| 属性名 | 类型   | 默认值         | 描述                        |
| ------ | ------ | -------------- | --------------------------- |
| name   | string | -              | 图标名称（必需）            |
| prefix | string | "icon"         | 图标前缀                    |
| color  | string | "currentColor" | 图标颜色                    |
| size   | string | "1em"          | 图标大小                    |
| width  | string | undefined      | 图标宽度（优先级高于 size） |
| height | string | undefined      | 图标高度（优先级高于 size） |

## 使用示例

### 基本用法

```vue
<template>
  <SvgIcon name="home" />
</template>

<script setup lang="ts">
import SvgIcon from "./index.vue";
</script>
```

### 自定义颜色和大小

```vue
<template>
  <SvgIcon name="user" color="#409EFF" size="24px" />
</template>

<script setup lang="ts">
import SvgIcon from "./index.vue";
</script>
```

### 分别设置宽度和高度

```vue
<template>
  <SvgIcon name="arrow" width="30px" height="20px" />
</template>

<script setup lang="ts">
import SvgIcon from "./index.vue";
</script>
```

## 注意事项

- 组件依赖 SVG 符号的定义，需要确保 SVG 图标已正确注册
- 图标名称会与前缀组合形成符号 ID，例如：name="home" 会生成 "#icon-home"
- 建议使用 currentColor 作为颜色，以便图标颜色随文字颜色变化
