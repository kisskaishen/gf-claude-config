---
name: code-review
description: 在合并前审查 Vue 变更的架构适配性、prop/emit/slot 设计、状态放置、样式/Token 使用、类型和可读性。与 ui-reviewer agent 对应的内联版本。
---

# 代码审查

对照 `.claude/rules/` 审查变更。报告发现的问题；仅在要求时修复。如需门禁式流水线运行，委托给 `ui-reviewer` agent（隔离、只读）。

## 检查项

- **架构** — 放置正确；展示型 vs 容器型分离；无跨功能模块的内部引用。标记**拆分信号**（≥3 个职责、prop/布尔爆炸、深层嵌套、重复块）并指出适合的分解方式（参考 `architecture.md`）。
- **组件 API** — 最小的正交 props；无布尔陷阱；双向绑定用 `defineModel`；插槽用于标记内容；面向消费者的命名风格；不修改 prop（参考 `architecture.md` → 组件 API 设计）。
- **状态** — 本地状态和 Pinia 选择正确；无全局状态存放组件私有数据；服务端数据视为缓存，不作为权威数据源（参考 `data-fetching.md`）。
- **数据与错误** — 组件内不直接获取数据；响应已验证；渲染加载/错误/空数据状态；不吞没错误（参考 `data-fetching.md`、`error-handling.md`）。
- **样式** — 使用 Token 而非魔数；共享样式机制仅保留给真正的基元；响应式 + 暗色模式一致（参考 `styling.md`）。
- **类型（TS）** — 无 `any`，精确且派生；JS：运行时校验器就位。
- **复用** — 不重新发明 `shared/` 中已存在的东西；遮罩层行为基于共享基元组合，而非重新实现；按"二次提取规则"提升到共享层。
- **可读性** — 命名、死代码、无 `console.log`、无不必要的复杂性。
- **安全** — 明显的风险点（`v-html`、`:is`、`$attrs` 展开、未校验的 `:href`/`:src`、原始 `:style`）；深度审查交给 `/security-audit`（参考 `security.md`）。

## 输出

按严重程度分组（Critical / Important / Nice-to-have），每条附带 `file:line` 和具体修复方案。最高优先级排在最前。如果没有问题，直接说明。
