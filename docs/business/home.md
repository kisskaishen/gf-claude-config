---
module: home
title: 首页
routes: /home
apis: src/api/home.ts
stores: useUserStore, useAppStore
generated_at: 2026-06-26
---

# 首页

> 系统首页/仪表盘，展示关键业务指标和订单概览。

## 1. 功能概述

首页是用户登录后的默认着陆页，提供业务数据概览，包含余额信息、派送统计等仪表盘数据。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/home` | 首页 | ❌ | ✅ | 首页（`affix: true`，标签页固定） |

## 3. 页面详情

### 3.1 首页 (`/home/index`)

**文件**：`src/views/home/index.vue`

**功能说明**：首页入口，动态组件加载实际页面内容。当前默认加载 `Gigma` 组件。

**子页面**：
| 组件 | 文件 | 说明 |
|------|------|------|
| `Gigma` | `src/views/home/gigma.vue` | 当前首页（数据仪表盘） |
| `Welcome` | `src/views/home/welcome.vue` | 欢迎页（备用） |

### 3.2 Gigma 首页仪表盘

**文件**：`src/views/home/gigma.vue`

**功能说明**：仪表盘展示关键业务指标和订单数据概览。

**依赖 API**：
- `getBalanceInfo` → GET `/home/balance/info` — 余额信息
- `getRecentCount` → GET `/home/order/recentCount` — 近期派送统计

### 3.3 工单咨询

**文件**：`src/views/home/gigma.vue`（内含咨询入口）

**功能说明**：用户可提交工单咨询，支持上传附件。

**依赖 API**：
- `addWorkOrder` → POST `/consult/addWorkOrder` — 创建工单
- `uploadWorkOrderAttachment` → POST `/consult/upload` — 上传附件（multipart/form-data）

## 4. 关键交互

- 首页标签页 `affix: true`，不可关闭
- 从首页订单概览可跳转到订单列表（通过 `sessionStorage.setItem("homeOrderType", status)` 传递筛选条件）

## 5. 相关模块

- [[order.md]] — 首页订单概览跳转到订单列表
- [[finance.md]] — 首页余额展示关联财务数据
