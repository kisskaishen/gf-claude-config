---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# 错误处理

失败是契约的一部分。有意识地处理它们；让它们对用户和工具可见（见 `observability.md`）。

## 先分类

- **预期内** — 校验失败、4xx、"未找到"、离线。内联处理，给出清晰、可操作的用户提示和前进路径（重试、修正输入）。
- **预期外** — 程序错误、5xx、损坏的不变量。在边界处捕获，显示通用降级提示，并上报。不要假装它是预期内的。

## 绝不吞没

- 无空的 `catch {}`。每个 catch 要么处理错误、要么重新抛出、要么上报 — 绝不使其静默。
- 不将原始错误文本、堆栈跟踪或内部细节展示给用户（糟糕的 UX 且属于信息泄露 — 见 `security.md`）。记录细节；向用户展示一句人可读的说明。

## 边界

- 将路由视图 / 有风险的子树包裹在错误边界中，使用 `onErrorCaptured`（或一个小型 `ErrorBoundary` 组件），渲染降级内容而非空白屏幕。如果被复用则提升为共享遮罩/基元（见 `architecture.md`）。
- `onErrorCaptured` 捕获后代组件的渲染和生命周期错误 — **不**捕获异步回调或 promise 中的错误。在哪里发生就在哪里处理。

## 异步

- 每个可能 reject 的 `await`/promise 都被包裹（`try/catch` 或 `.catch`）。对于预期内的失败，优先返回带类型的结果（可区分联合类型 / `Result`）而非抛出。
- 设置最后的兜底网：`app.config.errorHandler` 和 `window.addEventListener('unhandledrejection', …)` → 上报，而不只是记录。这些是安全网，而非主要策略。

## TypeScript

- `catch (e)` 是 `unknown` — 读取 `.message` 前先缩小类型（`instanceof Error`、类型守卫）。绝不将其类型为 `any`。

## 用户体验

- 失败时保留用户输入（不要清空表单）。对临时错误提供重试。字段级 vs 表单级错误放置遵循 `forms.md`。

## 验证

- 新的异步路径处理了 rejection；未引入空 catch。
- 失败状态可触达并可渲染（测试了错误分支，不仅仅是成功）。
