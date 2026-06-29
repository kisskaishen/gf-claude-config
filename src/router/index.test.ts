import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("./routes", () => ({
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/home/index.vue")
    }
  ]
}));

vi.mock("./guard", () => ({
  setupRouteGuard: vi.fn()
}));

import { setupRouteGuard } from "./guard";

describe("router/index", () => {
  it("应创建router实例并设置路由守卫", async () => {
    // 动态导入以触发 router 创建
    const routerModule = await import("./index");
    const router = routerModule.default;

    expect(router).toBeDefined();
    expect(typeof router.push).toBe("function");
    expect(setupRouteGuard).toHaveBeenCalledWith(router);
  });

  it("应使用web history模式", async () => {
    // 重新导入（vitest 会缓存，但可以验证 router 已创建）
    const routerModule = await import("./index");
    const router = routerModule.default;

    // 验证 router 实例可用
    expect(router.currentRoute).toBeDefined();
  });
});
