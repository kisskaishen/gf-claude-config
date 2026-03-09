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

const { t, locale } = useI18n();

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

// 用户注册协议内容
const userAgreementContent = `
<p><span>版本生效日期：【2026-3-12】</span></p>
<p>本用户协议的所有权归属【GOFO】（以下简称“GOFO”、“我们”及“公司”），其定义如下：</p>
<p><b>争议解决：</b>欧盟委员会提供在线争议解决（ODR）平台：<a href="https://ec.europa.eu/consumers/odr"><b>https://ec.europa.eu/consumers/odr</b></a></p>
<p>本用户协议（下称“本协议”）适用您注册及使用用户中心系统（<a href="https://gfuc-eu.gofoexpress.com"><b>https://gfuc-eu.gofoexpress.com</b></a>）的行为。您在 GOFO 系统注册界面上点击“登录”、“提交”、“确认”或“注册”按钮，即视为已阅读并同意本协议。若您不接受本协议或其中任何条款，请立即停止使用服务。</p>
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
<h2>GOFO Terms of Use</h2>
<p><span>Effective Date: 【2026-03-12】</span></p>
<p><b>Dispute Resolution:</b> The European Commission provides an online dispute resolution (ODR) platform: <a href="https://ec.europa.eu/consumers/odr"><b>https://ec.europa.eu/consumers/odr</b></a></p>
<p>This Terms of Use applies to your registration and use of the system (<a href="https://gfuc-eu.gofoexpress.com" style='background-color:yellow'><b>https://gfuc-eu.gofoexpress.com</b></a>). By clicking “Log in”, “Submit”, “Confirm” or “Register”, you acknowledge that you have read and agreed to this Agreement. If you do not accept any clause, please stop using the services.</p>
<h2>1. Scope of this Agreement</h2>
<p>1.1 This Agreement is a binding contract between you and GOFO.</p>
<p>1.2 GOFO has subsidiaries and/or related legal entities that may provide services on behalf of GOFO. You agree they are entitled to provide services to you.</p>
<p>1.3 This Agreement applies to your use of the system. Services provided by GOFO and its subsidiaries and/or related legal entities are subject to the specific contract(s) separately signed with you.</p>
<p>1.4 GOFO may change or modify this Agreement to reflect legal or service changes and will announce updates on the system. Continued use after changes take effect means you have read, understood, and accepted the updated Agreement; otherwise, stop using the system.</p>
<h2>2. User</h2>
<p>2.1 If you are a natural person, you confirm you have the capacity for civil conduct before registering a GOFO account. Otherwise, stop registering or using the system; you and your guardian bear the resulting consequences.</p>
<p>2.2 If you are a legal entity, you confirm you are legally established and qualified under applicable laws and that entering into and performing this Agreement does not violate applicable laws. Otherwise, stop registering or using GOFO services and bear the resulting consequences.</p>
<h2>3. Account and Password</h2>
<p>3.1 To access the system and use services, register an account and provide complete, correct, and accurate information (e.g., name/company name, email, phone, country) and keep it updated. You are responsible for damages arising from false, incorrect, or incomplete information.</p>
<p>3.2 If you set a username, it must not violate applicable laws and regulations; otherwise GOFO may deny or cancel your account. If false or improper information is discovered after registration, GOFO may require correction, suspend use, or cancel your account.</p>
<p>3.3 Generally, each user may use only one GOFO account. If there is evidence or reason to believe improper registration/use of multiple accounts, GOFO may cancel accounts, refuse services, and terminate this Agreement; you are liable for losses caused.</p>
<h2>4. Account Management</h2>
<p>4.1 If you have a GOFO account, you may log in with your username and password. Your account is for your own use only. If you authorize others to use your account, you bear full responsibility for actions taken under your account. If use of your account may endanger account or information security, GOFO may refuse services or terminate this Agreement.</p>
<p>4.2 GOFO will never proactively ask for your password. Keep your account and password secure. You are responsible for losses due to disclosure to third parties and for all actions under your account.</p>
<p>4.3 If you lose or forget account information for personal reasons, provide legal, true, accurate and valid information for verification; otherwise, we cannot reset your password. We need reasonable time to act on requests and are not responsible for consequences of unauthorized use.</p>
<p>4.4 GOFO may reclaim your account and terminate related services in the following cases:</p>
<p>(1) You seriously violate obligations under a service contract with GOFO.</p>
<p>(2) You fail to complete real‑name and/or qualification authentication as required.</p>
<p>4.5 You must complete required real‑name and/or qualification authentication; otherwise you may be unable to access/log in or use services normally.</p>
<p>4.6 You may transfer or grant your account only with GOFO’s consent; GOFO may require qualified documents from you and the recipient. Upon transfer, rights and obligations under the account and this Agreement transfer together. Otherwise, GOFO may pursue breach liability and you bear resulting responsibilities.</p>
<p>4.7 To cancel your account, contact GOFO. Account cancellation is irreversible. After receiving your request, GOFO will verify your identity. GOFO will cancel your account if:</p>
<p>(1) You apply for cancellation and follow GOFO procedures.</p>
<p>(2) You remain responsible for actions prior to cancellation and GOFO may retain relevant information.</p>
<p>(3) Your cancellation does not affect performance of other agreements with GOFO.</p>
<p>(4) After successful cancellation, account information, records and related rights cannot be restored or provided.</p>
<h2>5. Services</h2>
<p>5.1 The system provides an online platform for services offered by GOFO. You may not enjoy all services shown; system information does not constitute a service commitment. Specific services are subject to the agreement(s) you sign with GOFO.</p>
<p>5.2 Services and information are provided on an “as is” and “as available” basis. To the fullest extent permitted by law, GOFO disclaims all warranties and makes no representations as to accuracy, completeness, security or timeliness.</p>
<p>5.3 GOFO is not liable for damages due to equipment maintenance, power failure, strikes, riots, fire, flood, storms, explosions, war, government actions, judicial/administrative orders, or failures of servers, computers, communications, or third‑party causes.</p>
<p>5.4 The system may display content not belonging to GOFO; publishers bear responsibility. GOFO may review content and remove or refuse to display content that violates policies or laws, without obligation to review all content.</p>
<h2>6. Disclaimer</h2>
<p>6.1 GOFO may change, interrupt, or terminate system functions without prior notice and does not guarantee uninterrupted operation, timeliness, security, or accuracy.</p>
<p>6.2 GOFO is not responsible for interruptions due to: (1) maintenance/upgrade without prior notice; (2) force majeure; (3) your hardware/software failure; (4) viruses, attacks, congestion, instability, equipment/communication/power failures, banking reasons, third‑party defects, or government actions.</p>
<p>6.3 GOFO will take reasonable actions to restore services.</p>
<h2>7. Intellectual Property</h2>
<p>Unless otherwise stated in writing, all rights in products, technologies, software, programs, data, text, images, audio, video, charts, layouts, electronic documents and any information or materials displayed on the system are owned by GOFO, including copyrights, trademarks, patents, trade secrets and other related rights. Without GOFO’s express written authorization, you may not use such content, including copying, disseminating, displaying, mirroring or downloading. Accessing or using the system grants no rights to any information or content.</p>
<h2>8. Termination</h2>
<p>8.1 You may terminate this Agreement by: (1) stopping use of the system; (2) stopping use and expressly not accepting changes/modifications; (3) expressly notifying GOFO that you will not continue to use the system and meeting GOFO’s termination conditions.</p>
<p>8.2 GOFO may terminate this Agreement if: (1) you violate laws or this Agreement or other agreements with GOFO; (2) you commit fraud, misuse accounts, make false transactions, or take improper advantage, or endanger transaction/account security; (3) you misuse GOFO services; (4) your account is cancelled under this Agreement; (5) other reasonable circumstances.</p>
<p>8.3 Termination does not affect the validity of orders processed via the system or other agreements signed between you and GOFO.</p>
<h2>9. Notice</h2>
<p>9.1 GOFO may notify you via system messages or your provided contact information (email, phone, address). These notices may significantly affect your rights and obligations; keep your information updated. Electronic notices (SMS, email, system messages) are deemed served upon successful sending; written notices are deemed delivered on the fifth natural day after mailing to your address.</p>
<p>9.2 For disputes arising from this Agreement, you agree judicial institutions may send legal documents to your provided phone, email or other contact details; the sending date is deemed the service date.</p>
<p>9.3 You must ensure contact information is accurate, effective and updated in real time; otherwise, you bear consequences if notices cannot be delivered.</p>
<h2>10. Miscellaneous</h2>
<p>10.1 If any provision is repealed, invalid or unenforceable, it is severable and does not affect the validity or enforceability of the remaining provisions.</p>
<p>10.2 Within the scope permitted by applicable law, GOFO reserves the right of final interpretation and amendment of this Agreement.</p>
`;
// 用户隐私政策内容
const privacyPolicyContent = `
  <h2>1. 引言</h2>
<p>我们很高兴您访问我们，并对本公司的业务、产品及服务表示关注。您的信任对我们至关重要。我们致力于在整个业务流程中的个人数据处理活动中，保护您的隐私以及任何可直接或间接识别自然人身份的信息（以下简称“个人数据”）的安全。为此，我们制定本《隐私声明》，以说明我们如何收集和使用您的个人<p>数据。</p>
<p>最后更新日期：【2026/03/12】。</p>
<p>本《隐私声明》中提及“公司”、“我们”或“我们的”，系指根据本声明决定您个人数据处理目的和方式的公司主体。</p>
<p><b>数据控制者信息：</b><span style='background-color:yellow'>详见《隐私声明》英文及相关当地语言版本中的相关数据控制者的信息</span></p>
<p>公司已指定一名数据保护官（Data Protection Officer，简称“DPO”）。您可通过以下邮箱与我们的DPO联系：dpo@gofoexpress.com。</p>
<h2>2. 本隐私声明是否适用于您？</h2>
<p>如您为本公司的客户，或通过访问<a href="https://gfuc-eu.gofoexpress.com">【https://gfuc-eu.gofoexpress.com】</a>（包括其任何页面及移动应用，以下统称“系统”）与我们联系，或接收我们发送的电子邮件，则本《隐私声明》适用于您。</p>
<p>我们的系统、产品和服务面向一般公众，并非专门针对儿童（儿童年龄界限的定义以用户所在地适用的相关法律法规为准）。原则上，我们不会主动收集儿童的个人数据。如您为儿童，请勿向我们提供任何个人数据；如需使用我们的服务，请在父母或监护人的协助下进行。</p>
<p>如我们可能已收集儿童的个人数据，其父母或监护人可与我们联系；在核实后，我们将根据要求删除相关个人数据。</p>
<h2>3. 我们收集哪些个人数据？</h2>
<p>在开展业务活动及提供服务过程中，公司需要处理您的个人数据。如未能提供相关个人数据，我们将无法向您提供所请求的服务。</p>
<p>通常情况下，您在使用我们的服务及访问我们的系统时，直接或间接向公司提供的个人数据包括：</p>
<p><b>联系方式信息。</b> 包括您的姓名、地址、电子邮箱地址及电话号码；</p>
<p><b>财务信息。</b> 包括您的银行账户号码、付款状态及发票信息；</p>
<p><b>账户信息。</b> 包括登录信息（如用户名、电子邮箱地址、电话号码）以及通过<b>您的账户提供的其他相关信息；</p>
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
<p>为实现 GOFO 的合法利益所必需，但该等利益不应凌驾于您的利益或基本权</p><p>利与自由之上；</p>
<p>在适当且必要的情况下，我们将征得您的同意。</p>

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
<p>营销及追踪类 Cookies ——用于个性化内容和广告，并衡量营销活动的效果。</p>
<p>该类 Cookies 亦仅在您同意后设置。</p>
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

<p>您可以联系我们的数据保护官（邮箱：dpo@gofoexpress.com）获取有关您的个人数据国际传输的更多信息，包括相关保障措施的副本。</p>

<h2>8. 您的个人数据如何受到保护？</h2>
<p>我们已采取充分的保护措施，确保您个人数据的保密性和安全性。我们已实施适当的技术、物理和组织措施，以保护个人数据免遭意外或非法销毁、意外丢失、损坏、更改、未经授权的披露或访问，以及所有其他形式的非法处理（包括但不限于不必要的收集）或进一步处理，包括保护您的个人数据免遭未经授权的访问、维护您个人数据的保密性、完整性和可用性，以及对员工进行信息安全要求方面的培训。</p>

<p>但是，没有任何安全措施能够完全保证数据安全。您在保护个人数据方面也扮演着重要的角色。您不应与任何人分享您的用户名和密码，也不应在多个系统中重复使用密码。如果您有理由相信您的个人数据已被泄露，请立即与我们联系。</p>

<h2>9. 您的个人数据将保留多久？</h2>

<p>除非适用法律法规另有规定或要求外，我们将仅在为实现收集目的、履行任何法律、会计或报告义务或解决争议所必需的时间内保留您的个人数据。为确定个人数据的适当保留期限，我们会考虑适用的法律要求、个人数据的数量、性质和敏感性、未经授权使用或披露您的个人数据可能造成的潜在风险、我们处理您的个人数据的目的，以及我们是否可以通过其他方式实现这些目的。</p>
<p>在特定情况下，我们可能会匿名化您的个人数据，使其不再与您关联。我们保留在不另行通知您或征得您同意的情况下，将此类匿名化和去标识化数据用于任何合法商业目的的权利。</p>
<p><span style='background-color:yellow'>本隐私声明中所涉及的个人数据的留存期限详见《隐私声明》英文及相关当地语言版本中的相关规定。</span></p>

<h2>10. 我们在哪里存储或传输您的个人数据？</h2>
<p>通常情况下，公司依法收集的关于您的个人数据将存储在欧盟成员国境内。</p>

<p>鉴于我们业务的性质以及我们向您提供的服务，公司可能需要将您的个人数据传输至位于其他国家或地区的关联公司或子公司，以便履行与您签订的协议或实现本声明中所述的目的。在任何情况下，如果我们传输个人数据，我们将确保此类传输受到适当的保障措施，<span style='background-color:yellow'>其保护水平不低于欧盟以及业务发生国适用数据保护法律所要求的保护水平。</span在进行跨境传输或远程访问之前，我们将根据相关的个人数据保护法律法规完成必要的程序。</p>

<h2>11. 您可以就您的个人数据行使哪些权利？</h2>
<p>根据适用于您个人数据处理的法律，您可能拥有与您的个人数据相关的权利。请注意，在某些情况下，我们无需完全满足您的请求，因为这些权利可能附带条件，或者因为我们必须平衡您的权利与我们处理您的个人数据以及保护他人权利和自由的权利和义务。以下解释了您在欧洲经济区、加利福尼亚州或其他美国或国际司法管辖区享有的部分个人数据权利：</p>
<p>访问权</p>
<p>您有权获取我们持有的关于您的个人数据的副本，并了解我们如何使用这些数据的详细信息。您的个人数据通常会以电子方式提供给您。在提供所请求的信息之前，我们可能会要求您证明您的身份。</p>
<p>更正权</p>
<p>我们会采取合理措施，确保我们持有的关于您的信息准确完整。但是，如果您认为情况并非如此，您有权要求我们更正任何关于您的不完整或不准确的个人数据。</p>
<p>删除权</p>
<p>您有权要求我们删除您的个人数据，例如，当我们收集的个人数据不再用于最初目的、个人数据已过时或您撤回同意（如果我们基于您的同意处理您的个人数据）时。但是，这需要与其他因素进行权衡。例如，由于某些法律或监管义务，我们可能无法满足您的请求。</p>
<p>限制处理权</p>
<p>您有权要求我们（暂时）停止使用您的个人数据，例如，当您认为我们持有的关于您的个人数据可能不准确或您认为我们不再需要使用您的个人数据时。
<p>数据可携权</p>
<p>您有权要求我们将您提供给我们的个人数据传输给您指定的第三方。只有在您向我们提供个人数据，且我们基于您的同意或为了履行与您签订的合同项下的义务而通过自动化方式处理该数据时，您才能行使此项权利。</p>
<p>反对权</p>
<p>您有权反对我们基于合法利益处理您的个人数据。对于出于营销目的处理您的个人数据，您有权随时提出反对。当您要求我们停止将您的个人数据用于营销目的时，我们将立即停止使用您的个人数据。对于基于我们合法利益的其他目的，如果您基于自身情况提出反对，我们将不再基于该目的处理您的个人数据，除非我们有令人信服的合法理由进行处理。但请注意，如果我们无法处理为特定目的所需的个人数据，我们可能无法向您提供某些服务或权益。</p>
<p>与自动化决策相关的权利</p>
<p>本公司可能在特定情况下使用自动化处理技术（包括用户画像），主要用于<p>以下两个目的：</p>
<p>(1) 市场营销和服务个性化</p>
<p>本公司会分析您与我们系统、电子邮件和服务互动中的某些方面，例如浏览活动、点击记录、购买历史、发货模式和偏好，以便更好地了解您的兴趣。</p>
<p>用户画像有助于我们：</p>
<p>提供更相关、更个性化的内容、优惠和广告；</p>
<p>改进我们的系统和服务体验；以及衡量并优化我们营销活动的有效性。</p>
<p>用户画像中使用的逻辑基于可观察的行为模式和汇总的分析数据。这些活动不会产生法律效力，也不会根据《通用数据保护条例》(GDPR) 第 22 条的规定对您造成类似重大影响。</p>
<p>您可以随时通过联系我们的数据保护官（邮箱：dpo@gofoexpress.com）或调整您的Cookie和营销设置，反对此类用户画像或直接营销。如果您提出反对，我们将立即停止将您的个人数据用于这些目的。</p>
<p>（2）欺诈预防和风险管理</p>
<p>本公司也可能使用自动化系统和评分模型来帮助检测和预防欺诈活动或滥用我们的服务。例如，自动化系统可能会分析包裹信息、账户活动和交易模式，以识别可能表明欺诈或安全风险的异常情况。</p>
<p>进行此类自动化处理是为了保护我们的合法权益（GDPR 第 6 条第 1 款 (f) 项），并履行我们在欺诈预防、海关和反洗钱方面的法律义务。</p>
<p>在这些情况下，自动化工具可能会标记交易或要求由公司授权人员进行人工审核。我们不会仅基于自动化处理做出任何会对您产生法律效力或类似重大影响的决定，除非有人工参与。</p>
<p>您有权：</p>
<p>要求对任何涉及自动化处理的决定进行人工干预；</p>
<p>表达您的观点并对该决定提出异议；以及</p>
获得对此类自动化处理所涉逻辑的解释。</p>
<p>您可能有权拒绝对您产生法律效力或类似重大影响的自动化决策，包括用户画像分析。</p>
<p>如需行使这些权利或了解更多关于我们用户画像分析实践的信息，请联系我们的数据保护官，邮箱地址为 dpo@gofoexpress.com。</p>
<p>撤回同意的权利</p>
<p>在特定情况下，我们可能会征求您的同意以处理您的个人数据。在这种情况下，您有权随时撤回您的同意。公司将在您撤回同意后尽快停止进一步处理。但是，这并不影响撤回同意前处理的合法性。</p>
<p>我们将根据 GDPR 第 12 条第 3 款的规定，在一个月内回复您的请求。
如果您认为您的数据处理违反了 GDPR，您有权向当地主管数据保护机构提出投诉。</p>

<h2>12. 加州消费者</h2>
<p>如果您是加州居民，您可以就您的个人数据提出某些请求。我们将根据加州法律的要求满足您的每一项请求。</p>
<p>您可以请求获取我们持有的关于您的个人数据副本，包括我们出于商业目的与其他公司共享的您的个人数据类别列表。</p>
<p>您可以请求我们删除您的个人数据。</p>
<p>您可以请求我们停止出售您的个人数据。</p>

<p>以下是关于每项请求的更多信息。</p>
<p>请求访问个人数据</p>
<p>如果您提出此请求（我们也称之为“访问信息请求”），我们将（在法律要求的范围内）向您提供以下信息：</p>
<p>我们收集的关于您的个人数据类别。</p>
<p>我们收集您的个人数据的来源类别。</p>
<p>我们收集或出售您的个人数据的商业或商业目的。</p>
<p>我们与之共享个人数据的第三方类别。</p>
<p>我们收集的关于您的具体个人数据。</p>
<p>我们已出于商业目的披露的个人数据类别列表，以及我们与之共享的任何其他公司的类别。</p>
<p>您可以在连续十二个月内最多两次要求我们提供此信息。当您提出此请求时，所提供的信息可能仅限于我们在过去 12 个月内收集的关于您的个人数据。
<p>删除个人数据</p>
<p>您有权要求我们删除您的个人数据。一旦我们收到请求，我们将从我们的记录中删除截至您请求之日我们持有的关于您的个人数据（在法律要求的范围内），并指示任何服务提供商执行相同的操作。在某些情况下，删除可以通过对个人数据进行匿名化处理来实现。选择删除您的个人数据可能会影响您使用我们的系统和在线功能，包括关闭您的在线账户。</p>
<p>不歧视</p>
<p>我们不会因您行使您的权利而对您进行歧视。这通常意味着我们不会拒绝您使用我们的服务，也不会提供不同级别或质量的服务。请注意，如果您要求我们删除您的信息，可能会影响您使用我们服务的体验，并且您可能无法参与某些需要使用您的个人数据才能正常运行的服务。</p>
<p>加州阳光法案</p>
<p>加州民法典第1798.83条，也称为“阳光法案”，允许加州居民用户每年一次免费向我们索取以下信息：我们出于直接营销目的向第三方披露的个人数据类别（如有），以及我们在上一个日历年度与之共享个人信息的所有第三方的名称和地址。如果您是加州居民并希望提出此类请求，请使用本隐私声明提供的联系方式以书面形式向我们提交您的请求。</p>

<h2>13. 如果您有其他疑问或投诉，该怎么办？</h2>
<p>如果您对个人数据的处理有任何疑问或投诉，请使用本隐私声明提供的联系方式与本公司联系。</p>

<p>您也有权向您工作地、居住地或涉嫌侵权行为发生地的主管数据保护机构提出投诉。</p>

<h2>14. 本隐私声明将如何更新？</h2>
<p>本公司可能会不时更新本隐私声明。如果修订内容会产生重大影响，本公司将尽力主动通知您。本公司将始终在系统中发布最新的隐私声明，并注明最新的修订内容。</p>
<p><span style='background-color:yellow'>注：本隐私声明用中文、英文及相关当地语言版本书写并发布，如不同语言版本之间存在不一致或冲突之处，在法律允许的范围内，应以英文版本或当地语言版本为准。</span></p>
`;
const privacyPolicyEnContent = `
<h2>1. Introduction</h2>
<p>We are pleased that you are interested in our company, products and services. Your trust is important to us. We are committed to protecting your privacy and the security of information that can directly or indirectly identify a natural person (<span>“Personal Data”</span>) throughout our business processes. This Privacy Statement explains how we collect and use your Personal Data.</p>
<p><b>Last updated:</b> <span>【2026/03/12】</span></p>
<p>References in this Privacy Statement to <b>“GOFO”</b>, <b>“the Company”</b>, <b>“we”</b>, or <b>“us”</b> refer to the company that determines the purposes and means of processing your Personal Data under this Privacy Statement.</p>
<p><b>Data Controller Information:</b></p>
<p><b>Name:</b> <span>GOFO FRANCE</span></p>
<p><b>Address:</b> <span>10 rue Eugène Pottier 95670 Marly-la-Ville</span></p>
<p><b>Email:</b> <span>cs@mail.gofoexpress.fr</span></p>
<p>The Company has appointed a Data Protection Officer. You can contact our DPO at <a href="mailto:dpo@gofoexpress.com"><b>dpo@gofoexpress.com</b></a>.</p>

<h2>2. Does This Privacy Statement Apply To You?</h2>
<p>This Privacy Statement applies if you are a customer of the Company, if you contact us, for example by visiting <a href="https://gfuc-eu.gofoexpress.com"><b>https://gfuc-eu.gofoexpress.com</b></a> (including any pages and mobile apps, the “system”), or if you receive emails from us.</p>
<p>Our system, products and services are for a general audience and are not aimed at children (the age threshold is determined by applicable laws in your place of residence). In principle, we do not collect Personal Data from children. If you are a child, please do not provide any Personal Data; if you want to use our services, please rely on a parent or guardian to assist you.</p>
<p>If a child has disclosed Personal Data to us, a parent or guardian can contact us and we will remove the Personal Data if required.</p>

<h2>3. What Personal Data Do We Collect?</h2>
<p><b>Contact Information.</b> Includes your name, address, email address and telephone number.</p>
<p><b>Financial Information.</b> Includes your bank account number, payment status and invoices.</p>
<p><b>Account Information.</b> Includes login information (user name, email address, telephone) and other information provided through your account.</p>
<p><b>Shipper’s Information.</b> Includes shipper’s name, address, email address and telephone number.</p>
<p><b>Recipient’s Information.</b> Includes recipient’s name, address, email address and telephone number.</p>
<p><b>User Data and Preferences.</b> Includes shipment volumes, complaints, transaction history and related commercial activity, communications, survey information, and your preferences.</p>
<p><b>Automatically Generated Information.</b> Includes IP address, unique device or user ID, system and browser type, date/time stamps, referring website, content and pages you access on our system or mobile apps, and location data.</p>
<p>Depending on your interactions with us, we may also collect other information related to shipments and services, including tracking numbers, routing information, location data, shipment status, delivery location, packaging type, number of pieces, weight, prices, parcel images, proof of delivery, and customs information. If we become aware that a child’s Personal Data has been collected without parental or guardian consent, we will promptly delete such data.</p>
<p>The Company does not intentionally collect or process special categories of personal data within the meaning of Article 9 GDPR (e.g., health data, political opinions, biometric data).</p>

<h2>4. How Do We Collect Personal Data?</h2>
<p>We collect Personal Data when provided by the shipper or our contractual customer. If you are the shipper or our contractual customer, we receive your Personal Data directly from you. Examples include:</p>
<p>- The shipper’s name, address and phone number.</p>
<p>- The name, address, identity information, payment card information and account number of the person opening a GOFO account.</p>
<p>If Personal Data of others is provided by the shipper or our contractual customer, we receive it indirectly. Examples include:</p>
<p>- The recipient’s name, address and phone number.</p>
<p>- The name, address, phone number, email address and identifying information of a director or representative of the shipper or account holder.</p>
<p>- The actual shipper’s name and address when an order is placed on an online marketplace and we deliver to the address provided.</p>
<p>When we receive Personal Data indirectly, we rely on the provider for accuracy and for the authority to provide such information to GOFO.</p>

<h2>5. Purposes And Legal Grounds</h2>
<p>We collect, use, store and otherwise process Personal Data only when necessary within responsible, efficient and effective business management. We process Personal Data on the following legal grounds and related business purposes:</p>
<p>- <b>Performance of a contract.</b> Delivery services, tracking, communications, responses to information requests, dispute resolution and agreement preparation.</p>
<p>- <b>Product development and improvement.</b> Processing data to develop and improve products/services and to perform research and analysis.</p>
<p>- <b>Relationship management and marketing.</b> Account management, customer service and targeted marketing; statistical analysis of Personal Data.</p>
<p>- <b>Business process execution and internal management.</b> Asset management, audits and investigations, finance and accounting, business controls, central processing, and mergers/acquisitions/divestitures; management reporting and analysis.</p>
<p>- <b>Security and protection.</b> Safeguarding the Company and its customers/partners and authenticating identities and access rights (online/offline).</p>
<p>- <b>Vital interests.</b> Processing necessary to protect your vital interests or those of others.</p>
<p>- <b>Legal obligations.</b> Compliance with applicable laws and regulations (e.g., sanctions screening, trade controls, AML/anti-corruption).</p>
<p>Where processing is based on legitimate interests, we perform a balancing test to ensure your rights and freedoms are not overridden.</p>

<h2>6. How Do We Use Cookies?</h2>
<p>When you visit our system, we use cookies and similar technologies to ensure proper operation, analyze usage and, with your consent, personalize content and advertising. Your cookie preferences and consent records are stored as proof of compliance.</p>
<p>In accordance with applicable laws (including the French Act No. 78-17, CNIL guidelines, Directive 2002/58/EC and the GDPR), we place non-essential cookies (e.g., analytics/marketing) only after you explicitly consent via our cookie banner.</p>
<p>Our cookie banner allows you to:</p>
<p>- Accept all cookies;</p>
<p>- Reject non-essential cookies; or</p>
<p>- Manage preferences by category (e.g., functional, analytical, marketing).</p>
<p>Cookies we use include:</p>
<p>- Strictly necessary cookies — required for proper operation (no consent needed).</p>
<p>- Analytical cookies — improve functionality and user experience (placed with consent).</p>
<p>- Marketing/tracking cookies — personalize content/ads and measure campaign effectiveness (placed with consent).</p>
<p>Our Cookie Notice describes for each category: purpose, provider, lifespan/storage duration, and whether data are shared with third parties and applicable safeguards (e.g., Standard Contractual Clauses). You can change or withdraw consent at any time via the banner or your browser settings.</p>

<h2>7. How Do We Share Your Personal Data?</h2>
<p><b>Internal recipients.</b> We share Personal Data within our affiliates, operating groups, subsidiaries and divisions where necessary. Employees are authorized to access Personal Data only to the extent necessary to perform their jobs.</p>
<p><b>External recipients.</b> We share Personal Data with processors such as vendors or service providers acting on our behalf and under our instructions, with contractual, technical and organizational safeguards in place. Relevant third parties may include:</p>
<p>- Customs agencies (customs formalities and declarations).</p>
<p>- Last‑mile delivery service providers (deliveries to your destination).</p>
<p>- IT service providers (system and software development/maintenance).</p>
<p>- Cloud service providers (data storage on servers that may be located outside the country of collection).</p>
<p>- Law enforcement, regulators and other parties for legal reasons (e.g., to comply with legal processes, protect rights and safety, or investigate fraud).</p>
<p>Some third parties are located within the EEA. For transfers outside the EEA, we ensure compliance with applicable data protection laws, including adequacy decisions and, where needed, <span>Standard Contractual Clauses (SCCs)</span> or other recognized mechanisms. In exceptional cases and only where permitted by law, transfers may take place under Article 49 GDPR derogations.</p>
<p>You may request information about international transfers, including copies of safeguards, by contacting our DPO at <a href="mailto:dpo@gofoexpress.com"><b>dpo@gofoexpress.com</b></a>.</p>

<h2>8. How Is Your Personal Data Secured?</h2>
<p>We implement technical, physical and organizational measures to protect Personal Data against accidental or unlawful destruction, loss, damage, alteration, unauthorized disclosure or access and other unlawful processing. Measures include access controls, confidentiality, integrity and availability safeguards, and personnel training.</p>
<p>No security measures are absolute. You play an important role: do not share your username or password and avoid re‑using passwords across systems. If you believe your Personal Data has been compromised, please contact us.</p>

<h2>9. How Long Is Your Personal Data Retained?</h2>
<p>Except as permitted or required by law, we retain Personal Data only as long as necessary to fulfill the purposes for which it was collected, meet legal/accounting/reporting obligations or resolve disputes. We consider legal requirements, data volume/nature/sensitivity, risk from unauthorized use or disclosure, processing purposes, and whether those purposes can be achieved by other means.</p>
<p>We may anonymize data so it is no longer associated with you and use such data for any legitimate business purpose without notice or consent.</p>
<p><b>Main retention periods (illustrative):</b></p>
<p>- Subscription and account creation: 3 years from last authentication or account deletion (if no active services remain).</p>
<p>- Delivery preference management: 5 years from last update.</p>
<p>- Customer service call recordings: 6 months from recording.</p>
<p>- Fraud/cybercrime prevention: up to 12 months from fraud alert.</p>
<p>- Requests to exercise rights: up to 5 years from processing (ID proofs retained for 1 year).</p>
<p>- Accounting/financial records: 10 years from the end of the relevant financial year.</p>

<h2>10. Where Do We Store Or Transfer Your Personal Data?</h2>
<p>Generally, Personal Data legally collected by the Company is stored within EU Member States (France).</p>
<p>Given our business nature and services, we may need to transfer Personal Data to affiliates or subsidiaries in other countries/regions to perform agreements or achieve the purposes described here. Any transfer is subject to appropriate safeguards not lower than those required by applicable EU and French data protection laws. Required procedures will be completed before cross‑border transfers or remote access.</p>

<h2>11. Your Rights</h2>
<p>Depending on applicable law, you may have rights regarding your Personal Data. In some cases requests may be conditional or must be balanced against our rights and obligations and those of others. Rights may include:</p>
<p><b>Right of access.</b> Obtain a copy of your Personal Data and information about its processing.</p>
<p><b>Right to rectification.</b> Request correction of inaccurate or incomplete Personal Data.</p>
<p><b>Right to erasure.</b> Request deletion of Personal Data, subject to exceptions such as legal obligations, contract performance or legal claims.</p>
<p><b>Right to restriction.</b> Request temporary restriction of processing in certain circumstances.</p>
<p><b>Right to data portability.</b> Request transfer of Personal Data you provided to a third party, when processed by automated means on the basis of consent or contract.</p>
<p><b>Right to object.</b> Object to processing based on legitimate interests; object at any time to processing for direct marketing.</p>
<p><b>Rights related to automated decision‑making.</b> Request human intervention, express your view and contest decisions; obtain an explanation of the logic involved; you may have the right not to be subject to decisions producing legal or similarly significant effects.</p>
<p><b>Right to withdraw consent.</b> Where we rely on consent, you may withdraw it at any time without affecting prior lawful processing.</p>
<p><b>How to exercise your rights:</b></p>
<p>- Email: <a href="mailto:dpo@gofoexpress.com"><b>dpo@gofoexpress.com</b></a></p>
<p>- Mail: <span>GOFO, 10 Rue Eugène Pottier, 95670 Marly‑la‑Ville, France</span></p>
<p>Under Article 12 GDPR, you may be asked to provide proof of identity. If acting for a third party, provide appropriate authorization. If you believe your rights have not been respected, you may lodge a complaint with the CNIL: <span>3 Place de Fontenoy - TSA 80715 - 75334 Paris Cedex 07, France</span>, <span>+33 1 53 73 22 22</span>.</p>

<h2>12. California Consumers</h2>
<p>California residents may make certain requests under California law, including to:</p>
<p>- Request access to Personal Data we hold about you and categories of Personal Data shared for a business purpose;</p>
<p>- Request deletion of your Personal Data;</p>
<p>- Request that we stop selling your Personal Data.</p>
<p>We do not discriminate for exercising these rights. Deletion may affect your ability to use our system and features.</p>
<p><b>Shine The Light law.</b> California Civil Code §1798.83 permits California residents to request, once per year and free of charge, information about categories of personal data disclosed to third parties for direct marketing and the names/addresses of such third parties. Submit written requests using the contact information at the top of this Privacy Statement.</p>

<h2>13. Updates To This Privacy Statement</h2>
<p>The Company may update this Privacy Statement from time to time. If an amendment has a serious impact, we will endeavor to inform you proactively. An up‑to‑date Privacy Statement will always be available on the system, indicating the latest amendments.</p>
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
