# SiteSelect 组件

## 作用

SiteSelect 是一个站点选择组件，用于在应用中切换不同的站点（如法国站、意大利站、荷兰站）。它使用 SelectDropdown 组件来展示站点选项，并通过 appStore 来管理站点状态。

## 功能

- 显示站点选择下拉菜单
- 支持切换不同的站点（法国站、意大利站、荷兰站）
- 站点切换时自动更新应用站点设置
- 站点切换后自动刷新页面以应用新站点设置

## 使用示例

### 基本用法

```vue
<template>
  <SiteSelect />
</template>

<script setup lang="ts">
import SiteSelect from "./index.vue";
</script>
```

## 组件依赖

- `@/store/app` - 用于管理应用站点状态
- `@/components/SelectDropdown` - 用于显示下拉选择菜单
- `@/enums` - 提供站点枚举定义
- `vue-i18n` - 用于文本翻译

## 支持的站点

| 站点代码 | 站点名称 |
| -------- | -------- |
| fr       | 法国站   |
| it       | 意大利站 |
| nl       | 荷兰站   |

## 注意事项

- 组件依赖 appStore 中的 site 状态和 setSite 方法
- 站点切换后会自动刷新页面以应用新站点设置
