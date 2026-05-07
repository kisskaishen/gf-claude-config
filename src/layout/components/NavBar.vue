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

      <!-- 用户头像 -->
      <el-avatar :size="30" :src="avatarImg"></el-avatar>

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
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import TimezoneSelect from "@/components/TimezoneSelect/index.vue";
import SiteSelect from "@/components/SiteSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import { useI18n } from "vue-i18n";
import avatarImg from "@/assets/avatar.png";

const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();

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
