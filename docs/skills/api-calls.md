---
title: API 调用模式
description: 新增 API 的完整流程，包括文件组织、请求方法选择、文件上传下载和类型定义
tags: [API, Axios, 请求, 文件上传]
type: skill
priority: high
scope: src/api/**/*.ts
---

# API 调用模式

## 文件组织

每个功能域一个独立的 API 文件，放在 `src/api/` 下：

| 文件         | 包含的 API                          |
| ------------ | ----------------------------------- |
| `user.ts`    | 登录、注册、用户信息、服务激活      |
| `order.ts`   | 订单 CRUD、标签、批量操作、地址查询 |
| `finance.ts` | 充值、余额、账单、预警              |
| `home.ts`    | 首页仪表盘、工单咨询                |
| `task.ts`    | 任务列表                            |
| `common.ts`  | 字典查询、文件上传、i18n 数据、公钥 |
| `product.ts` | 产品列表/详情/创建/更新             |

## 基础结构

```typescript
import request from "@/utils/request";

export function getOrderList(
  data: OrderListParams
): Promise<PageResult<OrderItem>> {
  return request({
    url: "/oms/order/pageList",
    method: "post",
    data
  });
}
```

## 请求方法选择

| 场景                | Method                                                          | 参数位置          |
| ------------------- | --------------------------------------------------------------- | ----------------- |
| 列表查询 / 提交表单 | `post`                                                          | `data`            |
| 获取详情            | `get`                                                           | `params`          |
| 文件下载            | `get` 或 `post`，加 `responseType: "blob"`                      | `params` / `data` |
| 文件上传            | `post`，加 `headers: { "Content-Type": "multipart/form-data" }` | FormData          |

## GET 请求示例

```typescript
export function getOrderDetail(params: { id: string }) {
  return request({
    url: "/oms/order/detail",
    method: "get",
    params
  });
}
```

## 文件下载示例

```typescript
export function downloadOrderTemplate() {
  return request({
    url: "/oms/order/downloadTemplate",
    method: "get",
    responseType: "blob"
  });
}
```

## 文件上传示例

```typescript
export const uploadFile = (data: FormData) => {
  return request({
    url: "/fms/file/upload",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  });
};
```

## 请求工具说明

`src/utils/request.ts` 封装了 Axios，提供了以下功能：

- **Base URL 自动切换**：开发环境使用 `VITE_APP_BASE_API`，生产环境从 hostname 动态构造
- **请求拦截器**：自动添加 `Lang`、`User-Time-Zone`、`Authorization`、`SiteCode` 请求头
- **响应拦截器**：自动解包 `Result<T>`（`status === 1` 返回 `data`），错误时弹出 `ElMessage.error`
- **全响应模式**：传 `isFullResponse: true` 获取完整响应对象（含 `message` 等字段）

## 类型定义

```typescript
// 通用响应
export interface Result<T = any> {
  code: number;
  status: number; // 1 = 成功, 0 = 失败
  message: string;
  data: T;
}

// 分页响应
export interface PageResult<T = any> {
  pageTotal: number;
  pageList: T[];
  pageNum: number;
  pageSize: number;
}
```

## 新增 API 的步骤

1. 确定所属功能域，找到对应的 `src/api/<feature>.ts` 文件
2. 定义请求参数和响应数据的 TypeScript 类型
3. 使用 `request()` 封装 API 函数（命名导出）
4. 在页面组件中 import 并使用

```typescript
// 1. 定义类型
interface MyListParams {
  keyword?: string;
  pageNum: number;
  pageSize: number;
}

interface MyListItem {
  id: string;
  name: string;
  status: number;
}

// 2. 封装 API
export function getMyList(data: MyListParams): Promise<PageResult<MyListItem>> {
  return request({
    url: "/oms/my/pageList",
    method: "post",
    data
  });
}
```
