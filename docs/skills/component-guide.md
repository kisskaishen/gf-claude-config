---
title: 组件开发指南
description: 可复用组件和页面组件的分类、创建步骤、设计决策及常见组合模式
tags: [组件, Vue, 架构, 复用]
type: skill
priority: medium
scope: src/components/**/*.vue
---

# 组件开发指南

## 组件类型

项目中主要有两种组件：

### 1. 可复用组件（Shared Components）

放在 `src/components/<Name>/` 目录下，可被多个页面引用：

| 组件              | 用途                                              |
| ----------------- | ------------------------------------------------- |
| `PageContainer`   | 页面级容器（flex column、固定高度、loading 状态） |
| `SearchContainer` | 搜索表单布局容器（auto-layout、折叠、节流）       |
| `TableLayout`     | 完整表格布局（搜索 + 工具栏 + 表格 + 分页）       |
| `ProTable`        | 增强表格                                          |
| `ProTableColumn`  | 增强表格列（空值显示 "-"）                        |
| `CommonUpload`    | 文件上传                                          |
| `FeedbackDialog`  | 反馈弹框                                          |
| `SuccessDialog`   | 成功确认弹框                                      |
| `SelectDropdown`  | 可搜索下拉框                                      |
| `SiteSelect`      | 站点（国家）选择器                                |
| `TimezoneSelect`  | 时区选择器                                        |
| `SvgIcon`         | SVG 图标包装器                                    |
| `LangSelect`      | 语言选择器                                        |

### 2. 页面级组件（View Components）

放在 `src/views/<feature>/` 下，作为路由对应的页面：

| 路径             | 说明               |
| ---------------- | ------------------ |
| `views/login/`   | 登录/注册/验证     |
| `views/home/`    | 首页/仪表盘        |
| `views/order/`   | 下单/订单列表/详情 |
| `views/finance/` | 充值/余额/账单     |
| `views/setting/` | 设置               |
| `views/task/`    | 任务列表           |
| `views/help/`    | 帮助中心           |

## 创建新组件

### 可复用组件的创建步骤

1. 在 `src/components/<Name>/` 下创建目录，入口文件为 `index.vue`
2. 使用 `defineOptions({ name: "ComponentName" })` 命名
3. 定义完整的 Props 和 Emits 类型
4. 使用 `<style lang="scss" scoped>` 限定样式
5. 利用 Element Plus 组件组合（非必要不封装基础组件）

### 页面组件的创建步骤

1. 在 `src/views/<feature>/` 下创建 `.vue` 文件
2. 使用 `defineOptions({ name: "RouteName" })` 命名
3. 由布局组件 `PageContainer` / `TableLayout` 包裹内容
4. 在 `src/router/routes.ts` 中注册路由（懒加载）

## 组件设计决策

### 何时创建新组件 vs 直接在页面中写

**创建新组件**：

- 组件在 2 个以上页面中使用
- 组件逻辑复杂，拆开可读性更好
- 组件需要独立测试

**写在页面中**：

- 只在当前页面使用一次的代码
- 页面特有的布局和样式

### 何时使用 El- 组件 vs 自定义组件

| 场景                     | 推荐方案                            |
| ------------------------ | ----------------------------------- |
| 基础表单元素             | 直接使用 `el-input`, `el-select` 等 |
| 简单表格                 | 直接使用 `el-table`                 |
| 带搜索/分页/工具栏的表格 | 使用 `TableLayout` 封装             |
| 搜索区域                 | 使用 `SearchContainer` 封装         |
| 带 loading 的页面容器    | 使用 `PageContainer` 封装           |

### 插槽设计

- 组件应暴露足够的插槽用于自定义
- 插槽命名使用 kebab-case
- 常用插槽命名模式：`default`、`header`、`footer`、`action-left`、`action-right`、`prefix`、`suffix`

### 响应式数据

```typescript
// ✅ 推荐 — 使用 ref 定义响应式状态
const searchForm = ref({ keyword: "", status: "" });

// ✅ 推荐 — 使用 computed 派生状态
const hasSelection = computed(() => selectedIds.value.length > 0);

// ⚠️ 避免 — 在 template 中直接执行复杂计算
```

## 常见组合模式

### 页面 = PageContainer + TableLayout

```vue
<template>
  <PageContainer>
    <TableLayout
      :data="tableData"
      :loading="loading"
      :total="total"
      @search="handleSearch"
    >
      <template #search>
        <!-- 搜索表单 -->
      </template>
      <template #table>
        <el-table-column prop="name" label="名称" />
      </template>
    </TableLayout>
  </PageContainer>
</template>
```

### 搜索 = SearchContainer 自动布局

`SearchContainer` 自动处理搜索表单的布局（多列、折叠、搜索节流），无需手动管理栅格系统。
