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

    <el-scrollbar>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import SidebarItem from "./SidebarItem.vue";
import { DArrowLeft, DArrowRight } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const menuRoutes = computed(() => router.options.routes);
const activeMenu = computed(() => route.path);
const isCollapse = computed(() => !appStore.sidebar.opened);

const toggleCollapse = () => {
  appStore.toggleSidebar();
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
      font-size: var(--font-size-md);
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
  }
}
</style>
