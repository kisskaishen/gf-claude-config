import { describe, it, expect } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("应定义登录路由", () => {
    const login = routes.find((r) => r.name === "Login");
    expect(login).toBeDefined();
    expect(login?.path).toBe("/login");
    expect(login?.meta?.hidden).toBe(true);
  });

  it("首页路由应设为affix固定标签", () => {
    const root = routes.find((r) => r.path === "/");
    expect(root).toBeDefined();
    expect(root?.redirect).toBe("/home");

    const home = root?.children?.find((c) => c.name === "Home");
    expect(home).toBeDefined();
    expect(home?.meta?.affix).toBe(true);
  });

  it("订单模块应包含所有子路由", () => {
    const order = routes.find((r) => r.path === "/order");
    expect(order).toBeDefined();
    expect(order?.meta?.requireAuth).toBe(true);

    const names = order?.children?.map((c) => c.name);
    expect(names).toContain("SingleOrder");
    expect(names).toContain("SingleOrderWithParams");
    expect(names).toContain("OrderDetail");
    expect(names).toContain("BatchOrder");
    expect(names).toContain("OrderList");
  });

  it("财务模块应包含所有子路由", () => {
    const finance = routes.find((r) => r.path === "/finance");
    expect(finance).toBeDefined();
    expect(finance?.redirect).toBe("/finance/balance");

    const names = finance?.children?.map((c) => c.name);
    expect(names).toContain("Recharge");
    expect(names).toContain("RechargeRecord");
    expect(names).toContain("Balance");
    expect(names).toContain("Account");
  });

  it("所有懒加载路由应使用动态import", () => {
    const allRoutes = [...routes];

    for (const route of allRoutes) {
      if (route.component) {
        // 懒加载组件应为函数
        expect(typeof route.component).toBe("function");
      }
      if (route.children) {
        for (const child of route.children) {
          if (child.component) {
            expect(typeof child.component).toBe("function");
          }
        }
      }
    }
  });

  it("应包含重定向路由", () => {
    const redirect = routes.find((r) => r.path === "/redirect");
    expect(redirect).toBeDefined();
    expect(redirect?.meta?.hidden).toBe(true);
  });

  it("应包含404通配路由", () => {
    const notFound = routes.find((r) => r.path === "/404");
    expect(notFound).toBeDefined();
    expect(notFound?.name).toBe("404");
  });

  it("应包含catch-all通配路由重定向到404", () => {
    const catchAll = routes.find((r) => r.path === "/:pathMatch(.*)*");
    expect(catchAll).toBeDefined();
    expect(catchAll?.redirect).toBe("/404");
  });

  it("订单详情路由应带参数且hidden", () => {
    const order = routes.find((r) => r.path === "/order");
    const detail = order?.children?.find((c) => c.name === "OrderDetail");
    expect(detail).toBeDefined();
    expect(detail?.path).toContain(":orderId");
    expect(detail?.meta?.hidden).toBe(true);
  });

  it("帮助中心应包含详情路由", () => {
    const help = routes.find((r) => r.path === "/help");
    expect(help).toBeDefined();

    const detail = help?.children?.find((c) => c.name === "HelpDetail");
    expect(detail).toBeDefined();
    expect(detail?.path).toContain(":id");
    expect(detail?.meta?.hidden).toBe(true);
  });
});
