# TimezoneSelect 组件

## 作用

TimezoneSelect 是一个时区选择组件，用于在应用中切换不同的时区。它使用 SelectDropdown 组件来展示时区选项，并通过 appStore 来管理时区状态。

## 功能

- 显示时区选择下拉菜单，包含国旗图标
- 支持搜索过滤时区选项
- 时区切换时自动更新应用时区设置
- 时区切换后自动刷新页面以应用新时区设置

## 使用示例

### 基本用法

```vue
<template>
  <TimezoneSelect />
</template>

<script setup lang="ts">
import TimezoneSelect from "./index.vue";
</script>
```

## 组件依赖

- `@/store/app` - 用于管理应用时区状态
- `@/components/SelectDropdown` - 用于显示下拉选择菜单
- `@/enums` - 提供时区枚举定义

## 注意事项

- 组件依赖 appStore 中的 timezone 状态和 setTimezone 方法
- 时区切换后会自动刷新页面以应用新时区设置
- 组件会为每个时区显示对应的国旗图标，图标文件需要放在 `../../assets/timezones/` 目录下
