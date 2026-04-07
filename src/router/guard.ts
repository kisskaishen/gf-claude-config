import type { Router } from "vue-router";
import { useUserStoreWithOut } from "@/store/user";
import { i18n, loadI18nMap } from "@/lang";
import { useAppStore } from "@/store/app";
const whiteList = ["/login"];

export function setupRouteGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStoreWithOut();
    const appStore = useAppStore();

    console.log("+++", userStore, appStore);

    if (userStore.token && !userStore.isUserInfoUpdated) {
      await userStore.fetchUserInfo();
    }

    if (userStore.token && !appStore.loadedI18nMap) {
      await loadI18nMap();
      appStore.setLoadedI18nMap(true);
    }

    if (userStore.token) {
      if (to.path === "/login") {
        // 已登录，跳转到首页
        next({ path: "/" });
      } else {
        next();
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        // 在免登录白名单，直接进入
        next();
      } else {
        // 否则全部重定向到登录页
        next(`/login?redirect=${to.path}`);
      }
    }
  });

  router.afterEach((to, _from) => {
    document.title = (to.meta.title as string)
      ? i18n.global.t(to.meta.title as string)
      : i18n.global.t("web.gfuc.user_center" /** 用户中心 **/);
  });
}
