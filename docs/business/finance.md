---
module: finance
title: 财务管理
routes: /finance/*
apis: src/api/finance.ts
stores: useUserStore
generated_at: 2026-06-26
---

# 财务管理

> 余额查询、充值、充值记录、账单管理（运费账单 + 理赔账单）、余额预警配置。

## 1. 功能概述

财务管理模块提供账户余额查看、充值操作、充值记录查询，以及运费账单和理赔账单的分页查询、导出和下载功能。同时支持余额预警配置。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/finance/balance` | 余额 | ✅ | ✅ | 余额展示 + 余额预警配置 |
| `/finance/recharge` | 充值 | ✅ | ❌ | 提交充值申请（金额+凭证） |
| `/finance/record` | 充值记录 | ✅ | ✅ | 充值记录列表查询 |
| `/finance/account` | 账单 | ✅ | ✅ | 运费账单 + 理赔账单（Tab切换） |

## 3. 页面详情

### 3.1 余额 (`/finance/balance`)

**文件**：`src/views/finance/balance.vue`

**功能说明**：显示账户资金概况，包括可下单金额、账号余额、可用信用额度、待出账金额、未结账单金额。可配置余额预警通知。

**显示信息**：
| 卡片 | 公式 | 说明 |
|------|------|------|
| 可下单金额 | = 账户余额 + 信用额度 - 待出账 - 未结账单 | 实际可用于下单的金额 |
| 账号余额 | — | 客户充值进账户的金额 |
| 可用信用额度 | — | 剩余可用的信用额度 |
| 待出账金额 | — | 已产生但未出账的费用 |
| 未结账单金额 | — | 已出账但未支付的账单 |

**余额预警配置**：
| 字段 | 说明 |
|------|------|
| 预警开关 | 启用/禁用（`state: 0/1`） |
| 预警金额 | 余额低于此值时触发提醒 |
| 告警邮箱 | 接收提醒的邮箱列表 |
| 告警时间 | 每日告警的 UTC 时间 |
| 弹窗提醒 | 是否在页面上弹窗提醒 |

**依赖 API**：
- `getBalance` → GET `/fms/balance/info`
- `getBalanceAlertConfig` → GET `/userConfig/balanceAlert/queryByGfucLoginId`
- `getBalanceAlertInfo` → GET `/userinfo/balance/alert/info`
- `addBalanceAlertConfig` → POST `/userConfig/balanceAlert`
- `updateBalanceAlertConfig` → PUT `/userConfig/balanceAlert`

### 3.2 充值 (`/finance/recharge`)

**文件**：`src/views/finance/recharge.vue`

**功能说明**：提交充值申请，需填写充值金额、选择支付方式、上传付款凭证，备注选填。

**表单字段**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `arrivalAmount` | number | ✅ | 充值金额（需与凭证金额一致） |
| `currency` | string | — | 币种（禁用，自动获取） |
| `receiptMethod` | select | ✅ | 支付方式（字典） |
| `receiptDate` | date | ❌ | 到账日期 |
| `attachmentKeys` | file[] | ❌ | 付款凭证附件 |
| `remark` | string | ❌ | 备注 |

**依赖 API**：
- `recharge` → POST `/fms/recharge/balance`

### 3.3 充值记录 (`/finance/record`)

**文件**：`src/views/finance/record.vue`

**功能说明**：分页查询充值历史记录，支持按支付方式、状态、日期类型、时间范围筛选。

**搜索条件**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `paymentMethod` | string[] | 付款方式（字典，多选） |
| `status` | string[] | 充值状态（字典，多选） |
| `dateType` | select | 日期类型（充值日期/提交日期） |
| `dateRange` | date range | 时间范围 |

**依赖 API**：
- `getRechargeRecord` → POST `/fms/recharge/pageQuery`

### 3.4 账单 (`/finance/account`)

**文件**：`src/views/finance/account.vue`

**功能说明**：Tab 切换显示运费账单和理赔账单，共用 `BillPageQueryRequest` 参数结构，各提供分页查询、导出、下载功能。下载操作触发飞入任务中心的交互动画。

**子组件**：
- `CostTable` (运费账单) — 运费账单的分页/导出/下载
- `ClaimTable` (理赔账单) — 理赔账单的分页/导出/下载

**账单搜索条件**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `number` | string | 账单编号 |
| `waybillNo` | string | 运单编号 |
| `billYear` | number | 账单年份 |
| `billMonth` | string[] | 账单月份 |
| `billStatusList` | number[] | 账单状态 |
| `invoiceStatusList` | number[] | 发票状态 |
| `customerIdList` | number[] | 客户 ID |
| `cycle` | number | 周期 |
| `halfMonth` | number | 半月标识 |
| `weeks` | number[] | 周数 |

**依赖 API**：
- `getFreightBill` → POST `/fms/bill/pageQuery`（运费账单查询）
- `exportFreightBill` → POST `/fms/bill/exportList`（导出运费账单）
- `downloadFreightBill` → POST `/fms/bill/download`（下载运费账单）
- `getClaimBill` → POST `/fms/claimBill/pageQuery`（理赔账单查询）
- `exportClaimBill` → POST `/fms/claimBill/exportList`（导出理赔账单）
- `downloadClaimBill` → POST `/fms/claimBill/download`（下载理赔账单）
- `downloadBill` → GET `/taskCenter/getDcExportDownloadUrl`（任务中心下载）
- `getCustomerSettleCycle` → POST `/fms/getCustomerSettleCycle`（结算周期）

## 4. 数据模型

### 4.1 充值参数

```typescript
interface RechargeParams {
  arrivalAmount: string;       // 充值金额
  currency: string;            // 币种
  receiptMethod: any;          // 支付方式
  receiptDate?: string;        // 到账日期
  remark: string;              // 备注
  attachmentKeys?: string[];   // 付款凭证附件 key
}
```

### 4.2 充值记录查询参数

```typescript
interface RechargeRecordParams {
  pageNumber: number;
  pageSize: number;
  receiptDateStart?: string;       // 充值开始日期
  receiptDateTimeEnd?: string;     // 充值结束日期
  receiptMethod?: any[];           // 付款方式（字典）
  status?: any[];                  // 充值状态（字典）
  submitEnd?: string;              // 提交结束日期
  submitStart?: string;            // 提交开始日期
}
```

### 4.3 余额预警配置

```typescript
interface BalanceAlertConfig {
  id?: number;
  account: string;
  alertAmount: number;          // 预警金额
  alertEmails: string[];        // 告警邮箱
  alertHourMinute: string;      // 告警时间（HH:mm）
  alertUtcHour: string;         // 告警 UTC 小时
  country: string;
  emailLanguage: string;        // 邮件语言
  popupSwitch: number;          // 弹窗提醒开关
  state: number;                // 启用/禁用（0/1）
  timeZone: string;             // 时区
}
```

### 4.4 账单查询参数

```typescript
interface BillPageQueryRequest {
  billMonth?: string[];            // 账单月份
  billStatusList?: number[];       // 账单状态
  billYear?: number;               // 账单年份
  customerIdList?: number[];       // 客户 ID
  customerPrincipalId?: number;    // 客户负责人 ID
  cycle?: number;                  // 周期
  halfMonth?: number;              // 半月标识
  invoiceStatusList?: number[];    // 发票状态
  number?: string;                 // 账单编号
  pageNum: number;
  pageSize: number;
  waybillNo?: string;              // 运单编号
  weeks?: number[];                // 周数
}
```

## 5. 相关 API 清单

| 功能 | API 函数 | 请求方式 | 接口路径 |
|------|---------|---------|---------|
| 余额查询 | `getBalance` | GET | `/fms/balance/info` |
| 充值 | `recharge` | POST | `/fms/recharge/balance` |
| 充值记录 | `getRechargeRecord` | POST | `/fms/recharge/pageQuery` |
| 新增预警 | `addBalanceAlertConfig` | POST | `/userConfig/balanceAlert` |
| 更新预警 | `updateBalanceAlertConfig` | PUT | `/userConfig/balanceAlert` |
| 查询预警 | `getBalanceAlertConfig` | GET | `/userConfig/balanceAlert/queryByGfucLoginId` |
| 预警信息 | `getBalanceAlertInfo` | GET | `/userinfo/balance/alert/info` |
| 运费账单 | `getFreightBill` | POST | `/fms/bill/pageQuery` |
| 导出运费 | `exportFreightBill` | POST | `/fms/bill/exportList` |
| 下载运费 | `downloadFreightBill` | POST | `/fms/bill/download` |
| 理赔账单 | `getClaimBill` | POST | `/fms/claimBill/pageQuery` |
| 导出理赔 | `exportClaimBill` | POST | `/fms/claimBill/exportList` |
| 下载理赔 | `downloadClaimBill` | POST | `/fms/claimBill/download` |
| 任务下载 | `downloadBill` | GET | `/taskCenter/getDcExportDownloadUrl` |
| 结算周期 | `getCustomerSettleCycle` | POST | `/fms/getCustomerSettleCycle` |

## 6. 相关模块

- [[order.md]] — 订单费用生成账单
- [[task.md]] — 账单下载生成后台任务
