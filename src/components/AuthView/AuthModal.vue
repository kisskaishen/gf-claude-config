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
          <el-form-item :label="$t('姓名')" prop="name">
            <el-input v-model="formData.name" :placeholder="$t('请输入')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('国家')" prop="country">
            <el-select
              v-model="formData.country"
              :placeholder="$t('请输入')"
              :options="countryDict.options.value"
              multiple
              collapse-tags
            />
          </el-form-item>
        </el-col>
      </el-row>

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
              :placeholder="$t('选择')"
              :options="frequencyDict.options.value"
            >
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('一个月的货量预估')" prop="count">
            <el-select
              v-model="formData.count"
              :placeholder="$t('选择')"
              :options="volumeDict.options.value"
            >
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" :disabled="loading">{{
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
import { postOpenService } from "@/api/user";
import { useDict } from "@/hooks/useDict";

const { t } = useI18n();

const loading = ref(false);

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});
const countryDict = useDict("gfuc.site.code");
const frequencyDict = useDict("gfuc.send.frequency");
const volumeDict = useDict("gfuc.send.count");

const formRef = ref<FormInstance>();

const formData = reactive({
  name: "",
  email: "",
  phone: "",
  /** 发货频率 */
  frequency: undefined,
  /** 货量预估 */
  count: undefined,
  /** 国家 */
  country: undefined
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: t("请输入姓名"), trigger: "change" }],
  country: [{ required: true, message: t("请输入国家"), trigger: "change" }],
  email: [
    { required: true, message: t("请输入邮箱"), trigger: "change" },
    { type: "email", message: t("请输入正确的邮箱格式"), trigger: "change" }
  ],
  frequency: [
    { required: true, message: t("请选择发货频率"), trigger: "change" }
  ],
  count: [{ required: true, message: t("请选择货量预估"), trigger: "change" }]
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
  loading.value = true;
  try {
    await postOpenService(formData);
    ElMessage.success(t("提交成功"));
    visible.value = false;
    emit("success");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-tip {
  display: flex;
  align-items: flex-start;
  padding: 9px 16px;
  margin-bottom: 24px;
  font-size: var(--font-size-base);
  background-color: #e5eaff; /* 浅蓝色背景 */
  border-radius: 4px;
  box-shadow: 0 2px 16px 0 #4f577d14;

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
