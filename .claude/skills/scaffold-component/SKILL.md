---
name: scaffold-component
description: 按照项目规范创建新的 Vue 3 组件 — props/emits 契约（TS 项目中带类型）、正确的位置、使用 Token 的样式、无障碍基线以及单元测试。用于添加新组件或 UI 元素时。
---

# 脚手架生成组件

1. **确定位置。** 放在你的项目布局指定的位置 — `src/components/`（按层布局）、功能模块的 `components/`（按功能布局）、或被广泛复用的共享 `components/`。先搜索确认没有类似组件（复用优于重建）。
2. **创建 `<Name>.vue`**，使用 `<script setup>`（TS 项目加上 `lang="ts"`）：
   - TS：定义 `Props` 类型和 `defineProps<Props>()`（Vue 3.5+ 用响应式 props 解构设置默认值，≤3.4 用 `withDefaults`）；用 `defineEmits<{ ... }>()` 类型化 emits。JS：使用运行时校验器 — `defineProps({ ... })` 带 `type`/`required`/`default`/`validator` — 以及 `defineEmits([...])`。
   - 保持展示型：状态通过 props 传入，事件通过 emits 传出。此处不做数据获取。
3. **模板** — 语义化原生元素；任何控件都有标签；键盘可操作；焦点可见。用项目设计 Token 编写样式 — 无魔数（默认用 Tailwind 工具类；否则用 Sass 变量或 `var(--token)` 自定义属性）。
4. **逻辑** — 如果有非平凡逻辑，提取到 `useX` composable 而非内联在组件中。
5. **测试** — 添加 `<Name>.test.ts`（JS 项目为 `.test.js`）：用 props 渲染，断言可见输出和已触发事件，覆盖一个边界/错误状态。通过 role/label/text 查询。
6. **验证** — `<pm> run lint && <pm> run test`（TS 项目加上 `<pm> run typecheck`）。如果交互性较强，快速运行 axe 检查。
7. **导出** — 如果是共享组件，按项目约定从 barrel/index 导出。

保持专注：根据分解**信号**来拆分 — ≥3 个职责、prop/布尔爆炸、深层模板嵌套、逻辑远超模板、或存在重复块 — 而非仅凭代码行数（参考 `architecture.md` → 分解与复用）。
