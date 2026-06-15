<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('web.gfuc.feedback')"
    width="600px"
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
          maxlength="80"
          class="feedback-input"
          show-word-limit
          word-limit-position="outside"
        />
      </div>

      <!-- 工单分类 -->
      <div class="form-group">
        <label class="form-label">
          工单分类
          <span class="required">*</span>
        </label>
        <el-select
          v-model="form.categoryId"
          placeholder="请选择工单分类"
          class="feedback-select"
          filterable
          clearable
          :loading="categoryLoading"
        >
          <el-option
            v-for="item in flatCategories"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </div>

      <!-- 紧急程度 -->
      <div class="form-group">
        <label class="form-label">紧急程度</label>
        <el-select
          v-model="form.priority"
          placeholder="请选择紧急程度"
          class="feedback-select"
        >
          <el-option label="低" value="低" />
          <el-option label="中" value="中" />
          <el-option label="高" value="高" />
        </el-select>
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
          drag
          :multiple="true"
          :list-type="'picture-card'"
          :show-file-list="true"
          :auto-upload="false"
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
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import CommonUpload from "@/components/CommonUpload/index.vue";
import {
  getWorkOrderCategory,
  uploadWorkOrderAttachment,
  addWorkOrder
} from "@/api/home";
import type { WorkOrderCategoryItem } from "@/api/home";

const { t } = useI18n();
const appStore = useAppStore();
const userStore = useUserStore();

const props = defineProps<{
  visible: boolean;
  categoryId?: number; // 可选：默认分类ID
  staffCode?: string; // 员工编号（默认取自登录账号）
  staffName?: string; // 员工姓名
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
const categoryLoading = ref(false);
const categories = ref<WorkOrderCategoryItem[]>([]);

const form = reactive({
  title: "",
  description: "",
  categoryId: undefined as number | undefined,
  priority: "低" as string,
  files: [] as any[]
});

// 将树形分类展平为一级选项
const flatCategories = computed(() => {
  const flatten = (
    items: WorkOrderCategoryItem[],
    parentName = ""
  ): { id: number; label: string }[] => {
    const result: { id: number; label: string }[] = [];
    for (const item of items) {
      const label = parentName ? `${parentName} / ${item.name}` : item.name;
      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children, label));
      } else {
        result.push({ id: item.id, label });
      }
    }
    return result;
  };
  return flatten(categories.value);
});

// 根据选中的分类ID获取分类完整路径名
const selectedCategoryName = computed(() => {
  if (!form.categoryId) return "";
  const item = flatCategories.value.find((c) => c.id === form.categoryId);
  return item?.label || "";
});

// 获取工单分类
const fetchCategories = async () => {
  categoryLoading.value = true;
  try {
    const res = await getWorkOrderCategory();
    categories.value = res || [];
  } catch (e) {
    console.error("获取工单分类失败", e);
  } finally {
    categoryLoading.value = false;
  }
};

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      resetForm();
      fetchCategories();
    }
  }
);

watch(dialogVisible, (val) => {
  emit("update:visible", val);
});

const isFormValid = computed(() => {
  return (
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.categoryId !== undefined
  );
});

const resetForm = () => {
  form.title = "";
  form.description = "";
  form.categoryId = props.categoryId;
  form.priority = "低";
  form.files = [];
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleClosed = () => {
  resetForm();
};

// 上传单个文件，返回附件路径
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  return await uploadWorkOrderAttachment(formData);
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (!form.title.trim()) {
      ElMessage.error(t("web.gfuc.please_input_feedback_title"));
    } else if (!form.description.trim()) {
      ElMessage.error(t("web.gfuc.please_input_feedback_description"));
    } else if (form.categoryId === undefined) {
      ElMessage.error("请选择工单分类");
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
    // 1. 上传附件
    const attachmentPaths: string[] = [];
    for (const item of form.files) {
      const rawFile = item.raw || item;
      if (rawFile instanceof File || rawFile instanceof Blob) {
        const path = await uploadFile(rawFile);
        attachmentPaths.push(path);
      }
    }

    // 2. 构建表单字段
    const countryName =
      {
        fr: "法国",
        de: "德国",
        it: "意大利",
        es: "西班牙",
        uk: "英国",
        at: "奥地利"
      }[appStore.site?.toLowerCase()] ||
      appStore.site ||
      "";

    const formFieldValues = [
      {
        Name: "紧急程度",
        IsRequired: 1,
        Type: 4,
        Value: form.priority
      },
      {
        Name: "国家",
        IsRequired: 1,
        Type: 1,
        Value: countryName
      },
      {
        Name: "问题描述",
        IsRequired: 1,
        Type: 7,
        Value: `<p>${form.description}</p>`
      }
    ];

    // 3. 创建工单
    if (form.categoryId === undefined) {
      throw new Error("categoryId is undefined");
    }
    await addWorkOrder({
      Title: form.title,
      CategoryId: form.categoryId,
      Category: selectedCategoryName.value,
      Attachments: attachmentPaths,
      OrderPriority: form.priority,
      FormFieldValues: formFieldValues,
      source: 5,
      staffCode: props.staffCode || userStore.userInfo?.account || "",
      staffName: props.staffName || "",
      IsDraft: false
    });

    ElMessage.success(t("web.gfuc.feedback_submit_success"));
    dialogVisible.value = false;
  } catch (e: any) {
    console.error("提交工单失败", e);
    ElMessage.error(e?.message || t("web.gfuc.feedback_submit_failed"));
  } finally {
    submitting.value = false;
  }
};

// 自定义上传请求（auto-upload=false 时不会被调用，为后续扩展预留）
const customHttpRequest = (_options: any) => {
  return null;
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
