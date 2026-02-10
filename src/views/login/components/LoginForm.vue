<template>
  <el-form
    ref="loginFormRef"
    :model="loginData"
    :rules="loginRules"
    label-position="top"
    class="form-body"
  >
    <el-form-item :label="$t('web.gfuc.email' /** 邮箱 */)" prop="email">
      <el-input
        v-model="loginData.email"
        :placeholder="$t('web.gfuc.please_enter_email')"
      />
    </el-form-item>
    <el-form-item :label="$t('web.gfuc.password' /** 密码 */)" prop="password">
      <el-input
        v-model="loginData.password"
        type="password"
        :placeholder="$t('web.gfuc.please_enter_password')"
        show-password
      />
    </el-form-item>

    <!-- 图片验证码-->
    <el-form-item :label="$t('web.gfuc.code' /** 验证码 */)" prop="code">
      <div class="captcha-wrapper">
        <el-input
          v-model="loginData.code"
          :placeholder="
            $t('web.gfuc.please_enter_verification_code' /** 请输入验证码 */)
          "
          class="captcha-input"
        />
        <div class="captcha-img" @click="refreshCaptcha">
          <img :src="codeUrl" />
        </div>
      </div>
    </el-form-item>

    <div class="form-actions">
      <el-button
        type="primary"
        class="submit-btn"
        @click="handleLogin"
        :disabled="loading"
        >{{ $t("web.gfuc.login" /** 登录 */) }}</el-button
      >
    </div>

    <div class="form-footer">
      <span>{{ $t("web.gfuc.no_account_yet" /** 还没有账号？ */) }}</span>
      <a
        href="javascript:;"
        class="link"
        @click="$emit('switch', 'register', { email: loginData.email })"
        >{{ $t("web.gfuc.go_to_register" /** 去注册 */) }}</a
      >
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { type FormInstance, type FormRules } from "element-plus";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";
import { rsaEncryptPwd } from "@/utils/crypto";
import { getVerifyCode } from "@/api/user";

const emit = defineEmits(["switch", "success"]);

const { t } = useI18n();

const userStore = useUserStore();

const props = defineProps({
  email: {
    type: String,
    default: ""
  }
});

// --- 登录逻辑 ---
const verifyCodeData = reactive({
  image: "",
  uuid: ""
});

const codeUrl = computed(() =>
  verifyCodeData.image ? "data:image/gif;base64," + verifyCodeData.image : ""
);
const loginData = reactive({
  email: props.email || "",
  password: "",
  code: ""
});

watch(
  () => props.email,
  (val) => {
    if (val) {
      loginData.email = val;
    }
  }
);

const loading = ref(false);

const loginFormRef = ref<FormInstance>();

const loginRules = reactive<FormRules>({
  email: [
    {
      required: true,
      message: t("web.gfuc.please_enter_email" /** 请输入邮箱 */),
      trigger: "change"
    },
    {
      type: "email",
      message: t(
        "web.gfuc.email_format_incorrect" /** 您输入的邮箱格式不对，请填写正确的邮箱 */
      ),
      trigger: "change"
    }
  ],
  password: [
    {
      required: true,
      message: t("web.gfuc.please_enter_password" /** 请输入密码 */),
      trigger: "change"
    }
  ],
  code: [
    {
      required: true,
      message: t("web.gfuc.please_enter_verification_code" /** 请输入验证码 */),
      trigger: "change"
    }
  ]
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        await userStore.login({
          email: loginData.email,
          password: await rsaEncryptPwd(loginData.password),
          code: loginData.code,
          uuid: verifyCodeData.uuid
        });
        await nextTick();
        emit("success", "login");
      } catch (error: any) {
        console.error(error);

        refreshCaptcha();
      } finally {
        loading.value = false;
      }
    }
  });
};

const refreshCaptcha = async () => {
  const res = await getVerifyCode();
  verifyCodeData.image = res?.image;
  verifyCodeData.uuid = res?.uuid;
};

refreshCaptcha();
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
      cursor: pointer;
      user-select: none;
      border: 1px solid #eff0f5;
      border-radius: 4px;

      img {
        display: block;
        width: 100%;
        height: 100%;
      }
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
