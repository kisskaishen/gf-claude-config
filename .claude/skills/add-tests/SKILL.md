---
name: add-tests
description: 为变更添加或加强测试 — 单元/组件测试（Vitest + Vue Test Utils / Testing Library）和 e2e 测试（Playwright）。用于覆盖新逻辑、填补覆盖率缺口或为 bug 修复添加回归测试。
---

# 添加测试

根据你要保护的内容选择测试层级（参考 `testing.md`）。大部分覆盖率通过单元/组件测试实现；e2e 仅保留给少数关键流程。

## 1. 选择层级

- **单元测试** — 纯逻辑：composables、工具函数、store actions/getters。快速，无 DOM。
- **组件测试** — 通过组件的公共接口测试行为：props 输入、事件输出、渲染结果、用户交互。
- **e2e 测试** — 仅用于一旦出问题就灾难性的用户旅程（登录、核心增删改查、下单等）。不做单元/组件测试已覆盖的内容。

## 2. 单元 / 组件测试（Vitest + VTU / Testing Library）

- 命名 `<Name>.test.ts`（JS 项目为 `.test.js`），放在被测试文件同级目录。
- 通过 props 渲染；**通过 role/label/text 查询**，而非 CSS 类名或组件内部实现。断言可见输出和已触发事件。
- 覆盖边界/错误/空数据分支，不只是正常路径。对 composables，测试响应式输入和清理（`onScopeDispose`）。
- 在边界处模拟网络/服务层；不访问真实接口。保持测试确定性 — 不使用真实定时器/日期。

## 3. e2e 测试（Playwright）

- 通过 fixtures/API 初始化状态并以编程方式认证 — 不要通过点击前序步骤来达到测试起点。
- 使用 role/text 定位器和自动等待；不用 `waitForTimeout`。断言用户可见的结果（URL、可见文本、元素状态）。
- 独立且幂等 — 单独运行和任意顺序运行都能通过。包含一条失败/校验路径。用 `--repeat-each=3` 确认不 flaky。

## 4. 为 Bug 添加回归锚点

- 在修复之前，先写一个**失败**的测试来复现 bug；修复后测试通过（参考 `principles.md`、`testing.md`）。

## 5. 运行

- 单元/组件测试：`<pm> run test`；e2e 测试：`<pm> run test:e2e`（缺少浏览器？运行 `<pm> exec playwright install`）。
- 精炼优于数量多：少量健壮的测试胜过大量脆弱的测试。
