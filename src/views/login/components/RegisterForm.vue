<template>
  <el-form
    ref="registerFormRef"
    :model="registerData"
    :rules="registerRules"
    label-position="top"
    class="form-body"
  >
    <el-form-item :label="$t('web.gfuc.email' /** 邮箱 */)" prop="email">
      <el-input
        v-model="registerData.email"
        :placeholder="$t('web.gfuc.please_enter_email' /** 请输入邮箱 */)"
        :suffix-icon="isEmailValid ? CircleCheckFilled : ''"
        class="email-input"
      />
    </el-form-item>
    <el-form-item :label="$t('web.gfuc.password' /** 密码 */)" prop="password">
      <el-input
        v-model="registerData.password"
        type="password"
        :placeholder="$t('web.gfuc.please_enter_password' /** 请输入密码 */)"
        show-password
      />
    </el-form-item>

    <!-- 安全认证 (密码强度) -->
    <div v-if="registerData.password" class="password-strength">
      <div class="strength-header">
        <span>{{
          $t("web.gfuc.security_authentication" /** 安全认证 */)
        }}</span>
        <div class="strength-bars" :class="'level-' + strength">
          <div class="bar" :class="{ active: strength >= 1 }"></div>
          <div class="bar" :class="{ active: strength >= 2 }"></div>
          <div class="bar" :class="{ active: strength >= 3 }"></div>
        </div>
      </div>
      <p class="strength-tip">
        {{
          $t(
            "web.gfuc.security_authentication_tip" /** 为了您的账号安全，您的密码必须包含以下几个部分 */
          )
        }}
      </p>
      <ul class="strength-list">
        <li :class="{ success: hasLowercase }">
          <el-icon
            ><CircleCheckFilled v-if="hasLowercase" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("web.gfuc.lowercase" /** 小写字母 */) }}
        </li>
        <li :class="{ success: hasUppercase }">
          <el-icon
            ><CircleCheckFilled v-if="hasUppercase" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("web.gfuc.uppercase" /** 大写字母 */) }}
        </li>
        <li :class="{ success: hasSpecial }">
          <el-icon
            ><CircleCheckFilled v-if="hasSpecial" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("web.gfuc.special" /** 特殊字符 */) }}
        </li>
        <li :class="{ success: isLengthValid }">
          <el-icon
            ><CircleCheckFilled v-if="isLengthValid" /><CircleCloseFilled
              v-else
          /></el-icon>
          {{ $t("web.gfuc.length" /** 8-12位字符 */) }}
        </li>
      </ul>
    </div>

    <div class="form-actions">
      <el-button
        type="primary"
        class="submit-btn"
        @click="handleRegister"
        :disabled="loading"
        >{{ $t("web.gfuc.register" /** 注册 **/) }}</el-button
      >
    </div>

    <div class="agreements">
      <el-checkbox v-model="registerData.agree1" @change="handleAgreeChange">
        <i18n-t
          :keypath="'web.gfuc.agreement' /** 我同意GOFO的{register_agreement}和{privacy_policy} */"
        >
          <template #register_agreement>
            <span
              class="link-inline"
              @click.stop.prevent="openAgreement('register')"
              >{{ $t("web.gfuc.register_agreement" /** 注册协议 */) }}</span
            >
          </template>
          <template #privacy_policy>
            <span
              class="link-inline"
              @click.stop.prevent="openAgreement('privacy')"
              >{{ $t("web.gfuc.privacy_policy" /** 隐私政策 */) }}</span
            >
          </template>
        </i18n-t>
      </el-checkbox>
      <el-checkbox v-model="registerData.agree2">
        {{
          $t(
            "web.gfuc.agreement2" /** 通过勾选此框，我明确同意接收来自 GOFO通过短信发送的营销信息。可能需要支付短信和数据费用。通过提供我的手机号码，我同意接收来自GOFO 通过短信发送的交易相关消息，包括订单通知和验证码。 */
          )
        }}
      </el-checkbox>
    </div>

    <div class="form-footer">
      <span>{{ $t("web.gfuc.already_have_account" /** 已有账号？ */) }}</span>
      <a
        href="javascript:;"
        class="link"
        @click="$emit('switch', 'login', { email: registerData.email })"
        >{{ $t("web.gfuc.go_to_login" /** 去登录 */) }}</a
      >
    </div>

    <!-- 协议弹窗 -->
    <AgreementModal
      v-model:visible="userAgreementVisible"
      :title="$t('web.gfuc.register_agreement' /** 注册协议 */)"
      :view-only="isViewOnly"
      @confirm="handleAgreementConfirm('register')"
      @cancel="handleAgreementCancel"
    >
      <div v-html="userAgreementContent"></div>
    </AgreementModal>

    <AgreementModal
      v-model:visible="privacyPolicyVisible"
      :title="$t('web.gfuc.privacy_policy' /** 隐私政策 */)"
      :view-only="isViewOnly"
      @confirm="handleAgreementConfirm('privacy')"
      @cancel="handleAgreementCancel"
    >
      <div v-html="privacyPolicyContent"></div>
    </AgreementModal>
  </el-form>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { CircleCheckFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import {
  type CheckboxValueType,
  type FormInstance,
  type FormRules
} from "element-plus";
import { useI18n } from "vue-i18n";
import AgreementModal from "./AgreementModal.vue";
import { postCheckAccount } from "@/api/user";

const { t } = useI18n();

const emit = defineEmits(["switch", "success"]);

const props = defineProps({
  registerData: {
    type: Object,
    default: () => ({ email: "", password: "", agree1: false, agree2: false })
  }
});

// --- 注册逻辑 ---
const registerData = reactive({
  email: props.registerData.email || "",
  password: props.registerData.password || "",
  agree1: props.registerData.agree1 || false,
  agree2: props.registerData.agree2 || false
});

const loading = ref(false);

const registerFormRef = ref<FormInstance>();

const validatePassword = (_rule: any, value: string, callback: any) => {
  const hasLowercase = /[a-z]/.test(value);
  const hasUppercase = /[A-Z]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isLengthValid = value.length >= 8 && value.length <= 12;
  // 只允许字母、数字和指定的特殊字符
  const hasInvalidChar = /[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/.test(value);

  if (!value) {
    callback(new Error(t("web.gfuc.please_enter_password" /** 请输入密码 **/)));
  } else if (
    hasInvalidChar ||
    !hasLowercase ||
    !hasUppercase ||
    !hasSpecial ||
    !isLengthValid
  ) {
    callback(
      new Error(t("web.gfuc.password_format_incorrect" /** 密码格式不正确 **/))
    );
  } else {
    callback();
  }
};

/* eslint-disable no-control-regex */
const emailPattern =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
/* eslint-enable no-control-regex */

const isEmailValid = computed(() => {
  return emailPattern.test(registerData.email);
});

const registerRules = reactive<FormRules>({
  email: [
    {
      required: true,
      message: t("web.gfuc.please_enter_email" /** 请输入邮箱 **/),
      trigger: "change"
    },
    {
      type: "email",
      message: t(
        "web.gfuc.invalid_email_format" /** 您输入的邮箱格式不对，请填写正确的邮箱 **/
      ),
      trigger: "change"
    }
  ],
  password: [{ required: true, validator: validatePassword, trigger: "change" }]
});

const hasLowercase = computed(() => /[a-z]/.test(registerData.password));
const hasUppercase = computed(() => /[A-Z]/.test(registerData.password));
const hasSpecial = computed(() =>
  /[!@#$%^&*(),.?":{}|<>]/.test(registerData.password)
);
const isLengthValid = computed(
  () => registerData.password.length >= 8 && registerData.password.length <= 12
);

const strength = computed(() => {
  let s = 0;
  if (isLengthValid.value) s++;
  if (hasLowercase.value || hasUppercase.value) s++;
  if (hasSpecial.value) s++;
  return s;
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!registerData.agree1 || !registerData.agree2) {
        ElMessage.warning(
          t("web.gfuc.please_agree_to_terms" /** 请同意注册协议 **/)
        );
        return;
      }
      loading.value = true;
      try {
        await postCheckAccount({ email: registerData.email });
        emit("switch", "verify", {
          ...registerData
        });
      } finally {
        loading.value = false;
      }
    }
  });
};

// --- 协议弹窗逻辑 ---
const userAgreementVisible = ref(false);
const privacyPolicyVisible = ref(false);

const isUserAgreementRead = ref(false);
const isPrivacyPolicyRead = ref(false);
const isViewOnly = computed(() => registerData.agree1);

// 模拟协议内容
const userAgreementContent = `
  <h3>用户注册协议</h3>
  <p>欢迎您注册成为GOFO用户！在您注册前，请您仔细阅读本协议的全部内容。</p>
  <p>1. 服务条款的确认和接纳...</p>
  <p>2. 用户账号及密码...</p>
  <p>3. 用户个人信息保护...</p>
  <p>4. 用户行为规范...</p>
  <p>...</p>
  <p>（此处省略详细内容，实际开发中请替换为真实协议文本）</p>
`;
const privacyPolicyContent = `
  <h3>隐私政策</h3>
  <p>GOFO非常重视您的隐私保护。本隐私政策将向您说明我们如何收集、使用、存储和保护您的个人信息。</p>
  <p>1. 我们如何收集您的信息...</p>
  <p>2. 我们如何使用您的信息...</p>
  <p>3. 我们如何共享、转让、公开披露您的信息...</p>
  <p>...</p>
  <p>（此处省略详细内容，实际开发中请替换为真实隐私政策文本）</p>
`;

const handleAgreeChange = (val: CheckboxValueType) => {
  if (val) {
    if (isUserAgreementRead.value && isPrivacyPolicyRead.value) {
      registerData.agree1 = true;
    } else {
      registerData.agree1 = false;
      if (!isUserAgreementRead.value) {
        openAgreement("register");
      } else if (!isPrivacyPolicyRead.value) {
        openAgreement("privacy");
      }
    }
  } else {
    // 复选框取消勾选时，重置阅读状态
    isUserAgreementRead.value = false;
    isPrivacyPolicyRead.value = false;
  }
};

const openAgreement = (type: "register" | "privacy") => {
  if (type === "register") {
    userAgreementVisible.value = true;
  } else {
    privacyPolicyVisible.value = true;
  }
};

const handleAgreementConfirm = (type: "register" | "privacy") => {
  if (type === "register") {
    isUserAgreementRead.value = true;
    if (!isPrivacyPolicyRead.value) {
      openAgreement("privacy");
    }
  } else {
    isPrivacyPolicyRead.value = true;
    if (!isUserAgreementRead.value) {
      openAgreement("register");
    }
  }
  registerData.agree1 = isUserAgreementRead.value && isPrivacyPolicyRead.value;
};

const handleAgreementCancel = () => {
  isUserAgreementRead.value = false;
  isPrivacyPolicyRead.value = false;
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

.password-strength {
  margin-bottom: 24px;

  .strength-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #4e5969;

    .strength-bars {
      display: flex;
      gap: 4px;

      .bar {
        width: 80px;
        height: 8px;
        background: #d9d9d9;
        border-radius: 4px;
        transition: background-color 0.3s;
      }

      &.level-1 .bar.active {
        background: var(--color-danger);
      }

      &.level-2 .bar.active {
        background: var(--color-warning);
      }

      &.level-3 .bar.active {
        background: var(--color-success);
      }
    }
  }

  .strength-tip {
    margin-bottom: 12px;
    color: #767676;
  }

  .strength-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: var(--color-danger);

      .el-icon {
        font-size: 14px;
        color: inherit;
      }

      &.success {
        color: var(--color-success);
      }
    }
  }
}

.agreements {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 22px;

  :deep(.el-checkbox) {
    align-items: flex-start;
    height: auto;
    white-space: normal;

    --el-checkbox-input-border: 1px solid var(--color);

    .el-checkbox__input {
      margin-top: 2px;
    }

    .el-checkbox__label {
      font-size: 12px;
      line-height: 18px;
      color: var(--color);
    }
  }

  .link-inline {
    color: var(--color-primary);
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
