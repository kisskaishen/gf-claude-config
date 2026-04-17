<template>
  <div class="pt-5 step-container last-step-container">
    <div
      class="mr-4 step-left"
      :class="{ 'step-completed': isCompleted, 'step-active': isActive }"
    >
      <div class="step-number">{{ stepNumber }}</div>
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <el-row>
        <el-col :span="24" class="form-actions">
          <el-button type="primary" @click="onSubmit">提交订单</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  stepNumber: {
    type: Number,
    default: 5
  }
});
const emit = defineEmits(["submit"]);

const onSubmit = () => {
  emit("submit");
};
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";

.last-step-container {
  @apply flex items-baseline;

  .step-left {
    .step-line {
      @apply hidden;
    }
  }

  .step-content {
    @apply p-0 pb-5 bg-transparent !important;
  }
}
</style>
