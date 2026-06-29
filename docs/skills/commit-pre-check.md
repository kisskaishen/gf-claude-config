---
title: 提交前检查 — 代码质量检查指南
description: 在提交代码前运行 ESLint、Stylelint、TypeScript 类型检查和单元测试，确保代码质量
tags: [提交, 检查, ESLint, Stylelint, TypeScript, 测试, 质量]
type: skill
priority: high
scope: "git commit"
---

# 提交前检查 — 代码质量检查指南

> 每次 `git commit` 前必须执行以下检查，确保代码质量达标。

---

## 检查流程

按顺序执行以下 5 项检查，**任何一项失败都必须修复后再提交**：

```
  ┌─────────────┐
  │ ① Git 规范  │ → 分支命名 + 提交信息格式
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ ② ESLint    │ → npx eslint --ext .js,.ts,.vue src
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ ③ Stylelint │ → npx stylelint "src/**/*.{vue,scss,css}"
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ ④ TypeCheck │ → npx vue-tsc --noEmit -p tsconfig --skipLibCheck
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ ⑤ Unit Test │ → npx vitest run
  └─────────────┘
```

---

## ① Git 规范 — 分支命名与提交信息

### 1.1 分支命名检查

当前分支必须符合以下格式之一：

| 格式 | 用途 | 示例 |
|------|------|------|
| `feat/<功能名>` | 功能开发 | `feat/user-auth` |
| `fix/<bug名>` | Bug 修复 | `fix/order-list-crash` |
| `release-vX.XX.XX.XX` | 发布候选 | `release-v1.26.06.25` |
| `master` | 生产分支 | — |

**检查命令：**
```bash
# 获取当前分支名
git branch --show-current
```

**常见错误：**

| 错误示例 | 问题 | 正确格式 |
|----------|------|---------|
| `feature/login` | 前缀不对 | `feat/login` |
| `fix-bug` | 缺少斜杠 | `fix/bug` |
| `test` | 无意义分支名 | 遵循命名规范 |

> 🟡 临时实验分支不在此限制内，但合并到 release/master 前必须规范命名。

### 1.2 提交信息检查

提交信息必须符合格式：**`<类型>: <中文描述>`**

**支持的提交类型：**

| 前缀 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加站点选择功能` |
| `fix` | 修复 Bug | `fix: 修复订单列表分页错误` |
| `refactor` | 重构 | `refactor: 优化订单状态判断逻辑` |
| `style` | 样式调整 | `style: 调整导航栏图标间距` |
| `docs` | 文档变更 | `docs: 添加提交前检查指南` |
| `chore` | 构建/工具变更 | `chore: 升级 Element Plus 版本` |

**检查命令：**
```bash
# 查看最近一次提交信息
git log -1 --pretty=%B

# 查看待推送的提交信息
git log origin/$(git branch --show-current)..HEAD --pretty=%B
```

**正确示例：**
```
feat: 添加工单分类选择和紧急程度功能
fix: 修复订单列表分页显示错误
refactor: 移除工单分类和紧急程度相关代码
```

**错误示例：**
```
添加功能              ✗ 缺少类型前缀
feat: add feature     ✗ 描述应使用中文
Fix bug               ✗ 类型前缀首字母应小写
feat:这是一个功能      ✗ 冒号后缺少空格
```

### 1.3 检查脚本

```bash
#!/bin/bash
# 检查分支命名
BRANCH=$(git branch --show-current)
if [[ ! "$BRANCH" =~ ^(feat|fix|release-v|master)/.+$ ]] && [[ "$BRANCH" != "master" ]]; then
  echo "❌ 分支命名不符合规范: $BRANCH"
  echo "   格式: feat/<功能名> | fix/<bug名> | release-vX.XX.XX.XX"
  exit 1
fi

# 检查最近一次提交信息
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ ! "$COMMIT_MSG" =~ ^(feat|fix|refactor|style|docs|chore):[[:space:]][^[:space:]] ]]; then
  echo "❌ 提交信息不符合规范: $COMMIT_MSG"
  echo "   格式: <类型>: <中文描述>"
  exit 1
fi

echo "✅ Git 规范检查通过"
```

---

## ② ESLint — 代码规范检查

```bash
npx eslint --ext .js,.ts,.vue src
```

**检查内容：**
- JavaScript/TypeScript 语法规范
- Vue 组件规范（`<script setup>`、命名、Props/Emits 定义）
- 导入路径（别名 `@/`、禁止相对路径跨层级）
- 未使用的变量和导入

**自动修复：**
```bash
npx eslint --ext .js,.ts,.vue src --fix
```

**常见错误：**

| 错误 | 原因 | 修复方式 |
|------|------|---------|
| `'xxx' is defined but never used` | 未使用的变量/导入 | 删除或使用 |
| `Missing return type on function` | 函数缺少返回值类型 | 添加类型注解 |
| `Use "@/" alias` | 使用了相对路径导入 | 改为 `@/` 别名 |

---

## ③ Stylelint — 样式规范检查

```bash
npx stylelint "src/**/*.{vue,scss,css}"
```

**检查内容：**
- SCSS/CSS 语法错误
- 样式规范（缩进、命名、选择器深度）
- 禁止使用的写法

**自动修复：**
```bash
npx stylelint "src/**/*.{vue,scss,css}" --fix
```

---

## ④ TypeScript — 类型检查

```bash
npx vue-tsc --noEmit -p tsconfig --skipLibCheck
```

**检查内容：**
- TypeScript 类型错误
- 隐式 `any` 类型
- Props/Emits 类型不匹配
- API 响应类型不完整

**注意：**
- `--noEmit` 只检查不生成文件
- `--skipLibCheck` 跳过 `node_modules` 的类型检查以加速
- 此步骤耗时较长（大型项目），但必须通过

**常见错误：**

| 错误 | 原因 | 修复方式 |
|------|------|---------|
| `Type 'xxx' is not assignable to type 'yyy'` | 类型不匹配 | 检查接口定义 |
| `Parameter 'xxx' implicitly has an 'any' type` | 隐式 any | 添加类型注解 |
| `Property 'xxx' does not exist on type 'yyy'` | 属性不存在 | 更新接口或修正拼写 |

---

## ⑤ Unit Test — 单元测试

```bash
npx vitest run
```

**检查内容：**
- 工具函数（`src/utils/`）
- API 层（`src/api/`）
- Pinia Store（`src/store/`）
- 自定义 Hooks（`src/hooks/`）
- Vue 组件

**修改以上模块时，必须同步编写或更新对应的测试用例。**

**查看覆盖率：**
```bash
npx vitest run --coverage
```

---

## 一键检查脚本

可以组合为一条命令：

```bash
# ① Git 规范
BRANCH=$(git branch --show-current)
if [[ ! "$BRANCH" =~ ^(feat|fix|release-v|master)/.+$ ]] && [[ "$BRANCH" != "master" ]]; then
  echo "❌ 分支命名不符合规范: $BRANCH" && exit 1
fi
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ ! "$COMMIT_MSG" =~ ^(feat|fix|refactor|style|docs|chore):[[:space:]][^[:space:]] ]]; then
  echo "❌ 提交信息不符合规范: $COMMIT_MSG" && exit 1
fi

# ② ESLint
npx eslint --ext .js,.ts,.vue src && \

# ③ Stylelint
npx stylelint "src/**/*.{vue,scss,css}" && \

# ④ TypeCheck
npx vue-tsc --noEmit -p tsconfig --skipLibCheck && \

# ⑤ Unit Test
npx vitest run
```

---

## 检查失败的处理

| 步骤 | 失败时操作 |
|------|-----------|
| Git 规范 | 修正分支命名或修改最近一次提交信息 |
| ESLint | 先 `--fix` 自动修复，再手动修复剩余问题 |
| Stylelint | 先 `--fix` 自动修复，再手动修复剩余问题 |
| TypeCheck | 根据错误信息修复类型定义 |
| Unit Test | 查看失败用例，修复代码或更新测试 |

> 🔴 **任何一项未通过，禁止 `git commit`。** 修复后重新运行全套检查，全部通过后方可提交。

---

## 与 Husky 的关系

项目已配置 Husky + lint-staged，`git commit` 时会自动对暂存文件运行 ESLint。但建议提交前**手动运行全套检查**，因为：

- Husky 只检查暂存文件，不会运行完整项目检查
- Husky 不包含 Git 规范、TypeScript 类型检查和单元测试
- 提前发现问题比在 CI 中失败更高效

> 💡 **提示：** 可以将一键检查脚本保存为 `.git/hooks/pre-push`，在推送前自动运行 Git 规范检查和单元测试。
