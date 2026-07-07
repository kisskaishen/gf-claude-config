<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
    <div class="logo">
      <img src="@/assets/logos/logo-red.png" alt="GOFO" />
      <span v-show="!isCollapse" class="logo-text">{{
        $t("gfuc.user_center" /** 用户中心 **/)
      }}</span>

      <div class="collapse-btn" @click="toggleCollapse">
        <div class="icon-wrapper">
          <img
            src="@/assets/svg-icons/collapse.svg"
            class="collapse-icon"
            :class="{ 'is-active': isCollapse }"
          />
        </div>
      </div>
    </div>

    <el-scrollbar class="sidebar-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        router
        class="el-menu-vertical"
      >
        <sidebar-item
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>

    <!-- 底部帮助中心和退出登录 -->
    <div class="sidebar-footer">
      <div class="help-entry" @click="handleGoHelp">
        <svg-icon name="help" width="24" height="24" />
        <span v-show="!isCollapse" class="help-text">{{
          $t("web.gfuc.help_center" /** 帮助中心 **/)
        }}</span>
      </div>
      <div class="logout-entry" @click="handleLogout">
        <svg-icon name="icon-logout" width="24" height="24" />
        <span v-show="!isCollapse" class="logout-text">{{
          $t("web.gfuc.logout" /** 退出登录 **/)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
import { ElMessageBox, ElMessage } from "element-plus";
import SidebarItem from "./SidebarItem.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const menuRoutes = computed(() => router.options.routes);
const activeMenu = computed(() => route.path);
const isCollapse = computed(() => !appStore.sidebar.opened);

const toggleCollapse = () => {
  appStore.toggleSidebar();
};

const handleGoHelp = () => {
  router.push("/help");
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      t("gfuc.confirm_logout_prompt" /** 确定要退出登录吗？ **/),
      t("gfuc.prompt" /** 提示 **/),
      {
        confirmButtonText: t("gfuc.confirm" /** 确定 **/),
        cancelButtonText: t("gfuc.cancel" /** 取消 **/),
        type: "warning"
      }
    );
    if (sessionStorage.getItem("balanceAlertNotShown")) {
      sessionStorage.removeItem("balanceAlertNotShown");
    }
    if (sessionStorage.getItem("single_order_form_data")) {
      sessionStorage.removeItem("single_order_form_data");
    }
    userStore.logout();
    router.push("/login");
    ElMessage.success(t("gfuc.logged_out" /** 已退出登录 **/));
  } catch {
    // 用户取消
  }
};
</script>

<style scoped lang="scss">
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  transition: width 0.3s;

  .logo {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;
    height: 54px;
    padding: 16px 0 12px 20px;
    overflow: visible;

    img {
      flex-shrink: 0;
      width: 32px;
    }

    .logo-text {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-color-primary);
      white-space: nowrap;
      transition: opacity 0.3s;
    }

    .collapse-btn {
      position: absolute;
      top: 50%;
      right: -16px;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      cursor: pointer;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 2px 0 4px rgb(0 0 0 / 10%);
      transform: translateY(-50%);

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
      }

      .collapse-icon {
        width: 14px;
        height: 14px;
        transition: transform 0.3s;

        &.is-active {
          transform: rotate(180deg);
        }
      }
    }
  }

  :deep(.el-menu) {
    width: 100%;
    border-right: none;

    // 一级菜单字体颜色
    .el-menu-item,
    .el-sub-menu__title {
      color: #000;
    }

    // 二级菜单字体颜色
    .el-menu--inline .el-menu-item {
      color: #525252;
    }

    &.el-menu--collapse {
      width: 100%;

      .el-sub-menu__icon-arrow {
        display: none;
      }

      .sidebar-title {
        display: none;
      }
    }
  }

  // .collapse-btn {
  //   height: 48px;
  //   margin-top: auto;
  //   cursor: pointer;

  //   .icon-wrapper {
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     width: 64px;
  //     height: 100%;
  //     margin-left: auto;
  //   }

  //   .collapse-icon {
  //     width: 16px;
  //     height: 16px;
  //     transition: transform 0.3s;

  //     &.is-active {
  //       transform: rotate(180deg);
  //     }
  //   }
  // }

  &.is-collapse {
    .logo {
      justify-content: center;
      padding-right: 0;
      padding-left: 0;
    }

    .collapse-btn {
      justify-content: center;
      padding-left: 0;
    }

    .sidebar-footer {
      .help-entry {
        justify-content: center;
        padding: 12px 0;
      }

      .logout-entry {
        justify-content: center;
        padding: 12px 0;
      }
    }
  }

  .sidebar-menu-wrapper {
    flex: 1;
    min-height: 0;
  }

  .sidebar-footer {
    flex-shrink: 0;

    .help-entry {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgb(252 76 2 / 4%);
      }

      .help-text {
        font-size: var(--font-size-base);
        color: #999;
        white-space: nowrap;
      }
    }

    .logout-entry {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgb(252 76 2 / 4%);
      }

      .logout-text {
        font-size: var(--font-size-base);
        color: #999;
        white-space: nowrap;
      }
    }
  }
}
</style>
