<template>
  <div class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in" appear>
        <keep-alive :include="cachedViews">
          <component
            :is="checkPermission(route) ? Component : AuthView"
            :key="route.fullPath"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import { useTagsViewStore } from "@/store/tagsView";
import AuthView from "@/components/AuthView/index.vue";
import { useUserStore } from "@/store/user";
const { userInfo, loginInfo } = useUserStore();

const tagsViewStore = useTagsViewStore();

const cachedViews = computed(() => tagsViewStore.cachedViews);

const checkPermission = (_route: RouteLocationNormalizedLoadedGeneric) => {
  if (
    _route.meta.requireAuth &&
    loginInfo?.userInfo.userIdentity === 1 &&
    loginInfo?.shipperCustomerList.length === 0
  ) {
    return false;
  }
  return true;
};
</script>

<style scoped lang="scss">
.app-main {
  background-color: var(--bg-color-white);
  border-radius: 4px;
}

/* fade-transform */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
