<template>
  <el-dialog
    :title="$t('web.gfuc.balance_low_reminder')"
    v-model="visible"
    @close="handleClose"
    width="700px"
    class="custom-dialog"
  >
    <template #header>
      <div class="flex items-center">
        <!-- 图标 -->
        <svg
          class="w-6 h-6 mr-2 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span class="text-lg font-medium">{{
          $t("web.gfuc.balance_low_reminder")
        }}</span>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="config-form"
    >
      <!-- 提醒额度 -->
      <el-form-item
        :label="$t('web.gfuc.balance_low_reminder_amount')"
        prop="alertAmount"
      >
        <div class="flex items-center">
          <el-input-number
            :controls="false"
            v-model.number="form.alertAmount"
            :placeholder="$t('gfuc.please_enter')"
            class="flex-1"
          />
          <span class="ml-2 text-gray-600">{{ $t("web.gfuc.eur") }}</span>
        </div>
      </el-form-item>

      <!-- 提醒时间 -->
      <el-form-item
        :label="$t('web.gfuc.balance_low_reminder_time')"
        prop="alertHourMinute"
      >
        <el-time-select
          v-model="form.alertHourMinute"
          class="w-full"
          start="00:00"
          step="01:00"
          end="23:00"
          :placeholder="$t('gfuc.please_select')"
        />
        <template #prefix>
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </el-form-item>

      <!-- 时区 -->
      <el-form-item
        :label="$t('web.gfuc.balance_low_reminder_timezone')"
        prop="timeZone"
      >
        <el-select
          v-model="form.timeZone"
          :placeholder="$t('gfuc.please_select')"
          class="w-full"
          filterable
          clearable
        >
          <el-option
            v-for="item in timezoneOptions"
            :key="item.value"
            :label="item.label + ' ' + item.time"
            :value="item.value"
          />
        </el-select>
        <template #prefix>
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </el-form-item>

      <!-- 提醒邮箱 -->
      <el-form-item :label="$t('web.gfuc.reminder_email')" prop="email">
        <el-input
          v-model="form.email"
          type="textarea"
          resize="none"
          :rows="4"
          :placeholder="$t('web.gfuc.reminder_email_placeholder')"
          class="w-full"
        />
        <div class="mt-1 text-xs text-gray-500">
          {{ $t("web.gfuc.reminder_email_placeholder_tip") }}
        </div>
        <template #prefix>
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </template>
      </el-form-item>

      <!-- 邮件语言 -->
      <el-form-item
        :label="$t('web.gfuc.balance_low_reminder_email_language')"
        prop="emailLanguage"
      >
        <el-select
          v-model="form.emailLanguage"
          :placeholder="$t('gfuc.please_select')"
          class="w-full"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <template #prefix>
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </template>
      </el-form-item>

      <!-- 弹窗提醒 -->
      <el-form-item
        :label="$t('web.gfuc.balance_low_reminder_popup')"
        prop="popupSwitch"
      >
        <div class="flex items-center">
          <el-switch
            v-model="form.popupSwitch"
            active-color="#ff7d00"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('web.gfuc.enable')"
            :inactive-text="$t('web.gfuc.disable')"
          />
        </div>
        <div class="mt-1 ml-1 text-xs text-gray-500">
          {{ $t("web.gfuc.balance_low_reminder_popup_tip") }}
        </div>
        <template #prefix>
          <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </template>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">{{ $t("web.gfuc.cancel") }}</el-button>
        <el-button
          type="primary"
          class="bg-orange-500 border-orange-500 hover:bg-orange-600"
          @click="handleSave"
        >
          {{ $t("web.gfuc.save") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import { ElMessage } from "element-plus";
import { Timezone, TimezoneArea, Lang } from "@/enums";
import { addBalanceAlertConfig, updateBalanceAlertConfig } from "@/api/finance";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";

const t = useI18n().t;
const userInfo = useUserStore();
const emit = defineEmits(["update:visible"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  balanceAlertConfig: {
    type: Object,
    default: () => ({})
  },
  balanceReminder: {
    type: Number,
    default: 0
  }
});

const visible = ref(props.visible);
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      form.value = { ...props.balanceAlertConfig };
      form.value.email = props.balanceAlertConfig?.alertEmails.join(",");
      form.value.account = userInfo.userInfo?.account || "";
      form.value.country = userInfo.userInfo?.country || "";
      form.value.state = props.balanceReminder || 0;
    }
    visible.value = newVal;
    // 重置表单
    formRef.value?.resetFields();
  }
);

const timezoneOptions = computed(() =>
  Object.entries(Timezone).map(([key, value]) => {
    const fileName = key.split("/").join("_");

    return {
      label: value,
      value,
      time: TimezoneArea[key],
      // 使用 new URL 动态获取资源路径
      icon: new URL(`../../assets/timezones/${fileName}.png`, import.meta.url)
        .href
    };
  })
);

const options = [
  {
    value: Lang.zh,
    label: "简体中文"
  },
  {
    value: Lang.en,
    label: "English"
  },
  {
    value: Lang.fr,
    label: "Français"
  },
  {
    value: Lang.it,
    label: "Italiano"
  },
  {
    value: Lang.nl,
    label: "Nederlands"
  }
];
const formRef = ref(null);

// 表单数据
const form = ref({
  gfucLoginId: userInfo.userInfo?.id || "",
  account: userInfo.userInfo?.account || "",
  country: userInfo.userInfo?.country || "",
  alertAmount: null,
  alertHourMinute: "",
  timeZone: "",
  email: "",
  emailLanguage: "",
  popupSwitch: 1, // 首页弹窗开关：0-关闭 1-开启
  state: props.balanceReminder || 0 // 余额提醒总开关 1-开启 0-关闭（默认关闭）
});

// 邮箱格式校验函数
const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback();
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emails = parseEmails(value);

  for (const email of emails) {
    if (!emailRegex.test(email.trim())) {
      callback(new Error(`${t("web.gfuc.email_format_error")}: ${email}`));
      return;
    }
  }

  callback();
};

const rules = reactive({
  alertAmount: [
    { required: true, message: t("web.gfuc.please_enter"), trigger: "blur" }
  ],
  alertHourMinute: [
    { required: true, message: t("web.gfuc.please_select"), trigger: "change" }
  ],
  timeZone: [
    { required: true, message: t("web.gfuc.please_select"), trigger: "change" }
  ],
  email: [
    { required: true, message: t("web.gfuc.please_enter"), trigger: "blur" },
    { validator: validateEmail, trigger: "blur" }
  ],
  emailLanguage: [
    { required: true, message: t("web.gfuc.please_select"), trigger: "change" }
  ],
  popupSwitch: [
    { required: true, message: t("web.gfuc.please_select"), trigger: "change" }
  ]
});

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  emit("update:visible", false);
};

// 处理邮箱字符串 → 干净数组
const parseEmails = (emailStr) => {
  if (!emailStr) return [];

  return emailStr
    .replace(/\s+/g, ",") // 去掉所有空格、换行、制表符
    .split(",") // 按逗号分割
    .filter(Boolean); // 过滤空字符串
};

// 保存设置
const handleSave = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      form.value.alertEmails = parseEmails(form.value?.email) || "";
      form.value.gfucLoginId = userInfo.userInfo?.id || "";

      if (props.balanceAlertConfig?.id) {
        form.value.id = props.balanceAlertConfig.id;
        await updateBalanceAlertConfig(form.value);
      } else {
        await addBalanceAlertConfig(form.value);
      }
      ElMessage.success(t("web.gfuc.setting_save_success"));
      handleClose();
    } else {
      ElMessage.error(t("web.gfuc.please_check_form"));
    }
  });
};
</script>

<style scoped>
/* 自定义弹窗样式 */
.custom-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 10px 20px;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
}

/* 表单项前缀图标 */
.config-form :deep(.el-form-item__label) {
  display: flex;
  align-items: center;
  line-height: 1;
}

.config-form :deep(.el-input__prefix) {
  left: 10px;
}

:deep(.el-input-number) {
  width: 100%;

  .el-input__inner {
    text-align: left;
  }
}
</style>
