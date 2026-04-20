<template>
  <el-dialog
    title="余额不足提醒配置"
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
        <span class="text-lg font-medium">余额不足提醒配置</span>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      label-width="100px"
      class="config-form"
    >
      <!-- 提醒额度 -->
      <el-form-item label="提醒额度" prop="amount" required>
        <div class="flex items-center">
          <el-input
            v-model.number="form.amount"
            placeholder="请输入金额"
            class="flex-1"
            type="number"
          />
          <span class="ml-2 text-gray-600">€ 欧元</span>
        </div>
      </el-form-item>

      <!-- 提醒时间 -->
      <el-form-item label="提醒时间" prop="time" required>
        <el-time-select
          v-model="form.time"
          class="w-full"
          start="00:00"
          step="01:00"
          end="23:00"
          placeholder="Select time"
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
      <el-form-item label="时区" prop="timezone" required>
        <el-select
          v-model="form.timezone"
          placeholder="请选择时区"
          class="w-full"
        >
          <el-option label="GMT+1 柏林" value="GMT+1 柏林" />
          <el-option label="GMT+8 北京" value="GMT+8 北京" />
          <el-option label="GMT+0 伦敦" value="GMT+0 伦敦" />
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
      <el-form-item label="提醒邮箱" prop="emails" required>
        <el-input
          v-model="form.emails"
          type="textarea"
          :rows="4"
          placeholder="请输入邮箱地址，多个邮箱请用逗号或换行分隔"
          class="w-full"
        />
        <div class="mt-1 text-xs text-gray-500">多个邮箱请用逗号或换行分隔</div>
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
      <el-form-item label="邮件语言" prop="language" required>
        <el-select
          v-model="form.language"
          placeholder="请选择语言"
          class="w-full"
        >
          <el-option label="简体中文" value="zh-CN" />
          <el-option label="English" value="en-US" />
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
      <el-form-item label="弹窗提醒">
        <div class="flex items-center">
          <el-switch v-model="form.popupEnabled" active-color="#ff7d00" />
          <span class="ml-2">开启</span>
        </div>
        <div class="mt-1 ml-1 text-xs text-gray-500">
          开启后，余额不足时将在登录时弹出提醒窗口
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
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          class="bg-orange-500 border-orange-500 hover:bg-orange-600"
          @click="handleSave"
        >
          保存设置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

const emit = defineEmits(["update:visible"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const visible = ref(props.visible);
watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal;
  }
);
const formRef = ref(null);

// 表单数据
const form = ref({
  amount: null,
  time: "09:00",
  timezone: "GMT+1 柏林",
  emails: "",
  language: "zh-CN",
  popupEnabled: true
});

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  emit("update:visible", false);
};

// 保存设置
const handleSave = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success("设置保存成功");
      handleClose();
    } else {
      ElMessage.error("请检查表单填写是否正确");
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
}

.config-form :deep(.el-input__prefix) {
  left: 10px;
}

.config-form :deep(.el-input__wrapper) {
  padding-left: 30px;
}
</style>
