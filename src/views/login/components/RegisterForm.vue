<template>
  <el-form
    ref="registerFormRef"
    :model="registerData"
    :rules="registerRules"
    label-position="top"
    class="form-body"
  >
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="registerData.email"
        placeholder="请输入邮箱"
        :suffix-icon="isEmailValid ? CircleCheckFilled : ''"
        class="email-input"
      />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        v-model="registerData.password"
        type="password"
        placeholder="请输入密码"
        show-password
      />
    </el-form-item>

    <!-- 安全认证 (密码强度) -->
    <div v-if="registerData.password" class="password-strength">
      <div class="strength-header">
        <span>{{ $t("安全认证") }}</span>
        <div class="strength-bars" :class="'level-' + strength">
          <div class="bar" :class="{ active: strength >= 1 }"></div>
          <div class="bar" :class="{ active: strength >= 2 }"></div>
          <div class="bar" :class="{ active: strength >= 3 }"></div>
        </div>
      </div>
      <p class="strength-tip">
        {{ $t("为了您的账号安全，您的密码必须包含以下几个部分") }}
      </p>
      <ul class="strength-list">
        <li :class="{ success: hasLowercase }">
          <el-icon
            ><CircleCheckFilled v-if="hasLowercase" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("小写字母") }}
        </li>
        <li :class="{ success: hasUppercase }">
          <el-icon
            ><CircleCheckFilled v-if="hasUppercase" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("大写字母") }}
        </li>
        <li :class="{ success: hasSpecial }">
          <el-icon
            ><CircleCheckFilled v-if="hasSpecial" /><CircleCloseFilled v-else
          /></el-icon>
          {{ $t("特殊字符") }}
        </li>
        <li :class="{ success: isLengthValid }">
          <el-icon
            ><CircleCheckFilled v-if="isLengthValid" /><CircleCloseFilled
              v-else
          /></el-icon>
          {{ $t("8-12位字符") }}
        </li>
      </ul>
    </div>

    <div class="form-actions">
      <el-button type="primary" class="submit-btn" @click="handleRegister">{{
        $t("注册")
      }}</el-button>
    </div>

    <div class="agreements">
      <el-checkbox v-model="registerData.agree1" @change="handleAgreeChange">
        <i18n-t
          :keypath="'web.gfuc.agreement' /** 我同意GOFO的{register_agreement}和{privacy_policy} */"
        >
          <template #register_agreement>
            <span
              class="link-inline"
              @click.stop.prevent="openUserAgreement(false)"
              >{{ $t("web.gfuc.register_agreement" /** 注册协议 */) }}</span
            >
          </template>
          <template #privacy_policy>
            <span
              class="link-inline"
              @click.stop.prevent="openPrivacyPolicy(false)"
              >{{ $t("web.gfuc.privacy_policy" /** 隐私政策 */) }}</span
            >
          </template>
        </i18n-t>
      </el-checkbox>
      <el-checkbox v-model="registerData.agree2">
        {{
          $t(
            " 通过勾选此框，我明确同意接收来自 GOFO通过短信发送的营销信息。可能需要支付短信和数据费用。通过提供我的手机号码，我同意接收来自GOFO 通过短信发送的交易相关消息，包括订单通知和验证码。"
          )
        }}
      </el-checkbox>
    </div>

    <div class="form-footer">
      <span>{{ $t("已经有账号？") }}</span>
      <a href="javascript:;" class="link" @click="$emit('switch', 'login')">{{
        $t("去登录")
      }}</a>
    </div>

    <!-- 协议弹窗 -->
    <AgreementModal
      v-model:visible="userAgreementVisible"
      :title="$t('web.gfuc.register_agreement' /** 注册协议 */)"
      @confirm="handleUserAgreementConfirm"
      @cancel="handleAgreementCancel"
    >
      <div v-html="userAgreementContent"></div>
    </AgreementModal>

    <AgreementModal
      v-model:visible="privacyPolicyVisible"
      :title="$t('web.gfuc.privacy_policy' /** 隐私政策 */)"
      @confirm="handlePrivacyPolicyConfirm"
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
  type FormRules,
  ElMessage
} from "element-plus";
import { useI18n } from "vue-i18n";
import AgreementModal from "./AgreementModal.vue";

const { t } = useI18n();

const emit = defineEmits(["switch", "success"]);

// --- 注册逻辑 ---
const registerData = reactive({
  email: "",
  password: "",
  agree1: false,
  agree2: false
});

const registerFormRef = ref<FormInstance>();

const validatePassword = (_rule: any, value: string, callback: any) => {
  const hasLowercase = /[a-z]/.test(value);
  const hasUppercase = /[A-Z]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isLengthValid = value.length >= 8 && value.length <= 12;

  if (!value) {
    callback(new Error(t("请输入密码")));
  } else if (!hasLowercase || !hasUppercase || !hasSpecial || !isLengthValid) {
    callback(new Error(""));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "change" },
    {
      type: "email",
      message: t("您输入的邮箱格式不对，请填写正确的邮箱"),
      trigger: "change"
    }
  ],
  password: [{ required: true, validator: validatePassword, trigger: "change" }]
});

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email);
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

  await registerFormRef.value.validate((valid) => {
    if (valid) {
      if (!registerData.agree1) {
        ElMessage.warning(t("请同意注册协议"));
        return;
      }
      emit("switch", "verify");
    }
  });
};

// --- 协议弹窗逻辑 ---
const userAgreementVisible = ref(false);
const privacyPolicyVisible = ref(false);
const isSequentialFlow = ref(false);

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
    // 用户尝试勾选，拦截并开始流程
    registerData.agree1 = false;
    isSequentialFlow.value = true;
    openUserAgreement(true);
  }
};

const openUserAgreement = (sequential: boolean) => {
  if (!sequential) isSequentialFlow.value = false;
  userAgreementVisible.value = true;
};

const openPrivacyPolicy = (sequential: boolean) => {
  if (!sequential) isSequentialFlow.value = false;
  privacyPolicyVisible.value = true;
};

const handleUserAgreementConfirm = () => {
  if (isSequentialFlow.value) {
    // 流程中：用户协议同意后，打开隐私协议
    openPrivacyPolicy(true);
  }
  // 非流程中：仅关闭
};

const handlePrivacyPolicyConfirm = () => {
  if (isSequentialFlow.value) {
    // 流程中：隐私协议同意后，勾选复选框
    registerData.agree1 = true;
    isSequentialFlow.value = false;
  }
  // 非流程中：仅关闭
};

const handleAgreementCancel = () => {
  // 任何取消都中断流程
  isSequentialFlow.value = false;
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
  margin-top: -12px;
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
