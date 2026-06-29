import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTagsViewStore, type TagView } from "./tagsView";

// Mock route for tagsView
const mockRoute = {
  name: "TestPage",
  path: "/test",
  meta: { title: "Test Page" },
  query: {},
  params: {}
} as any;

describe("useTagsViewStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("addView / addVisitedView", () => {
    it("应添加新标签到visitedViews", () => {
      const store = useTagsViewStore();
      store.addVisitedView(mockRoute);

      expect(store.visitedViews).toHaveLength(1);
      expect(store.visitedViews[0].path).toBe("/test");
      expect(store.visitedViews[0].name).toBe("TestPage");
    });

    it("相同路径重复添加应跳过", () => {
      const store = useTagsViewStore();
      store.addVisitedView(mockRoute);
      store.addVisitedView(mockRoute);

      expect(store.visitedViews).toHaveLength(1);
    });

    it("addView应同时添加visitedView和cachedView", () => {
      const store = useTagsViewStore();
      store.addView(mockRoute);

      expect(store.visitedViews).toHaveLength(1);
      expect(store.cachedViews).toContain("TestPage");
    });

    it("meta.noCache为true时不应添加cachedView", () => {
      const store = useTagsViewStore();
      store.addView({
        ...mockRoute,
        meta: { title: "No Cache", noCache: true }
      } as any);

      expect(store.visitedViews).toHaveLength(1);
      expect(store.cachedViews).toHaveLength(0);
    });

    it("SingleOrder路由应单例覆盖已存在的同类标签", () => {
      const store = useTagsViewStore();

      // 添加第一个单票下单标签
      store.addVisitedView({
        name: "SingleOrder",
        path: "/order/single/1",
        meta: { title: "单票下单-1" }
      } as any);

      // 添加第二个单票下单标签（应覆盖第一个）
      store.addVisitedView({
        name: "SingleOrder",
        path: "/order/single/2",
        meta: { title: "单票下单-2" }
      } as any);

      expect(store.visitedViews).toHaveLength(1);
      expect(store.visitedViews[0].path).toBe("/order/single/2");
    });

    it("OrderDetail路由应单例覆盖已存在的同类标签", () => {
      const store = useTagsViewStore();

      store.addVisitedView({
        name: "OrderDetail",
        path: "/order/detail/1",
        meta: { title: "订单详情-1" }
      } as any);

      store.addVisitedView({
        name: "OrderDetail",
        path: "/order/detail/2",
        meta: { title: "订单详情-2" }
      } as any);

      expect(store.visitedViews).toHaveLength(1);
      expect(store.visitedViews[0].path).toBe("/order/detail/2");
    });
  });

  describe("delView", () => {
    it("应删除指定标签", async () => {
      const store = useTagsViewStore();
      store.addVisitedView(mockRoute);

      const tag: TagView = {
        name: "TestPage",
        path: "/test"
      };

      const { visitedViews } = await store.delView(tag);
      expect(visitedViews).toHaveLength(0);
    });

    it("删除不存在的标签不应报错", async () => {
      const store = useTagsViewStore();
      store.addVisitedView(mockRoute);

      const tag: TagView = { name: "NonExistent", path: "/none" };
      const { visitedViews } = await store.delView(tag);

      expect(visitedViews).toHaveLength(1);
    });
  });

  describe("delCachedView", () => {
    it("应删除缓存视图", async () => {
      const store = useTagsViewStore();
      store.addView(mockRoute);

      const tag: TagView = { name: "TestPage", path: "/test" };
      const cachedViews = await store.delCachedView(tag);

      expect(cachedViews).toHaveLength(0);
    });
  });

  describe("delOthersViews", () => {
    it("应删除除指定标签外的所有标签", async () => {
      const store = useTagsViewStore();

      store.addVisitedView(mockRoute);
      store.addVisitedView({
        name: "OtherPage",
        path: "/other",
        meta: { title: "Other" }
      } as any);

      const tag: TagView = { name: "TestPage", path: "/test" };
      const { visitedViews } = await store.delOthersViews(tag);

      expect(visitedViews).toHaveLength(1);
      expect(visitedViews[0].path).toBe("/test");
    });
  });

  describe("delAllViews", () => {
    it("应删除所有标签", async () => {
      const store = useTagsViewStore();
      store.addVisitedView(mockRoute);
      store.addVisitedView({
        name: "OtherPage",
        path: "/other",
        meta: { title: "Other" }
      } as any);

      const { visitedViews, cachedViews } = await store.delAllViews();

      expect(visitedViews).toHaveLength(0);
      expect(cachedViews).toHaveLength(0);
    });
  });
});
