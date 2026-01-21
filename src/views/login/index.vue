<template>
  <div class="login-container">
    <!-- 左侧装饰区 -->
    <div class="login-left">
      <div class="top-decor">
        <img src="@/assets/login/bg-top.png" alt="GOFO" />
      </div>

      <!-- 底部大图标装饰 -->
      <div class="bottom-decor">
        <img src="@/assets/login/bg-bottom.png" alt="" />
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="login-right">
      <div class="login-card">
        <div class="auth-form-container">
          <div class="card-header">
            <div class="header-logo">
              <img
                src="@/assets/logos/logo-red.png"
                alt="GOFO"
                class="inner-logo-img"
              />
            </div>
            <span class="header-title">{{ $t("客户平台") }}</span>
          </div>

          <!-- 登录表单 -->
          <LoginForm
            v-if="mode === 'login'"
            @success="handleSuccess"
            @switch="handleSwitch"
          />

          <!-- 注册表单 -->

          <RegisterForm
            v-else-if="mode === 'register'"
            @success="handleSuccess"
            @switch="handleSwitch"
          />
          <!-- 验证码表单 -->
          <VerifyCodeForm
            v-else-if="mode === 'verify'"
            @success="handleSuccess"
            @switch="handleSwitch"
          />
        </div>
      </div>
    </div>

    <!-- 偏好设置弹窗 -->
    <PreferenceModal @confirm="handlePreferenceConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";
import { useI18n } from "vue-i18n";
import LoginForm from "./components/LoginForm.vue";
import RegisterForm from "./components/RegisterForm.vue";
import VerifyCodeForm from "./components/VerifyCodeForm.vue";
import PreferenceModal from "@/components/PreferenceModal/index.vue";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const appStore = useAppStore();

const mode = ref<"login" | "register" | "verify">("login");

const handleSwitch = (_mode: "login" | "register" | "verify") => {
  mode.value = _mode;
};

const handleSuccess = async (type: "login" | "register") => {
  if (type === "login") {
    // 模拟登录成功
    await userStore.login({
      token: "mock-token",
      userInfo: {
        name: "Admin",
        avatar: ""
      }
    });

    // 1. 登录后立即尝试获取云端偏好
    await appStore.fetchPreferences();

    // 2. 如果已经设置过偏好 (来自本地或云端)，直接跳转
    if (appStore.hasSetPreference) {
      redirectToHome();
    } else {
      // 3. 否则触发弹窗
      appStore.setFirstLogin(true);
      ElMessage.success(t("登录成功，请设置您的偏好"));
    }
  } else {
    ElMessage.success(t("注册成功，请登录"));
    mode.value = "login";
  }
};

const handlePreferenceConfirm = () => {
  redirectToHome();
};

const redirectToHome = () => {
  ElMessage.success(t("登录成功"));
  const redirect = route.query.redirect as string;
  if (redirect && redirect !== "/login") {
    router.push(redirect);
  } else {
    router.push("/");
  }
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
}

.login-left {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 375px;
  padding: 60px 40px;
  color: #fff;
  background-color: var(--color-primary);

  img {
    width: 100%;
    height: auto;
  }

  .top-decor {
    position: absolute;
    top: 0;
    left: 0;
    width: 289px;
  }

  .bottom-decor {
    position: absolute;
    bottom: -17px;
    left: -9px;
    width: 416px;
  }
}

.login-right {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.login-card {
  width: 480px;
  padding: 40px 40px 22px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 #4f577d14;
  backdrop-filter: blur(66px);
}

.auth-form-container {
  --color: #999;

  width: 100%;
  font-size: 14px;
  color: var(--color);

  :deep(.el-form-item__label::before) {
    content: "" !important;
  }
}

.card-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  .header-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;

    .inner-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .header-title {
    font-size: 28px;
    font-weight: 600;
    color: #1d2129;
  }
}
</style>
