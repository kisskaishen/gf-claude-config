---
name: pre-commit
description: 提交前运行完整的质量检查 — Git规范、ESLint、Stylelint、TypeScript类型检查、单元测试。用于 git commit 前确保代码质量达标。
---

# 提交前检查

按顺序执行以下 5 项检查，**任何一项失败都必须修复后再提交**。参考 `docs/skills/commit-pre-check.md` 了解详细说明和常见错误。

## 1. Git 规范检查

- **分支命名**：必须符合 `feat/<功能名>` / `fix/<bug名>` / `release-vX.XX.XX.XX` / `master`
  ```bash
  git branch --show-current
  ```
- **提交信息**：必须符合 `<类型>: <中文描述>`（类型：feat/fix/refactor/style/docs/chore）
  ```bash
  git log -1 --pretty=%B
  ```
- 不符合则修正后再继续。

## 2. ESLint — 代码规范

```bash
npx eslint --ext .js,.ts,.vue src
```

可先尝试自动修复：`npx eslint --ext .js,.ts,.vue src --fix`

## 3. Stylelint — 样式规范

```bash
npx stylelint "src/**/*.{vue,scss,css}"
```

可先尝试自动修复：`npx stylelint "src/**/*.{vue,scss,css}" --fix`

## 4. TypeScript — 类型检查

```bash
npx vue-tsc --noEmit -p tsconfig --skipLibCheck
```

## 5. Unit Test — 单元测试

```bash
npx vitest run
```

修改了 `src/{api,store,utils,hooks}/` 下的代码时，必须同步编写或更新对应的测试用例。

## 结果

- 全部通过 → ✅ 可以提交
- 任一项失败 → 🔴 修复后重新运行全套检查，禁止跳过

> 项目已配置 Husky + lint-staged，但只检查暂存文件。建议手动运行全套检查，因为 Husky 不包含 Git 规范、TypeScript 类型检查和单元测试。
