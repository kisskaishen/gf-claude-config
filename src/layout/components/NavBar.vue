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

      <!-- 用户头像 (文字) -->
      <el-avatar :size="30" class="user-avatar-text">MT</el-avatar>

      <!-- 退出按钮 -->
      <div class="logout-btn" @click="handleLogout" :title="t('退出登录')">
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

const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();

// --- 退出逻辑 ---
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(t("确定要退出登录吗？"), t("提示"), {
      confirmButtonText: t("确定"),
      cancelButtonText: t("取消"),
      type: "warning"
    });

    userStore.logout();
    router.push("/login");
    ElMessage.success(t("已退出登录"));
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

    .user-avatar-text {
      font-size: 12px;
      font-weight: 500;
      color: #fff;
      cursor: pointer;
      background-color: #0eb0be; /* 青色背景 */
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
