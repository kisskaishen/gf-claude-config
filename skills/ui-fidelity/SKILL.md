---
name: ui-fidelity
description: 从 Figma 设计稿到高保真 Vue 3 页面的完整工作流 — 提取设计规范、像素级精确实现、截图自测比对、差异率 ≤1%。用于 UI 设计还原任务。
---

# UI 高保真还原 — Figma 到 Vue 3 页面

从 UI 设计稿生成高保真 Vue 3 页面，含自动自测验证。详细参考 `docs/skills/ui-fidelity-implementation.md`。

## ① 分析设计

从 Figma 设计稿提取：

- **布局**：页面尺寸（基准 1440px）、Header/Sidebar/Main 分布、间距、z-index
- **视觉**：色彩（主色/辅色/文字色/背景色/边框色）、排版（字号/字重/行高）、圆角、阴影
- **组件映射**：设计元素 → 项目组件

| 设计元素 | 组件映射 |
|---------|---------|
| 搜索区域 | `<SearchContainer>` |
| 表格 | `<TableLayout>` / `<ProTable>` |
| 页面容器 | `<PageContainer>` |
| 表单输入 | `<el-input>` / `<el-select>` |
| 弹框 | `<el-dialog>` |
| 反馈 | `<FeedbackDialog>` |

## ② 生成 Vue 3 代码

**核心原则：**

- 像素级精确：所有尺寸、间距、颜色严格匹配设计稿
- 使用 CSS 变量：优先使用项目 `var(--color-primary)` 等 Token
- 组件复用：优先使用已有共享组件
- 添加 Figma 测量值注释：`padding: 24px; /* Figma: padding 24px */`

**屏幕适配（设计稿基准 1440px）：**

```scss
// ✅ 正确
.page { min-width: 1440px; }
.content { max-width: 1440px; margin: 0 auto; }

// ❌ 错误 — 大屏时左侧空一大片
.page { width: 1440px; margin: 0 auto; }
```

| 页面类型 | 适配方案 |
|---------|---------|
| 表单/详情页 | `max-width: 1440px; margin: 0 auto;` |
| 表格/列表页 | 弹性宽度 + 百分比 padding |
| 仪表盘/卡片页 | flex-wrap + minmax |

## ③ 自测 — 像素级比对

```bash
# 完整流水线（启动 dev → 截图 → 比对 → 报告）
pnpm run verify:fidelity -- --ref=design-screenshot.png

# 只截图
pnpm run verify:fidelity -- --capture-only --url=http://localhost:5173/page-path

# 只比对
pnpm run verify:fidelity -- --diff-only --capture=actual.png --ref=design.png
```

验证 3 个断点：1440px（基准）、1920px（大屏）、1440px（极限无横向滚动）。

## ④ 修正迭代

根据差异日志逐项修复：

| 差异类型 | 处理方式 |
|---------|---------|
| 颜色偏差 | 使用 Figma 精确色值 |
| 间距偏移 | 调整 margin/padding 到精确值 |
| 字号不同 | 匹配设计稿 font-size |
| 组件缺失 | 补全遗漏的 UI 元素 |
| 布局错位 | 检查 flex/grid 布局属性 |

修复后重新自测，直到 **差异率 ≤ 1%**。

## ⑤ 确认达标

差异率 ≤ 1% 且无肉眼可见的结构性差异 → 还原完成 ✅

> 首次使用需安装 Playwright：`pnpm add -D playwright @playwright/test pixelmatch && npx playwright install chromium`
