<template>
  <div class="recharge-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="recharge-form"
    >
      <!-- 支付截图 -->
      <el-form-item prop="file">
        <template #label>
          <div class="label-with-link">
            <span>{{ $t("支付截图") }}</span>
            <el-link type="primary" class="example-link" :underline="false">
              {{ $t("支付凭证示例") }}
            </el-link>
          </div>
        </template>
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="true"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="1"
          accept=".pdf,.jpg,.png,.jpeg"
        >
          <div v-if="!formData.file" class="upload-placeholder">
            <img src="@/assets/upload.png" alt="upload" class="upload-icon" />
            <div class="upload__text">{{ $t("点击上传文件") }}</div>
          </div>
          <div v-else class="upload-file-info">
            <el-icon class="file-icon"><Document /></el-icon>
            <span>{{ formData.file.name }}</span>
          </div>
          <template #tip>
            <div class="form-tip">
              {{ $t("只支持pdf/jpg/png/jpeg 文件，单个大小不能超过10MB") }}
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-row :gutter="24">
        <!-- 充值金额 -->
        <el-col :span="12">
          <el-form-item :label="$t('充值金额')" prop="amount">
            <el-input
              v-model="formData.amount"
              :placeholder="$t('充值的金额需要跟上传图片的金额一致')"
            />
          </el-form-item>
        </el-col>
        <!-- 币种 -->
        <el-col :span="12">
          <el-form-item :label="$t('币种')" prop="currency">
            <el-input v-model="formData.currency" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <!-- 支付方式 -->
        <el-col :span="12">
          <el-form-item :label="$t('支付方式')" prop="method">
            <el-select
              v-model="formData.method"
              :placeholder="$t('请选择充值时支付的方式')"
              style="width: 100%"
            >
              <el-option
                v-for="item in paymentMethods"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 充值日期 -->
        <el-col :span="12">
          <el-form-item :label="$t('充值日期')" prop="date">
            <el-date-picker
              v-model="formData.date"
              type="date"
              :placeholder="$t('时间需要跟上传截图的时间一致')"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 备注 -->
      <el-form-item :label="$t('备注')" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          :placeholder="$t('若有其他补充信息，请填写备注')"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <el-button type="primary" class="submit-btn" @click="handleSubmit">
        {{ $t("提交") }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Document } from "@element-plus/icons-vue";
import {
  type FormInstance,
  type FormRules,
  type UploadFile,
  ElMessage
} from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Recharge"
});

const { t } = useI18n();
const formRef = ref<FormInstance>();

const formData = reactive({
  file: null as UploadFile | null,
  amount: "",
  currency: "EUR",
  method: "",
  date: "",
  remark: ""
});

const paymentMethods = [
  { label: t("银行转账"), value: "bank_transfer" },
  { label: t("支票"), value: "check" },
  { label: t("承兑汇票"), value: "acceptance_bill" }
];

const validateFile = (_rule: any, value: any, callback: any) => {
  if (!formData.file) {
    callback(new Error(t("请上传支付截图")));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  file: [{ required: true, validator: validateFile, trigger: "change" }],
  amount: [
    { required: true, message: t("请输入充值金额"), trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: t("请输入有效的金额"),
      trigger: "blur"
    }
  ],
  currency: [{ required: true, message: t("币种不能为空"), trigger: "blur" }],
  method: [{ required: true, message: t("请选择支付方式"), trigger: "change" }],
  date: [{ required: true, message: t("请选择充值日期"), trigger: "change" }]
});

const handleFileChange = (uploadFile: UploadFile) => {
  const isLt10M = uploadFile.size ? uploadFile.size / 1024 / 1024 < 10 : false;
  const validTypes = ["application/pdf", "image/jpeg", "image/png"];

  // Element Plus upload rawFile type check
  if (uploadFile.raw && !validTypes.includes(uploadFile.raw.type)) {
    ElMessage.error(t("只支持pdf/jpg/png/jpeg 文件"));
    handleFileRemove();
    return;
  }

  if (!isLt10M) {
    ElMessage.error(t("单个大小不能超过10MB"));
    handleFileRemove();
    return;
  }

  formData.file = uploadFile;
  // Trigger validation manually to clear error if any
  formRef.value?.validateField("file");
};

const handleFileRemove = () => {
  formData.file = null;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log("Form submitted:", formData);
      ElMessage.success(t("提交成功"));
    }
  });
};
</script>

<style lang="scss" scoped>
.recharge-container {
  padding: 24px;
}

.recharge-form {
  max-width: 732px;
}

.label-with-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.upload-demo {
  :deep(.el-upload-dragger) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;

  .upload-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .upload__text {
    font-size: var(--font-size-base);
    color: var(--text-color-tertiary);
  }
}

.upload-file-info {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);

  .file-icon {
    font-size: 20px;
  }
}

.form-tip {
  margin-top: 8px;
  font-size: var(--font-size-sm);
  line-height: 21px;
  color: var(--text-color-placeholder);
}

.submit-btn {
  margin-bottom: 119px;
}
</style>
