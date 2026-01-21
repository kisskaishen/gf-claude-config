<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :before-close="handleCancel"
    append-to-body
    center
    class="agreement-modal"
  >
    <div class="agreement-content">
      <el-scrollbar height="400px">
        <slot></slot>
      </el-scrollbar>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-cancel" @click="handleCancel">{{
          $t("取消")
        }}</el-button>
        <el-button
          type="primary"
          class="btn-confirm"
          :disabled="currentCountdown > 0"
          @click="handleConfirm"
        >
          {{ $t("同意") }}
          {{ currentCountdown > 0 ? `(${currentCountdown}S)` : "" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  countdown: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(["update:visible", "confirm", "cancel"]);

const currentCountdown = ref(0);
let timer: any = null;

watch(
  () => props.visible,
  (val) => {
    if (val) {
      startCountdown();
    } else {
      stopCountdown();
    }
  }
);

const startCountdown = () => {
  currentCountdown.value = props.countdown;
  stopCountdown();
  if (currentCountdown.value > 0) {
    timer = setInterval(() => {
      currentCountdown.value--;
      if (currentCountdown.value <= 0) {
        stopCountdown();
      }
    }, 1000);
  }
};

const stopCountdown = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};

const handleConfirm = () => {
  if (currentCountdown.value > 0) return;
  emit("update:visible", false);
  emit("confirm");
};

onUnmounted(() => {
  stopCountdown();
});
</script>

<style lang="scss" scoped>
.agreement-content {
  padding: 0 20px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  text-align: justify;
}

.dialog-footer {
  display: flex;
  gap: 40px;
  justify-content: center;
  padding-bottom: 20px;

  .el-button {
    width: 200px;
    height: 44px;
    font-size: 16px;
    border-radius: 4px;
  }

  .btn-cancel {
    color: #606266;
    background: #fff;
    border: 1px solid #dcdfe6;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-7);
    }
  }

  .btn-confirm {
    color: #fff;
    background: #ff5722;
    border-color: #ff5722;

    &:hover {
      background: #f4511e;
      border-color: #f4511e;
    }

    &.is-disabled {
      background-color: #fab6b6;
      border-color: #fab6b6;
    }
  }
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

:deep(.el-dialog__header) {
  padding-top: 30px;
  margin-right: 0;
}
</style>
