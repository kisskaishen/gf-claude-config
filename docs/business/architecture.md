---
module: architecture
title: 前端架构概览
type: architecture
generated_at: 2026-06-26
---

# 前端架构概览

> 系统整体架构说明，帮助理解各模块之间的关系。

## 1. 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 (Composition API) | UI 框架 |
| TypeScript | 类型系统 |
| Element Plus | UI 组件库 |
| Pinia | 状态管理 |
| Vue Router 4 | 路由管理 |
| Axios | HTTP 客户端 |
| SCSS | 样式预处理器 |
| Day.js | 日期处理 |
| Lodash-es | 工具函数 |

## 2. 项目结构

```
src/
├── api/              # API 请求层（7 个功能域文件）
│   ├── user.ts       # 用户认证
│   ├── order.ts      # 订单管理（20+ 接口）
│   ├── finance.ts    # 财务管理（15 个接口）
│   ├── task.ts       # 任务管理
│   ├── home.ts       # 首页仪表盘
│   ├── common.ts     # 公共接口（字典/文件/i18n）
│   └── product.ts    # 产品管理
├── store/            # Pinia 状态管理
│   ├── app.ts        # 全局设置（语言/时区/站点/侧栏）
│   ├── user.ts       # 用户认证（token/用户信息/登录）
│   └── tagsView.ts   # 标签页管理
├── router/           # 路由配置
│   ├── routes.ts     # 路由定义
│   └── guard.ts      # 路由守卫
├── hooks/            # 组合式函数
│   └── useDict.ts    # 字典查询（带缓存）
├── components/       # 共享组件（15+ 个）
├── views/            # 页面组件（7 个功能域）
├── utils/            # 工具函数
├── styles/           # 全局样式
├── lang/             # 国际化
└── enums/            # 枚举常量
```

## 3. 功能域一览

| 功能域 | 路由前缀 | API 文件 | Store | 页面数 |
|--------|---------|---------|-------|--------|
| 登录认证 | `/login` | `user.ts` | `useUserStore` | 1 |
| 首页 | `/home` | `home.ts` | `useUserStore`, `useAppStore` | 1 (2个子组件) |
| 订单管理 | `/order` | `order.ts` | `useUserStore`, `useAppStore` | 4 |
| 财务管理 | `/finance` | `finance.ts` | `useUserStore` | 4 |
| 任务管理 | `/task` | `task.ts` | `useUserStore` | 1 |
| 设置 | `/setting` | `finance.ts` (部分) | `useAppStore`, `useUserStore` | 1 |
| 帮助中心 | `/help` | — | — | 2 |

## 4. 数据流

```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐
│  .vue    │ ──→ │ api/    │ ──→ │ request  │ ──→ │ 后端   │
│  页面    │     │ 请求层  │     │ 拦截器    │     │ API    │
└──────────┘     └─────────┘     └──────────┘     └────────┘
     │                                  │
     │ 状态写入                         │ 全局错误处理
     ↓                                  ↓
┌──────────┐     ┌─────────┐     ┌──────────┐
│ store/   │ ←── │ hooks/  │     │ ElMessage│
│ Pinia    │     │ 复用逻辑│     │ 错误提示  │
└──────────┘     └─────────┘     └──────────┘
```

## 5. 路由守卫

- `setupRouteGuard` 在 `router/guard.ts` 中定义
- 处理认证检查、权限验证、页面标题设置
- `/login` 路由不校验认证

## 6. Store 持久化

| Store | 持久化 Key | 持久化字段 |
|-------|-----------|-----------|
| `useUserStore` | `csd-gfuc-web-user-state` | `token`, `userInfo`, `loginInfo` |
| `useAppStore` | `csd-gfuc-web-app-state` | `lang`, `timezone`, `site`, `hasSetPreference` |
