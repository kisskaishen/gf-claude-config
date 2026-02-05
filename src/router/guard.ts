import type { Router } from "vue-router";
import { useUserStoreWithOut } from "@/store/user";
import { i18n } from "@/lang";
const whiteList = ["/login"];

export function setupRouteGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStoreWithOut();
    if (userStore.token && !userStore.isUserInfoUpdated) {
      await userStore.fetchUserInfo();
    }

    if (userStore.token && userStore.hasSetPreference) {
      if (to.path === "/login") {
        // 已登录，如果已设置偏好则跳转到首页，否则留在登录页设置偏好
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
      : i18n.global.t("用户中心");
  });
}
