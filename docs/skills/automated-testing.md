---
title: 自动化测试 — 单元测试与组件测试指南
description: 使用 Vitest + @vue/test-utils 对工具函数、API 层、Pinia Store、Vue 组件进行单元测试的完整指南
tags: [测试, Vitest, 单元测试, 组件测试, 覆盖率]
type: skill
priority: high
scope: src/**/*.{test,spec}.ts
---

# 自动化测试 — 单元测试与组件测试指南

> 本技能定义了一套基于 **Vitest + @vue/test-utils** 的单元测试体系，覆盖工具函数、API 层、Pinia Store 和 Vue 组件。

---

## 测试策略

### 测试金字塔

```
        ╱╲
       ╱ E2E ╲         少量 — 端到端流程（暂不涉及）
      ╱────────╲
     ╱  集成测试  ╲    中等 — Store + API 组合场景
    ╱──────────────╲
   ╱    单元测试      ╲  大量 — 工具函数、组件、Store 独立逻辑
  ╱────────────────────╲
```

### 各层测试分工

| 测试层          | 测试内容                   | 优先级     | 框架                     |
| --------------- | -------------------------- | ---------- | ------------------------ |
| **工具函数**    | utils 中的纯函数           | ⭐⭐⭐     | Vitest                   |
| **API 层**      | 请求/响应拦截器、Mock 场景 | ⭐⭐⭐     | Vitest + MSW / vi.mock   |
| **Pinia Store** | 状态变更、Action、Getter   | ⭐⭐⭐     | Vitest + @pinia/testing  |
| **可复用组件**  | Props 渲染、Emits 触发     | ⭐⭐       | Vitest + @vue/test-utils |
| **Composables** | 组合式函数逻辑             | ⭐⭐       | Vitest                   |
| **页面组件**    | 关键交互流程               | ⭐         | Vitest + @vue/test-utils |
| **E2E 测试**    | 跨页面流程                 | ⭐（后续） | Playwright               |

---

## 环境搭建

### 安装依赖

```bash
# 核心测试框架
pnpm add -D vitest @vue/test-utils happy-dom @pinia/testing

# 覆盖率
pnpm add -D @vitest/coverage-v8

# Mock HTTP（可选，也可用 vi.mock 代替）
pnpm add -D msw
```

### 配置文件

项目根目录已有 `vitest.config.ts`，主要内容：

```typescript
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "happy-dom",
    globals: true, // describe/it/expect 无需 import
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: { statements: 60, branches: 50, functions: 60, lines: 60 }
    },
    css: false // 跳过 CSS 解析加速测试
  }
});
```

### Package.json 脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 测试文件组织

### 命名规则

测试文件放在被测试模块的同级目录下，使用 `.test.ts` 后缀：

```
src/
├── utils/
│   ├── index.ts
│   ├── index.test.ts         # utils 测试
│   ├── crypto.ts
│   └── crypto.test.ts        # 加密工具测试
├── store/
│   ├── user.ts
│   └── user.test.ts          # 用户 Store 测试
├── components/
│   └── PageContainer/
│       ├── index.vue
│       └── index.test.ts     # 组件测试
└── api/
    ├── home.ts
    └── home.test.ts          # API 层测试
```

### 文件结构规范

```
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("模块名", () => {
  beforeEach(() => {
    // 每个测试前的准备工作
  })

  it("具体场景 → 期望结果", () => {
    //  Arrange（准备）
    //  Act（执行）
    //  Assert（断言）
  })
})
```

---

## 测试模式

### 1. 工具函数测试

纯函数最容易测试，不需要任何 Mock：

```typescript
// src/utils/index.test.ts
import { copyText, commaToArr, formatAmount } from "./index";

describe("formatAmount", () => {
  it("格式化千分位数字", () => {
    expect(formatAmount(1234567.89)).toBe("1,234,567.89");
  });

  it("处理零值", () => {
    expect(formatAmount(0)).toBe("0");
  });

  it("处理负数", () => {
    expect(formatAmount(-500)).toBe("-500");
  });
});

describe("commaToArr", () => {
  it("逗号分隔字符串转为数组", () => {
    expect(commaToArr("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("处理空字符串", () => {
    expect(commaToArr("")).toEqual([]);
  });
});
```

### 2. API 层测试

使用 `vi.mock` 模拟 `axios`，只验证请求参数是否正确拼装：

```typescript
// src/api/order.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "@/utils/request";

// Mock request 模块
vi.mock("@/utils/request", () => ({
  default: vi.fn()
}));

// 导入被测试的 API（必须在 mock 之后）
import { getOrderList, getOrderDetail } from "./order";

describe("order API", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("getOrderList 发送正确的 POST 请求", async () => {
    vi.mocked(request).mockResolvedValueOnce({
      data: { pageList: [], pageTotal: 0 }
    });

    const params = { pageNum: 1, pageSize: 20, keyword: "test" };
    await getOrderList(params);

    // 验证请求参数
    expect(request).toHaveBeenCalledWith({
      url: "/oms/order/pageList",
      method: "post",
      data: params
    });
  });

  it("getOrderDetail 发送正确的 GET 请求", async () => {
    vi.mocked(request).mockResolvedValueOnce({ data: { id: "123" } });

    await getOrderDetail({ id: "123" });

    expect(request).toHaveBeenCalledWith({
      url: "/oms/order/detail",
      method: "get",
      params: { id: "123" }
    });
  });

  it("getOrderList 返回正确的分页数据结构", async () => {
    const mockResponse = {
      pageList: [{ id: "1", name: "订单1" }],
      pageTotal: 1
    };
    vi.mocked(request).mockResolvedValueOnce(mockResponse);

    const result = await getOrderList({ pageNum: 1, pageSize: 20 });

    expect(result).toEqual(mockResponse);
    expect(result.pageList).toHaveLength(1);
    expect(result.pageTotal).toBe(1);
  });
});
```

### 3. Pinia Store 测试

使用 `@pinia/testing` 创建隔离的 Store 实例：

```typescript
// src/store/user.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useUserStore } from "./user";

describe("useUserStore", () => {
  beforeEach(() => {
    // 为每个测试创建一个全新的 Pinia 实例
    setActivePinia(createPinia());
  });

  it("初始状态 token 为空", () => {
    const store = useUserStore();
    expect(store.token).toBe("");
    expect(store.userInfo).toBeNull();
  });

  it("login 成功后更新 token 和 userInfo", async () => {
    const store = useUserStore();

    // 假设 login API 被 mock
    // 需要配合 Mock API
    // await store.login({ username: "test", password: "123456" })
    // expect(store.token).toBeTruthy()
    // expect(store.userInfo).not.toBeNull()
  });

  it("logout 清除 token 和 userInfo", () => {
    const store = useUserStore();
    // 先设置状态
    store.token = "test-token";
    store.userInfo = { id: "1", name: "Test" } as any;

    store.logout();

    expect(store.token).toBe("");
    expect(store.userInfo).toBeNull();
  });

  it("isLoggedIn getter 根据 token 返回正确值", () => {
    const store = useUserStore();

    expect(store.isLoggedIn).toBe(false);

    store.token = "some-token";
    expect(store.isLoggedIn).toBe(true);
  });
});
```

#### 有持久化的 Store 测试

项目中 Store 使用了 `pinia-plugin-persistedstate`，测试时需注意：

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

function createTestPinia() {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  return pinia;
}

describe("持久化 Store", () => {
  beforeEach(() => {
    // 清除 localStorage 避免测试间干扰
    localStorage.clear();
    setActivePinia(createTestPinia());
  });

  it("恢复持久化状态", () => {
    // 先设置 localStorage 模拟已持久化的数据
    localStorage.setItem(
      "csd-gfuc-web-app-state",
      JSON.stringify({
        lang: "en",
        timezone: "Europe/Paris"
      })
    );

    // 重新创建 Store，自动读取持久化数据
    const { useAppStore } = await import("@/store/app");
    const store = useAppStore();

    expect(store.lang).toBe("en");
    expect(store.timezone).toBe("Europe/Paris");
  });
});
```

### 4. Vue 组件测试

使用 `@vue/test-utils` 的 `mount` / `shallowMount`：

```typescript
// src/components/SvgIcon/index.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SvgIcon from "./index.vue";

describe("SvgIcon", () => {
  it("根据 name prop 渲染正确的 SVG 图标", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "icon-test" }
    });

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.html()).toContain("icon-test");
  });

  it("渲染自定义 class", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "icon-test", className: "custom-icon" }
    });

    expect(wrapper.find(".custom-icon").exists()).toBe(true);
  });
});
```

#### 带 Pinia 的组件测试

```typescript
// src/components/AuthView/index.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import AuthView from "./index.vue";

describe("AuthView", () => {
  beforeEach(() => {
    // 使用 @pinia/testing 创建测试 Pinia
    const pinia = createTestingPinia({
      initialState: {
        user: {
          token: "mock-token",
          userInfo: { name: "Test User" }
        }
      }
      // stubActions: false, // 设为 false 让 actions 真实执行
    });

    mount(AuthView, {
      global: { plugins: [pinia] }
    });
  });

  it("已登录时显示用户信息", () => {
    const wrapper = mount(AuthView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              user: { token: "test-token", userInfo: { name: "张三" } }
            }
          })
        ]
      }
    });

    expect(wrapper.text()).toContain("张三");
  });

  it("未登录时显示登录按钮", () => {
    const wrapper = mount(AuthView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { user: { token: "", userInfo: null } }
          })
        ]
      }
    });

    expect(wrapper.text()).toContain("登录");
  });
});
```

#### emit 测试

```typescript
// src/components/SelectDropdown/index.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SelectDropdown from "./index.vue";

describe("SelectDropdown", () => {
  it("选择选项后触发 change 事件", async () => {
    const wrapper = mount(SelectDropdown, {
      props: {
        options: [
          { label: "选项A", value: "a" },
          { label: "选项B", value: "b" }
        ]
      }
    });

    // 模拟选择
    await wrapper.find(".el-select").trigger("change", "b");

    expect(wrapper.emitted("change")).toBeTruthy();
    expect(wrapper.emitted("change")![0]).toEqual(["b"]);
  });
});
```

### 5. Composables / Hooks 测试

```typescript
// src/hooks/useDict.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// Mock API
vi.mock("@/api/common", () => ({
  getDictList: vi.fn().mockResolvedValue([
    { dictValue: "1", dictLabel: "类型A" },
    { dictValue: "2", dictLabel: "类型B" }
  ])
}));

describe("useDict", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("根据 code 返回字典选项列表", async () => {
    const { useDict } = await import("./useDict");
    const { dictList, getLabel } = useDict("order_type");

    // 首次调用会触发 API 请求
    // 等待异步完成
    await new Promise(process.nextTick);

    expect(dictList.value).toHaveLength(2);
    expect(getLabel("1")).toBe("类型A");
    expect(getLabel("3")).toBeUndefined();
  });
});
```

---

## 运行测试

```bash
# 运行所有测试（单次）
pnpm test

# 监听模式（开发时使用）
pnpm test:watch

# 运行特定文件
pnpm test -- src/utils/index.test.ts
pnpm test -- src/store/user.test.ts

# 按文件名模式匹配
pnpm test -- user        # 匹配所有包含 user 的测试文件
pnpm test -- "store/*"   # 匹配 store 目录下的测试

# 运行覆盖率
pnpm test:coverage

# 打开 Vitest UI
pnpm test:ui
```

---

## 覆盖率目标

| 模块              | 目标覆盖率 | 说明                         |
| ----------------- | ---------- | ---------------------------- |
| `src/utils/`      | ≥ 80%      | 纯函数，容易覆盖             |
| `src/api/`        | ≥ 70%      | 接口封装层                   |
| `src/store/`      | ≥ 70%      | 状态管理核心逻辑             |
| `src/hooks/`      | ≥ 70%      | 可复用的组合式函数           |
| `src/components/` | ≥ 60%      | 共享组件（基础 + 复杂）      |
| `src/views/`      | ≥ 40%      | 页面组件（优先关键交互路径） |
| **全项目**        | **≥ 60%**  | 全局最低线                   |

> 初期可以先从工具函数和 API 层入手，逐步覆盖 Store 和组件。覆盖率是辅助工具，**不追求 100%**，重点关注核心业务逻辑。

---

## 最佳实践

### 原则

1. **测试行为，不要测试实现**：断言输出结果，而不是内部变量名
2. **每个 it 只测一个关注点**：一个测试用例只验证一个行为
3. **避免测试框架本身**：不要断言 Vue/Element Plus 的内部行为
4. **测试贴近真实使用方式**：mount 的行为越接近真实用户，测试越有价值

### 编码规范

- 测试描述使用中文，格式：`it("场景 → 期望", ...)`
- 使用 Arrange → Act → Assert 三段式注释分隔
- Mock 数据放在 `__mocks__/` 目录或被 `vi.mock` 顶部引用
- 避免在测试中修改全局状态（除非必要并在 teardown 中恢复）
- 每个 `beforeEach` 重置测试间的共享状态

### 常见陷阱

| 陷阱                      | 解决方案                                         |
| ------------------------- | ------------------------------------------------ |
| 组件测试超时              | 检查异步操作是否缺少 `await`                     |
| 全局 CSS 报错             | 配置 `css: false` 或 `css: { modules: { ... } }` |
| Element Plus 组件无法挂载 | 使用 `global.plugins` 或 `shallowMount`          |
| Router 相关测试报错       | 使用 `global.plugins: [createRouter(...)]`       |
| i18n 未初始化             | 使用 `global.mocks: { $t: (key) => key }`        |
| Store 测试受之前测试影响  | 每个测试前调用 `setActivePinia(createPinia())`   |
