---
name: pinia-store
description: 按项目规范创建或修改 Pinia Store — Setup函数语法、持久化配置、组件内外使用方式。用于需要新增或调整全局状态时。
---

# Pinia Store 管理

使用 Setup 函数语法（Composition API 风格）创建或修改 Pinia Store。详细参考 `docs/skills/state-management.md`。

## 1. 判断是否需要 Store

先确认状态是否真的需要全局化：

- ✅ **创建 Store**：跨多个组件/页面共享的状态、用户信息/token、应用配置（语言/时区/站点）
- ❌ **不要创建 Store**：仅单个组件使用的状态 → 用 `ref`/`reactive` 本地保持
- ❌ **不要**：为一个组件的状态创建全局 Store（反模式 — 参考 `architecture.md`）

## 2. 创建 Store

放在 `src/store/<name>.ts`，使用 Setup 函数语法：

```typescript
import { defineStore } from "pinia";
import { store } from "@/store";

interface UserInfo {
  id: string;
  name: string;
}

export const useUserStore = defineStore("user", () => {
  // State — ref / reactive
  const token = ref("");
  const userInfo = ref<UserInfo | null>(null);

  // Getters — computed
  const isLoggedIn = computed(() => !!token.value);
  const userName = computed(() => userInfo.value?.name ?? "");

  // Actions — 封装业务逻辑，调用 api/
  async function login(credentials: { username: string; password: string }) {
    const res = await loginApi(credentials);
    token.value = res.token;
    userInfo.value = res.userInfo;
  }

  function logout() {
    token.value = "";
    userInfo.value = null;
  }

  return { token, userInfo, isLoggedIn, userName, login, logout };
});

// 组件外使用（utils、router guard 等）
export function useUserStoreWithOut() {
  return useUserStore(store);
}
```

## 3. 配置持久化

使用 `pinia-plugin-persistedstate`：

```typescript
export const useAppStore = defineStore(
  "app",
  () => {
    // ... state, getters, actions
    return { sidebar, lang, timezone, site };
  },
  {
    persist: {
      key: "csd-gfuc-web-<store-name>",  // localStorage key 命名规则
      pick: ["sidebar", "lang", "timezone"]  // 只持久化需要的字段
    }
  }
);
```

**持久化选择：**

| 场景 | 方式 | 示例 |
|------|------|------|
| 用户偏好 | localStorage | app store |
| 认证信息（token） | localStorage | user store |
| 会话级状态 | sessionStorage | tagsView store |
| 临时状态（加载标志） | 不持久化 | — |

> 绝不持久化敏感 token 到可被 JS 读取的存储（安全警告 — 参考 `security.md`）。

## 4. 使用方式

**组件内：**

```typescript
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
// 访问: userStore.token, userStore.isLoggedIn
// 调用: await userStore.login(credentials)
// 注意: 直接解构会失去响应性，需用 storeToRefs
```

**组件外（utils / router guard）：**

```typescript
import { useUserStoreWithOut } from "@/store/user";

const userStore = useUserStoreWithOut();
const token = userStore.token;
```

## 5. 验证

- Store 通过 `WithOut` 导出函数可在组件外使用
- Actions 调用 `api/` 层，不在 Store 中直接写 axios
- 持久化 key 遵循 `csd-gfuc-web-<name>` 命名规则
- 编写单元测试：`<name>.test.ts` 放在 `src/store/` 同级目录
