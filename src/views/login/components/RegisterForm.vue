<template>
  <el-form
    ref="registerFormRef"
    :model="registerData"
    :rules="registerRules"
    label-position="top"
    class="form-body"
  >
    <el-form-item
      :label="$t('web.gfuc.country_zh' /** 走货国家 */)"
      prop="country"
    >
      <el-select
        v-model="registerData.country"
        :placeholder="$t('web.gfuc.please_select_country' /** 请选择国家 */)"
      >
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
      <!-- 如果选择中文显示userAgreementContent，其他则显示英文 -->
      <div
        v-html="
          registerData.agreeLanguage === 'zh'
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
      <!-- 如果选择中文显示privacyPolicyContent，其他则显示英文 -->
      <div
        v-html="
          registerData.agreeLanguage === 'zh'
            ? privacyPolicyContent
            : privacyPolicyEnContent
        "
      ></div>
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
import { Country } from "@/enums/index";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
const { t, locale } = useI18n();

const emit = defineEmits(["switch", "success"]);

const props = defineProps({
  registerData: {
    type: Object,
    default: () => ({
      country: "",
      email: "",
      password: "",
      agree1: false,
      agree2: false
    })
  }
});

// --- 注册逻辑 ---
const registerData = reactive({
  country: props.registerData.country || "",
  email: props.registerData.email || "",
  password: props.registerData.password || "",
  agree1: props.registerData.agree1 || false,
  agree2: props.registerData.agree2 || false,
  agreeLanguage: locale.value
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
  country: [
    {
      required: true,
      message: t("web.gfuc.please_select_country" /** 请选择国家 **/),
      trigger: "change"
    }
  ],
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
  appStore.setSite(registerData.country);

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
        await postCheckAccount({
          country: registerData.country,
          email: registerData.email
        });
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

// 用户注册协议内容
const userAgreementContent = `
<p><span>版本生效日期：【2026-3-12】</span></p>
<p>本用户协议的所有权归属【GOFO】（以下简称“GOFO”、“我们”及“公司”），其定义如下：</p>
<p><b>争议解决：</b>欧盟委员会提供在线争议解决（ODR）平台：<a target="_blank" href="https://ec.europa.eu/consumers/odr"><b>https://ec.europa.eu/consumers/odr</b></a></p>
<p>本用户协议（下称“本协议”）适用您注册及使用用户中心系统（<a target="_blank" href="https://gfuc-eu.gofoexpress.com"><b>https://gfuc-eu.gofoexpress.com</b></a>）的行为。您在 GOFO 系统注册界面上点击“登录”、“提交”、“确认”或“注册”按钮，即视为已阅读并同意本协议。若您不接受本协议或其中任何条款，请立即停止使用服务。</p>
<h2>一、协议范围</h2>
<p>1.1 本协议由您与 GOFO 共同缔结，本协议对您与 GOFO 均具有合同效力。</p>
<p>1.2 GOFO 拥有子公司和/或关联法律实体。这些子公司和/或关联法律实体可代表 GOFO 向您提供服务。您理解并同意这些子公司和/或关联法律实体有权向您提供服务。</p>
<p>1.3 本协议适用于您使用 GOFO 系统以及相关功能。GOFO 及其子公司和/或关联法律实体向您提供的服务，均受您与 GOFO 或其子公司和/或关联法律实体另行签订的合同约束。</p>
<p>1.4 GOFO 有权不定时变更或修改本协议，如为反映法律的变更或服务变化而进行的修改。当 GOFO 对本协议做出变更或修改的，GOFO 将通过系统予以公布。您应当定期查阅系统获悉本协议的修订情况。如果您在本协议内容公告变更/修改生效后继续使用 GOFO 服务的，表示您已充分阅读、理解并接受变更或修改后的协议内容；如果您不同意变更或修改后的协议内容，您应立即停止使用 GOFO 服务。</p>
<h2>二、用户</h2>
<p>2.1 如果您属于自然人，您确认，在您取得 GOFO 系统账号或使用 GOFO 服务前，您应具备与您行为相适应的民事行为能力。如果您不具备前述与您行为相适应的民事行为能力，请您立即停止注册或停止使用 GOFO 服务，否则您及您的监护人应依据法律规定承担因此导致的一切后果。</p>
<p>2.2 如果您属于非自然人法律主体，则您确认，在您取得 GOFO 账号或使用 GOFO 服务前，您为依据注册地国家的法律合法设立并已具备相应资质开展业务的法人或其他组织，且您订立并履行本协议不会违反您所属、所居住或开展业务的国家或地区法律法规。如果不具备前述条件的，您应立即停止注册或停止使用 GOFO 服务，否则您及您的负责人应依据法律规定承担因此导致的一切后果。</p>
<h2>三、账号与密码</h2>
<p>3.1 您理解并同意，为访问 GOFO 系统或使用 GOFO 服务，您需要注册 GOFO 账号。您承诺根据 GOFO 系统注册页面提示填写完整、准确且真实的信息（包括您的姓名/企业名称、电子邮箱、联系电话、所在国家等），并确保前述信息的准确性，如因注册信息不真实、不完整或者不准确而导致的任何损害及后果，由您自行承担。</p>
<p>3.2 如您使用用户名设置您的账号的，您应保证所设置的用户名不得违反国家法律法规，否则 GOFO 有权不通过您的注册申请或者注销您的账号。在注册后，如发现您以虚假信息骗取账号名称注册，或提供不良、不道德或者违法信息的，GOFO 有权采取限期改正、暂停使用、注销账户等措施。</p>
<p>3.3 通常情况下，GOFO 只允许每位用户使用一个 GOFO 账号。如有证据证明或 GOFO 有理由相信您存在不当注册或不当使用多个 GOFO 账号的情形，GOFO 可采取注销账号、拒绝提供服务、终止本协议等措施，如给 GOFO 及相关方造成损失的，您还应承担赔偿责任。</p>
<h2>四、账号管理</h2>
<p>4.1 如果您已经注册 GOFO 系统账号，可使用 GOFO 账号用户名和 GOFO 账号密码登陆。您的 GOFO 账号仅限您本人使用。若您授权他人使用您的账号，您应对被授权人在该账号下发生的所有行为负全部责任。如 GOFO 判断您 GOFO 账号的使用可能危及您的账号安全和/或 GOFO 系统信息安全的，GOFO 可以拒绝提供相应服务或终止本协议。</p>
<p>4.2 您理解并同意，GOFO 任何时候均不会主动要求您提供您的账号及密码，因此，建议您务必保管好您的账号及密码。因您主动向第三方泄露账号信息导致的损失及后果，均由您自行承担。您应对您账号项下的所有行为（包括但不限于在线签署各类协议、提供信息、使用服务等）负责。</p>
<p>4.3 因您个人原因导致的账号信息遗失，请按照账号找回要求提供相应的信息，并确保提供的信息合法真实准确有效，否则 GOFO 将无法协助您重置密码；如果发现任何未经授权使用您账号登录 GOFO 系统或其他可能导致您账号遭窃的情况，建议您立即通知 GOFO。您理解 GOFO 对您的任何请求采取行动均需要合理时间，GOFO 对因任何未经授权使用您账号登录 GOFO 系统或其他可能导致您账号遭窃的情况而产生的后果不承担任何责任。</p>
<p>4.4 如出现以下情形，GOFO 有权回收您的账号，您的账号将不能再登录 GOFO 系统，相应服务同时终止：</p>
<p>（1）您已严重违反您与 GOFO 签署的服务合同项下您应履行的义务的；</p>
<p>（2）您未按照规定进行实名认证和/或资质认证的；</p>
<p>4.5 您理解并同意，您需要按要求完成实名认证和/或资质认证，否则您将有可能无法正常访问/登陆 GOFO 系统或使用服务。</p>
<p>4.6 您仅可在 GOFO 同意的情况下转让或授予您的账户；在此情况下，GOFO 有权要求您、受让人及接收方提供合格合法文件材料。您的账号一经转让，该账号项下权利义务及您本协议项下权利义务一并转移。除此外，您的账号不得以任何方式转让，否则 GOFO 有权追究您的违约责任，且由此产生的一切责任均由您承担。</p>
<p>4.7 您可以通过联系 GOFO 办理账号注销流程。由于您的 GOFO 账号可能直接关系到您是否能正常使用 GOFO 服务，且 GOFO 账号注销属于不可恢复的操作，因此，为了保障账户及关联服务安全，在您向 GOFO 提出注销 GOFO 账号申请之后，GOFO 会就您的 GOFO 账号进行相应核查及身份核验。符合以下条件的，GOFO 将注销您的账号：</p>
<p>（1）您申请注销的是您本人的账号，并依照 GOFO 的流程进行注销；</p>
<p>（2）您仍应对您在注销账号前使用系统及 GOFO 服务的行为承担相应责任，同时 GOFO 仍可保存您注销前的相关信息；</p>
<p>（3）您的注销行为不影响您与 GOFO 签署的相关协议的履行；</p>
<p>（4）注销成功后，账号信息、主体信息、交易记录、相关权益等将无法恢复或提供。</p>
<h2>五、服务内容</h2>
<p>5.1 GOFO 系统为您提供提供了一个在线平台，使您能够使用 GOFO 向您提供的服务。您取得 GOFO 账号后不必然享有系统页面展示的所有服务，且 GOFO 系统页面中公布的信息不意味着对服务进行承诺，您享有的具体服务以您与 GOFO 实际签署的相关协议为准。</p>
<p>5.2 GOFO 负责“按现状”和“可得到”的状态向您提供服务。GOFO 在法律允许的最大范围内，不承担任何明示、默示、法定或其他形式的保证责任。GOFO 不对系统提供的服务、内容或信息的准确性、完整性、安全性或及时性作出任何陈述或保证。</p>
<p>5.3 无法对由于信息网络设备维护、连接故障，服务器、电脑、通讯或其他系统的故障、电力故障、罢工、暴乱、火灾、洪水、风暴、爆炸、战争、政府行为、司法行政机关的命令或因第三方原因而给您造成的损害结果承担责任。</p>
<p>5.4 GOFO 可能会在系统页面中展示一些不属于 GOFO 的内容，这些内容由发布的实体承担全部责任。GOFO 可能会审查相关内容，以确定其是否违法或违反了 GOFO 的政策；如果 GOFO 有理由相信该内容违反了 GOFO 的政策或违法，GOFO 可以将其删除或拒绝展示。但是，这并不意味 GOFO 必然会或有义务审查相关内容。</p>
<h2>六、免责声明</h2>
<p>6.1 您知悉，GOFO 有可能不经事先通知就变更、中断或终止部分或全部的系统服务。GOFO 不担保系统服务不会中断，对系统服务的及时性、安全性、准确性也都不作担保。</p>
<p>6.2 您理解并同意，因以下情况造成网络服务的中断，GOFO 无需为此承担任何责任；</p>
<p>（1）GOFO 保留不经事先通知为维护保养、升级或者其它目的暂停本系统及其服务的权利。</p>
<p>（2）因台风、地震、洪水、雷电或恐怖袭击等不可抗力原因；</p>
<p>（3）您的电脑软硬件出现故障的；</p>
<p>（4）因病毒、木马、恶意程序或黑客攻击、网络拥堵、系统不稳定、系统或设备故障、通讯故障、电力故障、银行原因、第三方服务瑕疵或政府行为等其他原因。</p>
<p>6.3 尽管有前款约定，GOFO 将采取合理行动积极促使服务恢复正常。</p>
<h2>七、知识产权</h2>
<p>除非 GOFO 另行书面声明，GOFO 系统中向您展示的或者 GOFO 向您提供的所有产品、技术、软件、程序、数据、文字、图像、图片、音频、视频、图表、色彩、版面设计、电子文档及任何信息、内容、资料的所有权利，包括但不限于版权（软件著作权）、商标权、专利权、商业秘密及其他所有相关的权利，均为 GOFO 所有。未经 GOFO 明确书面授权，您及任何人不得擅自使用，包括但不限于复制、传播、展示、镜像、下载本软件中的任何内容。访问或者使用 GOFO 系统并不能让您获得系统中任何信息、内容、资料的任何权利。</p>
<h2>八、协议终止</h2>
<p>8.1 您有权通过以下任一方式终止本协议：</p>
<p>（1）按照本协议停止使用账号的；</p>
<p>（2）在 GOFO 账号或服务或本协议变更和/或修改事项生效前，您停止使用且明示不愿接受该变更和/或修改事项的；</p>
<p>（3）您向 GOFO 明示不愿继续使用本系统，且符合 GOFO 终止条件。</p>
<p>8.2 出现以下情况时，GOFO 有权通知您终止本协议：</p>
<p>（1）您在使用服务过程中违反有关法律法规的规定或违反本协议、您与 GOFO 签署的其他相关协议的约定的；</p>
<p>（2）您存在欺诈、盗用他人账号、制造虚假交易、涉嫌走私犯罪、采取不正当手段谋利等行为的，或者您存在危及他人交易安全或账号安全风险等行为的；</p>
<p>（3）滥用 GOFO 提供的服务（如：干扰服务或尝试使用除 GOFO 提供的界面和指示以外的方法访问这些服务）；</p>
<p>（4）根据本协议相关约定，您的账号被 GOFO 注销的；</p>
<p>（5）其它 GOFO 有合理理由终止本协议的情况。</p>
<p>8.3 本协议终止后，对于您按照本协议以及其他协议产生的交易，GOFO 可自行决定是否终止该等交易；如 GOFO 要求继续履行的，则您应当就该等交易继续履行本协议及交易的约定，并承担因此产生的任何损失。本协议的终止不影响您已经通过 GOFO 系统处理的订单或者您与 GOFO 签署的其他协议的效力。</p>
<h2>九、通知条款</h2>
<p>9.1 GOFO 将通过您注册系统时预留的有效联系方式（包括您的电子邮件地址、联系电话、联系地址等）或者系统消息等方式向您送达各类通知，而此类通知的内容可能对您的权利义务产生重大影响，请您务必及时关注。联系方式发生变更的，您有义务及时更新有关信息。以电子方式发出的书面通知和公告，包括向您发送手机短信，向您发送电子邮件，向您发送系统消息以及站内信，在发送成功后即视为送达；以纸质载体发出的书面通知，按照您提供的联系地址交邮后的第五个自然日即视为送达。</p>
<p>9.2 对于本协议引起的任何纠纷，您同意司法机关（包括但不限于人民法院、仲裁机构等）可以通过您在 GOFO 系统中注册时预留或者使用过程中更新（如有）的手机短信、电子邮件等通讯方式向您送达法律文书。司法机关向上述联系方式发出法律文书即视为送达。</p>
<p>9.3 您应当保证所提供的联系方式是准确、有效的，并进行实时更新。如果因提供的联系方式不确切，或不及时告知变更后的联系方式，使通知无法送达或未及时送达，由您自行承担由此可能产生的法律后果。</p>
<h2>十、其他</h2>
<p>10.1 本协议任一条款被视为废止、无效或不可执行，该条款应视为可分的且并不影响本协议其余条款的有效性及可执行性。</p>
<p>10.2 本协议最终解释权及修订权在法律范围内归 GOFO 所有。</p>
`;
const userAgreementEnContent = `
<p>Effective Date:  2026-03-12</p>
<p>The copyright of this publication belongs to 【GOFO】 (hereinafter referred to as “GOFO”, “we”, and “us”),
</p>
<p>Dispute Resolution: The European Commission provides an online dispute resolution (ODR) platform: <a target="_blank" href="https://ec.europa.eu/consumers/odr">https://ec.europa.eu/consumers/odr</a></p>
<p>This Terms of Use (this Agreement) shall apply in relation to your registration and use of the system ( <a target="_blank" href="https://gfuc-eu.gofoexpress.com">https://gfuc-eu.gofoexpress.com </a> ). This Terms of Use is an agreement between you (“User”) and GOFO and should be read together with our Privacy Policy. If you click “Log in”, “Submit”, “Confirm” or “Register “on the system, it shall be deemed that you have read and agreed to this Agreement. If you do not accept this Agreement or any clause of it, please stop using the service.</p>
<h2>1. Scope of this Agreement</h2>
<p>1.1 This agreement is an effective contract between you and GOFO.</p>
<p>1.2 GOFO has subsidiaries and/or related legal entities. These subsidiaries and/or related legal entities may provide services to you on behalf of GOFO. You understand and agree that these subsidiaries and/or related legal entities have the right to provide services to you.</p>
<p>1.3 This agreement applies to your use of the system. The services provided by GOFO and its subsidiaries and/or related legal entities to you are subject to the respective contract(s) signed separately between you and GOFO or its subsidiaries and/or related legal entities. </p>
<p>1.4 GOFO reserves the right to change or modify this Agreement from time to time. For example, GOFO will modify this Agreement in accordance with legal changes or service changes. When GOFO makes changes or modifications to this Agreement, GOFO will announce it on the system. And you should regularly check the system to learn about the revision of this Agreement. If you continue to use the system after the change/modification, it shall be deemed that you have fully read, understood, and accepted the change/modification of this Agreement; if you do not agree with the change/modification, you should stop using the system.</p>
<h2>2. User</h2>
<p>2.1 In the case that you are a natural person, you confirm that you should have the capacity for civil conduct before you register an GOFO account. If not, please stop registering or stop using the system, otherwise you and your guardian shall be liable for all consequences arising therefrom.</p>
<p>2.2 In the case that you are a legal entity, you confirm that before to your registration, you have been legally established in accordance with the applicable laws and regulations and have the appropriate qualifications to conduct business. You confirm that you would enter into this Agreement without violating applicable laws and regulations. If not, you shall stop registering or using the GOFO services, otherwise you shall be liable for all consequences arising therefrom.</p>
<h2>3. Account and Password</h2>
<p>3.1 To access of the system and use the services, you shall register an account. You agree to provide complete, correct, and accurate information (including your name/company name/Business License, Email address, phone number, country, etc.) to GOFO and to maintain the accuracy of the information. You will be solely responsible for any damage or consequence that may arise from the false or incorrect or incomplete information.</p>
<p>3.2 If you set up a username of your account, you should ensure that the username does not violate applicable laws and regulations, otherwise GOFO has the right to cancel your account. After registration, if it is found that you register your account with false information, or that there are immoral or illegal information provided by you, GOFO shall have the right to request you to correct the information, to suspend the use of your account and to cancel your account.</p>
<p>3.3 Normally, GOFO allows each user to use only one GOFO account. If there is evidence or GOFO has reason to believe that user has improper registration or improper use of multiple GOFO accounts, GOFO has the right to cancel accounts, refuse to provide services, and terminate this Agreement. If a user causes losses to GOFO or related parties, the user should also be liable.</p>
<h2>4. Account management</h2>
<p>4.1 If you have already registered a GOFO account, you can use the GOFO account username and password to log in. Your GOFO account is for your own use only. If you authorize others to use your account, you shall be fully responsible for all actions of the authorized person using your account. If GOFO determines that the use of your GOFO account may endanger the security of your account and/or the information security, GOFO reserves the right to refuse to provide corresponding services or terminate this Agreement.</p>
<p>4.2 You understand and agree that GOFO will not ask you to provide your password at any time. Therefore, it is recommended that you keep your GOFO account and password to your own. You shall be solely liable for the losses and consequences caused by your account disclosure to any third party. You shall be responsible for all actions under your account (including but not limited to signing agreements, providing information, using services, etc.).<p>
<p>4.3 If your account information is lost or forgotten due to your personal reasons, please provide relevant information to us for verification and ensure that the provided information is legal, true, accurate and valid. Otherwise, we cannot help you to reset your password. You understand that it would take time for us to deal with your requests, and we shall not be responsible for any consequences arising out of any unauthorized use of your account.</p>
<p>4.4 If the following situation exists, we have the right to terminate your account, and you will no longer be able to log into our system. The corresponding services will also be terminated:
</p>
<p>(1) You have seriously violated your obligations under the service contract signed with us.</p>
<p>(2) You fail to carry out real-name authentication and/or qualification authentication in accordance with Article </p>
<p>4.5 You understand and agree that you shall complete the real-name authentication and/or qualification authentication as required, otherwise you may not be able to access/log in our system or use the Service normally.</p>
<p>4.6 You may transfer or grant your account only with GOFO’ consent. In such case, we have the right to require you, the assignee and the recipient to provide qualified documents. Upon transfer of your account, your rights and obligations under the account and under this Agreement shall be transferred together. In addition, your account shall not be transferred in any other way, otherwise we have the right to hold you liable for breach of this Agreement and all liabilities arising therefrom shall be borne by you.</p>
<p>4.7 You can cancel your account by contacting us. Your account may be directly related to whether you can use our services normally, and account cancellation is not recoverable. Therefore, to ensure the security of your account and all services related to your account, after you submit an account cancellation application to us, we will check your account and verify your identity. If you agree to the following conditions, we will cancel your account:</p>
<p>(1) You apply for the cancellation of your account and cancel it according to our procedures.</p>
<p>(2) You shall still be responsible for your use of the system and our services before you cancel your account, and we may still save your information before you cancel your account.</p>
<p>(3) Your cancellation does not affect the performance of the relevant agreements you have signed with us.</p>
<p>(4) After successful cancellation, account information, subject information, transaction records, relevant rights, and interests, etc. cannot be recovered or provided.</p>
<h2>5. Services</h2>
<p>5.1 GOFO provides you with an online platform that allows you to access services provided by GOFO to you. After registration, you may not necessarily enjoy all the services shown on the system, and the information on the system does not make a commitment to the service. The specific services provided to you are subject to the service agreement(s) signed by you and GOFO.</p>
<p>5.2 The services and the information on the system are provided on an “as is” basis. GOFO, to the fullest extent permitted by law, disclaims all warranties, whether express, implied, statutory, or otherwise. GOFO makes no representations or warranties about the accuracy, completeness, security or timeliness of the services, content or information provided on or the system.</p>
<p>5.3 GOFO shall not be liable for any damage caused to you due to network equipment maintenance, power failure, strike, riot, fire, flood, storm, explosion, war, government action, order of judicial administration authority or failure of servers, computers or communications. GOFO shall not be liable for any damage caused by any third party.</p>
<p>5.4 The system may obtain some content that does not belong to GOFO, and the publisher bears full responsibility for this content. GOFO may review the content to determine whether it is illegal or violates GOFO’ policies; if there is reason to believe that the content violates GOFO’ policies or is illegal, GOFO can delete it or refuse to show this content. However, it does not mean that GOFO will necessarily or have the obligation to review relevant content.</p>
<h2>6. Disclaimer</h2>
<p>6.1 You understand and agree that GOFO may change, interrupt or terminate the functions of the system without prior notice. GOFO does not guarantee that the functions will not be interrupted, nor guarantee the timeliness, safety, and accuracy of functions.</p>
<p>6.2 You understand and agree that GOFO shall not bear any responsibility for the interruption of the system and its functions due to the following circumstances:</p>
<p>(1) GOFO reserves the right to suspend any part of the system for maintenance, upgrade, or other purposes without prior notice.</p>
<p>(2) Force majeure such as typhoon, earthquake, flood, lightning, or terrorist attack.</p>
<p>(3) Your computer hardware and software malfunction.</p>
<p>(4) Due to virus, Trojan horse, malicious program attack, network congestion, system instability, system or equipment failure, communication failure, power failure, banking reasons, third-party defect or government behavior and other reasons.</p>
<p>6.3 Despite the agreement in the preceding paragraph, GOFO will take reasonable actions to restore the system.</p>
<h2>7. Intellectual property</h2>
<p>Unless GOFO declares in writing, all rights to all products, technologies, software, programs, data, text, images, pictures, audios, videos, charts, colors, layouts, electronic documents and any information, content, and materials shown to you on the system, including but not limited to Copyright (software copyright), trademark rights, patent rights, trade secrets and all other related rights are owned by GOFO. Without the express written authorization of GOFO, you and anyone may not use it without authorization, including but not limited to copying, disseminating, displaying, mirroring, and downloading any content on the system. Accessing or using the system does not give you any rights to any information, content, or data in the system.</p>
<h2>8. Termination</h2>
<p>8.1 You have the right to terminate this Agreement in any of the following ways:</p>
<p>(1) Stop using the system in accordance with this Agreement.</p>
<p>(2) When GOFO changes and/or modifies this Agreement, you stop using and expressly do not accept the changes and/or modifications.</p>
<p>(3) You clearly express to GOFO that you will not continue to use the system, and you meet the termination conditions of GOFO.</p>
<p>8.2 In the following circumstances, GOFO has the right to notify you to terminate this Agreement:</p>
<p>(1) You violate the provisions of relevant laws and regulations or violate this Agreement or other relevant agreements signed by you and GOFO.</p>
<p>(2) You have committed fraud, misappropriation of other people’s accounts, making false transactions, suspected of smuggling crimes, or taking improper means for profit, or you have acts that endanger the security of others’ transactions or account security.</p>
<p>(3) Misuse of the services provided by GOFO.</p>
<p>(4) According to the relevant provisions of this Agreement, your account has been canceled by GOFO.</p>
<p>(5) Other circumstances that GOFO has reason to terminate this Agreement.</p>
<p>8.3 The termination of this Agreement does not affect the validity of orders and services you have already processed through the system or other agreements have been signed between you and GOFO.</p>
<h2>9. Notice</h2>
<p>9.1 GOFO will notify you by a system message or according to the contact information that you provide (including your email address, contact number, contact address, etc.). Such notices may have a significant impact on your rights and obligations, so please pay attention to them in time. If your contact information changes, you are obliged to update it in time. Electronic notifications, including sending text messages, sending emails, and sending system messages to you, shall be deemed to have been served upon successful delivery; a written notice shall be deemed to be delivered on the fifth natural day after it is mailed to the address provided by you.</p>
<p>9.2 For any disputes arising out of this Agreement, you agree that judicial institutions (including but not limited to courts and arbitration institutions) could send legal documents to you through the telephone number, email, and other information you provided. The date on which the judiciary post legal documents to the above contact information shall be deemed to be the date of service.</p>
<p>9.3 You should ensure that the contact information provided is accurate, effective, and updated in real time. If the contact information provided is inaccurate or the changed contact information is not notified in time, and the notification cannot be delivered or is not delivered in time, you shall bear the legal consequences that may arise.</p>
<h2>10. Miscellaneous</h2>
<p>10.1If any provision of this Agreement is held to be repealed, invalid, or unenforceable, such provision shall be deemed severable and shall not affect the validity or enforceability of the remaining provisions of this Agreement.</p>
<p>10.2Within the scope permitted by applicable law, GOFO reserves the right of final interpretation and amendment of this Agreement.
</p>`;
// 用户隐私政策内容
const privacyPolicyContent = `
<h2>1. 引言</h2>
<p>我们很高兴您访问我们，并对本公司的业务、产品及服务表示关注。您的信任对我们至关重要。我们致力于在整个业务流程中的个人数据处理活动中，保护您的隐私以及任何可直接或间接识别自然人身份的信息（以下简称“个人数据”）的安全。为此，我们制定本《隐私声明》，以说明我们如何收集和使用您的个人<p>数据。</p>
<p>最后更新日期：【2026/03/12】。</p>
<p>本《隐私声明》中提及“公司”、“我们”或“我们的”，系指根据本声明决定您个人数据处理目的和方式的公司主体。</p>
<p><b>数据控制者信息：</b><span style='background-color:yellow'>详见《隐私声明》英文及相关当地语言版本中的相关数据控制者的信息</span></p>
<p>公司已指定一名数据保护官（Data Protection Officer，简称“DPO”）。您可通过以下邮箱与我们的DPO联系：<a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>。</p>
<h2>2. 本隐私声明是否适用于您？</h2>
<p>如您为本公司的客户，或通过访问<a target="_blank" href="https://gfuc-eu.gofoexpress.com">【https://gfuc-eu.gofoexpress.com】</a>（包括其任何页面及移动应用，以下统称“系统”）与我们联系，或接收我们发送的电子邮件，则本《隐私声明》适用于您。</p>
<p>我们的系统、产品和服务面向一般公众，并非专门针对儿童（儿童年龄界限的定义以用户所在地适用的相关法律法规为准）。原则上，我们不会主动收集儿童的个人数据。如您为儿童，请勿向我们提供任何个人数据；如需使用我们的服务，请在父母或监护人的协助下进行。</p>
<p>如我们可能已收集儿童的个人数据，其父母或监护人可与我们联系；在核实后，我们将根据要求删除相关个人数据。</p>
<h2>3. 我们收集哪些个人数据？</h2>
<p>在开展业务活动及提供服务过程中，公司需要处理您的个人数据。如未能提供相关个人数据，我们将无法向您提供所请求的服务。</p>
<p>通常情况下，您在使用我们的服务及访问我们的系统时，直接或间接向公司提供的个人数据包括：</p>
<p><b>联系方式信息。</b> 包括您的姓名、地址、电子邮箱地址及电话号码；</p>
<p><b>财务信息。</b> 包括您的银行账户号码、付款状态及发票信息；</p>
<p><b>账户信息。</b> 包括登录信息（如用户名、电子邮箱地址、电话号码）以及通过您的账户提供的其他相关信息；</p>
<p>寄件人信息。</b> 包括寄件人的姓名、地址、电子邮箱地址及电话号码；</p>
<p><b>收件人信息。</b> 包括收件人的姓名、地址、电子邮箱地址及电话号码；</p>
<p><b>用户数据及偏好信息。</b> 包括（如适用）货件数量、投诉记录、交易历史及相关商业活动信息、沟通记录、问卷调查信息以及您的偏好设置；</p>
<p><b>自动生成的信息。</b> 包括IP地址、唯一设备标识或用户标识、系统及浏览器类型、日期和时间戳、来源网站地址、您在我们的系统或移动应用中访问的内容和页面、相关操作的日期、时间及位置信息。</p>
<p>除上述类别的个人数据外，根据您与我们互动的具体情形，我们可能还会收集其他类型的信息，该等信息可能包含亦可能不包含个人数据。与包裹及服务相关的信息可能包括：运单追踪号码、包裹路由信息、位置信息、包裹状态、派送地点、包装类型、件数、重量、价格、包裹图片、签收证明以及报关信息。如我们发现，在未取得父母或法定监护人同意的情况下收集了儿童的个人数据，我们将及时删除该等数据。公司不会有意收集或处理《通用数据保护条例》（GDPR）第9条所定义的特殊类别个人数据（例如健康数据、政治观点、生物识别数据等）。</p>
<h2>4. 我们如何收集个人数据？</h2>
<p>当寄件人或我们的合同客户向我们提供信息时，公司会收集相关个人数据。若您为寄件人或我们的合同客户，我们将直接从您处获取您的个人数据。公司直接收集个人数据的情形包括但不限于：</p>
<p>提交包裹的人员，其姓名、地址及电话号码被列示为寄件人；</p>
<p>开立 GOFO 账户的个人（即我们的合同客户），其姓名、地址、身份信息、支付卡信息及账户号码。</p>

<p>如寄件人或我们的合同客户向我们提供他人的个人数据，则该等个人数据属于间接收集。公司间接收集个人数据的情形包括但不限于：</p>
包裹收件人的姓名、地址及电话号码；</p>
<p>寄件人或账户持有人的董事或代表的姓名、地址、电话号码、电子邮箱地址及身份信息；</p>
<p>当寄件人通过在线交易平台下单，且公司根据您提供的地址进行派送时，实际寄件人的姓名及地址。</p>
<p>在间接获取个人数据的情况下，公司依赖个人数据提供方确保相关信息的准确性，并确认其有权向 GOFO 提供该等信息。</p>

<h2>5. 我们基于何种目的及法律依据处理您的个人数据？</h2>
<p>仅在必要且符合 GOFO 负责任、高效及有效的业务管理框架下，我们才会收集、使用、存储或以其他方式处理个人数据。公司基于适用的法律依据处理个人数据。该法律依据通常与具体业务目的密切相关。例如，为履行合同既可能构成一项法律依据，也可能构成 GOFO 的业务目的。因此，我们将首先说明公司处理您个人数据所依据的法律基础，随后说明我们使用您个人数据的具体业务目的。
一般而言，公司基于以下一种或多种法律依据处理您的个人数据：</p>
<p>为履行合同所必需；</p>
<p>为履行我们的法定义务所必需；</p>
<p>为保护您或他人的重大利益所必需；</p>
<p>为实现 GOFO 的合法利益所必需，但该等利益不应凌驾于您的利益或基本权利与自由之上；在适当且必要的情况下，我们将征得您的同意。</p>

<p>公司仅在处理行为符合下列一项或多项合法业务目的范围内时，方会收集、使用或以其他方式处理个人数据：</p>
<p><b>履行合同。</b> 包括提供派送服务、包裹追踪服务、就服务事项与我们的合同客户、寄件人及其他相关方进行沟通、回应信息请求、处理争议以及拟定和签署相关协议。</p>
<p><b>产品开发、研究及产品和/或服务改进。 </b>公司在必要范围内处理个人数据，以开展产品和/或服务的开发与改进，以及研发活动（例如，分析与派送及相关服务有关的信息，以优化我们的服务质量）。</p>
<p><b>商业活动中的关系管理及营销。</b> 一般而言，公司在必要范围内处理个人数据，用于产品和/或服务的开发与改进、账户管理、客户服务以及开展有针对性的营销活动，以建立、维护及拓展与客户或业务合作伙伴的关系，并就个人数据开展统计分析。</p>
<p><b>业务流程执行、内部管理及管理报告。</b> 包括公司资产管理、内部审计与调查、财务与会计核算、实施业务管控、为提高效率提供集中处理设施、管理合并、收购及资产剥离事项，以及为管理报告与分析目的处理个人数据。</p>
<p><b>安全与保护。</b> 为保障公司及其客户或业务合作伙伴的安全与利益，以及验证客户或业务合作伙伴的身份及访问权限（例如，为线上或线下交易提供安全服务）而进行的数据处理。</p>
<p><b>保护个人重大利益。</b> 在必要情况下处理数据，以保护您或其他个人的重大利益（例如，出于紧急安全原因）。</p>
<p><b>履行法律义务。</b> 为遵守公司所适用的法律法规而处理个人数据（例如，将客户及业务合作伙伴的姓名与制裁或黑名单进行比对以避免利益冲突，遵守贸易管制规定、反洗钱及反腐败法规，以及其他相关政策、程序和监管要求）。</p>
<p>如基于我们的合法利益进行处理，我们将进行利益衡量测试，以确保您的权利和自由不被凌驾。</p>
<h2>6. 我们如何使用 Cookies？</h2>
<p>当您访问我们的系统时，我们会使用 Cookies 及类似技术，以确保系统正常运行、分析系统的使用情况，并在您同意的情况下实现内容和广告的个性化。您的 Cookie 偏好设置及同意记录将被安全保存，以作为合规证明。</p>
<p><span style='background-color:yellow'>根据《通用数据保护条例》（GDPR）及各个业务所在国所适用的与cookies有关的法律规定</span>，我们仅在您通过 Cookie 横幅明确表示同意后，才会设置非必要 Cookies（例如分析类或营销类 Cookies）。</p>
<p>我们的 Cookie 横幅允许您：</p>
<p>接受所有 Cookies；</p>
<p>拒绝非必要 Cookies；或</p>
<p>按类别管理您的偏好（例如功能类、分析类、营销类）。</p>
<p>我们使用的 Cookies 类型包括：</p>
<p>严格必要类Cookies ——为网站正常运行所必需，因此无需取得您的同意。</p>
<p>分析类 Cookies ——帮助我们了解访客如何使用我们的网站，以便改进功能和提升用户体验。该类 Cookies 仅在您同意后设置。</p>
<p>营销及追踪类 Cookies ——用于个性化内容和广告，并衡量营销活动的效果。该类 Cookies 亦仅在您同意后设置。</p>
<p>针对每一类 Cookies，我们的《Cookie 通知》将提供以下详细信息：
<p>每项 Cookie 的具体用途；</p>
<p>提供方（第一方或第三方）；</p>
<p>Cookie 的存续期限或存储时长<span style='background-color:yellow'>（具体详见《隐私声明》英文及相关当地语言版本中的相关规定）</span>；以及是否与第三方共享数据；如共享，相关国家以及所采取的保障措施（例如签署标准合同条款）。</p>
<p>您可随时通过 Cookie 横幅或浏览器设置调整 Cookie 偏好，从而更改或撤回您的同意。</p>

<h2>7. 我们如何共享您的个人数据？</h2>
<p>本公司在以下情况下与第三方共享您的个人数据：</p>
如有必要，我们会与关联公司、运营团队、子公司和部门共享您的个人数据，以实现上述目的。</p>
<p>我们的员工仅在履行其职责和实现相关目的所必需的范围内被授权访问个人数据。</p>
<p>我们会与代表我们处理个人数据的供应商或服务提供商等数据处理者共享您的个人数据。在这种情况下，这些第三方仅会将您的个人数据用于上述目的，并严格按照我们的指示使用。当这些第三方获得您的个人数据访问权限时，我们将采取必要的合同、技术和组织措施，以确保您的个人数据仅在安全范围内进行处理。以下第三方在相关情况下有权访问您的个人数据，以便向我们提供其产品或服务：</p>
<p>海关机构，用于办理海关手续和申报您的货物。</p>
<p>最后一公里配送服务提供商，用于将货物配送至您指定的目的地。</p>
<p>IT服务提供商，负责开发和维护我们系统及特定软件。</p>
<p>云服务提供商：我们可能会将数据存储在由云服务提供商运营的服务器上。无论您在何处使用我们的在线服务或向我们提供数据，这些数据都可能被传输到位于数据收集地所在国家/地区以外的服务器上并进行维护。</p>
<p>执法部门、监管机构和其他相关方：我们还可能根据法律规定，或在我们合理认为有必要的情况下，将您的个人数据披露给第三方，例如：(a) 为遵守传票或其他法律程序、法律诉讼或政府机构的要求；(b) 当我们真诚地认为披露对于遵守法律和执法部门的合理要求是必要的；(c) 为保护和行使我们的合法权利、财产和权益；(d) 为保护您或他人的权利、财产或人身安全；以及 (e) 为调查欺诈行为。</p>

<p>我们与之共享您个人数据的某些第三方位于欧洲经济区 (EEA) 内。当我们与位于欧洲经济区 (EEA) 以外的第三方合作时，我们会确保此类数据传输符合适用的数据保护法律。</p>
<p>具体而言：</p>
<p>传输至欧盟委员会已做出充分性决定的国家/地区（例如英国、瑞士或加拿大）的个人数据将受到该决定的保护，该决定确认这些国家/地区能够确保足够的数据保护水平。</p>
<p>对于传输至其他未做出充分性决定的国家/地区的数据传输，本公司将根据《通用数据保护条例》(GDPR) 第 46 条采取适当的保障措施，包括使用欧盟委员会的标准合同条款 (SCC) 或其他法律认可的传输机制。</p>
<p>在特殊情况下，且仅在法律允许的情况下，可根据 GDPR 第 49 条的特定例外情况进行数据传输（例如，当数据传输对于履行与您签订的合同或为了确立、行使或抗辩法律主张是必要的）。</p>

<p>您可以联系我们的数据保护官（邮箱：<a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>）获取有关您的个人数据国际传输的更多信息，包括相关保障措施的副本。</p>

<h2>8. 您的个人数据如何受到保护？</h2>
<p>我们已采取充分的保护措施，确保您个人数据的保密性和安全性。我们已实施适当的技术、物理和组织措施，以保护个人数据免遭意外或非法销毁、意外丢失、损坏、更改、未经授权的披露或访问，以及所有其他形式的非法处理（包括但不限于不必要的收集）或进一步处理，包括保护您的个人数据免遭未经授权的访问、维护您个人数据的保密性、完整性和可用性，以及对员工进行信息安全要求方面的培训。</p>

<p>但是，没有任何安全措施能够完全保证数据安全。您在保护个人数据方面也扮演着重要的角色。您不应与任何人分享您的用户名和密码，也不应在多个系统中重复使用密码。如果您有理由相信您的个人数据已被泄露，请立即与我们联系。</p>

<h2>9. 您的个人数据将保留多久？</h2>

<p>除非适用法律法规另有规定或要求外，我们将仅在为实现收集目的、履行任何法律、会计或报告义务或解决争议所必需的时间内保留您的个人数据。为确定个人数据的适当保留期限，我们会考虑适用的法律要求、个人数据的数量、性质和敏感性、未经授权使用或披露您的个人数据可能造成的潜在风险、我们处理您的个人数据的目的，以及我们是否可以通过其他方式实现这些目的。</p>
<p>在特定情况下，我们可能会匿名化您的个人数据，使其不再与您关联。我们保留在不另行通知您或征得您同意的情况下，将此类匿名化和去标识化数据用于任何合法商业目的的权利。</p>
<p><span style='background-color:yellow'>本隐私声明中所涉及的个人数据的留存期限详见《隐私声明》英文及相关当地语言版本中的相关规定。</span></p>

<h2>10. 我们在哪里存储或传输您的个人数据？</h2>
<p>通常情况下，公司依法收集的关于您的个人数据将存储在欧盟成员国境内。</p>

<p>鉴于我们业务的性质以及我们向您提供的服务，公司可能需要将您的个人数据传输至位于其他国家或地区的关联公司或子公司，以便履行与您签订的协议或实现本声明中所述的目的。在任何情况下，如果我们传输个人数据，我们将确保此类传输受到适当的保障措施，<span style='background-color:yellow'>其保护水平不低于欧盟以及业务发生国适用数据保护法律所要求的保护水平。</span>在进行跨境传输或远程访问之前，我们将根据相关的个人数据保护法律法规完成必要的程序。</p>

<h2>11. 您可以就您的个人数据行使哪些权利？</h2>
<p>根据适用于您个人数据处理的法律，您可能拥有与您的个人数据相关的权利。请注意，在某些情况下，我们无需完全满足您的请求，因为这些权利可能附带条件，或者因为我们必须平衡您的权利与我们处理您的个人数据以及保护他人权利和自由的权利和义务。以下解释了您在欧洲经济区、加利福尼亚州或其他美国或国际司法管辖区享有的部分个人数据权利：</p>
<b>访问权</b>
<p>您有权获取我们持有的关于您的个人数据的副本，并了解我们如何使用这些数据的详细信息。您的个人数据通常会以电子方式提供给您。在提供所请求的信息之前，我们可能会要求您证明您的身份。</p>
<b>更正权</b>
<p>我们会采取合理措施，确保我们持有的关于您的信息准确完整。但是，如果您认为情况并非如此，您有权要求我们更正任何关于您的不完整或不准确的个人数据。</p>
<b>删除权</b>
<p>您有权要求我们删除您的个人数据，例如，当我们收集的个人数据不再用于最初目的、个人数据已过时或您撤回同意（如果我们基于您的同意处理您的个人数据）时。但是，这需要与其他因素进行权衡。例如，由于某些法律或监管义务，我们可能无法满足您的请求。</p>
<b>限制处理权</b>
<p>您有权要求我们（暂时）停止使用您的个人数据，例如，当您认为我们持有的关于您的个人数据可能不准确或您认为我们不再需要使用您的个人数据时。
<b>数据可携权</b>
<p>您有权要求我们将您提供给我们的个人数据传输给您指定的第三方。只有在您向我们提供个人数据，且我们基于您的同意或为了履行与您签订的合同项下的义务而通过自动化方式处理该数据时，您才能行使此项权利。</p>
<b>反对权</b>
<p>您有权反对我们基于合法利益处理您的个人数据。对于出于营销目的处理您的个人数据，您有权随时提出反对。当您要求我们停止将您的个人数据用于营销目的时，我们将立即停止使用您的个人数据。对于基于我们合法利益的其他目的，如果您基于自身情况提出反对，我们将不再基于该目的处理您的个人数据，除非我们有令人信服的合法理由进行处理。但请注意，如果我们无法处理为特定目的所需的个人数据，我们可能无法向您提供某些服务或权益。</p>
<b>与自动化决策相关的权利</b>
<p>本公司可能在特定情况下使用自动化处理技术（包括用户画像），主要用于以下两个目的：</p>
<p>(1) 市场营销和服务个性化</p>
<p>本公司会分析您与我们系统、电子邮件和服务互动中的某些方面，例如浏览活动、点击记录、购买历史、发货模式和偏好，以便更好地了解您的兴趣。</p>
<p>用户画像有助于我们：</p>
<p>提供更相关、更个性化的内容、优惠和广告；</p>
<p>改进我们的系统和服务体验；以及衡量并优化我们营销活动的有效性。</p>
<p>用户画像中使用的逻辑基于可观察的行为模式和汇总的分析数据。这些活动不会产生法律效力，也不会根据《通用数据保护条例》(GDPR) 第 22 条的规定对您造成类似重大影响。</p>
<p>您可以随时通过联系我们的数据保护官（邮箱：<a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>）或调整您的Cookie和营销设置，反对此类用户画像或直接营销。如果您提出反对，我们将立即停止将您的个人数据用于这些目的。</p>
<p>（2）欺诈预防和风险管理</p>
<p>本公司也可能使用自动化系统和评分模型来帮助检测和预防欺诈活动或滥用我们的服务。例如，自动化系统可能会分析包裹信息、账户活动和交易模式，以识别可能表明欺诈或安全风险的异常情况。</p>
<p>进行此类自动化处理是为了保护我们的合法权益（GDPR 第 6 条第 1 款 (f) 项），并履行我们在欺诈预防、海关和反洗钱方面的法律义务。</p>
<p>在这些情况下，自动化工具可能会标记交易或要求由公司授权人员进行人工审核。我们不会仅基于自动化处理做出任何会对您产生法律效力或类似重大影响的决定，除非有人工参与。</p>
<p>您有权：</p>
<p>要求对任何涉及自动化处理的决定进行人工干预；</p>
<p>表达您的观点并对该决定提出异议；以及获得对此类自动化处理所涉逻辑的解释。</p>
<p>您可能有权拒绝对您产生法律效力或类似重大影响的自动化决策，包括用户画像分析。</p>
<p>如需行使这些权利或了解更多关于我们用户画像分析实践的信息，请联系我们的数据保护官，邮箱地址为 <a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>。</p>
<p>撤回同意的权利</p>
<p>在特定情况下，我们可能会征求您的同意以处理您的个人数据。在这种情况下，您有权随时撤回您的同意。公司将在您撤回同意后尽快停止进一步处理。但是，这并不影响撤回同意前处理的合法性。</p>
<p>我们将根据 GDPR 第 12 条第 3 款的规定，在一个月内回复您的请求。
如果您认为您的数据处理违反了 GDPR，您有权向当地主管数据保护机构提出投诉。</p>

<h2>12. 加州消费者</h2>
<b>如果您是加州居民，您可以就您的个人数据提出某些请求。我们将根据加州法律的要求满足您的每一项请求。</b>
<b>您可以请求获取我们持有的关于您的个人数据副本，包括我们出于商业目的与其他公司共享的您的个人数据类别列表。</b>
<b>您可以请求我们删除您的个人数据。</b>
<b>您可以请求我们停止出售您的个人数据。</b>

<p>以下是关于每项请求的更多信息。</p>
<b>请求访问个人数据</b>
<p>如果您提出此请求（我们也称之为“访问信息请求”），我们将（在法律要求的范围内）向您提供以下信息：</p>
<p>我们收集的关于您的个人数据类别。</p>
<p>我们收集您的个人数据的来源类别。</p>
<p>我们收集或出售您的个人数据的商业或商业目的。</p>
<p>我们与之共享个人数据的第三方类别。</p>
<p>我们收集的关于您的具体个人数据。</p>
<p>我们已出于商业目的披露的个人数据类别列表，以及我们与之共享的任何其他公司的类别。</p>
<p>您可以在连续十二个月内最多两次要求我们提供此信息。当您提出此请求时，所提供的信息可能仅限于我们在过去 12 个月内收集的关于您的个人数据。</p>
<b>删除个人数据</b>
<p>您有权要求我们删除您的个人数据。一旦我们收到请求，我们将从我们的记录中删除截至您请求之日我们持有的关于您的个人数据（在法律要求的范围内），并指示任何服务提供商执行相同的操作。在某些情况下，删除可以通过对个人数据进行匿名化处理来实现。选择删除您的个人数据可能会影响您使用我们的系统和在线功能，包括关闭您的在线账户。</p>
<b>不歧视</b>
<p>我们不会因您行使您的权利而对您进行歧视。这通常意味着我们不会拒绝您使用我们的服务，也不会提供不同级别或质量的服务。请注意，如果您要求我们删除您的信息，可能会影响您使用我们服务的体验，并且您可能无法参与某些需要使用您的个人数据才能正常运行的服务。</p>
<b>加州阳光法案</b>
<p>加州民法典第1798.83条，也称为“阳光法案”，允许加州居民用户每年一次免费向我们索取以下信息：我们出于直接营销目的向第三方披露的个人数据类别（如有），以及我们在上一个日历年度与之共享个人信息的所有第三方的名称和地址。如果您是加州居民并希望提出此类请求，请使用本隐私声明提供的联系方式以书面形式向我们提交您的请求。</p>

<h2>13. 如果您有其他疑问或投诉，该怎么办？</h2>
<p>如果您对个人数据的处理有任何疑问或投诉，请使用本隐私声明提供的联系方式与本公司联系。</p>

<p>您也有权向您工作地、居住地或涉嫌侵权行为发生地的主管数据保护机构提出投诉。</p>

<h2>14. 本隐私声明将如何更新？</h2>
<p>本公司可能会不时更新本隐私声明。如果修订内容会产生重大影响，本公司将尽力主动通知您。本公司将始终在系统中发布最新的隐私声明，并注明最新的修订内容。</p>
<p><span style='background-color:yellow'>注：本隐私声明用中文、英文及相关当地语言版本书写并发布，如不同语言版本之间存在不一致或冲突之处，在法律允许的范围内，应以英文版本或当地语言版本为准。</span></p>
`;
const privacyPolicyEnContent = `
<h2>1. INTRODUCTION</h2>
<p>We are pleased that you have came to us and are interested in our company, products and services. Your trust is important to us. We are committed to protecting your privacy and the security of information that can directly or indirectly be used to identify a natural person (hereinafter “Personal Data”) during the processing throughout the entire business process. We have created this Privacy Statement to explain how we collect and use your Personal Data. The Company collects Personal Data</p>
<p>Last updated: 【2026/03/12】.<p>
<p>When this Privacy Statement mentions “GOFO”, “the Company”, “we”, “us”, it is referring to the company that decides on the purposes and means of the processing of your Personal Data under this Privacy Statement. </p>
<p>Data Controller Information:</p>
<p>Name：【GOFO FRANCE】</p>
<p>Address:【10 rue Eugène Pottier 95670 Marly-la-Ville】 </p>
<p>Email:【 cs@mail.gofoexpress.fr 】 </p>
<p>The Company has appointed a Data Protection Officer. You can contact our DPO at <a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>.</p>

<h2>2. DOES THIS PRIVACY STATEMENT APPLY TO YOU?</h2>
<p>This Privacy Statement applies to you if you are a customer of the Company or if you contact us, for instance, by visiting【<a target="_blank" href="https://gfuc-eu.gofoexpress.com">https://gfuc-eu.gofoexpress.com</a> 】including any pages and mobile apps (hereafter “system”), or if you receive emails from us.</p>
<p>Our system, products and services are for a general audience and not aimed at children（The definition of the age threshold for children shall be determined in accordance with the applicable laws and regulations of the user’s place of residence）. In principle, we do not collect Personal Data from children.  If you are a child, you are requested not to provide any Personal Data, if you want to use our services, please rely on a parent or guardian to assist you.</p>
<p>If a child may have disclosed Personal Data to us, the parent or guardian can contact us, and we will remove Personal Data if required.</p>

<h2>3. WHAT PERSONAL DATA DO WE COLLECT?</h2>
<p>As a rule, the Personal Data that you provide directly or indirectly to the Company when using our services and visiting our system are:</p>
<p>- Contact Information. This includes your name, address, email address and telephone number</p>
<p>- Financial Information. This includes your bank account number, payment status and invoices;</p>
<p>- Account Information. This includes login information, including your user name, email address, telephone and other information provided through your account;</p>
<p>- Shipper’s Information. This includes shipper’s name, address, email address and telephone number;</p>
<p>- Recipient’s Information. This includes recipient’s name, address, email address and telephone number;</p>
<p>- User Data and Preferences. This includes, where applicable, shipment volumes, complaints, transaction history and related commercial activity, communications, survey information, and your preferences.</p>
<p>- Automatically generated information. This includes IP address, unique device or user ID, system and browser type, date and time stamp, referring website address, content and pages you accessed on our system or mobile applications, date, time, and location actions. </p>
<p>In addition to the above categories of Personal Data, depending on your interaction with us, we may collect other types of information that may or may not contain Personal Data. Such information related to shipments and services may include shipment tracking number, shipment routing information, location data, status of a shipment, delivery location, packaging type, number of pieces, weight, prices, picture of the parcel, proof of delivery and customs information. If we become aware that personal data of a child have been collected without the consent of the parent or legal guardian, we will promptly delete such data.</p>
<p>The Company does not intentionally collect or process special categories of personal data as defined in Article 9 GDPR (e.g., health data, political opinions, biometric data, etc.).</p>

<h2>4. HOW DO WE COLLECT PERSONAL DATA?</h2>
<p>The Company collects Personal Data when it is provided by the shipper or our contractual customer. If you are the shipper or our contractual customer, then we receive your Personal Data directly from you. Examples of situations where the Company collects Personal Data directly are:</p>
<p>- The name, address, and phone number of a person tendering the shipment are listed as the shipper.</p>
<p>- The name, address, identity information, payment card information, and account number of a person who opens the GOFO account, namely our contractual customer.</p>
 
<p>If the shipper or our contractual customer provides Personal Data of others, then we receive that Personal Data indirectly. Examples of situations where the Company collects Personal Data indirectly are:</p>
<p>- The name, address, and phone number of the recipient of the shipment.</p>
<p>- The name, address, phone number, email address, identifying information of the shipper or account holder’s director or representatives. </p>
<p>- The actual shipper’s name and address when the shipper places an order with an online market platform and the Company delivers the parcel to the address you provide.</p>
 
<p>When the Company receives Personal Data indirectly, we rely on the provider of the Personal Data for the accuracy of the information and that the provider has the authority to provide that information to GOFO. </p>

<h2>5. FOR WHICH PURPOSES AND ON WHAT GROUNDS DO WE PROCESS YOUR PERSONAL DATA?</h2>
<p>Personal Data shall be collected, used, stored, or otherwise processed when only necessary, within the framework of responsible, efficient and effective business management of GOFO. The Company processes Personal Data based on applicable legal grounds. The legal ground is often intrinsically linked to the business purpose. This means, for example, that the performance of an agreement can be both a legal ground and a business purpose for GOFO. Therefore, we will first clarify the legal ground on which the Company processes your Personal Data and, subsequently, the business purpose that we use your Personal Data for.</p>
<p>In general, the Company processes your personal data on one of the following legal grounds:</p>
<p>- The processing is necessary to fulfill an agreement,</p>
<p>- The processing is necessary for us to comply with our legal obligations,</p>
<p>- processing is necessary to protect your vital interests or those of another person,</p>
<p>- The processing is necessary for GOFO’s legitimate interests, unless those interests are overridden by your interests or fundamental rights and freedoms, or</p>
<p>- where appropriate and necessary, we will ask for your consent.</p>

<p>The Company collects, uses or processes personal data only where the processing falls within the scope of one (or more) of the legitimate business purposes listed below: </p>
<p>- Performing agreements. This includes delivery services, tracking services, communication with our contractual customer, shipper and other parties regarding services, responding to requests for further information, dispute resolution and preparing agreements.</p>
<p>- Product development, research and improvement of products and/or services. the Company processes Personal Data as necessary for the development and improvement of products and/or services, research and development (e.g., analyze information related to the delivery and services to improve our services).</p>
<p>- Relationship management and marketing for commercial activities. In general, the Company processes Personal Data as necessary for the development and improvement of products and/or services, account management, customer services and the performance of targeted marketing activities in order to establish a relationship with a customer and/or maintaining as well as extending a relationship with a customer or business partner and for performing analyses with respect to Personal Data for statistical purposes (e.g., send advertising, communications and content more specific to your interests to you). </p>
<p>- Business process execution, internal management, and management reporting. This includes addressing activities such as managing company assets, conducting internal audits and investigations, finance and accounting, implementing business controls, providing central processing facilities for efficiency purposes, managing mergers, acquisitions, and divestitures, and Processing Personal Data for management reporting and analysis.</p>
<p>- Security and Protection. The processing of data for processes such as those related to safety, protecting the Company and its customers, or business partners, and authenticating the status and access rights (e.g,. providing secure services for online and offline transactions) of customers or business partners.</p>
<p>- Protecting the vital interests of individuals. This includes processing data when necessary to protect your vital interests or those of other individuals (e.g., for urgent safety reasons).</p>
<p>- Compliance with legal obligations. This addresses the processing of Personal Data as necessary for compliance with laws and regulations to which the Company is subject (e.g., checking the names of customers and business partners against blacklists to avoid conflicts of interest, compliance with trade regulations, anti-money laundering and anti-corruption regulations and other policies, procedures and regulations).</p>
<p>Where processing is based on our legitimate interests, we will conduct a balancing test to ensure that your rights and freedoms are not overridden.</p>
<h2>6. HOW DO WE USE COOKIES?</h2>
<p>When you visit our system, we use cookies and similar technologies to make our system work properly, to analyze how they are used, and if you agree to personalize content and advertising. Your cookie preferences and consent records are securely stored as proof of compliance.</p>
<p>In accordance with the French Act No. 78-17 of 6 January 1978 on Information Technology, Data Files and Civil Liberties. , CNIL Guidelines and Recommandations on Cookies and Other Trackers on 17 Septembre 2020, Directive 2002/58/EC on privacy and electronic communications,   and the General Data Protection Regulation (GDPR), we will only place non-essential cookies (such as analytics or marketing cookies) after you have given your explicit consent through our cookie banner.</p>
<p>Our cookie banner allows you to:</p>
<p>- Accept all cookies,</p>
<p>- Reject non-essential cookies, or</p>
<p>- Manage your preferences per category (e.g., functional, analytical, marketing).</p>
<p>The types of cookies we use include:</p>
<p>- Strictly necessary cookies – required for the proper functioning of the website and therefore do not require consent.</p>
<p>- Analytical cookies – help us understand how visitors use our site so we can improve functionality and user experience. These are placed only with your consent.</p>
<p>- Marketing and tracking cookies – used to personalise content and ads and to measure the effectiveness of our marketing campaigns. These are also placed only with your consent.</p>
<p>For each cookie category, our Cookie Notice provides detailed information on:</p>
<p>- The purpose of each cookie;</p>
<p>- The provider (first or third party);</p>
<p>- The lifespan or storage duration of the cookie; and</p>
<p>- Whether data are shared with third parties and, if so, to which countries and under what safeguards (e.g., Standard Contractual Clauses).</p>
<p>You can change or withdraw your consent at any time by adjusting your cookie settings via the cookie banner or through your browser settings.</p>

<h2>7. HOW DO WE SHARE YOUR PERSONAL DATA?</h2>
<p>The Company shares your Personal Data with third parties in the following circumstances:</p>
<p>Internal Recipients:</p>
<p>- Share your personal data within our affiliates, operating groups, subsidiaries and divisions if such is necessary for the purposes as listed above.</p>
<p>- Our employees are authorized to access personal data only to the extent necessary to serve the applicable purpose and to perform their jobs. They are bound by confidentiality obligations and are required to keep your personal data secure.</p>
<p>External Recipients:</p>
<p>- Share your personal data with data processors such as vendors or service providers processing Personal Data on our behalf. In such cases, these third parties only use your Personal Data for the purposes described above and only in accordance with our instructions. When these third parties are given access to your personal data, we will take the required contractual, technical and organizational measures to ensure that your personal data are only processed to the extent that such processing is secured. The following third parties have access to your personal data, where relevant, for the provisioning of their products or services to us.</p>
<p>- Customs agency to perform customs formalities and declaration of your shipment.</p>
<p>- Last-mile delivery service provider to deliver the shipment to the destination you are expecting. </p>
<p>- IT services provider who develops, maintains our system and certain software.</p>
<p>- Cloud services provider: We may store data on servers operated by a cloud service provider to us. Regardless of where you use our online services or provide data to us, the data may be transferred to and maintained on servers located outside the country in which the data was collected. </p>
<p>- Law enforcement, regulators and other parties for legal reasons: We may also disclose your personal data to third parties as required by law, or if we reasonably believe that such action is necessary (a) to comply with a subpoena or other legal proceedings, legal actions or government agency requests; (b) when we believe in good faith that a disclosure is necessary to comply with the law and the reasonable requests of law enforcement; (c) to protect and exercise our legal claims, rights and property; (d) to protect your rights, property or personal safety or that of others; and (e) to investigate fraud.</p>
 
<p>Some of the third parties with whom we share your personal data are located within the European Economic Area (EEA). Where we engage third parties located outside the EEA, we ensure that such transfers are carried out in compliance with applicable data protection laws.</p>
<p>In particular:</p>
<p>- Personal data transferred to countries for which the European Commission has adopted an adequacy decision (such as the United Kingdom, Switzerland or Canada) are protected under that decision, which confirms that these countries ensure an adequate level of data protection.</p>
<p>- For transfers to other countries without an adequacy decision, the Company applies appropriate safeguards in accordance with Article 46 GDPR, including the use of the European Commission’s Standard Contractual Clauses (SCCs) or other legally recognized transfer mechanisms.</p>

<p>In exceptional cases, and only where permitted by law, transfers may take place under the specific derogations of Article 49 GDPR (for example, where the transfer is necessary for the performance of a contract concluded with you or for the establishment, exercise or defense of legal claims).</p>
<p>You may request further information about the international transfers of your personal data, including a copy of the relevant safeguards, by contacting our Data Protection Officer via <a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a>.</p>

<h2>8. HOW IS YOUR PERSONAL DATA SECURED?</h2>
<p>We have taken adequate safeguards to ensure the confidentiality and security of your personal data. We have implemented appropriate technical, physical and organizational measures to protect personal data against accidental or unlawful destruction or accidental loss, damage, alteration, unauthorized disclosure or access as well as all other forms of unlawful processing (including, but not limited to, unnecessary collection) or further processing, including protecting your Personal Data against unauthorized access, maintaining the confidentiality, integrity and availability of your Personal data, and training personnel on information security requirements.</p>
<p>However, no security measure can guarantee against compromise. You also have an important role in protecting your Personal Data. You should not share your username and password with anyone, and you should not re-use passwords across more than one system. If you have a reason to believe that your Personal Data has been compromised, please contact us.</p>

<h2>9. HOW LONG IS YOUR PERSONAL DATA RETAINED?</h2>
<p>Except as otherwise permitted or required by applicable law or regulation, we will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, as required to satisfy any legal, accounting, or reporting obligations, or as necessary to resolve disputes. To determine the appropriate retention period for personal data, we consider applicable legal requirements, the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes we process your personal data for, and whether we can achieve those purposes through other means. </p>
<p>Under some circumstances, we may anonymize your personal data so that it can no longer be associated with you. We reserve the right to use such anonymous and de-identified data for any legitimate business purpose without further notice to you or your consent. </p>
<p>The following outlines the main retention periods for Personal Data held by GOFO:</p>
<p>1. Customer Management and Products/Services Offered by GOFO or its Subsidiaries:</p>
<p>- Subscription and Account Creation: Personal Data will be retained for a period of 3 years from the last authentication or the account deletion date, provided that no active services associated with your account remain.</p>
<p>- Delivery Preferences Management: Personal Data will be retained for 5 years from the last update or change.</p>
<p>2. Commercial Prospecting:</p>
<p>- Personal Data for commercial prospecting purposes will be retained for 3 years from the last contact with the prospect or until the data subject withdraws consent.</p>
<p>3. Recording of Telephone Conversations (Customer Service):</p>
<p>- Telephone conversation recordings will be retained for 6 months from the date of recording.</p>
<p>4. Fraud and Cybercrime Detection, Prevention, and Combat:</p>
<p>- Data related to fraud detection and prevention will be retained for a maximum of 12 months from the date the fraud alert was recorded.</p>
<p>5. Processing of Requests to Exercise Rights (e.g., data access, correction, deletion):</p>
<p>- Personal Data related to requests for exercising rights will be retained for a maximum of 5 years from the date of processing, with the exception of identity proof documents, which will be retained for 1 year.</p>
<p>6. Accounting and Financial Record-Keeping:</p>
<p>- Personal Data related to accounting purposes will be retained for 10 years from the end of the financial year in which the relevant data was generated.</p>

<h2>10. WHERE DO WE STORE OR TRANSFER YOUR PERSONAL DATA?</h2>
<p>Generally, the Personal Data with respect to you legally collected by the Company will be stored in EU member states,France.</p>
<p>Due to the nature of our business and the services we provide to you, the Company may need to transfer your Personal Data to its affiliates or subsidiaries located in other countries or regions in order to perform the agreements with you or achieve the purposes provided in this Statement. In any case where we transfer Personal Data, we shall ensure that such transfers are subject to appropriate safeguards not lower than the level of protection required by applicable data protection laws in the EU and the France. Before cross-border transmission or remote access, we will complete the necessary procedures in accordance with the relevant personal data protection laws and regulations.</p>

<h2>11.WHAT RIGHTS CAN YOU EXERCISE IN RELATION TO YOUR PERSONAL DATA?</h2>
<p>Based on the law applicable to the use of your Personal Data, you may have rights that you can exercise in relation to your Personal Data. Note that in some cases we are not required to completely comply with your request, as such rights may be conditional or because we have to balance your rights against our rights and obligations to process your Personal Data and to protect the rights and freedoms of others. A number of the rights you have in relation to your Personal Data, as applicable in the European Economic Area, the State of California, or other US or international geographic jurisdictions, are explained below:</p>
<b>Right of access</b>
<p>You may be entitled to a copy of the Personal Data we hold about you and receive details concerning its processing. Your Personal Data will usually be provided in  a structured, commonly used, and machine-readable format. </p>
<b>Right to rectification</b>
<p>We take reasonable steps to ensure that the Personal Data we hold about you is accurate and complete. However, if you believe this is not the case, you may have the right to request the rectification of any inaccurate or incomplete Personal Data .</p>
<b>Right to erasure</b>
<p>You may have the right to ask us to erase your Personal Data, provided that the retention of such data is not necessary for:</p>
<p>- Compliance with a legal obligation;</p>
<p>- The performance of a contract with you;</p>
<p>- The establishment, exercise, or defense of legal claims;</p>
<b>Right to restriction of processing</b>
<p>You may be entitled to ask us to (temporarily) restrict the processing of your Personal Data (i.e., temporarily "freeze" its use) in certain circumstances, for example, where you think that the Personal Data we hold about you may be inaccurate or where you think that we no longer need to use your Personal Data.</p>
<b>Right to data portability</b>
<p>You may have the right to ask that we transfer Personal Data that you have provided to us to a third party of your choice. This right can only be exercised when you have provided the Personal Data to us, and when we are processing such data by automated means on the basis of your consent or in order to fulfil our obligations under a contract with you.</p>
<b>Right to object</b>
<p>You may have the right to object to processing which is based on our legitimate interests on grounds relating to your specific situation. We will cease the processing unless we can demonstrate compelling legitimate grounds for the processing which override your interests, rights, and freedoms, or for the establishment, exercise, or defense of legal claims. In the processing of Personal Data for marketing purposes, you have the right to object at any time. When you ask us to restrict to processing your Personal Data for marketing purposes, the Company will immediately cease to use your Personal Data for such purposes. Note, however, that we may not be able to provide certain services or benefits if we are unable to process the necessary Personal Data for that purpose.</p>
<b>Right to automated decision-making</b>
<p>The Company may use automated processing techniques, including profiling, in limited circumstances for two main purposes:</p>
<p>(1) Marketing and Service Personalization</p>
<p>The Company analyses certain aspects of your interaction with our system, emails, and services — such as browsing activity, clicks, purchase history, shipment patterns, and preferences to better understand your interests.</p>
<p>This profiling helps us:</p>
<p>- Provide more relevant and tailored content, offers, and advertisements;</p>
<p>- Improve our system and service experience;</p>
<p>- Measure and optimise the effectiveness of our marketing activities.</p>
<p>The logic used in this profiling is based on observable patterns of behaviour and aggregated analytics data. These activities do not produce legal effects or similarly significantly affect you within the meaning of Article 22 GDPR.</p>
<p>You can object at any time to this type of profiling or direct marketing by adjusting your cookie and marketing settings. If you object, we will immediately restrict to processing your personal data for these purposes.</p>
<p>(2) Fraud Prevention and Risk Management</p>
<p>The Company may also use automated systems and scoring models to help detect and prevent fraudulent activities or misuse of our services. For example, automated systems may analyze shipment information, account activity, and transaction patterns to identify irregularities that could indicate fraud or security risks.</p>
<p>Such automated processing is carried out to protect our legitimate interests (Article 6(1)(f) GDPR) and to comply with our legal obligations regarding fraud prevention, customs, and anti-money laundering.</p>
<p>In these cases, automated tools may flag transactions or require manual review by authorized Company staff. We do not take any decisions solely based on automated processing that would produce legal effects concerning you or similarly significantly affect you without human involvement.</p>
<p>You have the right to:</p>
<p>- Request human intervention in any decision that involves automated processing;</p>
<p>- Express your point of view and contest the decision; and</p>
<p>- Obtain an explanation of the logic involved in such automated processing.</p>
<p>You may have the right not to be subjected to automated decision-making, including profiling, which produces legal effect for you or has a similar significant effect.</p>
<b>Right to withdraw consent</b>
<p>We may ask for your consent to process your Personal Data in specific cases. When we do this, you have the right to withdraw your consent at any time. The Company will stop further processing as soon as possible after the withdrawal of your consent. However, this does not affect the lawfulness of the processing before consent was withdrawn.</p>
<p>If you wish to excess your rights regarding your personal data, following the following procedure:</p>
<p>a)The request may be sent:</p>
<p>- by email to <a href="mailto:dpo@gofoexpress.com">dpo@gofoexpress.com</a> or </p>
<p>- by letter directly to the GOFO’s office at 10 Rue Eugène Pottier, 95670 Marly-la-Ville, France </p>
<p>In accordance with Article 12 of GDPR, you are required to provide the proof of identity by any means when exercising your rights. In the event that you are acting on behalf of a third party, you are required to provide a copy of the public deed of power of attorney or a simple power of attorney executed before two witnesses, as applicable. Additionally, you must present your original identification for visual verification by the recipient of the request.</p>
<p>If, after contacting us, you believe that your rights regarding your Personal Data have not been adequately respected, you have the right to file a complaint with the Commission Nationale de l'Informatique et des Libertés (CNIL) at the following address:</p>
<p>- 3 Place de Fontenoy - TSA 80715 - 75334 Paris Cedex 07, France</p>
<p>- Tel: +33 1 53 73 22 22</p>
<p>b) GOFO shall have a maximum period of twenty (20) calendar days, starting from the date on which it receives a request for exercising your rights, via the same means by which the request was submitted, to notify the data subject of the acceptance or refusal of such request. In the event that the request is accepted, GOFO shall have an additional period of fifteen (15) calendar days from the date of notification to the User to make the necessary modifications. The aforementioned timeframes may be extended only once for an equal period, provided that  provides a valid justification for the extension.</p>
<p>c) Similarly, GOFO may deny a request to exercise your rights (including access, rectification, erasure, or objection) in the following circumstances:</p>
<p>- The requesting person is not the owner of the personal data, or is unable to provide sufficient evidence that they are the duly accredited legal representative of the data subject;</p>
<p>- Despite our reasonable efforts, we are unable to identify the data subject within our systems based on the information provided.</p>
<p>- When there is a legal impediment, or the resolution of a competent authority, that restricts access to the User’s personal data, or does not allow their rectification, cancellation or opposition, and</p>
<p>In all the above cases, GOFO will inform the requesting person, as the case may be, the reason for their decision by the same means by which the request was made, accompanying, where appropriate, the relevant justifications.</p>
<h2>12. CALIFORNIA CONSUMERS</h2>
<p>If you are a California resident, you can make certain requests regarding your Personal Data. We will fulfil each of these requests per the requirements of California law.</p>
<p>You can request access to a copy of the Personal Data we have about you, including a list of categories of your Personal Data that we have shared with another company for a business purpose.</p>
<p>You can request that we delete your Personal Data.</p>
<p>You can request that we stop selling your Personal Data. </p>
<p>More information on each of these requests is below.</p>
<b>Request access to Personal Data</b>
<p>If you make this request, which we also refer to as a Request to Access Information, we will return to you (to the extent required by law):</p>
<p>The categories of Personal Data we have collected about you.</p>
<p>The categories of sources from which we collect your Personal Data.</p>
<p>The business or commercial purpose for collecting or selling your Personal Data.</p>
<p>The categories of third parties with whom we share Personal Data.</p>
<p>The specific pieces of Personal Data we have collected about you.</p>
<p>A list of categories of Personal Data that we have disclosed for a business purpose, along with the category of any other company we shared with.</p>
<p>You can ask us to provide you with this information up to two times in a rolling twelve-month period. When you make this request, the information provided may be limited to the Personal Data we collected about you in the previous 12 months.</p>
<b>Delete the Personal Data</b>
<p>You have the right to ask that we delete your Personal Data. Once we receive a request, we will delete the Personal Data (to the extent required by law) we hold about you as of the date of your request from our records and direct any service providers to do the same. In some cases, deletion may be accomplished through de-identification of the information. Choosing to delete your Personal Data may impact your ability to use our system and online features, including closure of your online account.</p>
<b>No Discrimination</b>
<p>We will not discriminate against you for exercising your rights. This generally means we will not deny you using our services, or provide a different level or quality of our services. Please know, if you ask us to delete your information, it may impact your experience with us, and you may not be able to participate in certain services that require the use of your Personal Data to function.</p>
<b>Shine the light law</b>
<p>California Civil Code Section 1798.83, also known as the “Shine The Light” law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal data (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided at the top of this Privacy Statement.</p>
<h2>13. HOW WILL THIS PRIVACY STATEMENT BE UPDATED?</h2>
<p>The Company may update this Privacy Statement from time to time. If an amendment has a serious impact, the Company will endeavor to inform you about such amendments actively. The Company will publish an up-to-date Privacy Statement on the system at all times, indicating the latest amendments.</p>`;

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
    color: var(--form-item--label) !important;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  .email-input {
    :deep(.el-input__icon) {
      font-size: 20px;
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
      font-size: 13px;
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
