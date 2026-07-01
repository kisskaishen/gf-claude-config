---
name: release
description: 执行发布 — 匹配项目的发布机制（CHANGELOG 驱动或 Changesets），生成发布说明，确定 SemVer 版本号，运行质量门禁。用于发布新版本时。
---

# 执行发布

首先检测发布机制，然后按对应轨道执行。发布前始终运行质量门禁，并使用 `git-operations.md` 的审批流程处理提交/PR。

## 检测

- **Changesets** — `.changeset/config.json` 存在或 `@changesets/cli` 是 devDependency → **轨道 B**。
- **CHANGELOG 驱动**（本 kit 默认）— 有人工维护的 `CHANGELOG.md` + `.github/workflows/release.yml` → **轨道 A**。

## 轨道 A — CHANGELOG 驱动

1. **收集** — `git log <上次tag>..HEAD --oneline`（或自上次 tag 以来合并的 PR）；跳过噪音（合并提交、纯格式化）。
2. **分类**为 Keep a Changelog 分组（新增 / 变更 / 弃用 / 移除 / 修复 / 安全）；编写面向用户的说明，而非原始提交摘要。
3. **选择版本号**（SemVer）：破坏性变更 → 主版本号，新功能 → 次版本号，仅修复 → 修订号。
4. **编写版本段** — 将 `## [Unreleased]` 改为 `## [x.y.z] - YYYY-MM-DD`，在其上方留一个新的空 `## [Unreleased]`，并刷新底部的版本对比链接。
5. **版本号同步** — 将任何跟踪的版本号（`package.json` 等）更新为与 tag 一致。
6. **门禁** — `<pm> run lint && <pm> run test`（TS 项目加上 `<pm> run typecheck`）。
7. **发布** — 通过审批流程提交 + 创建 PR。合并到 `main` 后，`release.yml` 打 `vx.y.z` tag 并发布 GitHub Release（参考 `docs/release-automation.md`）。

## 轨道 B — Changesets

1. **意图随变更提交** — 贡献者运行 `npx changeset`（选择版本级别 + 摘要）；生成的 `.changeset/*.md` 文件在功能 PR 中提交，而非在发布时。
2. **版本化** — 运行 `npx changeset version`（或 `changeset:version` 脚本）。它消费 changesets、更新每个受影响的 `package.json`、并重写 `CHANGELOG.md`。在此步骤中**不要**手动编辑版本号或 changelog。
3. **审查**生成的版本号和 changelog diff。
4. **门禁** — `<pm> run lint && <pm> run test`（TS 项目加上 `<pm> run typecheck`）。
5. **发布** — 提交 + PR（通常是机器人创建的 "Version Packages" PR）。合并后，`changeset publish` 打 tag 并发布（npm 和/或 GitHub Release）。

> 不要混用轨道：在 Changesets 仓库中，让 `changeset version` 负责 changelog — 绝不手写 `## [x.y.z]` 段。
