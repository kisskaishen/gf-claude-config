---
title: 状态管理（Pinia）指南
description: Pinia Store 的定义规则、持久化配置、组件内/外使用方式及现有 Store 一览
tags: [Pinia, 状态管理, Store, 持久化]
type: skill
priority: high
scope: src/store/**/*.ts
---

# 状态管理（Pinia）指南

## Store 定义规则

所有 Store 使用 **Setup 函数语法**（Composition API 风格），统一放在 `src/store/` 下。

## 基础模板

```typescript
import { defineStore } from "pinia";
import { store } from "@/store";

interface UserInfo {
  id: string;
  name: string;
}

export const useUserStore = defineStore("user", () => {
  // State — 使用 ref / reactive
  const token = ref("");
  const userInfo = ref<UserInfo | null>(null);

  // Getters — 使用 computed
  const isLoggedIn = computed(() => !!token.value);
  const userName = computed(() => userInfo.value?.name ?? "");

  // Actions — 封装业务逻辑
  async function login(credentials: { username: string; password: string }) {
    const res = await loginApi(credentials);
    token.value = res.token;
    userInfo.value = res.userInfo;
  }

  function logout() {
    token.value = "";
    userInfo.value = null;
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    login,
    logout
  };
});

// 组件外使用（utils、router guard 等）
export function useUserStoreWithOut() {
  return useUserStore(store);
}
```

## 持久化

项目使用 `pinia-plugin-persistedstate` 进行状态持久化。

### 开启持久化

```typescript
export const useAppStore = defineStore(
  "app",
  () => {
    // ...
    return { sidebar, lang, timezone, site };
  },
  {
    persist: {
      key: "csd-gfuc-web-app-state", // localStorage key
      pick: ["sidebar", "lang", "timezone"] // 只持久化需要的字段
      // storage: sessionStorage             // 可选，默认 localStorage
    }
  }
);
```

### 选择哪些状态需要持久化

| 场景                         | 持久化方式     | 示例                           |
| ---------------------------- | -------------- | ------------------------------ |
| 用户偏好（语言、时区、站点） | localStorage   | `app store`                    |
| 认证信息（token）            | localStorage   | `user store`                   |
| 会话级状态（打开的标签页）   | sessionStorage | `tagsView store`               |
| 临时状态（加载标志）         | 不持久化       | `user store.isUserInfoUpdated` |

## 组件中使用

```typescript
import { useUserStore } from "@/store/user"

const userStore = useUserStore()

// 直接访问 state
console.log(userStore.token)

// 使用 getter
if (userStore.isLoggedIn) { ... }

// 调用 action
await userStore.login(credentials)
```

> 注意：直接解构会失去响应性，需要保持 `userStore.xxx` 方式访问，或使用 `storeToRefs`。

## 组件外使用（utils / router guard）

在非组件上下文（如 `request.ts`、`guard.ts`）中使用 Store 时，必须使用 `WithOut` 模式：

```typescript
import { useUserStoreWithOut } from "@/store/user";

const userStore = useUserStoreWithOut();
const token = userStore.token;
```

## 现有 Store 一览

| Store      | Key                       | 持久化         | 主要状态                      |
| ---------- | ------------------------- | -------------- | ----------------------------- |
| `app`      | `csd-gfuc-web-app-state`  | localStorage   | sidebar, lang, timezone, site |
| `user`     | `csd-gfuc-web-user-state` | localStorage   | token, userInfo, loginInfo    |
| `tagsView` | `csd-gfuc-web-tags-view`  | sessionStorage | visitedViews, cachedViews     |
