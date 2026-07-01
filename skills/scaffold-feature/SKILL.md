---
name: scaffold-feature
description: 使用项目的文件夹结构搭建新功能模块（components、composables、store、api、types、route）。用于开始一个新功能领域，而非单个组件。
---

# 脚手架生成功能模块

> **按功能布局**：这会创建 `src/features/<功能名>/`。**按层布局**：没有功能文件夹 — 将各部分添加到各自现有的类型文件夹下（`components/`、`composables/`、`stores/`、`services|api/`、`types/`），并将以下步骤视为需要添加的清单。

1. **创建功能模块基目录** — 按功能布局：`src/features/<功能名>/`，内含 `components/`、`composables/`、`stores/`（仅在需要共享状态时）、`api/`、`types/`。按层布局：在现有类型文件夹下添加相应文件。
2. **首先建模领域** — TS 项目在 `types/` 中定义类型，一切都从中派生（不重复声明）。JS 项目用 JSDoc `@typedef` 捕获关键结构并在数据层校验。
3. **数据层** — `api/` 暴露该功能请求的瘦函数（TS 带类型，JS 用 JSDoc 文档化）。组件绝不直接调用网络。
4. **状态** — 仅在跨功能组件共享状态时才添加 Pinia store；否则状态保持在本地。Store actions 调用 `api/`。
5. **Composables** — 将可复用逻辑（`useX`）放在 `composables/`，返回 refs/computed/handlers。
6. **组件** — 按照 scaffold-component 流程构建展示型组件；由容器/页面组件编排它们。
7. **路由** — 注册懒加载路由：`component: () => import('...')` 指向功能的页面/视图（在 `features/<功能名>/` 或 `views/` 下）。如果访问受限则添加守卫。
8. **状态覆盖** — 显式实现加载 / 错误 / 空数据状态，不仅是正常路径。
9. **测试** — 对 store actions/getters 和 composables 进行单元测试；仅当是关键流程时才添加 e2e 测试。
10. **验证** — `<pm> run lint && <pm> run test`（TS 项目加上 `<pm> run typecheck`）。

不要引入其他功能模块的内部实现；通过你的共享层（`src/shared/` 或你布局的共享部分）来共享。
