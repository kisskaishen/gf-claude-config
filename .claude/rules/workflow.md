# 工作流 — Agent 流水线

功能开发的编排框架。Agents 位于 `.claude/agents/`。优先将有限范围的工作委托给子 agent 以保持主上下文干净。

**Skills vs agents** — 一个 `/skill` 在当前会话中内联运行其清单（快速、临时、可边做边修）；对应的 agent（`code-review` → `ui-reviewer`、`a11y-audit` → `accessibility-auditor`、`perf-audit` → `performance-auditor`、`security-audit` → `security-scanner`、`debug-frontend` → `debugger`、`refactor` → `refactoring-expert`）是流水线中委托的隔离、最小权限专家。个人/临时工作使用 skill，门禁式流水线运行使用 agent。

## 标准功能开发

```
规划  →  开发  →  质量门禁（并行）  →  文档编写
```

1. **规划** — `planner` 将需求转化为简要计划（范围、组件、状态、边界情况、测试计划）。对于有实质 UX/架构/安全权衡的事项，负责人对计划运行 `devil`（只读）并将批评反馈融入规划，然后才写代码。简单变更直接跳到开发。
2. **开发** — `frontend-developer` 按照计划和规则实现。在实现过程中编写/更新单元测试。
3. **质量门禁（并行运行）** — `ui-reviewer`、`accessibility-auditor`、`test-engineer`、`performance-auditor` 和 `security-scanner`。如有任何返回 Critical/Important 发现，路由回 `frontend-developer`；然后仅重新运行标记了问题的审计项。最多两轮修复并重新运行后，停止并将剩余发现提交给用户决策。
4. **文档编写** — 如果公开行为有变更，`docs-writer` 更新 README/组件文档/changelog。

> **执行模型。** 负责人（主会话）用每个 agent 需要的上下文派发它，并在步骤间传递结果 — 子 agent 向负责人汇报，而非彼此之间。`SendMessage` 在 agent 间使用仅适用于流水线以实验性 agent **团队**方式运行时（`settings.json` 中 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`）。

## Bug 修复

```
调试  →  开发  →  验证（test-engineer + ui-reviewer）
```

`debugger` 复现并找到根因；`frontend-developer` 修复；验证环节用回归测试确认。

## 重构

```
refactoring-expert  →  验证（test-engineer + ui-reviewer）
```

`refactoring-expert` 不改变行为地重构代码 — 测试保持通过（如果该区域未覆盖则先添加特征测试）。当目标是清理/结构调整、而非新功能时用它代替 `frontend-developer`。对组件拆分，它遵循 `architecture.md` 中的分解模式和拆分信号；验证确认行为未变、提取/提升的单元保持稳定的 API。

## CI/CD

```
ci-cd-engineer  →  ui-reviewer + security-scanner
```

## 严重程度（所有审查 agent 通用）

- **Critical** — 功能破坏、无障碍阻断、安全问题、构建/测试失败。合并前必须修复。
- **Important** — 可能的 bug、性能退化、新逻辑缺少测试。合并前修复。
- **Nice-to-have** — 风格/可读性。可选。
