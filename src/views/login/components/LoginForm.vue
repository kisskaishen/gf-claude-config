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

const emit = defineEmits(["switch", "success"]);

const { t } = useI18n();

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
      // 模拟后端接口返回
      // 实际开发中这里会是: const res = await loginApi(loginData)

      // 模拟逻辑：
      // 1. 账号不存在或密码错误 (1次): code: 40101
      // 2. 账号不存在或密码错误 (2-4次): code: 40102
      // 3. 账号锁定: code: 40103
      // 4. 验证码错误: code: 40104

      const mockLoginApi = (data: any) => {
        return new Promise((resolve, reject) => {
          if (data.email === "locked@gofo.com") {
            reject({ code: 40103 });
          } else if (data.email === "error1@gofo.com") {
            reject({ code: 40101 });
          } else if (data.email === "error2@gofo.com") {
            reject({ code: 40102 });
          } else if (
            showCaptcha.value &&
            data.captcha.toUpperCase() !== "T4FR"
          ) {
            reject({ code: 40104 });
          } else if (
            data.email === "admin@gofo.com" &&
            data.password === "Password123!"
          ) {
            resolve({ code: 200 });
          } else {
            // 默认第一次错
            reject({ code: 40101 });
          }
        });
      };

      try {
        await mockLoginApi(loginData);
        showCaptcha.value = false;
        emit("success", "login");
      } catch (error: any) {
        const { code } = error;

        switch (code) {
          case 40101:
            showCaptcha.value = true;
            ElMessage.error(t("您输入的账号密码错误，请重新输入。"));
            break;
          case 40102:
            showCaptcha.value = true;
            ElMessage.error(
              t("您输入的账号密码错误，请重新输入。输错5次将锁定账号")
            );
            break;
          case 40103:
            ElMessage.error(t("账号已被锁定"));
            break;
          case 40104:
            ElMessage.error(t("验证码错误"));
            break;
          default:
            ElMessage.error(t("登录失败，请稍后再试"));
        }

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
