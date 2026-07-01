---
name: wizard
description: 首次上手引导 — 通过检测技术栈、确认并填充 CLAUDE.md 占位内容，将本 kit 适配到宿主项目。在将 kit 复制到仓库后立即使用，或在技术栈变更后重新运行以同步 CLAUDE.md。不会移除 agents/skills/rules（那是独立的步骤）。
---

# 上手引导向导

将 kit 适配到**当前**项目：检测技术栈，与用户确认，并填充 [CLAUDE.md](../../../CLAUDE.md)。它**不会**删除任何 agents/skills/rules — 裁剪未使用的配置是用户自行运行的独立步骤。

按顺序执行各步骤。当值不明确时暂停并询问；绝不悄无声息地猜测技术栈选择。

1. **刷新事实数据。** 运行 `node .claude/hooks/detect-stack.mjs`（轻量、容错），然后读取 `.claude/.wizard/facts.json`。
   - 如果 `isProject` 为 `false`，则此处没有宿主项目 — 这是 kit 仓库本身或空目录。**停止**，说明情况，不编辑任何内容。
   - 如果 `isVue` 为 `false`，警告本 kit 面向 Vue 3 并确认用户是否仍要继续。
   - 如果 `kit.onboarded` 已经是 `true`，这是一次重新同步 — 说明并继续（支持重新运行）。

2. **保护工作树。** 运行 `git status --short`。如果**不**干净，告诉用户向导将编辑 CLAUDE.md 并询问是继续还是先提交/暂存。绝不未经明确许可就在脏工作树上编辑（git 是唯一的回退手段）。

3. **确认技术栈。** 展示检测到的值供确认（纠正，而非留空）。将问题批量处理；预选检测到的答案：
   - **项目名称** — 默认 `projectName`（回退到仓库文件夹名称）。
   - **包管理器** — `packageManager`。如果 `packageManagerAmbiguous` 为 true 或为 `null`，用户必须选择（显示任何 `warnings`）。
   - **语言** — TypeScript 或 JavaScript（默认 `language`）。
   - **样式方案** — Tailwind / Sass-SCSS / CSS Modules / scoped `<style>`（默认 `styling`）。
   - **结构** — 按层或按功能（默认 `structure`）— 仅在未知或需确认时才询问。

4. **应用到 CLAUDE.md。** 用确认的值进行编辑 — 匹配意图，文件可能已被手动编辑过：
   - 标题 `# <项目名称>` → 项目名称。
   - **参考技术栈说明**（标题下方的标注）：它告诉读者规则使用的是 Vue 参考技术栈，需要进行 API 翻译。在 Vue 项目上可以删除（无需翻译）；在非 Vue 技术栈上保留但注明该框架为参考。
   - **语言**段：将 `**TypeScript** | **JavaScript** ← 为此仓库选择一个。` 收拢为选中的那个，并仅保留相关的指导说明。
   - **包管理器** — *保留 `<pm>` 标记*在命令块和质量门禁中。Kit 故意做到管理器无关（[README] "不硬编码"）：agent 根据 lockfile 替换 `<pm>`。在包管理器段中，只说明检测到的管理器（如 "检测到：**pnpm**（来自 `pnpm-lock.yaml`）"）并去掉通用的 lockfile 表格。**不要**在任何地方将 `<pm>` 改写成具体的管理器名称 — 在 CLAUDE.md 或规则中都是如此。
   - **样式方案行**（技术栈中）→ 说明选定的方案（确定后去掉"如有不同则替换…"的旁注）。
   - **JavaScript** 项目：删除 TS 专用的 `<pm> run typecheck` 命令行，并裁剪语言段和质量门禁中的"加 `typecheck`"/"仅 TS"注释。
   - **按功能布局**项目：将项目结构中的按层示例替换为 `features/<名称>/{components、composables、stores、api}` 布局。
   - 其他每一行都不要动（精准编辑 — 参考 `rules/principles.md`）。

5. **忽略缓存。** 确保项目的 `.gitignore` 包含 `.claude/.wizard/` — 如果缺失则追加。该目录存放机器本地的检测缓存（含绝对路径，每次会话重新生成），不得提交。**不要**忽略 `.claude/.onboarded`。（部署 kit 时只复制 `.claude/` + `CLAUDE.md`，所以 kit 自己的 `.gitignore` 规则不会传递 — 向导在此处重新建立。）

6. **留下标记。** 写入 `.claude/.onboarded` — 一行简短内容：日期和已确认的技术栈（如 `2026-06-24 · pnpm · TypeScript · Tailwind · 按层`）。这会阻止 SessionStart 钩子再次提示，并且它**会被提交**以便同事跳过上手引导。

7. **总结与交接。** 告诉用户 CLAUDE.md 中具体变更了什么。提醒他们 kit 仍然包含**全部** agent、skill 和 rule — 没有删除任何内容 — 裁剪项目不需要的部分是独立的步骤（`/prune` skill）。建议他们审查 `git diff CLAUDE.md` 和新的 `.claude/.onboarded`，然后在分支上提交（绝不在 `main` — 参考 `rules/git-operations.md`）。
