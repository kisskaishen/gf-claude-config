<template>
  <div class="pt-5 step-container last-step-container">
    <div class="mr-4 step-left">
      <div class="step-number">{{ stepNumber }}</div>
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <el-row>
        <el-col :span="24" class="form-actions">
          <el-button
            :type="currentStep < 4 ? 'default' : 'primary'"
            @click="onSubmit"
            :disabled="currentStep < 4"
            >{{ $t("web.gfuc.submit_order") }}</el-button
          >
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
  },
  currentStep: {
    type: Number,
    default: 1
  }
});

const currentStep = computed(() => props.currentStep);

const emit = defineEmits(["submit"]);

const onSubmit = () => {
  emit("submit");
};
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

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
