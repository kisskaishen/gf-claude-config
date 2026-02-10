import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true } // 登录页不在菜单显示
  },
  // {
  //   path: "/",
  //   component: () => import("@/layout/index.vue"),
  //   redirect: "/home",
  //   meta: { showOnlyOneChild: true },
  //   children: [
  //     {
  //       path: "home",
  //       name: "Home",
  //       component: () => import("@/views/home/index.vue"),
  //       meta: {
  //         title: "首页",
  //         icon: "home",
  //         i18n: "web.gfuc.homepage",
  //         affix: true
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: "/order",
  //   component: () => import("@/layout/index.vue"),
  //   redirect: "/order/single",
  //   meta: {
  //     title: "订单管理",
  //     icon: "order",
  //     i18n: "web.gfuc.order_management",
  //     requireAuth: true
  //   },
  //   children: [
  //     {
  //       path: "single",
  //       name: "SingleOrder",
  //       // component: () => import("@/views/order/single.vue"),
  //       component: () => import("@/views/home/index.vue"),
  //       meta: {
  //         title: "单票下单",
  //         i18n: "web.gfuc.single_ticket_order",
  //         requireAuth: true
  //       }
  //     },
  //     {
  //       path: "batch",
  //       name: "BatchOrder",
  //       // component: () => import("@/views/order/batch.vue"),
  //       component: () => import("@/views/home/index.vue"),
  //       meta: {
  //         title: "批量下单",
  //         i18n: "web.gfuc.batch_order",
  //         requireAuth: true
  //       }
  //     },
  //     {
  //       path: "list",
  //       name: "OrderList",
  //       // component: () => import("@/views/order/list.vue"),
  //       component: () => import("@/views/home/index.vue"),
  //       meta: {
  //         title: "订单列表",
  //         i18n: "web.gfuc.order_list",
  //         requireAuth: true
  //       }
  //     }
  //   ]
  // },
  {
    path: "/finance",
    component: () => import("@/layout/index.vue"),
    redirect: "/finance/recharge",
    meta: {
      title: "财务管理",
      icon: "finance",
      i18n: "web.gfuc.financial_management"
    },
    children: [
      {
        path: "recharge",
        name: "Recharge",
        component: () => import("@/views/finance/recharge.vue"),
        meta: { title: "充值", requireAuth: true, i18n: "web.gfuc.recharge" }
      },
      {
        path: "record",
        name: "RechargeRecord",
        component: () => import("@/views/finance/record.vue"),
        meta: {
          title: "充值记录",
          requireAuth: true,
          i18n: "web.gfuc.recharge_record"
        }
      },
      {
        path: "balance",
        name: "Balance",
        component: () => import("@/views/finance/balance.vue"),
        meta: { title: "余额", requireAuth: true, i18n: "web.gfuc.balance" }
      }
      // {
      //   path: "account",
      //   name: "Account",
      //   component: () => import("@/views/home/index.vue"),
      //   meta: { title: "账单", requireAuth: true, i18n: "web.gfuc.bill" }
      // }
    ]
  },
  // {
  //   path: "/problem",
  //   redirect: "/problem/list",
  //   component: () => import("@/layout/index.vue"),
  //   meta: {
  //     title: "问题件管理",
  //     icon: "problem",
  //     i18n: "web.gfuc.problem_piece_management"
  //   },

  //   children: [
  //     {
  //       path: "list",
  //       name: "ProblemList",
  //       // component: () => import("@/views/problem/list.vue"),
  //       component: () => import("@/views/home/index.vue"),
  //       meta: {
  //         title: "问题件查看",
  //         i18n: "web.gfuc.problem_piece_view",
  //         requireAuth: true
  //       }
  //     }
  //   ]
  // },
  {
    path: "/redirect",
    component: () => import("@/layout/index.vue"),
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/error/404.vue"),
    meta: { hidden: true }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { hidden: true }
  }
];
