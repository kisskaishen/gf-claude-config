---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/*.test.js"
  - "**/*.spec.js"
  - "tests/**"
  - "e2e/**"
---

# 测试

## 测什么

- 测试行为和契约，而非实现细节。断言用户看到/做的事。
- 覆盖：composables（逻辑）、store actions/getters、组件行为（props 输入 → 渲染输出 / 已触发事件输出）以及关键用户流程的 e2e 测试。
- 项目使用 Storybook 时，共享 UI kit 组件的 stories 可作为交互/视觉回归覆盖 — 可选，不替代行为测试。
- 不测试：框架内部实现、琐碎的直通 props、具体的 class 字符串、或全量快照。

## 单元/组件测试（Vitest）

- 无障碍查询来自 `@testing-library/vue` 或 Vitest 浏览器模式定位器（`vitest-browser-vue`）；在纯 Vue Test Utils 项目中，仍优先使用 role/label 选择。组件测试在 jsdom 或 Vitest 浏览器模式下运行（按项目配置）— 不要混用。
- 通过无障碍 role/label/text（`getByRole`、`getByLabelText`）查询，而非 CSS 选择器或 test-id，除非别无他法。
- Arrange–Act–Assert。每个测试一个行为；描述性名称（"valid 时 emit `submit` 带表单数据"）。
- 仅在边界处模拟（网络、时间、模块）。不模拟被测试对象本身。用 MSW 在 HTTP 层模拟网络 — 共享请求处理器，而非手动 stub fetch/axios — 这样测试会经过真实的序列化。
- 对防抖/超时逻辑使用 `vi.useFakeTimers()`；刷新并恢复。

## E2E 测试（Playwright）

- 覆盖一旦出问题就灾难性的少量流程（登录、核心增删改查路径、下单等）。
- 优先使用 role/text 定位器和 Playwright 的自动等待；避免随意使用 `waitForTimeout`。
- 保持 e2e 独立且幂等；通过 API/fixtures 设置状态，而非通过点击前序步骤达到测试起点。

## 标准

- 新逻辑附带测试。Bug 修复附带一个修复前失败的回归测试。
- 测试必须是确定性的 — 不依赖真实网络、时钟或顺序。
- 有意义地覆盖新逻辑；不追求虚假的覆盖率百分比。覆盖率只进不退 — 变更不应降低它。
