# AuthView 组件

## 作用

AuthView 是一个用于处理用户授权的组件，当用户账号未绑定客户信息且无权限时显示。它包含一个授权提示页面和授权表单模态框，引导用户进行账号授权绑定。

## 组件结构

- `AuthView.vue` - 主组件，显示授权提示页面
- `AuthModal.vue` - 授权表单模态框，收集用户信息

## 使用示例

### 基本用法

```vue
<template>
  <AuthView />
</template>

<script setup lang="ts">
import AuthView from "./index.vue";
</script>
```

## AuthView 组件说明

### 功能

- 显示无权限提示信息
- 提供"去授权"按钮，点击后打开授权模态框
- 授权成功后自动刷新用户信息

### 样式

- 居中显示授权提示内容
- 包含锁图标、提示文字和操作按钮
- 使用响应式布局，适应不同屏幕尺寸

## AuthModal 组件说明

### 功能

- 显示授权表单，收集用户信息
- 包含姓名、国家、邮箱、电话、发货频率、货量预估和备注等字段
- 表单验证，确保必填字段已填写
- 提交授权信息到后端
- 授权成功后关闭模态框并触发成功事件

### 属性

| 属性名     | 类型    | 默认值 | 描述                  |
| ---------- | ------- | ------ | --------------------- |
| modelValue | Boolean | false  | 控制模态框的显示/隐藏 |

### 事件

| 事件名            | 描述                     |
| ----------------- | ------------------------ |
| update:modelValue | 模态框显示状态变化时触发 |
| success           | 授权成功时触发           |

### 表单字段

| 字段名            | 类型   | 必填 | 描述                   |
| ----------------- | ------ | ---- | ---------------------- |
| name              | String | 是   | 姓名                   |
| country           | Array  | 是   | 国家（多选）           |
| email             | String | 是   | 邮箱（需符合邮箱格式） |
| phone             | String | 否   | 电话                   |
| shippingFrequency | String | 是   | 发货频率               |
| shippingVolume    | String | 是   | 货量预估               |
| remark            | String | 否   | 备注（最多300字）      |

## 注意事项

- 组件依赖 `@/store/user` 中的 `fetchUserInfo` 方法来刷新用户信息
- 组件依赖 `@/api/user` 中的 `postOpenService` 方法来提交授权信息
- 组件使用了 `@/hooks/useDict` 来获取字典数据
- 组件支持国际化，使用 `vue-i18n` 进行文本翻译
