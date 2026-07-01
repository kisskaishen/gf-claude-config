---
name: prune
description: 移除项目不需要的 kit 能力 — agents、skills 和 rules — 并修复所有残留引用。手动操作、破坏性、依赖关系感知。慎重运行；不会自动触发，并在分支上提交以便 git 回退。
---

# 裁剪 Kit

移除项目不需要的整套**能力**（agent + skill + rule 组合），然后修复所有引用它们的文件。具有破坏性且需谨慎操作 — 不会自动触发；由用户按名称调用。

## 两条硬性规则

- **绝不修改 `CHANGELOG.md`。** 它是仅追加的发布历史；过去的条目合法地引用了已不存在的名称。
- **绝不在脏工作树上运行。** git 是唯一的回退手段（步骤 1）。

## 流程

1. **保护工作树。** 运行 `git status --short`。如果不干净，停止并请用户先提交/暂存，或明确同意继续执行。建议使用专用分支（如 `chore/prune-kit`）。

2. **询问要移除什么。** 按层级分组展示以下能力，让用户多选。对于**B 级**的任何选择，显示其 ⚠️ 警告并要求明确确认 — 这些内容涉及多个文件并支撑某个声明的核心原则。

3. **应用每个选中项的移除方案**（见下方）：删除其文件，然后修复它列出的引用。如果多个项一起被移除，一个项删除的文件会自动满足另一个项的引用要求（方案中会注明"如果仍存在"）。

4. **修复通用枢纽文件** — 几乎每次移除都会涉及：
   - **`.claude/rules/workflow.md`** — 从任何流程/质量门禁行中移除对应 agent；如果整个流程段变空，删除该段。
   - **`CLAUDE.md`** — 仅修改该项拥有的核心原则要点/结构/技术栈行（参考各项方案）。
   - **`README.md` / `docs/`** — _仅 kit 仓库。_ 部署的项目只有 `.claude/` + `CLAUDE.md`（kit 的 README/docs/CHANGELOG 不会被复制），所以在项目中跳过这些。当裁剪 kit 仓库本身时：从目录树中移除名称，**重新计算标题计数**（"N 个 agents、N 个 rules（N 个路径限定）、N 个 skills" — 路径限定 = rules 的 frontmatter 中有 `paths:`/`globs:`），删除提及被移除 agent 的流水线/设计说明文字。方案中删除 `docs/…` 或 `.github/…` 的项在那些文件不存在时同样是无操作。

5. **验证 — 无悬挂引用。** 运行：

   ```bash
   node .claude/hooks/check-refs.mjs <被移除的名称> [<被移除的名称>...]
   ```

   审查每个命中结果（输出格式 `file:line  [名称]  文本`）。修复真正的悬挂引用。命中结果是合法英文单词（如 "release"）或通用概念引用可以保留 — 但仅在确认它不是对被移除项的引用后才保留。重新运行直到干净或每个剩余命中都有合理解释。

6. **重新检测与总结。** 如果 `CLAUDE.md` 有变动，重新运行 `node .claude/hooks/detect-stack.mjs`。告诉用户具体删除了什么、编辑了哪些文件；展示 `git diff --stat`。

7. **提交。** 在分支上，一次专注的提交（绝不在 `main` — 参考 `rules/git-operations.md`）。提交前展示变更文件列表和完整提交信息等待审批。

## 移除方案

### A 级 — 安全移除

| 能力               | 删除                                                                                                                         | 修复引用                                                                                                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **e2e 测试**       | _（裁剪，不删除）_                                                                                                           | `.claude/skills/add-tests/`：删除 "## 3. e2e 测试（Playwright）" 段 + `test:e2e` 运行行 — 保留 skill（它仍用于单元/组件测试）。可选清理：从 CLAUDE.md 的命令列表中去掉 `test:e2e`，从技术栈行中去掉 Playwright，从 `settings.json` 的 allow 中移除 `npx playwright:*`。保留 `test-engineer`/`testing.md`。 |
| **重构流程**       | `.claude/agents/refactoring-expert.md`、`.claude/skills/refactor/`                                                           | `workflow.md`：删除整个 `## 重构` 段 + 从 skills-vs-agents 行中去掉 `refactor`。README 目录树 + agent 和 skill 计数。（保留 `architecture.md` → 分解与复用 — 那是通用指导，不只用于重构。）                                                                                                                |
| **魔鬼代言人**     | `.claude/agents/devil.md`                                                                                                    | `planner.md`：去掉"建议进行 `devil` 审查"要点。`workflow.md`：从规划步骤中移除 `devil`。README 目录树 + 功能流程 + 设计说明文字 + agent 计数。                                                                                                                                                             |
| **文档 Agent**     | `.claude/agents/docs-writer.md`                                                                                              | `workflow.md`：从标准功能流程中移除 DocsWriter 步骤。README 目录树 + 流水线说明 + agent 计数。                                                                                                                                                                                                             |
| **国际化（i18n）** | `.claude/rules/i18n.md`                                                                                                      | `security.md`：删除 vue-i18n XSS 要点（如果安全规则仍保留）。`CLAUDE.md`：从结构块中删除 `translations/` 行。`planner.md`：删除 "RTL/i18n" 提及。README 目录树 + rule 和路径限定计数。                                                                                                                     |
| **表单**           | `.claude/rules/forms.md`                                                                                                     | README 目录树 + rule 和路径限定计数。（其他文件没有引用它。）                                                                                                                                                                                                                                              |
| **数据获取**       | `.claude/rules/data-fetching.md`                                                                                             | `architecture.md`：删除"参考 `data-fetching.md`"引用。`CLAUDE.md`：删除数据获取核心原则条款。README 目录树 + rule 和路径限定计数。                                                                                                                                                                         |
| **错误处理**       | `.claude/rules/error-handling.md`                                                                                            | `data-fetching.md` + `observability.md`：删除其"参考 `error-handling.md`"引用（如果仍保留）。`CLAUDE.md`：删除错误处理核心原则要点。README 目录树 + rule 和路径限定计数。                                                                                                                                  |
| **配置**           | `.claude/rules/config.md`                                                                                                    | `data-fetching.md`：删除"参考 `config.md`"引用（如果仍保留）。`CLAUDE.md`：删除配置核心原则要点。README 目录树 + rule 和路径限定计数。                                                                                                                                                                     |
| **可观测性**       | `.claude/rules/observability.md`                                                                                             | `error-handling.md`：删除"参考 `observability.md`"引用（如果仍保留）。`CLAUDE.md`：删除可观测性核心原则要点。README 目录树 + rule 和路径限定计数。                                                                                                                                                         |
| **依赖升级**       | `.claude/skills/upgrade-deps/`                                                                                               | README 目录树 + skill 计数。（其他文件没有引用它。）                                                                                                                                                                                                                                                       |
| **CI/CD + 发布**   | `.claude/agents/ci-cd-engineer.md`、`.claude/skills/release/`、`docs/release-automation.md`、`.github/workflows/release.yml` | `workflow.md`：删除 `## CI/CD` 段。`security.md`：改写"在 CI 中自动化（参考 `ci-cd-engineer`）"条款以去掉 agent 引用（如果安全规则仍保留）。README：目录树、计数、"发布自动化"设计说明、发布徽章。删除变空的 `docs/` / `.github/workflows/`。                                                              |

### B 级 — 影响面大（警告 + 明确确认）

| 能力          | 删除                                                                                                      | 修复引用                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **安全** ⚠️   | `.claude/rules/security.md`、`.claude/agents/security-scanner.md`、`.claude/skills/security-audit/`       | 改写/删除以下文件中的 `（参考 security.md）` 条款：`ui-reviewer.md`、`planner.md`、`architecture.md`、`performance.md`、`styling.md`、`config.md`、`observability.md` 以及 `devil.md`/`i18n.md`/`data-fetching.md`（如果仍存在）。`workflow.md`：从质量门禁 + CI/CD 中移除 `security-scanner` + 从 skills-vs-agents 行中去掉 `security-audit`。`CLAUDE.md`：删除安全核心原则要点。README：目录树、计数（rule + skill）、流水线 + 设计说明文字。**⚠️ 安全是声明的核心原则，"服务端是唯一信任边界"的立场写在 `security.md` 中 — 请确认用户真的要移除客户端安全指南。** |
| **性能** ⚠️   | `.claude/rules/performance.md`、`.claude/agents/performance-auditor.md`、`.claude/skills/perf-audit/`     | `workflow.md`：skills-vs-agents 行 + 质量门禁。`CLAUDE.md`：删除性能核心原则要点。README：目录树、计数、说明文字。                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **无障碍** ⚠️ | `.claude/rules/accessibility.md`、`.claude/agents/accessibility-auditor.md`、`.claude/skills/a11y-audit/` | `forms.md`：删除"无障碍（参考 `accessibility.md`）"段（如果表单规则仍保留）。`workflow.md`：skills-vs-agents 行 + 质量门禁。`CLAUDE.md`：删除无障碍核心原则要点。README：目录树、计数、说明文字。**⚠️ 无障碍是明示要求，不是锦上添花 — 请确认。**                                                                                                                                                                                                                                                                                                                    |

> **C 级 — 此处不可移除：** 流水线核心（`planner`、`frontend-developer`、`ui-reviewer`、`test-engineer`、`debugger`）、其内联版本（`code-review`、`add-tests`、`debug-frontend`、`verify`）以及始终启用的规则（`principles`、`code-style`、`architecture`、`styling`、`git-operations`、`workflow`）。移除这些会破坏 kit 的核心功能。
