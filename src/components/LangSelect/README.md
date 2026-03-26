# LangSelect 组件

## 作用

LangSelect 是一个语言选择组件，用于在应用中切换不同的语言。它使用 SelectDropdown 组件来展示语言选项，并通过 appStore 来管理语言状态。

## 功能

- 显示语言选择下拉菜单
- 支持多种语言切换（简体中文、English、Français、Italiano、Nederlands）
- 语言切换时自动更新应用语言设置
- 在非登录页面时，语言切换后自动刷新页面

## 使用示例

### 基本用法

```vue
<template>
  <LangSelect />
</template>

<script setup lang="ts">
import LangSelect from "./index.vue";
</script>
```

## 组件依赖

- `@/store/app` - 用于管理应用语言状态
- `@/components/SelectDropdown` - 用于显示下拉选择菜单
- `@/enums` - 提供语言枚举定义

## 支持的语言

| 语言代码 | 语言名称   |
| -------- | ---------- |
| zh       | 简体中文   |
| en       | English    |
| fr       | Français   |
| it       | Italiano   |
| nl       | Nederlands |

## 注意事项

- 组件依赖 appStore 中的 lang 状态和 setLang 方法
- 语言切换后，在非登录页面会自动刷新页面以应用新语言
- 登录页面不会自动刷新，以保持用户输入状态
