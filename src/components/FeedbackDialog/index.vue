<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('web.gfuc.feedback')"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="feedback-form">
      <!-- 反馈内容 -->
      <div class="feedback-field">
        <label class="feedback-label">
          {{ $t("web.gfuc.feedback_content") }}
          <span class="required">*</span>
        </label>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="5"
          :placeholder="$t('web.gfuc.feedback_content_placeholder')"
          maxlength="500"
          show-word-limit
        />
      </div>

      <!-- 上传截图 -->
      <div class="feedback-field">
        <label class="feedback-label">
          {{ $t("web.gfuc.feedback_upload") }}
        </label>
        <!-- <CommonUpload
          ref="uploadRef"
          type="image"
          :limit="5"
          :multiple="true"
          :list-type="'picture-card'"
          :show-file-list="true"
          :auto-upload="false"
          :button-text="$t('web.gfuc.feedback_upload_btn')"
          :hint="$t('web.gfuc.feedback_upload_hint')"
          v-model="form.files"
        /> -->
      </div>

      <!-- 联系方式 -->
      <div class="feedback-field">
        <label class="feedback-label">
          {{ $t("web.gfuc.feedback_contact") }}
        </label>
        <el-input
          v-model="form.contact"
          :placeholder="$t('web.gfuc.feedback_contact_placeholder')"
          maxlength="100"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">
        {{ $t("web.gfuc.cancel") }}
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t("web.gfuc.submit") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import CommonUpload from "@/components/CommonUpload/index.vue";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  onSubmit?: (data: {
    content: string;
    contact: string;
    files: any[];
  }) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const uploadRef = ref(null);
const submitting = ref(false);
const dialogVisible = ref(false);

const form = reactive({
  content: "",
  contact: "",
  files: []
});

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      resetForm();
    }
  },
  { immediate: true }
);

watch(dialogVisible, (val) => {
  emit("update:visible", val);
});

const resetForm = () => {
  form.content = "";
  form.contact = "";
  form.files = [];
};

const handleCancel = () => {
  dialogVisible.value = false;
};

const handleClosed = () => {
  resetForm();
};

const handleSubmit = async () => {
  if (!form.content.trim()) {
    ElMessage.error(t("web.gfuc.please_input_feedback_content"));
    return;
  }
  submitting.value = true;
  try {
    if (props.onSubmit) {
      await props.onSubmit({
        content: form.content,
        contact: form.contact,
        files: form.files
      });
    }
    dialogVisible.value = false;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.feedback-form {
  .feedback-field {
    margin-bottom: 20px;

    .feedback-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #333;

      .required {
        margin-left: 2px;
        color: #f56c6c;
      }
    }
  }
}
</style>
