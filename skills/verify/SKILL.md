---
name: verify
description: 运行质量门禁并确认变更确实达成了目标再提交 — lint、test、typecheck，加上规则合规性检查。用于收尾任何任务（"确保它能用"），而非停留在"应该能用"。
---

# 验证

将"应该能用"变为"已验证"。质量门禁是底线（`CLAUDE.md`）；没有通过就不算完成（参考 `principles.md`）。

## 1. 运行门禁

- `<pm> run lint && <pm> run test` — TS 项目加上 `<pm> run typecheck`。全部必须通过；失败的门禁阻止提交。
- 如果此仓库的脚本名称不同，使用实际名称（`package.json`）。

## 2. 确认目标达成，而不只是通过

- 将任务重述为具体的、可检查的结果，并确认变更满足该结果 — 新行为有测试覆盖；bug 修复有一个**之前失败**、现在通过的回归测试（参考 `testing.md`）。
- 检查 diff 是否有范围蔓延：只改了任务要求的内容（参考 `principles.md` → 精准变更）。没有散落的 `console.log`、调试代码或注释掉的代码块。

## 3. 抽查相关规则

- 新行为：渲染了加载/错误/空数据状态，错误未被吞没（`data-fetching.md`、`error-handling.md`）。
- UI：键盘可操作 + 有标签（`accessibility.md`）；用 Token 而非魔数（`styling.md`）；无明显 XSS 风险点（`security.md`）。
- 如需更深入检查，转交给 `/code-review`、`/a11y-audit`、`/perf-audit` 或 `/security-audit`。

## 4. 报告

- 明确说明什么通过了、什么（如果有）仍失败或被跳过 — 展示失败的输出，不要掩饰。只有门禁通过且目标达成才算完成。
