<template>
  <div class="navbar-content">
    <div class="left-section">
      <!-- <TagsBreadcrumb /> -->
    </div>

    <div class="right-menu">
      <SiteSelect />

      <!-- 语言切换 -->
      <LangSelect />

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
        <el-avatar :size="30" :src="avatarImg"></el-avatar>
      </el-tooltip>

      <!-- 退出按钮 -->
      <div
        class="logout-btn"
        @click="handleLogout"
        :title="$t('gfuc.logout' /** 退出登录 **/)"
      >
        <img src="@/assets/logout.png" alt="switch" />
      </div>
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
import { useI18n } from "vue-i18n";
import avatarImg from "@/assets/avatar.png";

const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();

const userAccount = computed(() => userStore.userInfo?.account || "User");

/** 跳转到任务中心 */
const handleGoTaskCenter = () => {
  router.push("/task/list");
};
// --- 退出逻辑 ---
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
.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .left-section {
    flex: 1;
  }

  .right-menu {
    display: flex;
    gap: 24px;
    align-items: center;
    font-size: 14px;

    .task-center-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .logout-btn {
      margin-right: 40px;
      cursor: pointer;

      img {
        display: block;
        width: 30px;
        height: auto;
      }
    }
  }
}
</style>
