<template>
  <div class="login-container">
    <!-- 语言切换 -->
    <!-- <LangSelect /> -->
    <div class="right-top">
      <svg-icon class="icon-earth" name="earth" />
      <LangSelect />
    </div>
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
            <span class="header-title">{{
              $t("web.gfuc.user_center" /** 用户中心 **/)
            }}</span>
          </div>

          <!-- 登录表单 -->
          <LoginForm
            v-if="mode === 'login'"
            :email="registerData.email"
            @success="handleSuccess"
            @switch="handleSwitch"
          />

          <!-- 注册表单 -->
          <RegisterForm
            v-else-if="mode === 'register'"
            :register-data="registerData"
            @success="handleSuccess"
            @switch="handleSwitch"
          />
          <!-- 验证码表单 -->
          <VerifyCodeForm
            v-else-if="mode === 'verify'"
            :register-data="registerData"
            @success="handleSuccess"
            @switch="handleSwitch"
          />
        </div>
      </div>
    </div>

    <!-- 偏好设置弹窗 -->
    <PreferenceModal
      v-if="showPreferenceModal"
      v-model="showPreferenceModal"
      @success="redirectToHome"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";

import { useI18n } from "vue-i18n";
import LoginForm from "./components/LoginForm.vue";
import RegisterForm from "./components/RegisterForm.vue";
import VerifyCodeForm from "./components/verifyCodeForm.vue";
import PreferenceModal from "./components/PreferenceModal.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import { useAppStore } from "@/store/app";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const appStore = useAppStore();

const showPreferenceModal = ref(false);

const mode = ref<"login" | "register" | "verify">("login");
const registerData = ref({
  email: "",
  password: "",
  agree1: false,
  agree2: false
});

const handleSwitch = (
  _mode: "login" | "register" | "verify",
  data?: typeof registerData.value
) => {
  if (data) {
    registerData.value = { ...registerData.value, ...data };
  }
  mode.value = _mode;
};

const handleSuccess = async (type: "login" | "register") => {
  if (type === "login") {
    if (userStore.hasSetPreference || appStore.timezone) {
      ElMessage.success(t("web.gfuc.login_successful" /** 登录成功 **/));
      redirectToHome();
    } else {
      showPreferenceModal.value = true;
    }
  } else {
    ElMessage.success(
      t("web.gfuc.registration_success_please_login" /** 注册成功，请登录 **/)
    );
    mode.value = "login";
  }
};

const redirectToHome = () => {
  appStore.setLoadedI18nMap(false);
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

.right-top {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 16px;
  color: var(--text-color-tertiary);

  .icon-earth {
    font-size: 20px;
  }
}
</style>
