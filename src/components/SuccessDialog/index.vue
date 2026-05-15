<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width"
    :class="dialogClass"
  >
    <div class="py-6 text-center">
      <!-- 成功图标 -->
      <div
        :class="[
          'inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full',
          iconClass
        ]"
      >
        <svg
          class="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <!-- 标题 -->
      <h3 class="mb-3 text-2xl font-bold text-gray-800">
        {{ title }}
      </h3>

      <!-- 描述文本 -->
      <p class="text-sm text-info">
        {{ description }}
      </p>

      <!-- 插槽：自定义额外内容 -->
      <slot name="extra-content"></slot>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-4 py-4">
        <el-button
          v-if="showPrimaryBtn"
          :size="buttonSize"
          :class="primaryBtnClass"
          @click="handlePrimaryClick"
        >
          {{ primaryBtnText }}
        </el-button>
        <el-button
          v-if="showSecondaryBtn"
          :size="buttonSize"
          :class="secondaryBtnClass"
          @click="handleSecondaryClick"
          type="primary"
        >
          {{ secondaryBtnText }}
        </el-button>
        <!-- 插槽：自定义按钮区域 -->
        <slot name="buttons"></slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: boolean; // 控制弹窗显示/隐藏
  title?: string; // 标题
  description?: string; // 描述文本
  primaryBtnText?: string; // 主要按钮文本
  secondaryBtnText?: string; // 次要按钮文本
  showPrimaryBtn?: boolean; // 是否显示主要按钮
  showSecondaryBtn?: boolean; // 是否显示次要按钮
  width?: string; // 弹窗宽度
  buttonSize?: "large" | "default" | "small"; // 按钮大小
  primaryBtnClass?: string; // 主要按钮自定义类名
  secondaryBtnClass?: string; // 次要按钮自定义类名
  iconClass?: string; // 图标容器自定义类名
  dialogClass?: string; // 弹窗自定义类名
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "primary-click"): void;
  (e: "secondary-click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  primaryBtnText: "确定",
  secondaryBtnText: "取消",
  showPrimaryBtn: true,
  showSecondaryBtn: true,
  width: "480px",
  buttonSize: "large",
  primaryBtnClass: "px-10 py-3 text-lg",
  secondaryBtnClass: "px-10 py-3 text-lg border-gray-300",
  iconClass: "",
  dialogClass: "success-dialog"
});

const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

const handlePrimaryClick = () => {
  emit("primary-click");
};

const handleSecondaryClick = () => {
  emit("secondary-click");
};
</script>

<style scoped>
/* 如果需要对弹窗进行额外样式定制，可以在这里添加 */
.success-dialog :deep(.el-dialog__header) {
  display: none;
}
</style>
