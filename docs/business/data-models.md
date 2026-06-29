---
module: data-models
title: 全局数据模型汇总
type: reference
generated_at: 2026-06-26
---

# 全局数据模型汇总

> 从各 API 文件和 Store 文件提取的核心数据模型。

## 1. 用户相关

### 1.1 UserInfo（用户信息）

```typescript
// src/store/user.ts
interface UserInfo {
  account: string;              // 账号
  cosId?: string;               // COS 相关 ID
  country: string;              // 国家代码（如 'FR'）
  createTime: number;           // 创建时间戳（毫秒）
  customerCode?: string;        // 客户编码
  customerId?: string;          // 客户 ID（UUID）
  defaultLanguage?: string;     // 默认语言（如 'zh'）
  defaultTimeZone?: string;     // 默认时区（如 'Local'）
  id: number;                   // 用户 ID
  pwd: string;                  // 加密密码
  updateTime: number;           // 更新时间戳（毫秒）
  userIdentity: number;         // 用户身份：1-潜在客户 2-成交客户 3-走货账户
}
```

### 1.2 LoginInfo（登录信息）

```typescript
// src/store/user.ts
interface LoginInfo {
  userInfo: UserInfo;
  shipperCustomerList: Array<{
    customerId: string;
    customerName: string;
    orderUpdateFlag?: number;   // 是否允许编辑订单（1-是 0-否）
  }>;
}
```

## 2. 订单状态枚举

| 值 | 含义 | 颜色 (#bg, #text) |
|----|------|-------------------|
| 0 | 待处理 | #FEF3EB, #FC4C02 |
| 1 | 已下单 | #DFEDFF, #237BEB |
| 2 | 已取消 | #F0F0F0, #999 |
| 3 | 异常 | #FFF4E1, #F59E0B |
| 4 | 处理中 | #FFF4E1, #F59E0B |
| 5 | 已完成 | #E7F5F0, #02B578 |
| 888 | 异常类型组合 | #FFE1E4, #FF0014 |
| 999 | 下单失败 | #FFE1E4, #FF0014 |

## 3. 公共 API 类型

### 3.1 通用响应类型

```typescript
// src/utils/request.ts
interface Result<T> {
  code: number;
  data: T;
  message: string;
}

interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}
```

## 4. 字典编码

| 字典编码 | 用途 | 使用位置 |
|---------|------|---------|
| `order_status` | 订单状态 | 订单列表 |
| `UnusualOrderType` | 异常订单类型 | 异常订单列表 |
| 付款方式字典 | 充值记录筛选 | 充值记录 |
| 充值状态字典 | 充值记录筛选 | 充值记录 |
| 任务类型字典 | 任务筛选 | 任务列表 |
| 任务状态字典 | 任务筛选 | 任务列表 |

> 字典统一通过 `useDict(code)` hook 获取，内置缓存。
