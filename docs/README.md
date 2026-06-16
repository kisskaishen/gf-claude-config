---
title: CSD-GFUC-Web 文档库总览
description: 项目文档库的入口文件，列出所有标准/规范和技能库的目录结构及使用方式
tags: [文档库, 索引, 总览]
type: index
priority: high
---

# CSD-GFUC-Web 项目文档库

> 本目录存放项目的 **标准/规范**（Standards）和 **技能库**（Skills），帮助团队成员保持代码风格一致并快速查阅常用操作模式。

---

## 目录结构

```
docs/
├── [README.md](.)                              # 本文档
├── standards/                                   # ⚖️ 编码规范与规则
│   ├── [README.md](standards/README.md)         #   规范总览
│   ├── [vue-conventions.md](standards/vue-conventions.md)       #   Vue 3 组件开发约定
│   ├── [typescript-rules.md](standards/typescript-rules.md)     #   TypeScript 编码规范
│   └── [git-workflow.md](standards/git-workflow.md)             #   Git 工作流程与提交规范
└── skills/                                      # 🔧 技能库 — 常用操作指南
    ├── [README.md](skills/README.md)            #   技能库说明
    ├── [api-calls.md](skills/api-calls.md)      #   API 调用模式
    ├── [state-management.md](skills/state-management.md)       #   状态管理（Pinia）指南
    ├── [component-guide.md](skills/component-guide.md)         #   组件开发指南
    ├── [ui-fidelity-implementation.md](skills/ui-fidelity-implementation.md)  #   UI 高保真还原
    └── [automated-testing.md](skills/automated-testing.md)     #   自动化测试
```

## 使用方式

- **新成员入职**：先通读 `standards/` 了解项目约定
- **日常开发**：遇到不确定的模式，查阅 `skills/` 对应文档
- **代码评审**：以 `standards/` 中的规则作为评审依据
- **贡献文档**：遵循现有格式，新增文件后在本文档添加链接
