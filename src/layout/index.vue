<template>
  <div class="layout-container">
    <InsufficientBalance />
    <aside class="sidebar-wrapper" :class="{ 'is-collapse': isCollapse }">
      <Sidebar />
    </aside>

    <div class="main-wrapper">
      <header class="layout-header">
        <NavBar />
      </header>

      <section class="layout-tags">
        <TagsView />
      </section>

      <main class="layout-main">
        <AppMain />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/store/app";
import Sidebar from "./components/Sidebar/index.vue";
import NavBar from "./components/NavBar.vue";
import TagsView from "./components/TagsView.vue";
import AppMain from "./components/AppMain.vue";
import InsufficientBalance from "./components/InsufficientBalance.vue";

const appStore = useAppStore();
const isCollapse = computed(() => !appStore.sidebar.opened);

const handleResize = () => {
  if (window.innerWidth < 1200) {
    appStore.sidebar.opened = false;
  } else {
    appStore.sidebar.opened = true;
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;

  .sidebar-wrapper {
    position: relative;
    z-index: 10;
    width: 270px;
    overflow: visible;
    background-color: #fff;
    box-shadow: 0 6px 15px 0 #0000000f;
    transition: width 0.3s;

    @media (width <= 1440px) {
      width: 248px;
    }

    &.is-collapse {
      width: 64px;
    }
  }

  .main-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 1000px;
    overflow: hidden;
    background-color: var(--bg-color);

    .layout-header {
      height: var(--header-height);
      background: #fff;
      border-bottom: 1px solid var(--border-color-light);
    }

    .layout-tags {
      height: var(--tags-height);
      background: #fff;
      border-bottom: 1px solid var(--border-color-light);
    }

    .layout-main {
      flex: 1;
      padding: 16px 0 0 16px;
      overflow-y: auto;
    }
  }
}
</style>
