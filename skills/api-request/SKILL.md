---
name: api-request
description: 按项目规范新增 API 请求函数 — 确定功能域文件、定义类型、封装请求、处理文件上传/下载。用于需要调用新后端接口时。
---

# 新增 API 请求函数

按照项目分层架构，在 `src/api/<feature>.ts` 中正确封装 API 函数。详细参考 `docs/skills/api-calls.md`。

## 1. 确定文件位置

每个功能域一个独立 API 文件，放在 `src/api/` 下：

| 文件 | 功能域 |
|------|--------|
| `user.ts` | 登录、注册、用户信息 |
| `order.ts` | 订单 CRUD、标签、批量操作 |
| `finance.ts` | 充值、余额、账单 |
| `home.ts` | 首页仪表盘 |
| `task.ts` | 任务列表 |
| `common.ts` | 字典、文件上传、i18n |
| `product.ts` | 产品列表/详情/创建 |

属于已有功能域 → 在对应文件追加。全新功能域 → 新建文件。

## 2. 定义类型

```typescript
// 请求参数 — 命名: <Feature><Action>Params
interface OrderListParams {
  keyword?: string;
  pageNum: number;
  pageSize: number;
}

// 响应数据 — 命名: <Feature><Action>Result
// 列表用 PageResult<T>, 单条用 Result<T>
```

## 3. 封装 API 函数

**列表查询 / 表单提交 → POST（data）：**

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

**获取详情 → GET（params）：**

```typescript
export function getOrderDetail(params: { id: string }) {
  return request({
    url: "/oms/order/detail",
    method: "get",
    params
  });
}
```

**文件下载 → GET/POST + responseType: "blob"：**

```typescript
export function downloadTemplate() {
  return request({
    url: "/oms/order/downloadTemplate",
    method: "get",
    responseType: "blob"
  });
}
```

**文件上传 → POST + multipart/form-data：**

```typescript
export function uploadFile(data: FormData) {
  return request({
    url: "/fms/file/upload",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  });
}
```

## 4. 请求工具说明

`src/utils/request.ts` 自动处理：
- **请求头**：`Lang`、`User-Time-Zone`、`Authorization`、`SiteCode`
- **响应解包**：`Result<T>` → `status === 1` 返回 `data`，失败自动 `ElMessage.error`
- **全响应模式**：传 `isFullResponse: true` 获取完整 `{ code, status, message, data }`

## 5. 验证

- TypeScript 类型检查通过
- 页面层通过 store/composable 间接调用，不直接在 `.vue` 中调 API
- 不在 API 层弹 UI（如 `ElMessage.success`）
