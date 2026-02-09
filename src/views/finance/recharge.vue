<template>
  <page-container :fixedHeight="false">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="recharge-form"
    >
      <!-- 支付截图 -->
      <el-form-item prop="attachmentKeys">
        <template #label>
          <div class="label-with-link">
            <span>{{ $t("支付截图") }}</span>
            <el-link
              type="primary"
              class="example-link"
              :underline="false"
              @click="handleDownloadExample"
            >
              {{ $t("支付凭证示例") }}
            </el-link>
          </div>
        </template>
        <div>
          <el-upload
            class="upload-demo"
            action="#"
            accept=".pdf,.jpg,.png,.jpeg"
            v-model:file-list="fileList"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :http-request="handleUpload"
            drag
          >
            <div class="upload-placeholder">
              <img src="@/assets/upload.png" alt="upload" class="upload-icon" />
              <div class="upload__text">{{ $t("点击上传文件") }}</div>
            </div>
          </el-upload>

          <div class="form-tip">
            {{ $t("只支持pdf/jpg/png/jpeg 文件，单个大小不能超过10MB") }}
          </div>

          <!-- 自定义文件列表显示 -->
          <div v-if="fileList.length > 0" class="custom-file-list">
            <div v-for="file in fileList" :key="file.uid" class="file-item">
              <div class="file-info">
                <img
                  class="file-icon"
                  :src="fileIconMap[file.raw?.type || '']"
                />
                <a class="file-name" @click="handleFilePreview(file)">
                  {{ file.name }}
                </a>
              </div>
              <el-icon class="delete-icon" @click="handleFileRemove(file)">
                <svg-icon name="trash" />
              </el-icon>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-row :gutter="24">
        <!-- 充值金额 -->
        <el-col :span="12">
          <el-form-item :label="$t('充值金额')" prop="arrivalAmount">
            <el-input
              v-model="formData.arrivalAmount"
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
          <el-form-item :label="$t('支付方式')" prop="receiptMethod">
            <el-select
              v-model="formData.receiptMethod"
              :placeholder="$t('请选择充值时支付的方式')"
              style="width: 100%"
            >
              <el-option
                v-for="item in receiptMethodDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 充值日期 -->
        <el-col :span="12">
          <el-form-item :label="$t('充值日期')" prop="receiptDate">
            <el-date-picker
              v-model="formData.receiptDate"
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
  </page-container>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  type FormInstance,
  type FormRules,
  type UploadRequestOptions,
  type UploadRawFile,
  ElMessage,
  type UploadFile
} from "element-plus";
import { useI18n } from "vue-i18n";
import { uploadFile } from "@/api/common";
import { useDict } from "@/hooks/useDict";
import { recharge } from "@/api/finance";
import { downloadFile } from "@/utils/download";
import excelIcon from "@/assets/upload-file/excel.svg";
import jpegIcon from "@/assets/upload-file/jpeg.svg";
import jpgIcon from "@/assets/upload-file/jpg.svg";
import pdfIcon from "@/assets/upload-file/pdf.svg";
import pngIcon from "@/assets/upload-file/png.svg";

const fileIconMap: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    excelIcon,
  "image/jpeg": jpegIcon,
  "image/jpg": jpgIcon,
  "application/pdf": pdfIcon,
  "image/png": pngIcon
};

defineOptions({
  name: "Recharge"
});

const { t } = useI18n();
const loading = ref(false);
const formRef = ref<FormInstance>();
const fileList = ref<UploadFile[]>([]);
/** 示例图片链接 */
const exampleImage = ref(
  "https://raw.githubusercontent.com/xfiveco/mock-api-images/main/images/img-01-xs.jpg"
);

const formData = reactive({
  /** 附件key */
  attachmentKeys: [] as string[],
  /** 充值金额 */
  arrivalAmount: "",
  currency: "EUR",
  /** 支付方式 */
  receiptMethod: undefined,
  /** 充值日期 */
  receiptDate: undefined as string | undefined,
  remark: ""
});

const handleDownloadExample = () => {
  downloadFile(exampleImage.value, t("支付凭证示例.jpg"));
};

const receiptMethodDict = useDict("fms.provider.paymentMode.type");

const validateFile = (_rule: any, value: any, callback: any) => {
  if (!formData.attachmentKeys.length) {
    callback(new Error(t("请上传支付截图")));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  attachmentKeys: [
    { required: true, validator: validateFile, trigger: "change" }
  ],
  arrivalAmount: [
    { required: true, message: t("请输入充值金额"), trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: t("请输入有效的金额"),
      trigger: "blur"
    }
  ],
  currency: [{ required: true, message: t("币种不能为空"), trigger: "blur" }],
  receiptMethod: [
    { required: true, message: t("请选择支付方式"), trigger: "change" }
  ],
  receiptDate: [
    { required: true, message: t("请选择充值日期"), trigger: "change" }
  ]
});

const handleFileRemove = (file: UploadFile) => {
  // 移除 formData 中的 key
  if (file.url) {
    formData.attachmentKeys = formData.attachmentKeys.filter(
      (key) => key !== file.url
    );
  }
  // 移除 fileList 中的 item
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

const handleFilePreview = (file: UploadFile) => {
  if (file.url) {
    window.open(file.url, "_blank");
  }
};

const handleBeforeUpload = (rawFile: UploadRawFile) => {
  const isLt10M = rawFile.size ? rawFile.size / 1024 / 1024 < 10 : false;

  if (!isLt10M) {
    ElMessage.error(t("单个大小不能超过10MB"));
    return false;
  }

  const validTypes = ["application/pdf", "image/jpeg", "image/png"];

  // Element Plus upload rawFile type check
  if (rawFile.type && !validTypes.includes(rawFile.type)) {
    ElMessage.error(t("只支持pdf/jpg/png/jpeg 文件"));
    return false;
  }

  return true;
};

const handleUpload = async (options: UploadRequestOptions) => {
  try {
    const data = new FormData();
    data.append("file", options.file);
    const res = await uploadFile(data);
    formData.attachmentKeys.push(res.url); // 假设返回结构中包含 url 字段

    // 更新 fileList 中的 url，以便删除时使用
    const file = fileList.value.find((f) => f.uid === options.file.uid);
    if (file) {
      file.url = res.url;
      file.status = "success";
    }

    formRef.value?.clearValidate("file");
  } catch (error) {
    ElMessage.error(t("上传失败，请重试"));
    // 上传失败移除文件
    const index = fileList.value.findIndex((f) => f.uid === options.file.uid);
    if (index !== -1) fileList.value.splice(index, 1);
  }
};

const validate = () => {
  return new Promise((resolve) => {
    formRef.value?.validate((valid) => {
      resolve(valid);
    });
  });
};

const handleSubmit = async () => {
  if (!(await validate())) return;
  try {
    loading.value = true;
    await recharge(formData);
    ElMessage.success(t("提交成功"));
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
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

.custom-file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #eff0f533;
    border-radius: 8px;

    .file-info {
      display: flex;
      gap: 8px;
      align-items: center;
      overflow: hidden;
    }

    .file-icon {
      width: 22px;

      img {
        width: 100%;
      }
    }

    .file-name {
      font-size: 14px;
      color: #7a869a;
    }

    .delete-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
    }
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
