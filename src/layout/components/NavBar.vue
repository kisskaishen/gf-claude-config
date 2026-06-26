<template>
  <div class="navbar-content">
    <div class="left-section">
      <!-- <TagsBreadcrumb /> -->
    </div>

    <div class="right-menu">
      <div class="site-select-wrapper">
        <svg-icon name="icon-location" width="20" height="20" />
        <SiteSelect />
      </div>

      <!-- 语言切换 -->
      <div class="lang-select-wrapper">
        <svg-icon name="icon-language" width="20" height="20" />
        <LangSelect />
      </div>

      <!-- 时区选择 (带搜索) -->
      <TimezoneSelect />

      <!-- 任务中心 -->
      <el-tooltip
        :content="$t('web.gfuc.task_list' /** 任务中心 **/)"
        placement="bottom"
      >
        <div
          id="tour-task-center"
          class="task-center-btn"
          @click="handleGoTaskCenter"
        >
          <svg-icon name="upload-download" width="24" height="24" />
        </div>
      </el-tooltip>

      <!-- 用户头像 -->
      <el-tooltip :content="`${userAccount}`" placement="bottom">
        <div class="user-avatar">
          <svg-icon name="icon-user" width="14" height="14" />
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import TimezoneSelect from "@/components/TimezoneSelect/index.vue";
import SiteSelect from "@/components/SiteSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";

const router = useRouter();
const userStore = useUserStore();

const userAccount = computed(() => userStore.userInfo?.account || "User");

/** 跳转到任务中心 */
const handleGoTaskCenter = () => {
  router.push("/task/list");
};
</script>

<style scoped lang="scss">
.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .left-section {
    flex: 1;
  }

  .site-select-wrapper,
  .lang-select-wrapper {
    display: flex;
    gap: 4px;
    align-items: center;
    line-height: 1;
    color: #7a869a;

    :deep(.menu-item) {
      color: #000;
    }
  }

  :deep(.timezone-item) {
    color: #000;
  }

  .right-menu {
    display: flex;
    gap: 24px;
    align-items: center;
    padding-right: 24px;
    font-size: 14px;

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      cursor: pointer;
      background-color: #ffc5ac;
      border-radius: 50%;
    }

    .task-center-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
