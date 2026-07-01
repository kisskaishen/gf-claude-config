---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# 可观测性

如果应用在生产环境出问题或变慢，你应在用户告知之前就知道。日志记录、错误上报和现场指标 — 都不泄露 PII 或密钥（见 `security.md`）。

## 日志

- 通过一个小型 logger 包装器，而非原始的 `console.*`（`console.log` 禁止出现在提交的代码中 — 见 `code-style.md`）。包装器按级别控制，可在生产环境静默。
- 用结构化上下文记录（什么失败了、哪些 id）— 绝不记录 token、密码或 PII。

## 错误上报

- 在应用边界通过 `app.config.errorHandler` 和 `unhandledrejection` 监听器接入错误追踪器（Sentry 风格）（与 `error-handling.md` 中的兜底网一致）。上报预期外错误；不要重复上报已经内联处理过的错误。
- 用 release/version 标记事件，并**私密地**将 source maps 上传到追踪器 — 绝不公开发布它们（`build.sourcemap: 'hidden'`，见 `security.md`）。在发送前清除请求体/headers 中的敏感数据。

## 现场性能（RUM）

- 在真实用户环境中测量 Core Web Vitals — LCP、INP、CLS — 使用 `web-vitals` 库并发送到你的分析/监控系统。实验室预算在 `performance.md` 中；这是真实用户的对应指标。

## 分析与隐私

- 通过一个带类型的事件辅助函数发送分析数据，而非零散的调用。事件不携带 PII、token 或密钥。
- 尊重同意和勿追踪设置；非必要的追踪在未获同意时关闭。对高频日志/事件进行采样，而非全部发送。

## 验证

- 日志、面包屑或分析负载中无 PII/密钥。
- 预期外错误到达追踪器；source maps 私密上传，而非公开发布。
