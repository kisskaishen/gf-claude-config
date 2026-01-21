import { ref } from "vue";
import { defineStore } from "pinia";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export interface TagView {
  name: string;
  path: string;
  title?: string;
  query?: any;
  params?: any;
  meta?: any;
}

export const useTagsViewStore = defineStore(
  "tagsView",
  () => {
    const visitedViews = ref<TagView[]>([]);
    const cachedViews = ref<string[]>([]);

    // 添加访问过的视图
    const addVisitedView = (route: RouteLocationNormalizedLoaded) => {
      if (visitedViews.value.some((v) => v.path === route.path)) return;

      visitedViews.value.push({
        name: route.name as string,
        path: route.path,
        title: (route.meta?.title as string) || "no-name",
        query: route.query,
        params: route.params,
        meta: route.meta
      });
    };

    // 添加缓存视图
    const addCachedView = (route: RouteLocationNormalizedLoaded) => {
      if (cachedViews.value.includes(route.name as string)) return;
      if (!route.meta?.noCache) {
        cachedViews.value.push(route.name as string);
      }
    };

    // 添加标签
    const addView = (route: RouteLocationNormalizedLoaded) => {
      addVisitedView(route);
      addCachedView(route);
    };

    // 删除访问过的视图
    const delVisitedView = (view: TagView) => {
      return new Promise<TagView[]>((resolve) => {
        for (const [i, v] of visitedViews.value.entries()) {
          if (v.path === view.path) {
            visitedViews.value.splice(i, 1);
            break;
          }
        }
        resolve([...visitedViews.value]);
      });
    };

    // 删除缓存视图
    const delCachedView = (view: TagView) => {
      return new Promise<string[]>((resolve) => {
        const index = cachedViews.value.indexOf(view.name);
        if (index > -1) {
          cachedViews.value.splice(index, 1);
        }
        resolve([...cachedViews.value]);
      });
    };

    // 删除标签
    const delView = (view: TagView) => {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>(
        (resolve) => {
          delVisitedView(view);
          delCachedView(view);
          resolve({
            visitedViews: [...visitedViews.value],
            cachedViews: [...cachedViews.value]
          });
        }
      );
    };

    // 删除其他标签
    const delOthersViews = (view: TagView) => {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>(
        (resolve) => {
          visitedViews.value = visitedViews.value.filter((v) => {
            return v.path === view.path;
          });
          cachedViews.value = cachedViews.value.filter((name) => {
            return name === view.name;
          });
          resolve({
            visitedViews: [...visitedViews.value],
            cachedViews: [...cachedViews.value]
          });
        }
      );
    };

    // 删除所有标签
    const delAllViews = () => {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>(
        (resolve) => {
          visitedViews.value = [];
          cachedViews.value = [];
          resolve({
            visitedViews: [...visitedViews.value],
            cachedViews: [...cachedViews.value]
          });
        }
      );
    };

    return {
      visitedViews,
      cachedViews,
      addView,
      addVisitedView,
      delView,
      delCachedView,
      delOthersViews,
      delAllViews
    };
  },
  {
    persist: {
      key: "dbu-tags-view",
      storage: sessionStorage,
      pick: ["visitedViews", "cachedViews"]
    }
  }
);
