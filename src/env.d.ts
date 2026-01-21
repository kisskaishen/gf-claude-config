/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    icon?: string;
    breadcrumb?: boolean;
    /** 是否在左侧菜单中隐藏 */
    hidden?: boolean;
    /** 是否显示唯一子路由 */
    showOnlyOneChild?: boolean;
    /** 是否需要判断账号绑定 */
    requireAuth?: boolean;
  }
}
