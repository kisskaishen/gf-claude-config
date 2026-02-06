import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { setupRouteGuard } from "./guard";

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 设置路由守卫
setupRouteGuard(router);

export default router;
