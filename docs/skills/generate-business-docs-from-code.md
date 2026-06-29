---
title: 从代码生成业务文档
description: 分析项目源代码（views/api/store/router），自动生成结构化的业务模块文档，输出到 docs/business/ 目录
tags: [文档生成, 业务分析, 代码扫描, AI]
type: skill
priority: medium
scope: src/**/*.{ts,vue}
---

# 从代码生成业务文档

> 扫描项目源代码，自动分析业务逻辑、数据流和模块依赖，生成结构化的业务文档。

---

## 文档输出位置

业务文档统一放在 `docs/business/` 目录下，按以下结构组织：

```
docs/business/
├── README.md                # 业务文档总览／索引
├── order.md                 # 订单管理
├── finance.md               # 财务管理
├── home.md                  # 首页
├── login.md                 # 登录认证
├── task.md                  # 任务管理
├── setting.md               # 系统设置
├── help.md                  # 帮助中心
├── data-models.md           # 全局数据模型汇总
└── architecture.md          # 前端架构概览
```

---

## 一、生成模式

### 1.1 全量生成（默认）

扫描 `src/views/`、`src/api/`、`src/store/`、`src/router/routes.ts` 所有模块，为每个功能域生成独立文档。

**触发方式：**
```
请为这个项目生成完整的业务文档
```

### 1.2 单模块生成

只针对指定功能域分析。

**触发方式：**
```
请生成「订单管理」模块的业务文档
请分析 src/views/order 的业务逻辑并生成文档
```

### 1.3 增量更新

仅更新有变更的模块文档（基于 git diff）。

**触发方式：**
```
请更新变更模块的业务文档
```

---

## 二、分析步骤

### 第 1 步：路由扫描 → 建立功能域清单

从 `src/router/routes.ts` 提取所有**一级菜单路由**作为功能域：

```
订单管理 (/order)     → single / batch / list / detail
财务管理 (/finance)   → balance / recharge / record / account
首页 (/home)          → index
任务管理 (/task)       → list
设置 (/setting)        → messageNotification
帮助中心 (/help)       → index / detail
登录 (/login)          → index
```

同时收集每个路由的：
- `meta.title` — 中文名称
- `meta.i18n` — i18n key
- `meta.requireAuth` — 是否需要认证
- `meta.hidden` — 是否在菜单显示

### 第 2 步：API 映射 → 梳理接口清单

根据页面中引用的 API 函数（通过 `import` 语句），建立「页面 → API 函数」的映射。

扫描每个 `.vue` 文件中的 `import { xxx } from "@/api/xxx"` 语句，定位该页面依赖的所有接口。

```typescript
// 示例：src/views/order/list.vue
import { getOrderList, cancelOrder, getOrderProductList } from "@/api/order";
// ↓ 映射为
订单列表 依赖:
  - getOrderList → POST /oms/order/pageList （分页查询订单）
  - cancelOrder → POST /oms/cancel （取消订单）
  - getOrderProductList → POST /plm/product/query-config （产品筛选）
```

### 第 3 步：Store 依赖分析

扫描页面中对 Pinia Store 的引用：

```typescript
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";
```

记录每个页面依赖的全局状态，以及读/写了哪些字段。

### 第 4 步：组件依赖分析

扫描页面中引用的共享组件（`src/components/`），记录使用的关键组件：

```vue
<!-- 示例 -->
<PageContainer>         ← 页面容器
<SearchContainer>       ← 搜索表单
<TableLayout>           ← 表格布局
<ProTableColumn>        ← 增强表格列
<SuccessDialog>         ← 成功弹框
```

### 第 5 步：业务逻辑提取

从页面的 `<script setup>` 中提取核心业务逻辑：

| 关注点     | 提取内容                                   |
| ---------- | ------------------------------------------ |
| 状态变量   | `ref()` / `reactive()` 的变量名和用途       |
| 搜索表单   | 搜索字段列表、默认值                       |
| 表格列定义 | 表格显示的列名和数据映射                   |
| 操作按钮   | 按钮文字、触发函数、权限控制               |
| 表单提交   | 提交流程、参数组装、成功/失败处理          |
| 弹框交互   | 弹框触发条件、`v-model` 绑定               |
| 条件渲染   | `v-if` / `v-show` 控制逻辑                  |
| 路由跳转   | `router.push` 的目标路由和参数              |

### 第 6 步：数据模型提取

从 API 文件的 TypeScript 类型定义中提取数据模型：

- **请求参数类型**：搜索字段、表单字段、分页参数
- **响应数据类型**：列表项、详情对象、嵌套结构
- **枚举/常量**：状态值、类型值及其中文含义

```typescript
// 从 API 类型提取
interface OrderListParams {
  orderNumber?: string;        // 单号
  customerNameSet?: string[];  // 客户名称集合
  orderStatusSet?: string[];   // 订单状态集合
  productCodeList?: string[];  // 产品编码
  queryStartTime?: string;     // 开始时间
  queryEndTime?: string;       // 结束时间
}
```

### 第 7 步：文档生成

将以上分析结果组织为 Markdown 文档。

---

## 三、文档模板

每个功能域的文档按以下结构生成：

```markdown
---
module: <功能域英文名>
title: <功能域中文名>
routes: <路由路径列表>
apis: <API 文件列表>
stores: <Store 列表>
generated_at: <生成时间>
---

# <功能域中文名>

## 1. 功能概述

<一句话说明该模块的业务目的>

## 2. 路由结构

| 路由路径               | 页面名称   | 认证 | 菜单可见 |
| ---------------------- | ---------- | ---- | -------- |
| /order/single          | 单票下单   | ✅   | ✅       |
| /order/batch           | 批量下单   | ✅   | ✅       |
| /order/list            | 订单列表   | ✅   | ✅       |
| /order/detail/:orderId | 订单详情   | ✅   | ❌       |

## 3. 页面详情

### 3.1 订单列表 (`/order/list`)

**文件**：`src/views/order/list.vue`

**功能说明**：实现订单的分页查询、筛选、批量操作和单条操作。

**搜索条件**：
| 字段 | 类型 | 说明 |
|------|------|------|
| orderNumber | string | 单号 |
| customerNameSet | string[] | 客户名称（多选） |
| orderStatusSet | string[] | 订单状态（多选） |
| productCodeList | string[] | 产品编码（多选） |
| queryStartTime | string | 开始时间 |
| queryEndTime | string | 结束时间 |

**列表字段**：
| 列名 | 数据字段 | 说明 |
|------|---------|------|
| 订单号 | orderNo | - |
| 客户名称 | customerName | - |
| 订单状态 | orderStatus | 枚举值，对应字典翻译 |
| 产品编码 | productCode | - |
| 创建时间 | createTime | - |
| 操作 | — | 详情/取消/打印 |

**操作按钮**：
| 操作 | 触发条件 | 说明 |
|------|---------|------|
| 查看详情 | — | 跳转 `/order/detail/:orderId` |
| 取消订单 | 待处理状态 | 弹出取消原因表单 |
| 打印面单 | 已发货状态 | 调用打印API |

**依赖 API**：
- `getOrderList` → POST /oms/order/pageList
- `cancelOrder` → POST /oms/cancel
- `getOrderLabelUrl` → GET /oms/label/getOrderLabelUrl
- `getOrderProductList` → POST /plm/product/query-config

**依赖 Store**：
- `useUserStore` — 获取客户 ID、用户信息
- `useAppStore` — 获取站点/语言设置

**使用组件**：
- PageContainer、SearchContainer、TableLayout、ProTableColumn、SuccessDialog

### 3.2 单票下单 (`/order/single`)

...（按相同模板）

## 4. 数据模型

### 4.1 OrderListParams（订单列表搜索参数）

```typescript
interface OrderListParams {
  orderNumber?: string;        // 单号
  customerNameSet?: string[];  // 客户名称集合
  orderStatusSet?: string[];   // 订单状态集合
  productCodeList?: string[];  // 产品编码
  queryStartTime?: string;     // 开始时间
  queryEndTime?: string;       // 结束时间
}
```

### 4.2 OrderItem（订单列表项）

```typescript
interface OrderItem {
  orderId: string;        // 订单 ID
  orderNo: string;        // 订单号
  customerName: string;   // 客户名称
  orderStatus: number;    // 订单状态
  productCode: string;    // 产品编码
  createTime: string;     // 创建时间
  // ...
}
```

## 5. 业务流程图（可选）

描述核心业务操作的端到端流程：

```
[单票下单]
  填写表单 → 选择产品 → 填写收寄件信息 → 提交 → 创建成功

[订单取消]
  列表页 → 点击取消 → 填写取消原因 → 确认 → 状态更新

[批量下单]
  下载模板 → 填写数据 → 上传文件 → 系统校验 → 批量创建 → 查看结果
```

## 6. 相关模块

- [[finance.md]] — 订单涉及费用/账单
- [[task.md]] — 批量下单生成后台任务
- [[home.md]] — 首页展示订单概览
```

---

## 四、索引文档模板

`docs/business/README.md` 按以下结构生成：

```markdown
---
type: index
generated_at: <生成时间>
---

# 业务文档

> 由代码自动生成，最后更新于 <生成时间>

## 功能域索引

| 模块 | 文档 | 页面数 | API数 | 说明 |
|------|------|--------|-------|------|
| 订单管理 | [order.md](order.md) | 4 | 15+ | 单票/批量下单、订单列表、详情、取消、打印 |
| 财务管理 | [finance.md](finance.md) | 4 | 8+ | 余额查询、充值、充值记录、账单 |
| 首页 | [home.md](home.md) | 1 | 5+ | 仪表盘、欢迎页 |
| 任务管理 | [task.md](task.md) | 1 | 2+ | 后台任务查看 |
| 设置 | [setting.md](setting.md) | 1 | 2+ | 消息订阅设置 |
| 登录认证 | [login.md](login.md) | 1 | 3+ | 登录、注册、密码重置 |
| 帮助中心 | [help.md](help.md) | 2 | 1+ | 帮助列表、帮助详情 |

## 全局架构

- [architecture.md](architecture.md) — 前端整体架构
- [data-models.md](data-models.md) — 全局数据模型汇总
```

---

## 五、AI 执行清单

当用户请求生成业务文档时，按以下顺序执行：

```
┌─────────────────────────────┐
│ 1. 确定范围                │
│    全量 or 单模块 or 增量    │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ 2. 扫描路由                │
│    读取 src/router/routes.ts │
│    建立功能域 → 页面映射    │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ 3. 读代码（并行）          │
│    对每个功能域：            │
│    - 读取 API 文件            │
│    - 读取所有 .vue 页面      │
│    - 读取关联 Store          │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ 4. 分析提取                │
│    - API 映射                │
│    - Store 依赖              │
│    - 组件依赖                │
│    - 业务逻辑摘要            │
│    - 数据模型                │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ 5. 生成文档                │
│    按模板写入                │
│    docs/business/<module>.md │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ 6. 生成索引                │
│    写入 docs/business/README.md │
│    更新 docs/README.md 引用   │
└─────────────────────────────┘
```

---

## 六、注意事项

1. **不要猜测** — 信息缺失时标注 `<!-- TODO: 待确认 -->`，不编造
2. **保持同步** — 文档头部记录 `generated_at` 时间戳，方便判断是否过期
3. **增量更新** — 修改代码时同步更新对应文档，用 git diff 定位影响范围
4. **引用真实接口** — API URL 和参数从 `src/api/*.ts` 直接提取，不编造
5. **链接 modules** — 模块间有关联时用 `[[other-module.md]]` 建立链接
6. **业务语言** — 文档面向产品和业务人员，避免纯技术术语，用中文描述功能
7. **不重复 CLAUDE.md** — 文档聚焦业务逻辑，不重复编码规范和架构说明
8. **已生成的文档** — 生成前检查是否已有文档，有则确认是否覆盖
