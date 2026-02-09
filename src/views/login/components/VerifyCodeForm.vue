<template>
  <el-form
    ref="verifyFormRef"
    :model="{ code: verifyCode }"
    class="form-body verify-form"
  >
    <div class="verify-header">
      <h3 class="verify-title">
        {{ $t("gfuc.verification_code" /** 验证码 **/) }}
      </h3>
      <p class="verify-tip">
        {{
          $t(
            "gfuc.please_enter_verification_code_sent_to_email" /** 请输入我们发送到您的邮箱的验证码 **/
          )
        }}
      </p>
    </div>

    <el-form-item>
      <div class="code-inputs">
        <input
          v-for="(_, i) in 4"
          :key="i"
          v-model="verifyCode[i]"
          type="text"
          maxlength="1"
          :class="[
            'code-input',
            { 'is-error': showVerifyError && !verifyCode[i] }
          ]"
          @input="handleCodeInput($event, i)"
          @keydown.delete="handleCodeDelete($event, i)"
          ref="codeRefs"
        />
        <div class="countdown">{{ countdown }}S</div>
      </div>
    </el-form-item>

    <div class="verify-actions">
      <p>
        {{ $t("gfuc.verification_code_not_received" /** 没有收到验证码？ **/)
        }}<a
          href="javascript:;"
          :class="['link-inline', { 'is-disabled': countdown > 0 }]"
          @click="countdown === 0 && resendCode()"
          >{{ $t("gfuc.resend" /** 再次发送 **/) }}.</a
        >
      </p>
      <p>
        {{ $t("gfuc.email_filled_incorrectly" /** 邮箱填写错误？ **/)
        }}<a
          href="javascript:;"
          class="link-inline"
          @click="$emit('switch', 'register')"
          >{{ $t("gfuc.return_to_refill" /** 返回重新填写 **/) }}</a
        >
      </p>
    </div>

    <div class="form-actions">
      <el-button
        type="primary"
        class="submit-btn"
        @click="handleVerify"
        :disabled="loading"
        >{{ $t("gfuc.authentication" /** 认证 **/) }}</el-button
      >
    </div>

    <div class="form-footer">
      <span>{{ $t("gfuc.already_have_account" /** 已经有账号？ **/) }}</span>
      <a href="javascript:;" class="link" @click="$emit('switch', 'login')">{{
        $t("gfuc.go_to_login" /** 去登录 **/)
      }}</a>
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { postRegister, postSendVerificationCode } from "@/api/user";
import { rsaEncryptPwd } from "@/utils/crypto";

const { t } = useI18n();

const props = defineProps<{
  registerData: { email: string; password: string };
}>();

const emit = defineEmits(["switch", "success"]);

// --- 验证码逻辑 ---
const verifyCode = ref(["", "", "", ""]);
const codeRefs = ref<HTMLInputElement[]>([]);
const countdown = ref(60);
const showVerifyError = ref(false);
const loading = ref(false);
let timer: any = null;

const startTimer = () => {
  if (timer) clearInterval(timer);
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--;
    else clearInterval(timer);
  }, 1000);
};

const handleSendCode = async () => {
  await postSendVerificationCode({
    email: props.registerData.email
  });
  startTimer();
  verifyCode.value = ["", "", "", ""];
  codeRefs.value[0]?.focus();
  showVerifyError.value = false;
};

onMounted(() => {
  handleSendCode();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleCodeInput = (e: any, index: number) => {
  const val = (e.target as HTMLInputElement).value;
  if (val && index < 3) {
    codeRefs.value[index + 1]?.focus();
  }
};

const handleCodeDelete = (_e: any, index: number) => {
  if (!verifyCode.value[index] && index > 0) {
    codeRefs.value[index - 1]?.focus();
  }
};

const resendCode = async () => {
  handleSendCode();
};

const handleVerify = async () => {
  showVerifyError.value = true;
  if (verifyCode.value.some((c) => !c)) {
    return;
  }
  loading.value = true;
  try {
    const code = verifyCode.value.join("");
    const encryptedPwd = await rsaEncryptPwd(props.registerData.password);
    await postRegister({
      email: props.registerData.email,
      password: encryptedPwd,
      verificationCode: code,
      protocolTracing: JSON.stringify({
        email: props.registerData.email,
        time: Date.now(),
        name: "注册协议、隐私协议",
        version: "1.0.0"
      })
    });
    emit("success", "register");
  } catch (error) {
    // 错误处理已在 request.ts 中统一处理
  } finally {
    loading.value = false;
  }
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

.verify-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.verify-header {
  margin-bottom: 16px;
  text-align: left;

  .verify-title {
    margin-bottom: 4px;
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  .verify-tip {
    font-size: 14px;
    color: #999;
  }
}

.code-inputs {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;

  .code-input {
    width: 54px;
    height: 54px;
    font-size: 20px;
    font-weight: 500;
    color: var(--text-color-secondary);
    text-align: center;
    outline: none;
    border: 1px solid #e4e4e4;
    border-radius: 4px;
    transition: all 0.2s;

    &:focus {
      border-color: #ff8755;
    }

    &.is-error {
      border-color: var(--color-danger) !important;
    }
  }

  .countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    margin-left: auto;
    font-size: 18px;
    font-weight: 400;
    color: var(--text-color-secondary);
  }
}

.verify-actions {
  font-size: var(--font-size-sm);
  color: #999;

  p:nth-child(1) {
    margin-bottom: 80px;
  }

  .link-inline {
    color: var(--color-primary);
    text-decoration: none;
    cursor: pointer;

    &.is-disabled {
      color: #999;
      text-decoration: none;
      pointer-events: none;
      cursor: not-allowed;
    }
  }
}

.link-inline {
  text-decoration: none;
}
</style>
