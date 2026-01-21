import { ref } from "vue";
import { defineStore } from "pinia";
import { routes as constantRoutes } from "@/router/routes";

export const usePermissionStore = defineStore("permission", () => {
  // State: 使用 shallowRef 优化长列表性能
  const routes = ref<any[]>([]);

  // 内部工具函数：判断是否有权限
  const hasPermission = (userRoles: string[], route: any) => {
    if (route.meta && route.meta.roles) {
      return userRoles.some((role) => route.meta.roles.includes(role));
    }
    return true;
  };

  // Action: 生成路由
  const generateRoutes = (userRoles: string[]) => {
    const accessedRoutes = constantRoutes.filter((route) => {
      if (hasPermission(userRoles, route)) {
        if (route.children) {
          route.children = route.children.filter((child) =>
            hasPermission(userRoles, child)
          );
        }
        return true;
      }
      return false;
    });
    routes.value = accessedRoutes;
  };

  return { routes, generateRoutes };
});
