---
name: gen-business-docs
description: 扫描项目源代码（views/api/store/router），自动分析业务逻辑生成结构化的业务模块文档到 docs/business/。用于为新功能或变更模块生成/更新业务文档。
---

# 从代码生成业务文档

扫描 `src/views/`、`src/api/`、`src/store/`、`src/router/routes.ts`，自动分析业务逻辑、数据流和模块依赖，生成结构化的业务文档。详细模板参考 `docs/skills/generate-business-docs-from-code.md`。

## 1. 确定范围

- **全量生成**：扫描所有模块，为每个功能域生成独立文档
- **单模块生成**：只针对指定功能域（如"订单管理"）
- **增量更新**：基于 `git diff` 仅更新变更模块

## 2. 扫描路由

从 `src/router/routes.ts` 提取所有一级菜单路由作为功能域，收集：
- `meta.title` — 中文名称
- `meta.i18n` — i18n key
- `meta.requireAuth` — 是否需要认证
- `meta.hidden` — 是否在菜单显示

## 3. 读代码（并行）

对每个功能域并行读取：
- API 文件（`src/api/<feature>.ts`）— 提取接口 URL、方法、参数类型
- 所有 `.vue` 页面 — 提取搜索条件、列表字段、操作按钮、弹框交互
- 关联 Store — 提取状态依赖和读/写字段

## 4. 分析提取

- **API 映射**：页面 → API 函数的依赖关系
- **Store 依赖**：页面依赖的全局状态
- **组件依赖**：使用的共享组件（`src/components/`）
- **业务逻辑**：搜索表单、表格列、操作按钮、条件渲染、路由跳转
- **数据模型**：TypeScript 类型 → 字段名、类型、中文说明

## 5. 生成文档

按模板写入 `docs/business/<module>.md`：

```markdown
# <功能域中文名>
## 1. 功能概述
## 2. 路由结构（表格：路径、页面名称、认证、菜单可见）
## 3. 页面详情（每个页面：搜索条件、列表字段、操作按钮、依赖API、依赖Store、使用组件）
## 4. 数据模型（TypeScript接口定义）
## 5. 业务流程图（可选）
## 6. 相关模块（wiki-links）
```

## 6. 生成索引

更新 `docs/business/README.md` — 模块索引表格（含页面数、API数、说明）。

## 注意事项

- 不猜测 — 信息缺失时标注 `<!-- TODO: 待确认 -->`
- 文档头部记录 `generated_at` 时间戳
- 引用真实接口 — URL 和参数从代码直接提取
- 业务语言 — 面向产品和业务人员，用中文描述
- 不重复 CLAUDE.md — 聚焦业务逻辑，不重复编码规范
- 生成前检查是否已有文档，有则确认是否覆盖
