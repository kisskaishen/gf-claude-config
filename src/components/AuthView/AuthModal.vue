<template>
  <el-dialog
    v-model="visible"
    :title="$t('账号授权')"
    width="587px"
    :close-on-click-modal="false"
    destroy-on-close
    class="auth-modal"
  >
    <!-- 提示信息 -->
    <div class="auth-tip">
      <el-icon class="tip-icon"><InfoFilled /></el-icon>
      <div class="tip-content">
        {{
          $t(
            "如果您已经跟我们公司签约走货，请联系您的商务帮您进行账号的授权绑定，如果还没商务联系您，请留下您的联系方式，将会派人专门跟进，或者您可用联系我们的邮箱："
          )
        }}
        <a class="tip-link">gofoasle@gofo.com</a>
      </div>
    </div>

    <!-- 表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="auth-form"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('邮箱')" prop="email">
            <el-input v-model="formData.email" :placeholder="$t('请输入')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('电话')" prop="phone">
            <el-input v-model="formData.phone" :placeholder="$t('请输入')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('您发货的频率')" prop="frequency">
            <el-select
              v-model="formData.frequency"
              :placeholder="$t('请选择')"
              :options="frequencyOptions"
            >
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('一个月的货量预估')" prop="volume">
            <el-select
              v-model="formData.volume"
              :placeholder="$t('请选择')"
              :options="volumeOptions"
            >
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('名')" prop="firstName">
            <el-input
              v-model="formData.firstName"
              :placeholder="$t('请输入')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('姓氏')" prop="lastName">
            <el-input v-model="formData.lastName" :placeholder="$t('请输入')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">{{
          $t("提交")
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const frequencyOptions = ref([
  {
    label: t("web.gfuc.daily" /** 每天 */),
    value: "daily"
  },
  {
    label: t("每周"),
    value: "weekly"
  },
  {
    label: t("每月"),
    value: "monthly"
  },
  {
    label: t("一年一次"),
    value: "yearly"
  },
  {
    label: t("其它"),
    value: "other"
  }
]);

const volumeOptions = ref([
  {
    label: t("至少100票"),
    value: 1
  },
  {
    label: "100~499",
    value: 2
  },
  {
    label: "500~1499",
    value: 3
  },
  {
    label: "1500~3000",
    value: 4
  },
  {
    label: "超过 3000",
    value: 5
  }
]);
const formRef = ref<FormInstance>();

// 默认值设为图片中的示例值，方便展示
const formData = reactive({
  firstName: "俊杰",
  lastName: "刘",
  email: "123564@163.com",
  phone: "123567899",
  frequency: "yearly", // 对应“一年一次”
  volume: "100+" // 对应“至少100票”
});

const rules = reactive<FormRules>({
  firstName: [{ required: true, message: t("请输入名"), trigger: "blur" }],
  lastName: [{ required: true, message: t("请输入姓氏"), trigger: "blur" }],
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "blur" },
    { type: "email", message: t("请输入正确的邮箱格式"), trigger: "blur" }
  ],
  frequency: [
    { required: true, message: t("请选择发货频率"), trigger: "change" }
  ],
  volume: [{ required: true, message: t("请选择货量预估"), trigger: "change" }]
});

const validate = () => {
  return new Promise<boolean>((resolve) => {
    if (!formRef.value) return resolve(false);
    formRef.value.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        console.log("error submit!", fields);
        resolve(false);
      }
    });
  });
};

const handleSubmit = async () => {
  if (!(await validate())) return;
  ElMessage.success(t("提交成功"));
  visible.value = false;
};
</script>

<style scoped lang="scss">
.auth-tip {
  display: flex;
  align-items: flex-start;
  padding: 9px 16px;
  margin-bottom: 24px;
  font-size: var(--font-size-base);
  background-color: #eef2ff; /* 浅蓝色背景 */
  border-radius: 4px;

  .tip-icon {
    flex-shrink: 0;
    margin-top: 2px;
    margin-right: 8px;
    font-size: 18px;
    color: #1239ff; /* 蓝色图标 */
  }

  .tip-content {
    line-height: 24px;
    color: var(--text-color-secondary);
    text-align: justify;
    box-shadow: 0 2px 16px 0 #4f577d14;

    .tip-link {
      color: var(--color-primary); /* 橙色链接 */
      text-decoration: none;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
