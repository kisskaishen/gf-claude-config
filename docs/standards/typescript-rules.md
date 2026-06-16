---
title: TypeScript 编码规范
description: TypeScript 接口命名、类型推断、函数签名、枚举和路径别名规范
tags: [TypeScript, 编码规范, 类型]
type: standard
priority: high
scope: src/**/*.ts
---

# TypeScript 编码规范

## 基本原则

1. **严格模式**：项目已启用 `strict: true`，充分利用类型系统
2. **禁止滥用 `any`**：除非有充分理由且添加 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 注释
3. **导出类型**：页面/组件中用到的接口定义应显式导出，方便复用

## 接口命名

- 请求参数类型：`<Feature><Action>Params` — `OrderListParams`
- 响应数据类型：`<Feature><Action>Result` — `OrderDetailResult`
- 通用响应使用 `Result<T>` / `PageResult<T>`：

```typescript
export interface Result<T = any> {
  code: number;
  status: number; // 1 = 成功, 0 = 失败
  message: string;
  data: T;
}

export interface PageResult<T = any> {
  pageTotal: number;
  pageList: T[];
  pageNum: number;
  pageSize: number;
}
```

## 类型推断

优先让 TypeScript 自动推断类型，而非显式标注：

```typescript
// ✅ 好 — 自动推断
const count = ref(0);
const isVisible = ref(false);

// ❌ 多余 — 类型已由初始值推断
const count = ref<number>(0);
const isVisible = ref<boolean>(false);
```

需要明确类型时才显式标注：

```typescript
// 初始值为 null 或 undefined 时需要标注
const userInfo = ref<UserInfo | null>(null)

// 复杂嵌套结构
const formData = ref<OrderFormData>({ ... })
```

## 函数签名

### API 函数

```typescript
// 参数和返回值都有完整类型
export function getOrderList(
  params: OrderListParams
): Promise<PageResult<OrderItem>> {
  return request({
    url: "/oms/order/pageList",
    method: "post",
    data: params
  });
}
```

### Composables / Hooks

```typescript
export function useDict(code: string): {
  dictList: ComputedRef<DictOption[]>;
  getLabel: (value: string | number) => string | undefined;
};
```

## 枚举

将枚举集中定义在 `src/enums/index.ts`：

```typescript
export enum Lang {
  ZH = "zh",
  EN = "en",
  FR = "fr",
  IT = "it",
  NL = "nl"
}
```

## 路径别名

使用 `@/` 指向 `src/`：

```typescript
import request from "@/utils/request";
import { useUserStore } from "@/store/user";
```

## Vue API 自动导入

项目已配置 `unplugin-auto-import`，以下 API 无需显式 import：

- Vue：`ref`, `computed`, `watch`, `onMounted`, `onActivated`, `nextTick` 等
- Vue Router：`useRouter`, `useRoute`
- Pinia：`defineStore`, `storeToRefs`
