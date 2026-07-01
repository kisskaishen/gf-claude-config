---
paths:
  - "src/**/*.vue"
---

# 架构

## 代码组织

- 选择一种布局并保持一致性：按**类型/层**（`components/`、`composables/`、`stores/`、`views/`、`services/`…）或较大应用按**功能模块**（`features/<功能>/{components,composables,stores,api,types}`）。
- 将共享/横切代码独立出来（顶层 `shared/`，或你布局中的共享层）。如果某样东西完全属于一个功能/模块，就放在那里。
- 不跨越同级边界 — 一个功能/模块不得引入另一个的内部；通过共享层共享。

## 组件职责

- 组件是展示型的：渲染状态并发出事件。按以下信号拆分，而非代码行数（~150 行是检查提示，不是规则）。
- 容器/页面组件负责编排；叶子组件保持简洁和可复用。
- 数据通过 props 向下流，事件通过 `emit` 向上流。不要修改 props。
- 模板中无业务逻辑。在 `computed`/composables 中计算，而非内联表达式。

## 分解与复用

看到**信号**时拆分，然后选择匹配的**模式** — 不只看代码行数。

**拆分信号**（满足任一即可）：

- 一个组件中超过约 3 个明显不同的职责（如：获取数据 + 表单 + 列表 + 弹窗）。
- 布尔爆炸：超过约 7 个 props，或像 `isEditMode`/`showFooter` 这样的 props 将模板分叉为不同模式。
- 模板嵌套 `v-if`/`v-for` 超过约 3 层，或 `<script>` 远超 `<template>`（逻辑需要 composable）。
- 一个区块（标记 + 其状态）在多个视图中重复，或被复制粘贴并微调。

**模式**（使用时机）：

- **提取叶子组件** — 一个自包含的模板块 + 其本地状态。当某个区域有独立的职责且可命名时使用（`UserAvatar`、`PriceTag`）。
- **提取 composable** — 逻辑（而非标记）是重量的来源。将有状态/可复用的行为移到 `useX`（见逻辑放置）。
- **插槽优先于 props** — 当调用方需要注入 _标记_ 而不仅是数据时。优先使用 `<slot>`（具名/作用域）而非 `content`/`render` 风格的 prop；切换模板块的布尔值通常是插槽（见 `code-style.md`）。
- **组合组件** — 一组共享隐式状态的组件（`Tabs`/`Tab`、`Accordion`/`Item`）。通过 `provide`/`inject` 共享状态，而非 prop 层层传递。
- **无头 vs 有样式** — 当相同行为需要不同外观时，将逻辑（composable 或无渲染单元）与展示分离。

**提升到 `shared/`** — 二次提取规则：第一次复用可以复制；第**二**个调用方出现时意味着提取。提升前，该单元必须是展示型的（无功能模块特定导入）、有稳定的 prop/emit/slot API、并取得自己的名称。一次性代码留在本地（见 `principles.md`）。

**遮罩层 UI 是共享基元** — 模态框/弹窗/抽屉/弹出菜单/菜单共享相同的难题：焦点被困、关闭后焦点恢复到触发器、Escape 关闭、滚动锁定以及 `aria` 配置（见 `accessibility.md`）。构建（或采用）**一个**基础遮罩层来统一处理这些问题，并通过插槽组合具体的遮罩层变体。功能模块重新实现焦点/Escape/滚动处理是一种缺陷，而非变体。

## 组件 API 设计

将公共接口 — props、events、slots — 视为任何 API：小巧、可预测、难以误用。（语法细节在 `code-style.md`；这里是结构设计。）

- **Props 输入，events 输出，slots 用于标记。** 数据通过 props 向下流；组件通过 `emit` 向上报告；调用方通过插槽注入内容，而非通过携带可渲染字符串/HTML 的 props。
- **最小化接口。** 更少、正交的 props 优于大量重叠的 props。避免**布尔陷阱** — 多个 `is*`/`show*` 标志使模板分支通常意味着需要 `variant`/`mode` 枚举、独立组件或插槽（拆分信号 — 见上文）。
- **真正的 v-model 状态用 `defineModel` 双向绑定**；否则单向 prop + 显式 event。不要修改 props。
- **面向消费者命名。** 过去式/祈使句事件名（`@saved`、`@close`），谓词式布尔值，不泄露内部状态名称。保持 API 稳定；变更意味着更新调用方（标记它们）。
- **类型化契约** — TS 中类型化 props/emits/slots，JS 中运行时校验器 — 使误用在调用点就大声失败。

## 逻辑放置

- 可复用有状态逻辑 → composables（`useX`），返回 refs/computed/handlers。接受响应式输入为 `MaybeRefOrGetter<T>`（TS），用 `toValue` 读取以便 refs _和_ getter 都能工作 — `useX(() => props.id)`；当调用方不应修改时返回 `readonly()` refs。
- 跨组件共享状态 → Pinia store。优先使用 setup 风格 store（`defineStore('x', () => {…})`）；通过 `storeToRefs(store)` 解构 store 状态以保持响应式（actions 直接解构）。仅组件使用的状态用 `ref`/`reactive` 本地保持。
- 数据获取绝不在组件中直接进行。通过 composable 或瘦的 `api/` 服务模块进行，返回有明确结构的结果（TS 中带类型，JS 中用 JSDoc/校验器）— 见 `data-fetching.md`。
- 副作用（订阅、定时器、监听器）在生命周期钩子中设置并始终清理 — 使用 `onScopeDispose` 以便在 composable 在组件外使用时清理也会触发。

## 路由

- 路由懒加载：`component: () => import('...')`。
- 路由级守卫为 UX 把关导航 — 它们**不是**安全边界。服务端授权每个请求；绝不依赖客户端守卫来保护数据或操作（见 `security.md`）。组件可以假设它们被合法地访问到。

## 应拒绝的反模式

- 一个全局 store 仅持有一个组件使用的状态。
- `fetch`/axios 调用散落在 `.vue` 文件中。
- Prop 层层传递超过 2 层 — 改用 provide/inject 或 store。
