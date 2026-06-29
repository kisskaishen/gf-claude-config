import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted 中的变量供 vi.mock 工厂使用（在 import 前执行）
const { mockFetchUserInfo, mockLoadI18nMap, mockSetLoadedI18nMap, mockState } =
  vi.hoisted(() => {
    const mockFetchUserInfo = vi.fn().mockResolvedValue(undefined);
    const mockLoadI18nMap = vi.fn().mockResolvedValue(undefined);
    const mockSetLoadedI18nMap = vi.fn();
    // 可变状态用对象包装，确保 getter 读取最新值
    const mockState = {
      token: "",
      isUserInfoUpdated: false,
      loadedI18nMap: false
    };
    return {
      mockFetchUserInfo,
      mockLoadI18nMap,
      mockSetLoadedI18nMap,
      mockState
    };
  });

vi.mock("@/store/user", () => ({
  useUserStoreWithOut: vi.fn(() => ({
    get token() {
      return mockState.token;
    },
    get isUserInfoUpdated() {
      return mockState.isUserInfoUpdated;
    },
    fetchUserInfo: mockFetchUserInfo
  }))
}));

vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(() => ({
    get loadedI18nMap() {
      return mockState.loadedI18nMap;
    },
    setLoadedI18nMap: mockSetLoadedI18nMap,
    lang: "zh",
    timezone: "Local",
    site: "FR"
  }))
}));

vi.mock("@/lang", () => ({
  i18n: { global: { t: vi.fn((key: string) => key) } },
  loadI18nMap: mockLoadI18nMap
}));

import { setupRouteGuard } from "./guard";
import type {
  Router,
  RouteLocationNormalized,
  NavigationGuardNext
} from "vue-router";

describe("setupRouteGuard", () => {
  let beforeEachCallback: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => Promise<void>;
  let afterEachCallback: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void;

  const mockRouter = {
    beforeEach: vi.fn((cb: any) => {
      beforeEachCallback = cb;
    }),
    afterEach: vi.fn((cb: any) => {
      afterEachCallback = cb;
    })
  } as unknown as Router;

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.token = "";
    mockState.isUserInfoUpdated = false;
    mockState.loadedI18nMap = false;
    setupRouteGuard(mockRouter);
  });

  const createTo = (overrides: Partial<RouteLocationNormalized> = {}) =>
    ({
      path: "/home",
      name: "Home",
      meta: { title: "首页" },
      ...overrides
    }) as RouteLocationNormalized;

  const createFrom = () => ({ path: "/" }) as RouteLocationNormalized;

  describe("未登录用户（无token）", () => {
    it("访问白名单/login应放行", async () => {
      const next = vi.fn();
      const to = createTo({ path: "/login", name: "Login" });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith();
    });

    it("访问非白名单页面应重定向到/login", async () => {
      const next = vi.fn();
      const to = createTo({ path: "/order/list" });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith("/login?redirect=/order/list");
    });

    it("访问OrderDetail未登录应重定向到order/list", async () => {
      const next = vi.fn();
      const to = createTo({ path: "/order/detail/123", name: "OrderDetail" });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith("/login?redirect=/order/list");
    });

    it("访问SingleOrderWithParams未登录应重定向到order/list", async () => {
      const next = vi.fn();
      const to = createTo({
        path: "/order/single/123",
        name: "SingleOrderWithParams"
      });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith("/login?redirect=/order/list");
    });
  });

  describe("已登录用户（有token）", () => {
    beforeEach(() => {
      mockState.token = "valid-token";
    });

    it("访问/login应重定向到首页", async () => {
      const next = vi.fn();
      const to = createTo({ path: "/login", name: "Login" });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith({ path: "/" });
    });

    it("访问普通页面应放行", async () => {
      const next = vi.fn();
      const to = createTo({ path: "/home" });

      await beforeEachCallback(to, createFrom(), next);
      expect(next).toHaveBeenCalledWith();
    });

    it("首次加载且用户信息未更新时应获取用户信息", async () => {
      mockState.isUserInfoUpdated = false;
      const next = vi.fn();
      const to = createTo({ path: "/home" });

      await beforeEachCallback(to, createFrom(), next);
      expect(mockFetchUserInfo).toHaveBeenCalled();
    });

    it("用户信息已更新时不应重复获取", async () => {
      mockState.isUserInfoUpdated = true;
      const next = vi.fn();
      const to = createTo({ path: "/home" });

      await beforeEachCallback(to, createFrom(), next);
      expect(mockFetchUserInfo).not.toHaveBeenCalled();
    });

    it("首次加载应加载i18n词条", async () => {
      mockState.loadedI18nMap = false;
      const next = vi.fn();
      const to = createTo({ path: "/home" });

      await beforeEachCallback(to, createFrom(), next);
      expect(mockLoadI18nMap).toHaveBeenCalled();
      expect(mockSetLoadedI18nMap).toHaveBeenCalledWith(true);
    });

    it("i18n已加载时不应重复加载", async () => {
      mockState.loadedI18nMap = true;
      const next = vi.fn();
      const to = createTo({ path: "/home" });

      await beforeEachCallback(to, createFrom(), next);
      expect(mockLoadI18nMap).not.toHaveBeenCalled();
    });
  });

  describe("afterEach", () => {
    it("应设置页面标题", () => {
      const to = createTo({ path: "/home", meta: { title: "首页" } });
      expect(() => afterEachCallback(to, createFrom())).not.toThrow();
    });

    it("无title时应使用默认标题不抛异常", () => {
      const to = createTo({ path: "/unknown", meta: {} });
      expect(() => afterEachCallback(to, createFrom())).not.toThrow();
    });
  });
});
