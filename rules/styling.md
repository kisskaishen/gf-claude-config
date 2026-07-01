---
paths:
  - "src/**/*.vue"
  - "src/**/*.scss"
  - "src/**/*.css"
---

# 样式

默认方案：**Tailwind CSS 4**（CSS-first `@theme` 令牌）。以下原则适用于任何样式系统 — 如果项目使用 Sass/SCSS、CSS Modules 或 scoped `<style>`，应用等价机制。

## 原则（任何方案通用）

- **设计令牌，而非魔数** — 引用语义化/具名令牌（`surface`、`muted`、`brand`），绝不在标记中使用原始调色板或超出标准的数值。
- **颜色/间距/字体/圆角令牌有唯一来源** — 在一个地方修改，而非每个组件修改。
- 遵循间距/尺寸/圆角比例尺；无文档记录的情况下不使用一次性值（孤立的 `13px`）。不将原始十六进制颜色与令牌颜色混用，也不提交与已有令牌几乎重复的色值。
- **提取重复样式模式为组件** — 将共享样式机制保留给真正的基元；不要构建 `@apply`/`@mixin`/`composes` 杂乱堆。
- **移动优先**：无前缀的基础样式，在更大断点处递增叠加。
- 可复用组件响应其**容器**（`@container` 查询），而非视口；视口断点（`sm: md: lg:`）保留给页面级布局。
- 布局优先使用 `flex`/`grid`，而非绝对定位。
- 一种暗色模式策略（class 或 `prefers-color-scheme`），一致应用 — 绝不内联两套调色板。
- 对所有非平凡动画遵循 `prefers-reduced-motion`。
- 无内联 `style=""` 用于你的 class/样式表能表达的内容；保留给真正的动态计算值 — 且绝不将原始用户输入绑定到 `:style`（CSS 注入；见 `security.md`）。

## 你的样式方案

- **Tailwind 4（默认）** — 令牌在 CSS 入口文件的 `@theme { … }` 中；语义化工具类（`bg-surface`、`text-muted`）；响应式 `sm: md: lg:`；`motion-reduce:`；`@apply` 保留给共享基元。
- **Sass/SCSS** — 令牌为变量/map（`$color-surface`、`$space-*`）在 `variables.scss`/`_tokens.scss` 中，通过 `@use` 共享；复用通过 `@mixin`/`@include` 或 `%placeholder`/`@extend`；响应式通过 `@media (min-width …)`。
- **CSS Modules / scoped `<style>`** — 令牌为 `:root { --color-surface; --space-* }` 自定义属性，通过 `var(--token)` 使用；复用通过 `composes`（Modules）或共享组件；减弱动画通过 `@media (prefers-reduced-motion: reduce)`。
