---
title: UI 高保真还原 — 从 Figma 设计到 Vue 3 页面
description: 根据 Figma / UI 设计链接生成高保真 Vue 3 页面的完整工作流，包含自测比对和差异日志
tags: [UI, Figma, 高保真, 自测, 设计还原]
type: skill
priority: high
scope: UI 设计还原任务
---

# UI 高保真还原 — 从 Figma 设计到 Vue 3 页面

> 本技能定义了一套**从 UI 设计（Figma 链接 / 设计图）到高保真 Vue 3 页面**的完整工作流，并包含**自动自测**机制来验证还原精度。

---

## 工作流总览

```
Figma URL / 设计图
       │
       ▼
 ① 分析设计 → 提取设计规范
       │
       ▼
 ② 生成 Vue 3 代码
       │
       ▼
 ③ 启动自测 → 截图 + 比对
       │
       ▼
 ④ 查看差异报告 → 修正
       │
       ▼
 ⑤ 确认达标 ✅
```

---

## ① 分析设计

拿到 Figma URL 或设计图后，提取以下设计规范：

### 布局分析

| 维度     | 要提取的内容                            |
| -------- | --------------------------------------- |
| 页面尺寸 | 宽度（如 1440px / 375px）、断点         |
| 布局结构 | Header / Sidebar / Main / Footer 的分布 |
| 间距     | 内边距、外边距、栅格系统                |
| 层级     | z-index 堆叠顺序                        |

### 视觉规范

| 维度 | 要提取的内容                                                   |
| ---- | -------------------------------------------------------------- |
| 色彩 | 主色、辅色、文字色（`#333` / `#666` / `#999`）、背景色、边框色 |
| 排版 | 字体大小层级、字重、行高、字间距                               |
| 圆角 | 按钮、卡片、输入框的 border-radius                             |
| 阴影 | box-shadow 的色值和偏移                                        |
| 图标 | 使用的 SVG 图标名称和尺寸                                      |

### 组件映射

识别设计中的 UI 元素，映射到项目现有的组件或 Element Plus 组件：

| 设计元素 | 项目组件映射                       | 说明                  |
| -------- | ---------------------------------- | --------------------- |
| 搜索区域 | `<SearchContainer>`                | 自动布局搜索表单      |
| 表格     | `<TableLayout>` / `<ProTable>`     | 带分页和工具栏        |
| 页面容器 | `<PageContainer>`                  | loading 状态          |
| 表单输入 | `<el-input>` / `<el-select>`       | Element Plus 基础组件 |
| 按钮     | `<el-button>`                      | type / size / icon    |
| 弹框     | `<el-dialog>`                      | 模态对话框            |
| 下拉选择 | `<SelectDropdown>` / `<el-select>` | 可搜索                |
| 反馈     | `<FeedbackDialog>`                 | 反馈弹框              |

## ② 生成 Vue 3 代码

### 代码生成规范

1. **像素级精确**：所有尺寸、间距、颜色必须严格匹配设计稿
2. **使用 CSS 变量**：优先使用项目已有的 `var(--color-primary)` 等 CSS 变量
3. **组件复用**：优先使用项目中已有的共享组件

### 屏幕适配策略

> 设计稿基于 **1440px** 宽度设计。适配策略如下：

#### 核心原则

| 原则     | 说明                                                            |
| -------- | --------------------------------------------------------------- |
| 最小宽度 | **`min-width: 1440px`** — 页面在 1440px 以下不发生任何变形/换行 |
| 适配方向 | 只考虑 **≥1440px** 的屏幕，移动端不需要适配                     |
| 大屏策略 | 1440px 以上的屏幕，内容区域居中 + 按比例弹性扩展                |

#### 布局模板

```scss
.page-name {
  min-width: 1440px; /* 保证设计稿最小宽度不崩 */
  max-width: 100%; /* 允许大屏横向撑满 */

  .page-content {
    // 方案 A：内容区居中（推荐 — 设计稿内容区有明确边界时）
    max-width: 1440px;
    margin: 0 auto;

    // 方案 B：内容区弹性填满（推荐 — 表格/列表类页面）
    // 宽度继承父容器，内边距使用百分比
    padding: 0 3%;
  }
}
```

#### 适配方案选择

| 设计稿类型                        | 推荐方案                                     | 大屏效果              |
| --------------------------------- | -------------------------------------------- | --------------------- |
| **表单/详情页**（内容区固定宽度） | 方案 A：`max-width: 1440px; margin: 0 auto;` | 内容居中，两侧留白    |
| **表格/列表页**（数据横向展开）   | 方案 B：弹性宽度 + 百分比 padding            | 数据列充分利用空间    |
| **仪表盘/卡片页**（多列布局）     | 混合：flex-wrap + `minmax`                   | 卡片自动换行/均匀分布 |

#### 具体实现指南

**页面容器居中（方案 A）**

```scss
.page-wrapper {
  min-width: 1440px;

  .content-area {
    width: 100%;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

**表格弹性扩展（方案 B）**

```scss
.table-page {
  min-width: 1440px;
  padding: 24px 32px; /* 固定内边距保证最小宽度整洁 */

  // 大屏时表格列百分比化
  :deep(.el-table-column) {
    // 宽表格列用百分比代替 px
    .cell {
      width: auto;
    }
  }
}
```

**卡片多列自适应**

```scss
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  .card-item {
    /* 按设计稿固定宽度，大屏时弹性扩容 */
    width: calc((100% - 48px) / 3); /* 3列布局 */
    min-width: 320px; /* 卡片不会缩太小 */
  }
}
```

**表格列宽自适应**

```scss
// 操作列保持固定宽度，内容列弹性分布
:deep(.el-table__body) {
  .col-operations {
    width: 120px;
  } /* 操作按钮列固定 */
  .col-name {
    width: auto;
  } /* 名称列填满剩余空间 */
  .col-status {
    width: 100px;
  } /* 状态列固定 */
}
```

#### 自测适配

自测时同时验证 3 个断点：

```bash
# 验证 1440px 基准（使用设计稿参考图比对）
pnpm run verify:fidelity -- --ref=refs/page.png --route=/page

# 验证 1920px 大屏（仅截图，目测检查布局完整）
pnpm run verify:fidelity:capture -- --url=http://localhost:5173/page --viewport=1920x1080

# 验证 1440px 极限（仅截图，目测检查无横向滚动）
pnpm run verify:fidelity:capture -- --url=http://localhost:5173/page --viewport=1440x900
```

#### 常见错误

```scss
// ❌ 错误：写死 1440px，大屏时左侧空一大片
.wrapper {
  width: 1440px;
  margin: 0 auto;
}

// ✅ 正确：body 填满，内容区约束最大宽度
.wrapper {
  min-width: 1440px;
}
.content {
  max-width: 1440px;
  margin: 0 auto;
}
```

```scss
// ❌ 错误：用 rem 或 vw 会导致 1440px 时尺寸偏小
.card {
  width: 30vw;
} /* 1440px 下 = 432px，不等于设计稿的 460px */

// ✅ 正确：基准大小用 px，大屏弹性用 %
.card {
  width: 460px;
} /* 1440px 基准下精确匹配 */
@media (min-width: 1600px) {
  .card {
    width: 30%;
  } /* 大屏下再弹性调整 */
}
```

### 文件结构

```vue
<script setup lang="ts">
defineOptions({ name: "PageName" })

// Props / Emits
interface PageNameProps { ... }
const props = withDefaults(defineProps<PageNameProps>(), { ... })

// State
const searchForm = ref({ ... })
const tableData = ref([...])

// Methods
function handleSearch() { ... }
function handleReset() { ... }
</script>

<template>
  <PageContainer>
    <SearchContainer>
      <!-- 严格匹配设计稿的搜索条件 -->
    </SearchContainer>
    <TableLayout :data="tableData">
      <!-- 严格匹配设计稿的表格列 -->
    </TableLayout>
  </PageContainer>
</template>

<style lang="scss" scoped>
/* 所有尺寸必须与设计稿完全一致 */
.page-name {
  /* spacing, color, font-size 均使用设计稿的值 */
}
</style>
```

### 设计值注释

对于关键的设计值，在代码中添加注释标注 Figma 上的测量值，方便后续核对：

```scss
.card {
  padding: 24px; /* Figma: padding 24px */
  border-radius: 8px; /* Figma: radius 8px */
  font-size: 14px; /* Figma: text size 14px */
  color: #333333; /* Figma: text color #333 */
}
```

## ③ 自测 — 高保真对比

### 前置条件

```bash
# 安装 Playwright（首次）
pnpm add -D playwright @playwright/test pixelmatch
npx playwright install chromium
```

### 执行自测

```bash
# 方式一：完整流水线（启动 dev → 截图 → 比对 → 输出报告）
pnpm run verify:fidelity -- --ref=design-screenshot.png

# 方式二：只截图（已有 ref 图片时）
pnpm run verify:fidelity -- --capture-only --url=http://localhost:5173/page-path

# 方式三：只比对（已有截图和 ref）
pnpm run verify:fidelity -- --diff-only --capture=actual.png --ref=design.png
```

### 自测流程

```
┌─────────────────────────────────────────┐
│  ① 启动 Vite dev server                 │
├─────────────────────────────────────────┤
│  ② Playwright 打开目标页面               │
├─────────────────────────────────────────┤
│  ③ 截取页面截图 → actual.png            │
├─────────────────────────────────────────┤
│  ④ 与参考图 design.png 像素级对比        │
├─────────────────────────────────────────┤
│  ⑤ 生成差异图 → diff.png                │
├─────────────────────────────────────────┤
│  ⑥ 输出差异日志                         │
└─────────────────────────────────────────┘
```

### 差异日志解读

```
═══ UI Fidelity Report ═══
Reference: design-screenshot.png
Actual:    actual-2026-06-16T10-30-00.png
Diff:      diff-2026-06-16T10-30-00.png

┌──────────────────────┬──────────┐
│ Metric               │ Value    │
├──────────────────────┼──────────┤
│ Image Size           │ 1440x900 │
│ Total Pixels         │ 1,296,000│
│ Different Pixels     │ 12,345   │
│ Difference %         │ 0.95%    │
│ Threshold            │ 0.1      │
│ Status               │ ⚠️ 有差异│
└──────────────────────┴──────────┘

Top 5 difference regions:
  1. x:120 y:45  w:200 h:40  — 按钮区域（颜色: #1890ff vs #1677ff）
  2. x:300 y:200 w:150 h:30 — 标题文字（字号: 16px vs 18px）
  3. x:50  y:400 w:800 h:1  — 分割线位置偏移 2px
  ...

Check diff.png for visual comparison.
───────────────────────────
```

## ④ 修正迭代

根据差异日志逐项修复：

| 差异类型 | 处理方式                              |
| -------- | ------------------------------------- |
| 颜色偏差 | 使用设计稿的精确色值（从 Figma 取色） |
| 间距偏移 | 调整 margin / padding 到精确值        |
| 字号不同 | 匹配设计稿的 font-size                |
| 组件缺失 | 补全遗漏的 UI 元素                    |
| 布局错位 | 检查 flex / grid 布局属性             |

修复后重新运行自测，直到差异率低于阈值（默认 **1%**）。

## ⑤ 确认达标

当差异率 ≤ 1% 且无肉眼可见的结构性差异时，确认还原完成。

---

## 快速开始

```bash
# 1. 准备参考图（从 Figma 导出或截图）
#    保存为 scripts/fidelity/refs/<page-name>.png

# 2. 生成页面代码
#    根据 Figma 设计实现 Vue 3 组件

# 3. 运行自测
pnpm run verify:fidelity -- --ref=scripts/fidelity/refs/<page-name>.png --route=/your-page-path

# 4. 查看报告
open scripts/fidelity/reports/diff-*.png

# 5. 修复差异后重测，直到通过
```

## 故障排除

| 问题                 | 解决方案                                                   |
| -------------------- | ---------------------------------------------------------- |
| Playwright 无法启动  | 确保已安装浏览器：`npx playwright install chromium`        |
| 截图与设计稿尺寸不同 | 检查页面是否设置了固定宽度，或用 `--viewport` 参数指定     |
| 颜色差异很大         | 可能是 CSS 变量被全局样式覆盖，检查样式优先级              |
| 字体渲染不同         | Figma 和浏览器字体渲染有差异，关注布局和颜色而非字体微渲染 |
