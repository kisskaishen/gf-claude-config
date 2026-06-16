---
title: Git 工作流程与提交规范
description: Git 分支策略、提交信息格式、Husky 检查流程和团队协作规范
tags: [Git, 工作流, 提交规范, Husky]
type: standard
priority: high
scope: git
---

# Git 工作流程与提交规范

## 分支策略

- **master**：生产分支，仅通过合并请求更新
- **release-vX.XX.XX.XX**：发布候选分支
- **feat/<功能名>**：功能开发分支
- **fix/<bug名>**：Bug 修复分支

## 提交信息规范

提交信息使用中文，简要说明改动内容：

```
<类型>: <描述>

示例:
feat: 添加工单分类选择和紧急程度功能
fix: 修复订单列表分页显示错误
refactor: 移除工单分类和紧急程度相关代码
```

### 常见类型前缀

| 前缀     | 说明          |
| -------- | ------------- |
| feat     | 新功能        |
| fix      | 修复 Bug      |
| refactor | 重构          |
| style    | 样式调整      |
| docs     | 文档变更      |
| chore    | 构建/工具变更 |

## 提交前检查

项目配置了 Husky + lint-staged，提交前会自动执行：

1. ESLint 检查
2. Prettier 格式化
3. Stylelint 检查
4. 各 lint-staged 规则

如果 pre-commit hook 失败，请修复提示的问题后重新提交。必要时可跳过（谨慎使用）：

```bash
git commit --no-verify -m "提交信息"
```

## 工作流程

1. 从当前 release 或 master 创建功能分支
2. 在功能分支上开发并提交
3. 提交前确保代码通过 lint 检查
4. 推送后创建 Pull Request / 合并请求
5. 代码评审通过后合并
