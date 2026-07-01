# Git 操作

（全局规则 — 无路径限定。适用于每个仓库。）

## 安全

- 绝不直接提交到 `main`/`master`。在分支上工作。
- 未经明确人工确认，绝不运行破坏性或改写历史的命令（`push --force`、共享分支上的 hard reset）。
- 绝不提交密钥、`.env` 文件、Token 或密码。如果已暂存，停止操作并指出。
- 每次提交前运行质量门禁（见 `CLAUDE.md`）。

## 分支

- `feature/<简短的slug>`、`fix/<简短的slug>`、`chore/<简短的slug>`。

## 提交（约定式提交）

- 格式：`type(scope): summary` — 类型：`feat fix refactor perf test docs chore build ci style`。
- 祈使句、现在时、标题 ≤72 个字符。正文解释 _为什么_，而非 _是什么_。
- 小而专注的提交优于一个大提交。

## 拉取请求（PR）

- 保持 PR 小而目的单一。
- PR 描述：**是什么**变更、**为什么**、**如何测试**，UI 变更需附截图/录屏。
- 注明任何无障碍/性能影响。链接跟踪 issue/卡片。
- 未经确认不要替用户推送。

## 提交或发起 PR 前需审批

- 在 `git commit` 之前：展示变更文件（`git status --short` / `git diff --stat`）和**完整**提交信息 — 标题**和**正文 — 逐字展示，然后等待。用户批准前不执行提交；让用户先编辑或补充信息。
- 在 `gh pr create` 之前：同样的方式展示**完整** PR 标题和描述；让用户在发起前调整或补充。
- `.claude/settings.json` 已将 `git commit`/`git push` 设为 `ask` 作为硬性阻断 — 本规则定义了在该阻断点 _应展示什么内容_（文件列表 + 完整文本），而不仅仅是确认存在。
