---
module: task
title: 任务管理
routes: /task/*
apis: src/api/task.ts
stores: useUserStore
generated_at: 2026-06-26
---

# 任务管理

> 后台任务中心，支持查看批量导入、账单导出等异步任务的执行状态和结果。

## 1. 功能概述

任务管理提供后台异步任务的统一查看入口。批量下单上传、账单导出等操作会产生后台任务，用户可在任务中心查看任务状态和结果。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/task/list` | 任务中心 | ✅ | ✅ | 后台任务列表查询 |

> 当前菜单 `hidden: true`，在导航中隐藏，但路由可访问。

## 3. 页面详情

### 3.1 任务中心 (`/task/list`)

**文件**：`src/views/task/list.vue`

**功能说明**：分页查询后台任务列表，支持按文件名称、任务类型、任务状态、时间范围、客户筛选。

**搜索条件**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `fileName` | string | 文件名称 |
| `taskTypeSet` | string[] | 任务类型（字典，多选） |
| `taskStatusSet` | string[] | 任务状态（字典，多选） |
| `orderTimeRange` | date range | 时间范围（默认最近30天，最大30天） |
| `customerIdList` | string[] | 下单客户（多客户时显示，多选） |

**列表字段**：
| 列名 | 数据字段 | 说明 |
|------|---------|------|
| 文件名称 | `fileName` | — |
| 任务类型 | `taskType` | 字典翻译 |
| 任务状态 | `taskStatus` | 字典翻译 |
| 客户名称 | `customerName` | — |
| 创建时间 | `createTime` | — |
| 操作 | — | 查看/下载结果 |

**依赖 API**：
- `getTaskList` → POST `/taskCenter/taskCenterPageList`

**依赖 Store**：
- `useUserStore` — 获取客户列表做筛选

**使用组件**：
- `TableLayout`、`CommonTag`

**关键逻辑**：
- 日期跨度限制 30 天，禁用未来日期
- 从账单页面飞入任务中心时，可能有外部参数（`flyToTaskCenter` 动效）

## 4. 数据模型

### 4.1 任务搜索参数

```typescript
interface TaskListParams {
  data: {
    taskStatusSet?: string[];    // 任务状态集合
    taskTypeSet?: string[];      // 任务类型集合
    customerIdList?: string[];   // 客户 ID 列表
    queryStartTime?: string;     // 开始时间
    queryEndTime?: string;       // 结束时间
  };
  pageNum: number;
  pageSize: number;
}
```

## 5. 任务来源

| 来源模块 | 触发操作 | 任务类型 |
|---------|---------|---------|
| 批量下单 | 上传 Excel 文件 | 订单导入 |
| 账单导出 | 下载运费/理赔账单 | 账单导出 |

## 6. 相关模块

- [[order.md]] — 批量下单产生导入任务
- [[finance.md]] — 账单下载产生导出任务
