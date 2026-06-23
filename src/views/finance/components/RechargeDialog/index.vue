<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('web.gfuc.recharge' /** 充值 **/)"
    :width="720"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="recharge-form"
    >
      <el-row :gutter="24">
        <!-- 充值金额 -->
        <el-col :span="12">
          <el-form-item
            :label="$t('gfuc.recharge_amount' /** 充值金额 **/)"
            prop="arrivalAmount"
          >
            <el-input
              v-model="formData.arrivalAmount"
              :placeholder="
                $t(
                  'gfuc.recharge_amount_consistency' /** 充值的金额需要跟上传图片的金额一致 **/
                )
              "
            />
          </el-form-item>
        </el-col>
        <!-- 币种 -->
        <el-col :span="12">
          <el-form-item
            :label="$t('gfuc.currency' /** 币种 **/)"
            prop="currency"
          >
            <el-input v-model="formData.currency" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <!-- 支付方式 -->
        <el-col :span="12">
          <el-form-item
            :label="$t('gfuc.pay_method' /** 支付方式 **/)"
            prop="receiptMethod"
          >
            <template #label>
              {{ $t("gfuc.pay_method" /** 支付方式 **/) }}
              <el-tooltip
                :content="
                  $t(
                    'gfuc.payment_method_selection' /** 请选择充值时支付的方式 **/
                  )
                "
                placement="top"
              >
                <el-icon class="tip-icon">
                  <svg-icon name="question" />
                </el-icon>
              </el-tooltip>
            </template>
            <el-select
              v-model="formData.receiptMethod"
              :placeholder="
                $t(
                  'gfuc.payment_method_selection' /** 请选择充值时支付的方式 **/
                )
              "
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
          <el-form-item
            :label="$t('gfuc.recharge_date' /** 充值日期 **/)"
            prop="receiptDate"
          >
            <template #label>
              {{ $t("gfuc.recharge_date" /** 充值日期 **/) }}
              <el-tooltip
                :content="
                  $t(
                    'gfuc.time_consistency' /** 时间需要跟上传截图的时间一致 **/
                  )
                "
                placement="top"
              >
                <el-icon class="tip-icon">
                  <svg-icon name="question" />
                </el-icon>
              </el-tooltip>
            </template>
            <el-date-picker
              v-model="formData.receiptDate"
              type="date"
              :placeholder="
                $t('gfuc.time_consistency' /** 时间需要跟上传截图的时间一致 **/)
              "
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 支付截图 -->
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item prop="attachmentKeys">
            <template #label>
              <div class="label-with-link">
                <span>{{
                  $t("gfuc.payment_screenshot" /** 支付截图 **/)
                }}</span>
                <el-popover
                  placement="right"
                  :width="400"
                  trigger="hover"
                  :show-after="200"
                >
                  <template #reference>
                    <el-link
                      type="primary"
                      class="example-link"
                      :underline="false"
                    >
                      {{ $t("gfuc.sample_image" /** 图片示例 **/) }}
                    </el-link>
                  </template>
                  <img :src="exampleImage" class="example-popover-img" />
                </el-popover>
              </div>
            </template>
            <div v-loading="uploadLoading" style="width: 100%">
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
                  <img
                    src="@/assets/upload.png"
                    alt="upload"
                    class="upload-icon"
                  />
                  <div class="upload__text">
                    {{ $t("gfuc.click_to_upload_file" /** 点击上传文件 **/) }}
                  </div>
                </div>
              </el-upload>

              <div class="form-tip">
                {{
                  $t(
                    "gfuc.file_format_restrictions" /** 只支持pdf/jpg/png/jpeg 文件，单个大小不能超过10MB **/
                  )
                }}
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
        </el-col>
      </el-row>

      <!-- 备注 -->
      <el-form-item :label="$t('gfuc.remark' /** 备注 **/)" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          :placeholder="
            $t(
              'gfuc.additional_info_remark' /** 若有其他补充信息，请填写备注 **/
            )
          "
          maxlength="300"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t("gfuc.cancel" /** 取消 **/) }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitLoading"
        >
          {{ $t("web.gfuc.submit_recharge" /** 提交充值 **/) }}
        </el-button>
      </div>
    </template>

    <SuccessDialog
      v-model="successVisible"
      :title="$t('web.gfuc.recharge_success' /** 充值成功 **/)"
      :description="
        $t(
          'web.gfuc.recharge_success_description' /** 您的充值记录已提交，我们预计将会在一个工作日内为您充值。 **/
        )
      "
      :primary-btn-text="
        $t('web.gfuc.view_recharge_record' /** 查看充值记录 **/)
      "
      :secondary-btn-text="$t('web.gfuc.continue_recharge' /** 继续充值 **/)"
      @primary-click="handleViewRechargeRecord"
      @secondary-click="handleContinueRecharge"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
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
import excelIcon from "@/assets/upload-file/excel.svg";
import jpegIcon from "@/assets/upload-file/jpeg.svg";
import jpgIcon from "@/assets/upload-file/jpg.svg";
import pdfIcon from "@/assets/upload-file/pdf.svg";
import pngIcon from "@/assets/upload-file/png.svg";
import SuccessDialog from "@/components/SuccessDialog/index.vue";
import { useAppStore } from "@/store/app";
import frExample from "@/assets/payment-example/FR.png";
import itExample from "@/assets/payment-example/IT.png";
import nlExample from "@/assets/payment-example/NL.png";
import { useRouter } from "vue-router";

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

defineOptions({
  name: "RechargeDialog"
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["update:modelValue", "success"]);

const submitLoading = ref(false);
const uploadLoading = ref(false);
const successVisible = ref(false);

const formRef = ref<FormInstance>();
const fileList = ref<UploadFile[]>([]);

const fileIconMap: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    excelIcon,
  "image/jpeg": jpegIcon,
  "image/jpg": jpgIcon,
  "application/pdf": pdfIcon,
  "image/png": pngIcon
};

const receiptMethodDict = useDict("fms.provider.paymentMode.type");

const exampleImage = computed(() => {
  const site = appStore.site;
  switch (site) {
    case "IT":
      return itExample;
    case "NL":
      return nlExample;
    case "FR":
    default:
      return frExample;
  }
});

const initFormData = () => ({
  attachmentKeys: [] as string[],
  arrivalAmount: "",
  currency: "EUR",
  receiptMethod: undefined,
  receiptDate: undefined as string | undefined,
  remark: ""
});

const formData = reactive(initFormData());

const validateFile = (_rule: any, value: any, callback: any) => {
  if (!formData.attachmentKeys.length) {
    callback(
      new Error(
        t("web.gfuc.please_upload_payment_screenshot" /** 请上传支付截图 **/)
      )
    );
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  attachmentKeys: [
    { required: true, validator: validateFile, trigger: "change" }
  ],
  arrivalAmount: [
    {
      required: true,
      message: t("gfuc.please_enter_recharge_amount" /** 请输入充值金额 **/),
      trigger: "blur"
    },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: t("gfuc.please_enter_valid_amount" /** 请输入有效的金额 **/),
      trigger: "blur"
    }
  ],
  currency: [
    {
      required: true,
      message: t("gfuc.currency_cannot_be_empty" /** 币种不能为空 **/),
      trigger: "blur"
    }
  ],
  receiptMethod: [
    {
      required: true,
      message: t("gfuc.please_select_payment_method" /** 请选择支付方式 **/),
      trigger: "change"
    }
  ],
  receiptDate: [
    {
      required: true,
      message: t("gfuc.please_select_recharge_date" /** 请选择充值日期 **/),
      trigger: "change"
    }
  ]
});

/** 重置表单 */
const resetForm = () => {
  formRef.value?.resetFields();
  fileList.value = [];
  Object.assign(formData, initFormData());
};

/** 关闭弹框 */
const handleClose = () => {
  emits("update:modelValue", false);
  resetForm();
};

/** 弹框打开时重置 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

const handleFileRemove = (file: UploadFile) => {
  if (file.url) {
    formData.attachmentKeys = formData.attachmentKeys.filter(
      (key) => key !== file.url
    );
  }
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
    ElMessage.error(
      t("gfuc.single_file_size_limit" /** 单个大小不能超过10MB **/)
    );
    return false;
  }
  const validTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (rawFile.type && !validTypes.includes(rawFile.type)) {
    ElMessage.error(
      t("gfuc.supported_file_formats" /** 只支持pdf/jpg/png/jpeg 文件 **/)
    );
    return false;
  }
  return true;
};

const handleUpload = async (options: UploadRequestOptions) => {
  try {
    uploadLoading.value = true;
    const data = new FormData();
    data.append("file", options.file);
    data.append("modelFolder", "modelFolder");
    const res = await uploadFile(data);
    formData.attachmentKeys.push(res.filePath);

    const file = fileList.value.find((f) => f.uid === options.file.uid);
    if (file) {
      file.url = res.url;
      file.status = "success";
    }
    uploadLoading.value = false;
    formRef.value?.clearValidate("file");
  } catch (error) {
    uploadLoading.value = false;
    ElMessage.error(t("gfuc.upload_failed_retry" /** 上传失败，请重试 **/));
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
    submitLoading.value = true;
    await recharge(formData);
    // 关闭弹框
    emits("update:modelValue", false);
    // 弹出成功提示
    successVisible.value = true;
    // 通知父组件充值成功
    emits("success");
  } finally {
    submitLoading.value = false;
  }
};

const handleViewRechargeRecord = () => {
  successVisible.value = false;
  resetForm();
  router.push("/finance/record");
};

const handleContinueRecharge = () => {
  successVisible.value = false;
  resetForm();
  // 重新打开弹框
  emits("update:modelValue", true);
};
</script>

<style lang="scss" scoped>
.recharge-form {
  padding: 0 4px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.label-with-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;

  .example-link {
    font-weight: 600;
  }
}

.upload-demo {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
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
    padding: 6px 12px;
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

      &:hover {
        color: #ff2503;
      }
    }
  }
}

.form-tip {
  margin-top: 8px;
  font-size: var(--font-size-sm);
  line-height: 21px;
  color: var(--text-color-placeholder);
}

.tip-icon {
  vertical-align: text-bottom;
}

.example-popover-img {
  display: block;
  width: 100%;
  height: auto;
}

:deep(.el-dialog__body) {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
