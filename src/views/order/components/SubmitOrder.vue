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
            :type="
              !completedSteps.includes(4) &&
              currentStep.value < 4 &&
              !$route.params.orderId
                ? 'default'
                : 'primary'
            "
            @click="onSubmit"
            :disabled="
              !completedSteps.includes(4) &&
              currentStep.value < 4 &&
              !$route.params.orderId
            "
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
  },
  completedSteps: {
    type: Array,
    default: () => []
  }
});

const currentStep = computed(() => props.currentStep);
const completedSteps = computed(() => props.completedSteps);

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
