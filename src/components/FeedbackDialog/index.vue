<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('web.gfuc.feedback')"
    width="640px"
    :close-on-click-modal="false"
    destroy-on-close
    top="5vh"
    @closed="handleClosed"
  >
    <div class="feedback-form">
      <!-- 提示横幅 -->
      <div class="hint-banner">
        <svg class="hint-icon" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="#E66C28" stroke-width="1.5" />
          <path
            d="M9 5.5v4"
            stroke="#E66C28"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="9" cy="12.8" r="0.8" fill="#E66C28" />
        </svg>
        <span>{{ $t("web.gfuc.feedback_hint") }}</span>
      </div>

      <!-- 标题 -->
      <div class="form-group">
        <label class="form-label">
          {{ $t("web.gfuc.feedback_title") }}
          <span class="required">*</span>
        </label>
        <el-input
          v-model="form.title"
          :placeholder="$t('web.gfuc.feedback_title_placeholder')"
          maxlength="50"
          class="feedback-input"
          show-word-limit
          word-limit-position="outside"
        />
      </div>

      <!-- 描述 -->
      <div class="form-group">
        <label class="form-label">
          {{ $t("web.gfuc.feedback_description") }}
          <span class="required">*</span>
        </label>
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="6"
          :placeholder="$t('web.gfuc.feedback_description_placeholder')"
          maxlength="1000"
          class="feedback-textarea"
          show-word-limit
          word-limit-position="outside"
        />
      </div>

      <!-- 图片上传 -->
      <div class="form-group">
        <label class="form-label">
          {{ $t("web.gfuc.feedback_upload") }}
        </label>
        <CommonUpload
          ref="uploadRef"
          v-model="form.files"
          :http-request="customHttpRequest"
          type="image"
          :limit="6"
          :max-size="10"
          accept=".jpg,.jpeg,.png,.gif"
          drag
          :multiple="true"
          :list-type="'picture-card'"
          :show-file-list="true"
          :need-front-msg="false"
          :button-text="$t('web.gfuc.feedback_upload_drag_hint')"
          :hint="$t('web.gfuc.feedback_upload_hint')"
          @remove="handleRemove"
        />
      </div>
    </div>

    <template #footer>
      <div class="btn-group">
        <el-button class="btn-cancel" @click="handleCancel">
          {{ $t("web.gfuc.cancel") }}
        </el-button>
        <el-button
          class="btn-submit"
          :loading="submitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ $t("web.gfuc.feedback_submit") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import CommonUpload from "@/components/CommonUpload/index.vue";
import { uploadWorkOrderAttachment, addWorkOrder } from "@/api/home";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  country?: string;
  onSubmit?: (data: {
    title: string;
    description: string;
    files: any[];
  }) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const uploadRef = ref<InstanceType<typeof CommonUpload> | null>(null);
const submitting = ref(false);
const dialogVisible = ref(false);

const form = reactive({
  title: "",
  description: "",
  files: [] as any[]
});

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      resetForm();
    }
  }
);

watch(dialogVisible, (val) => {
  emit("update:visible", val);
});

const isFormValid = computed(() => {
  return form.title.trim().length > 0 && form.description.trim().length > 0;
});

const resetForm = () => {
  form.title = "";
  form.description = "";
  form.files = [];
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleClosed = () => {
  resetForm();
};

// 自定义上传请求：选择图片后立即调用上传接口
const customHttpRequest = async (options: any) => {
  const formData = new FormData();
  formData.append("file", options.file);
  const path = await uploadWorkOrderAttachment(formData);
  return path;
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (!form.title.trim()) {
      ElMessage.error(t("web.gfuc.please_input_feedback_title"));
    } else if (!form.description.trim()) {
      ElMessage.error(t("web.gfuc.please_input_feedback_description"));
    }
    return;
  }

  // 如果父组件传了 onSubmit，走外部回调（兼容旧用法）
  if (props.onSubmit) {
    submitting.value = true;
    try {
      await props.onSubmit({
        title: form.title,
        description: form.description,
        files: form.files.map((item: any) => item.raw || item)
      });
      ElMessage.success(t("web.gfuc.feedback_submit_success"));
      dialogVisible.value = false;
    } catch {
      ElMessage.error(t("web.gfuc.feedback_submit_failed"));
    } finally {
      submitting.value = false;
    }
    return;
  }

  // 默认走直接 API 调用
  submitting.value = true;
  try {
    // 1. 从已上传的文件中取附件 FilePath（customHttpRequest 上传后返回的对象中包含 FilePath 字段）
    const attachmentPaths: string[] = [];
    for (const item of form.files) {
      if (item.response?.FilePath) {
        attachmentPaths.push(item.response.FilePath);
      }
    }

    // 2. 创建工单 — 使用 formContent 传递 HTML 描述内容

    await addWorkOrder({
      title: form.title,
      attachments: attachmentPaths,
      country: props.country,
      formContent: `<p>${form.description}</p>`
    });

    ElMessage.success(t("web.gfuc.feedback_submit_success"));
    dialogVisible.value = false;
  } catch (e: any) {
    console.error("提交失败", e);
    ElMessage.error(e?.message || t("web.gfuc.feedback_submit_failed"));
  } finally {
    submitting.value = false;
  }
};

// 文件移除回调（v-model 已双向同步，此方法可处理额外逻辑）
const handleRemove = () => {
  // form.files 已通过 v-model 自动同步
};
</script>

<style scoped lang="scss">
.feedback-form {
  padding: 0 4px;

  // ===== 提示横幅 =====
  .hint-banner {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 16px;
    margin-bottom: 24px;
    font-size: 13px;
    line-height: 20px;
    color: #606266;
    background: #fff8f0;
    border: 1px solid #fde2c4;
    border-radius: 10px;

    .hint-icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      margin-top: 1px;
    }
  }

  // ===== 表单组 =====
  .form-group {
    margin-bottom: 20px;

    &:last-of-type {
      margin-bottom: 28px;
    }

    .form-label {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;

      .required {
        font-size: 14px;
        color: #e54545;
      }
    }
  }
}

// ===== 按钮组 =====
:deep(.el-dialog__footer) {
  padding-top: 0;
}

.btn-group {
  display: flex;
  gap: 16px;
  justify-content: flex-end;

  .btn-cancel,
  .btn-submit {
    min-width: 120px;
    height: 42px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    border-radius: 21px;
    transition: all 0.2s;
  }

  .btn-cancel {
    color: #606266;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;

    &:hover {
      color: #303133;
      background: #eceef2;
    }
  }

  .btn-submit {
    color: #fff;
    background: #e66c28;
    border: none;
    box-shadow: 0 2px 8px rgb(230 108 40 / 30%);

    &:hover {
      background: #d05a1a;
      box-shadow: 0 4px 14px rgb(230 108 40 / 40%);
    }

    &:active {
      transform: scale(0.97);
    }

    &:disabled {
      color: #fff;
      cursor: not-allowed;
      background: #f0c4a8;
      box-shadow: none;
    }
  }
}

// ===== Element Plus 输入框覆盖样式 =====
:deep(.feedback-input) {
  .el-input__wrapper {
    height: 44px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    box-shadow: none;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &:hover {
      border-color: #e66c28;
    }

    &.is-focus {
      border-color: #e66c28;
      box-shadow: 0 0 0 3px rgb(230 108 40 / 10%);
    }

    .el-input__inner {
      font-size: 14px;
      color: #303133;

      &::placeholder {
        color: #c0c4cc;
      }
    }
  }
}

:deep(.feedback-textarea) {
  .el-textarea__inner {
    min-height: 180px;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
    color: #303133;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    box-shadow: none;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &::placeholder {
      color: #c0c4cc;
    }

    &:hover {
      border-color: #e66c28;
    }

    &:focus {
      border-color: #e66c28;
      box-shadow: 0 0 0 3px rgb(230 108 40 / 10%);
    }
  }
}

// ===== Element Plus 选择器覆盖样式 =====
:deep(.feedback-select) {
  width: 100%;

  .el-select__wrapper {
    height: 44px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    box-shadow: none;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &:hover {
      border-color: #e66c28;
    }

    &.is-focus {
      border-color: #e66c28;
      box-shadow: 0 0 0 3px rgb(230 108 40 / 10%);
    }
  }
}
</style>
