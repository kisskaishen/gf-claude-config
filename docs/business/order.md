---
module: order
title: 订单管理
routes: /order/*
apis: src/api/order.ts
stores: useUserStore, useAppStore
generated_at: 2026-06-26
---

# 订单管理

> 订单管理的核心模块，提供单票下单、批量下单、订单列表查询、订单详情查看、取消、打印等完整功能。

## 1. 功能概述

订单管理是系统的核心业务模块，支持两种下单方式（单票/批量），以及完整的订单生命周期管理。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/order/single` | 单票下单 | ✅ | ✅ | 创建单票订单（5步表单） |
| `/order/single/:orderId?/:orderType?/:editType?` | 单票下单（编辑/复制/重下单） | ✅ | ❌ | 编辑订单或复制订单重新提交 |
| `/order/batch` | 批量下单 | ✅ | ✅ | 下载模板 + 上传 Excel 批量创建 |
| `/order/list` | 订单列表 | ✅ | ✅ | 正常订单 + 异常订单查询 |
| `/order/detail/:orderId/:orderType?` | 订单详情 | ✅ | ❌ | 查看订单或异常订单详情 |

## 3. 页面详情

### 3.1 订单列表 (`/order/list`)

**文件**：`src/views/order/list.vue`

**功能说明**：双表格设计，正常订单和异常订单通过状态标签（CommonTag）切换显示。

**搜索条件**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `orderNumber` | string | 单号（支持换行/逗号/空格分隔多个） |
| `orderTimeRange` | datetime range | 下单时间范围（默认最近30天，最大跨度30天） |
| `consigneeCodeList` | string | 收件人邮编 |
| `consigneePhone` | string | 收件人电话 |
| `productCodeList` | string[] | 产品编码（多选） |
| `customerId` | string | 下单客户（多客户时显示） |

**状态标签栏**：
通过 `CommonTag` 组件按订单状态分组过滤，包含正常状态（0-5）和异常类型（6/7/8 → 888标签）。选中状态 999 时切换到异常订单表格。

**正常订单列表字段**：
| 列名 | 数据字段 | 说明 |
|------|---------|------|
| 客户订单号 | `corderNo` | — |
| 运单号 | `waybillNo` | — |
| 产品名称 | `productName` | — |
| 订单状态 | `orderStatusName` | 按颜色编码的状态标签（CommonTag） |
| 收件人 | `orderConsigneeVO.consigneeName` | — |
| 收件人电话 | `orderConsigneeVO.consigneePhone` | — |
| 收件人地址 | `orderConsigneeVO.address1` | 按国家格式化拼接地址 |
| 下单时间 | `orderCreateTime` | — |

**操作按钮（按状态区分）**：

| 操作 | 适用状态 | 说明 |
|------|---------|------|
| 查看详情 | 全部 | 跳转 `/order/detail/:orderId/order` |
| 打印面单 | 已下单（状态1） | 调用打印 API，下载 PDF 文件 |
| 编辑订单 | 已下单（状态1）且 `orderUpdateFlag=true` | 跳转 `/order/single/:orderId/order` |
| 取消订单 | 已下单（状态1） | 确认框后调用取消接口 |
| 复制订单 | 已取消（状态2） | 跳转 `/order/single/:orderId/order/copy` |
| 批量打印 | — | 多选后批量调用打印 |

**异常订单列表字段**（状态999时显示）：
包含客户名称、订单来源、运单号、客户订单号、邮编、异常类型、异常描述、异常字段、字段值、校验规则等详细信息。

**依赖 API**：
- `getOrderList` → POST `/oms/order/pageList`
- `getExceptionOrderList` → POST `/oms/unusualOrderPageList`
- `getOrderLabelUrl` → GET `/oms/label/getOrderLabelUrl`
- `batchPrintOrderLabel` → POST `/oms/label/batchPrintLabel`
- `cancelOrder` → POST `/oms/cancel`
- `getOrderProductList` → POST `/plm/product/query-config`

**依赖 Store**：
- `useUserStore` — 获取 `loginInfo.shipperCustomerList` 做客户筛选
- `useAppStore` — 监听 `lang`、`timezone` 变化自动刷新数据

**使用组件**：
- `PageContainer`、`TableLayout`、`CommonTag`、`SvgIcon`

**关键业务逻辑**：
- 日期跨度限制：不超过 30 天，禁用未来日期
- 多单号查询：换行、逗号、空格分隔，最多 500 个
- 语言/时区切换时自动重新加载产品列表和数据

### 3.2 单票下单 (`/order/single`)

**文件**：`src/views/order/single.vue`

**功能说明**：5 步向导式表单，依次填写发件人 → 收件人 → 产品 → 包裹 → 提交。

**子步骤组件**：
| 步骤 | 组件 | 说明 |
|------|------|------|
| 1 | `ShipperInfo` | 发件人信息 |
| 2 | `ConsigneeInfo` | 收件人信息 |
| 3 | `ProductInfo` | 产品选择 |
| 4 | `ParcelInfo` | 包裹信息 |
| 5 | `SubmitOrder` | 提交确认 |

**编辑模式**：
- `route.params.orderId` 存在 → 编辑模式，加载已有订单数据回填
- `route.params.editType === 'copy'` → 复制订单
- `route.params.editType === 'reorder'` → 异常重下单
- `route.params.orderType === 'exception'` → 来源异常订单

**提交成功后**：
弹出 `SuccessDialog`，可选"查看订单"或"继续下单"。

**依赖 API**：
- `createOrder` → POST `/oms/create/order`
- `getOrderDetail` → GET `/oms/order/detail`（编辑时加载）
- `getExceptionOrderDetail` → GET `/oms/getRequestDetail`（异常重下单时加载）

### 3.3 批量下单 (`/order/batch`)

**文件**：`src/views/order/batch.vue`

**功能说明**：下载 Excel 模板 → 填写订单数据 → 上传 Excel → 系统校验 → 批量创建。
上传成功后可在任务管理中查看导入结果。

**依赖 API**：
- `downloadOrderTemplate` → GET `/oms/order/downloadTemplate`（blob 下载）
- `uploadOrder` → POST `/oms/order/importExcel`
- `getOrderImportResult` → GET `/taskCenter/getOrderImportItem`
- `downloadFailedOrderData` → GET `/file/download`

### 3.4 订单详情 (`/order/detail`)

**文件**：`src/views/order/detail.vue`

**功能说明**：查看订单详细信息，含基本信息和物流轨迹。支持正常订单和异常订单两种类型（通过 `route.params.orderType` 区分）。

**依赖 API**：
- `getOrderDetail` → GET `/oms/order/detail`（正常订单）
- `getExceptionOrderDetail` → GET `/oms/getRequestDetail`（异常订单）
- `getOrderTracking` → POST `/dlts/track/query`（物流轨迹）

## 4. 数据模型

### 4.1 订单列表搜索参数

```typescript
interface OrderListSearchParams {
  orderNumber?: string;           // 单号（换行分隔多单）
  customerNameSet?: string[];     // 客户名称集合
  orderStatusSet?: string[];      // 订单状态集合
  consigneeCodeList?: string[];   // 收件地邮编
  shipperCodeList?: string[];     // 寄件地邮编
  productCodeList?: string[];     // 产品编码
  customerIdList?: string[];      // 客户 ID 列表
  queryStartTime?: string;        // 开始时间
  queryEndTime?: string;          // 结束时间
}
```

### 4.2 订单状态值

| 状态值 | 含义 | 颜色 |
|--------|------|------|
| 0 | 待处理 | 橙色 #FC4C02 |
| 1 | 已下单 | 蓝色 #237BEB |
| 2 | 已取消 | 灰色 #999 |
| 3 | 异常 | 黄色 #F59E0B |
| 4 | 处理中 | 黄色 #F59E0B |
| 5 | 已完成 | 绿色 #02B578 |
| 6/7/8 | 异常类型（三合一888） | 红色 #FF0014 |
| 999 | 下单失败（异常订单表） | 红色 #FF0014 |

### 4.3 取消订单参数

```typescript
interface CancelOrderParams {
  cancelReason?: string;
  orderId?: string;
  orderNo?: string;
  waybillNo?: string;
  remarks?: string;
}
```

## 5. 业务流程图

```
[单票下单流程]
  填写发件人信息 (Step 1)
    → 填写收件人信息 (Step 2)
    → 选择产品 (Step 3)
    → 填写包裹信息 (Step 4)
    → 提交确认 (Step 5)
    → 成功 → 弹窗选择：查看订单 / 继续下单

[批量下单流程]
  下载 Excel 模板
    → 线下填写订单数据
    → 上传 Excel 文件
    → 系统校验数据
    → 批量创建订单
    → 查看导入结果（任务中心）

[订单列表操作]
  查看订单 → 订单详情页
  打印面单 → 调用标签服务 → 下载 PDF
  编辑订单 → 进入单票下单（编辑模式）
  取消订单 → 确认弹窗 → 调用取消 API → 刷新列表
  复制订单 → 进入单票下单（复制模式）
  异常重下单 → 进入单票下单（重下单模式）
```

## 6. 相关 API 清单

共 20+ 个 API 函数，覆盖以下功能域：

| 功能 | API 函数 | 请求方式 | 接口路径 |
|------|---------|---------|---------|
| 订单列表 | `getOrderList` | POST | `/oms/order/pageList` |
| 异常订单列表 | `getExceptionOrderList` | POST | `/oms/unusualOrderPageList` |
| 订单详情 | `getOrderDetail` | GET | `/oms/order/detail` |
| 异常订单详情 | `getExceptionOrderDetail` | GET | `/oms/getRequestDetail` |
| 物流轨迹 | `getOrderTracking` | POST | `/dlts/track/query` |
| 创建订单 | `createOrder` | POST | `/oms/create/order` |
| 取消订单 | `cancelOrder` | POST | `/oms/cancel` |
| 标签打印 | `getOrderLabelUrl` | GET | `/oms/label/getOrderLabelUrl` |
| 批量打印 | `batchPrintOrderLabel` | POST | `/oms/label/batchPrintLabel` |
| 产品列表 | `getOrderProductList` | POST | `/plm/product/query-config` |
| 产品步骤信息 | `getProductStepInfo` | GET | `/cos/customer/customerProductList` |
| 渠道编码 | `queryProductChannelCode` | POST | `/plm/product/queryProductChannelCode` |
| 模板下载 | `downloadOrderTemplate` | GET | `/oms/order/downloadTemplate` |
| 上传订单 | `uploadOrder` | POST | `/oms/order/importExcel` |
| 导入结果 | `getOrderImportResult` | GET | `/taskCenter/getOrderImportItem` |
| 下载失败数据 | `downloadFailedOrderData` | GET | `/file/download` |
| 发件人信息 | `getSenderName` | GET | `/userShipper/selectUserShipperInfoByCustomerId` |
| 邮编查询城市 | `getPostcodeByCity` | POST | `/delivery/system/listAddressByCityOrState` |
| 邮编查地址 | `getAddressByCode` | POST | `/delivery/system/getByCode` |
| 城市列表 | `getListCityBySid` | POST | `/delivery/system/listCityBySid` |
| 州省列表 | `getStateList` | POST | `/delivery/system/selectSysStateCode` |

## 7. 相关模块

- [[finance.md]] — 订单费用通过财务管理结算
- [[task.md]] — 批量下单上传后生成后台任务
- [[home.md]] — 首页订单概览跳转到订单列表
