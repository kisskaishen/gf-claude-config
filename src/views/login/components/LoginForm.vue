<template>
  <el-form
    ref="loginFormRef"
    :model="loginData"
    :rules="loginRules"
    label-position="top"
    class="form-body"
  >
    <el-form-item :label="$t('邮箱')" prop="email">
      <el-input v-model="loginData.email" :placeholder="$t('请输入邮箱')" />
    </el-form-item>
    <el-form-item :label="$t('密码')" prop="password">
      <el-input
        v-model="loginData.password"
        type="password"
        :placeholder="$t('请输入密码')"
        show-password
      />
    </el-form-item>

    <!-- 图片验证码-->
    <el-form-item v-if="showCaptcha" :label="$t('验证码')" prop="captcha">
      <div class="captcha-wrapper">
        <el-input
          v-model="loginData.captcha"
          :placeholder="$t('请输入图片验证码')"
          class="captcha-input"
        />
        <div class="captcha-img" @click="refreshCaptcha">
          <span>T 4 F R</span>
        </div>
      </div>
    </el-form-item>

    <div class="form-actions">
      <el-button type="primary" class="submit-btn" @click="handleLogin">{{
        $t("登录")
      }}</el-button>
    </div>

    <div class="form-footer">
      <span>{{ $t("还没有账号？") }}</span>
      <a
        href="javascript:;"
        class="link"
        @click="$emit('switch', 'register')"
        >{{ $t("去注册") }}</a
      >
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { type FormInstance, type FormRules } from "element-plus";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";

const emit = defineEmits(["switch", "success"]);

const { t } = useI18n();

const userStore = useUserStore();

// --- 登录逻辑 ---
const showCaptcha = ref(false);
const loginData = reactive({
  email: "",
  password: "",
  captcha: ""
});

const loginFormRef = ref<FormInstance>();

const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "change" },
    {
      type: "email",
      message: t("您输入的邮箱格式不对，请填写正确的邮箱"),
      trigger: "change"
    }
  ],
  password: [{ required: true, message: t("请输入密码"), trigger: "change" }],
  captcha: [{ required: true, message: t("请输入验证码"), trigger: "change" }]
});

// 1. 监听显示状态，第一次显示时自动获取
watch(showCaptcha, (val) => {
  if (val) {
    refreshCaptcha();
  }
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.login(loginData);
        showCaptcha.value = false;
        emit("success", "login");
      } catch (error: any) {
        if (showCaptcha.value) {
          refreshCaptcha();
        }
      }
    }
  });
};

const refreshCaptcha = () => {
  // ElMessage.info(t("验证码已刷新"));
};
</script>
<style lang="scss" scoped>
.form-body {
  --el-component-size-large: 48px;
  --form-item--label: #4e5969;

  :deep(.el-input__password) {
    font-size: 20px;
    color: #828ab0;
  }

  :deep(.el-form-item__label) {
    margin-bottom: 6px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  .email-input {
    :deep(.el-input__icon) {
      font-size: 16px;
      color: var(--color-success);
    }
  }

  .captcha-wrapper {
    display: flex;
    gap: 16px;
    width: 100%;

    .captcha-input {
      flex: 1;
    }

    .captcha-img {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 140px;
      height: 48px;
      font-family: "Courier New", Courier, monospace;
      font-weight: bold;
      color: #4e5969;
      letter-spacing: 2px;
      cursor: pointer;
      user-select: none;
      border: 1px solid #eff0f5;
      border-radius: 4px;
    }
  }

  .submit-btn {
    width: 100%;
    margin-top: 16px;
  }

  .form-footer {
    margin-top: 40px;
    font-size: 13px;
    color: #86909c;
    text-align: center;

    .link {
      color: var(--color-primary);
      text-decoration: none;
    }
  }
}
</style>
