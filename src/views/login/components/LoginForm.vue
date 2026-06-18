<template>
  <el-form
    ref="loginFormRef"
    :model="loginData"
    :rules="loginRules"
    label-position="top"
    class="form-body"
  >
    <!-- 走货国家 -->
    <el-form-item
      :label="$t('web.gfuc.country_zh' /** 走货国家 */)"
      prop="country"
    >
      <el-select v-model="loginData.country" class="full-width">
        <el-option
          :key="Country.FR"
          :label="$t('web.gfuc.country_FR' /** 法国 */)"
          :value="Country.FR"
        />
        <el-option
          :key="Country.IT"
          :label="$t('web.gfuc.country_IT' /** 意大利 */)"
          :value="Country.IT"
        />
        <el-option
          :key="Country.NL"
          :label="$t('web.gfuc.country_NL' /** 荷兰 */)"
          :value="Country.NL"
        />
      </el-select>
    </el-form-item>

    <!-- 邮箱 -->
    <el-form-item :label="$t('web.gfuc.email' /** 邮箱 */)" prop="email">
      <el-input
        v-model="loginData.email"
        :placeholder="$t('web.gfuc.please_enter_email')"
      />
    </el-form-item>

    <!-- 密码 -->
    <el-form-item :label="$t('web.gfuc.password' /** 密码 */)" prop="password">
      <el-input
        v-model="loginData.password"
        type="password"
        :placeholder="$t('web.gfuc.please_enter_password')"
        show-password
      />
    </el-form-item>

    <!-- 验证码 -->
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

    <!-- 协议确认 -->
    <div class="agreements">
      <el-checkbox v-model="loginData.agree1">
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
      <el-checkbox v-model="loginData.agree2">
        {{
          $t(
            "web.gfuc.agreement2" /** 通过勾选此框，我明确同意接收来自 GOFO通过短信发送的营销信息。可能需要支付短信和数据费用。通过提供我的手机号码，我同意接收来自GOFO 通过短信发送的交易相关消息，包括订单通知和验证码。 */
          )
        }}
      </el-checkbox>
    </div>

    <!-- 登录按钮 -->
    <div class="form-actions">
      <el-button
        type="primary"
        class="submit-btn"
        @click="handleLogin"
        :disabled="loading"
      >
        {{ $t("web.gfuc.login" /** 确定 */) }}
      </el-button>
    </div>

    <!-- 注册链接 -->
    <div class="form-footer">
      <span>{{ $t("web.gfuc.no_account_yet" /** 还没有账号? */) }}</span>
      <a
        href="javascript:;"
        class="link"
        @click="
          $emit('switch', 'register', {
            email: loginData.email,
            country: loginData.country
          })
        "
        >{{ $t("web.gfuc.go_to_register" /** 去注册 */) }}</a
      >
    </div>
  </el-form>

  <!-- 协议弹窗 -->
  <AgreementModal
    v-model:visible="userAgreementVisible"
    :title="$t('web.gfuc.register_agreement' /** 注册协议 */)"
    :view-only="isViewOnly"
    @confirm="handleAgreementConfirm('register')"
    @cancel="handleAgreementCancel"
  >
    <div
      v-html="
        loginData.agreeLanguage === 'zh'
          ? userAgreementContent
          : userAgreementEnContent
      "
    ></div>
  </AgreementModal>

  <AgreementModal
    v-model:visible="privacyPolicyVisible"
    :title="$t('web.gfuc.privacy_policy' /** 隐私政策 */)"
    :view-only="isViewOnly"
    @confirm="handleAgreementConfirm('privacy')"
    @cancel="handleAgreementCancel"
  >
    <div
      v-html="
        loginData.agreeLanguage === 'zh'
          ? privacyPolicyContent
          : privacyPolicyEnContent
      "
    ></div>
  </AgreementModal>
</template>

<script setup lang="ts">
defineOptions({ name: "LoginForm" });

import { ref, reactive, computed, nextTick, watch } from "vue";
import { type FormInstance, type FormRules, ElMessage } from "element-plus";
import AgreementModal from "./AgreementModal.vue";

import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";
import { rsaEncryptPwd } from "@/utils/crypto";
import { getVerifyCode } from "@/api/user";
import { Country } from "@/enums/index";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
const emit = defineEmits<{
  (
    e: "switch",
    mode: "login" | "register",
    data?: { email: string; country: string }
  ): void;
  (e: "success", type: "login" | "register", otherInfo?: string): void;
}>();

const { t, locale } = useI18n();
const userStore = useUserStore();

const props = defineProps<{
  email?: string;
  country?: string;
}>();

// --- 验证码 ---
const verifyCodeData = reactive({
  image: "",
  uuid: ""
});

const codeUrl = computed(() =>
  verifyCodeData.image ? "data:image/gif;base64," + verifyCodeData.image : ""
);

// --- 登录表单数据 ---
const loginData = reactive({
  country: sessionStorage.getItem("setSite") || Country.FR,
  email: props.email || "",
  password: "",
  code: "",
  agree1: false,
  agree2: false,
  agreeLanguage: locale.value
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

// --- 表单校验规则 ---
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
    },
    {
      pattern: /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/,
      message: t("web.gfuc.password_format_incorrect" /** 密码格式不正确 */),
      trigger: ["blur", "change"]
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

// --- 协议相关 ---
const userAgreementVisible = ref(false);
const privacyPolicyVisible = ref(false);
const isUserAgreementRead = ref(false);
const isPrivacyPolicyRead = ref(false);
const isViewOnly = computed(() => loginData.agree1);

const openAgreement = (type: "register" | "privacy") => {
  if (type === "register") {
    userAgreementVisible.value = true;
  } else {
    privacyPolicyVisible.value = true;
  }
};

const handleAgreementCancel = () => {
  isUserAgreementRead.value = false;
  isPrivacyPolicyRead.value = false;
};

const handleAgreementConfirm = () => {
  userAgreementVisible.value = false;
  privacyPolicyVisible.value = false;
  isUserAgreementRead.value = false;
  isPrivacyPolicyRead.value = false;
};

// --- 协议内容（保留原始完整内容）---
const userAgreementContent = `
<p><span>版本生效日期：【2026-3-12】</span></p>
<p>本用户协议的所有权归属【GOFO】（以下简称"GOFO"、"我们"及"公司"），其定义如下：</p>
<p><b>争议解决：</b>欧盟委员会提供在线争议解决（ODR）平台：<a target="_blank" href="https://ec.europa.eu/consumers/odr"><b>https://ec.europa.eu/consumers/odr</b></a></p>
<p>本用户协议（下称"本协议"）适用您注册及使用用户中心系统（<a target="_blank" href="https://gfuc-eu.gofoexpress.com"><b>https://gfuc-eu.gofoexpress.com</b></a>）的行为。您在 GOFO 系统注册界面上点击"登录"、"提交"、"确认"或"注册"按钮，即视为已阅读并同意本协议。若您不接受本协议或其中任何条款，请立即停止使用服务。</p>
<h2>一、协议范围</h2>
<p>1.1 本协议由您与 GOFO 共同缔结，本协议对您与 GOFO 均具有合同效力。</p>
<p>1.2 GOFO 拥有子公司和/或关联法律实体。这些子公司和/或关联法律实体可代表 GOFO 向您提供服务。您理解并同意这些子公司和/或关联法律实体有权向您提供服务。</p>
<h2>二、用户</h2>
<p>2.1 如果您属于自然人，您确认，在您取得 GOFO 系统账号或使用 GOFO 服务前，您应具备与您行为相适应的民事行为能力。如果您不具备前述与您行为相适应的民事行为能力，请您立即停止注册或停止使用 GOFO 服务，否则您及您的监护人应依据法律规定承担因此导致的一切后果。</p>
<h2>三、账号与密码</h2>
<p>3.1 您理解并同意，为访问 GOFO 系统或使用 GOFO 服务，您需要注册 GOFO 账号。您承诺根据 GOFO 系统注册页面提示填写完整、准确且真实的信息（包括您的姓名/企业名称、电子邮箱、联系电话、所在国家等），并确保前述信息的准确性，如因注册信息不真实、不完整或者不准确而导致的任何损害及后果，由您自行承担。</p>
<h2>四、账号管理</h2>
<p>4.1 如果您已经注册 GOFO 系统账号，可使用 GOFO 账号用户名和 GOFO 账号密码登陆。您的 GOFO 账号仅限您本人使用。若您授权他人使用您的账号，您应对被授权人在该账号下发生的所有行为负全部责任。</p>
<h2>五、服务内容</h2>
<p>5.1 GOFO 系统为您提供提供了一个在线平台，使您能够使用 GOFO 向您提供的服务。</p>
<h2>六、免责声明</h2>
<p>6.1 您知悉，GOFO 有可能不经事先通知就变更、中断或终止部分或全部的系统服务。</p>
<h2>七、知识产权</h2>
<p>除非 GOFO 另行书面声明，GOFO 系统中向您展示的或者 GOFO 向您提供的所有产品、技术、软件、程序、数据、文字、图像、图片、音频、视频、图表、色彩、版面设计、电子文档及任何信息、内容、资料的所有权利，包括但不限于版权（软件著作权）、商标权、专利权、商业秘密及其他所有相关的权利，均为 GOFO 所有。</p>
<h2>八、协议终止</h2>
<p>8.1 您有权通过以下任一方式终止本协议：</p>
<p>（1）按照本协议停止使用账号的；</p>
<p>（2）在 GOFO 账号或服务或本协议变更和/或修改事项生效前，您停止使用且明示不愿接受该变更和/或修改事项的；</p>
<p>（3）您向 GOFO 明示不愿继续使用本系统，且符合 GOFO 终止条件。</p>
<h2>九、通知条款</h2>
<p>9.1 GOFO 将通过您注册系统时预留的有效联系方式（包括您的电子邮件地址、联系电话、联系地址等）或者系统消息等方式向您送达各类通知。</p>
<h2>十、其他</h2>
<p>10.1 本协议任一条款被视为废止、无效或不可执行，该条款应视为可分的且并不影响本协议其余条款的有效性及可执行性。</p>
<p>10.2 本协议最终解释权及修订权在法律范围内归 GOFO 所有。</p>
`;

const userAgreementEnContent = `
<p>Effective Date: 2026-03-12</p>
<p>The copyright of this publication belongs to 【GOFO】.</p>
<p>Dispute Resolution: The European Commission provides an online dispute resolution (ODR) platform: <a target="_blank" href="https://ec.europa.eu/consumers/odr">https://ec.europa.eu/consumers/odr</a></p>
<p>This Terms of Use (this Agreement) shall apply in relation to your registration and use of the system. If you click "Log in", "Submit", "Confirm" or "Register" on the system, it shall be deemed that you have read and agreed to this Agreement.</p>
<h2>1. Scope of this Agreement</h2>
<p>1.1 This agreement is an effective contract between you and GOFO.</p>
<p>1.2 GOFO has subsidiaries and/or related legal entities. These subsidiaries and/or related legal entities may provide services to you on behalf of GOFO.</p>
<h2>2. User</h2>
<p>2.1 In the case that you are a natural person, you confirm that you should have the capacity for civil conduct before you register an GOFO account.</p>
<h2>3. Account and Password</h2>
<p>3.1 To access of the system and use the services, you shall register an account.</p>
<h2>4. Account management</h2>
<p>4.1 If you have already registered a GOFO account, you can use the GOFO account username and password to log in.</p>
<h2>5. Services</h2>
<p>5.1 GOFO provides you with an online platform that allows you to access services provided by GOFO to you.</p>
<h2>6. Disclaimer</h2>
<p>6.1 You understand and agree that GOFO may change, interrupt or terminate the functions of the system without prior notice.</p>
<h2>7. Intellectual property</h2>
<p>Unless GOFO declares in writing, all rights to all products, technologies, software, programs, data, text, images, pictures, audios, videos, charts, colors, layouts, electronic documents and any information, content, and materials shown to you on the system, including but not limited to Copyright (software copyright), trademark rights, patent rights, trade secrets and all other related rights are owned by GOFO.</p>
<h2>8. Termination</h2>
<p>8.1 You have the right to terminate this Agreement in any of the following ways: (1) Stop using the system; (2) When GOFO changes this Agreement; (3) You clearly express to GOFO that you will not continue to use the system.</p>
<h2>9. Notice</h2>
<p>9.1 GOFO will notify you by a system message or according to the contact information that you provide.</p>
<h2>10. Miscellaneous</h2>
<p>10.1 If any provision of this Agreement is held to be repealed, invalid, or unenforceable, such provision shall be deemed severable.</p>
`;

const privacyPolicyContent = `
<h2>1. 引言</h2>
<p>我们很高兴您访问我们，并对本公司的业务、产品及服务表示关注。您的信任对我们至关重要。我们致力于保护您的隐私及个人数据的安全。</p>
<p>最后更新日期：【2026/03/12】。</p>
<p>公司已指定一名数据保护官（DPO）。您可通过以下邮箱与我们的DPO联系：<a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>。</p>
<h2>2. 本隐私声明是否适用于您？</h2>
<p>如您为本公司的客户，或通过访问系统与我们联系，则本《隐私声明》适用于您。</p>
<h2>3. 我们收集哪些个人数据？</h2>
<p>包括联系方式信息、财务信息、账户信息、寄件人信息、收件人信息、用户数据及偏好信息、自动生成的信息。</p>
<h2>4. 我们如何收集个人数据？</h2>
<p>当寄件人或我们的合同客户向我们提供信息时，公司会收集相关个人数据。</p>
<h2>5. 我们基于何种目的及法律依据处理您的个人数据？</h2>
<p>仅在必要且符合 GOFO 负责任、高效及有效的业务管理框架下，我们才会收集、使用、存储或以其他方式处理个人数据。</p>
<h2>6. 我们如何使用 Cookies？</h2>
<p>当您访问我们的系统时，我们会使用 Cookies 及类似技术，以确保系统正常运行。</p>
<h2>7. 我们如何共享您的个人数据？</h2>
<p>本公司在以下情况下与第三方共享您的个人数据：如有必要，我们会与关联公司、运营团队、子公司和部门共享。</p>
<h2>8. 您的个人数据如何受到保护？</h2>
<p>我们已采取充分的保护措施，确保您个人数据的保密性和安全性。</p>
<h2>9. 您的个人数据将保留多久？</h2>
<p>我们将仅在为实现收集目的、履行任何法律义务或解决争议所必需的时间内保留您的个人数据。</p>
<h2>10. 我们在哪里存储或传输您的个人数据？</h2>
<p>通常情况下，公司依法收集的关于您的个人数据将存储在欧盟成员国境内。</p>
<h2>11. 您可以就您的个人数据行使哪些权利？</h2>
<p>您可能拥有与您的个人数据相关的权利，包括访问权、更正权、删除权、限制处理权、数据可携权、反对权等。</p>
<h2>12. 加州消费者</h2>
<p>如果您是加州居民，您可以就您的个人数据提出某些请求。</p>
<h2>13. 如果您有其他疑问或投诉，该怎么办？</h2>
<p>请使用本隐私声明提供的联系方式与本公司联系。</p>
<h2>14. 本隐私声明将如何更新？</h2>
<p>本公司可能会不时更新本隐私声明。</p>
`;

const privacyPolicyEnContent = `
<h2>1. INTRODUCTION</h2>
<p>We are pleased that you have came to us and are interested in our company, products and services. Your trust is important to us.</p>
<p>Last updated: 【2026/03/12】.</p>
<p>The Company has appointed a Data Protection Officer. You can contact our DPO at <a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>.</p>
<h2>2. DOES THIS PRIVACY STATEMENT APPLY TO YOU?</h2>
<p>This Privacy Statement applies to you if you are a customer of the Company or if you contact us by visiting our system.</p>
<h2>3. WHAT PERSONAL DATA DO WE COLLECT?</h2>
<p>Contact Information, Financial Information, Account Information, Shipper's Information, Recipient's Information, User Data and Preferences, Automatically generated information.</p>
<h2>4. HOW DO WE COLLECT PERSONAL DATA?</h2>
<p>The Company collects Personal Data when it is provided by the shipper or our contractual customer.</p>
<h2>5. FOR WHICH PURPOSES AND ON WHAT GROUNDS DO WE PROCESS YOUR PERSONAL DATA?</h2>
<p>Personal Data shall be collected, used, stored, or otherwise processed when only necessary, within the framework of responsible, efficient and effective business management of GOFO.</p>
<h2>6. HOW DO WE USE COOKIES?</h2>
<p>When you visit our system, we use cookies and similar technologies to make our system work properly.</p>
<h2>7. HOW DO WE SHARE YOUR PERSONAL DATA?</h2>
<p>The Company shares your Personal Data with third parties in the following circumstances...</p>
<h2>8. HOW IS YOUR PERSONAL DATA SECURED?</h2>
<p>We have taken adequate safeguards to ensure the confidentiality and security of your personal data.</p>
<h2>9. HOW LONG IS YOUR PERSONAL DATA RETAINED?</h2>
<p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for.</p>
<h2>10. WHERE DO WE STORE OR TRANSFER YOUR PERSONAL DATA?</h2>
<p>Generally, the Personal Data with respect to you legally collected by the Company will be stored in EU member states.</p>
<h2>11. WHAT RIGHTS CAN YOU EXERCISE IN RELATION TO YOUR PERSONAL DATA?</h2>
<p>You may have rights including Right of access, Right to rectification, Right to erasure, Right to restriction of processing, Right to data portability, Right to object.</p>
<h2>12. CALIFORNIA CONSUMERS</h2>
<p>If you are a California resident, you can make certain requests regarding your Personal Data.</p>
<h2>13. HOW WILL THIS PRIVACY STATEMENT BE UPDATED?</h2>
<p>The Company may update this Privacy Statement from time to time.</p>
`;

// --- 登录逻辑 ---
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  if (!loginData.agree1 || !loginData.agree2) {
    ElMessage.warning(
      t("web.gfuc.please_agree_and_check_the_agreement" /** 请阅读用户协议 */)
    );
    return;
  }

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        appStore.setSite(loginData.country);
        await userStore.login({
          country: loginData.country as Country,
          email: loginData.email,
          password: await rsaEncryptPwd(loginData.password),
          code: loginData.code,
          uuid: verifyCodeData.uuid
        });
        await nextTick();
        sessionStorage.removeItem("setSite");
        emit(
          "success",
          "login",
          JSON.stringify({
            country: loginData.country,
            email: loginData.email
          })
        );
      } catch (error: any) {
        console.error(error);
        refreshCaptcha();
      } finally {
        loading.value = false;
      }
    }
  });
};

// --- 刷新图片验证码 ---
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

  :deep(.el-form-item__label) {
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 500;
    color: #7a869a !important;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
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
      flex-shrink: 0;
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
    height: 40px;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 4px;
  }

  .form-footer {
    margin-top: 32px;
    font-size: 13px;
    color: #999;
    text-align: center;

    .link {
      margin-left: 4px;
      color: var(--color-primary);
      text-decoration: none;
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

    .el-checkbox__input {
      margin-top: 2px;
    }

    .el-checkbox__label {
      font-size: 13px;
      line-height: 18px;
      color: #999;
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
