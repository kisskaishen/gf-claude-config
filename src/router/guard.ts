import type { Router } from "vue-router";
import { useUserStoreWithOut } from "@/store/user";
import { useAppStoreWithOut } from "@/store/app";

const whiteList = ["/login"];

export function setupRouteGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    const userStore = useUserStoreWithOut();
    const appStore = useAppStoreWithOut();
    const hasToken = userStore.token;

    if (hasToken) {
      if (to.path === "/login") {
        // 已登录，如果已设置偏好则跳转到首页，否则留在登录页设置偏好
        if (appStore.hasSetPreference) {
          next({ path: "/" });
        } else {
          next();
        }
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
}
