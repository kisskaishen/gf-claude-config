<template>
  <div class="pt-5 step-container">
    <div
      class="mr-4 step-left"
      :class="{ 'step-completed': isCompleted, 'step-active': isActive }"
    >
      <div class="step-number" v-if="!isCompleted">
        {{ stepNumber }}
      </div>
      <svg-icon
        name="order-step-complated"
        class="step-content-completed-icon"
        width="24"
        height="24"
        v-if="isCompleted"
      />
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <div class="step-content-header">
        <h3 class="step-content-header-title">产品信息</h3>
        <!-- 清除数据 -->
        <svg-icon
          name="order-clear"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onClear"
          v-if="isActive"
        />
        <!-- 编辑数据 -->
        <svg-icon
          name="order-edit"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onEdit"
          v-if="!isActive && isCompleted"
        />
      </div>

      <div v-if="isActive || isCompleted" class="step-content-form">
        <div v-if="isActive" class="form-container">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item label-width="0">
                  <el-radio-group v-model="formData.productType">
                    <el-radio value="economy">普惠</el-radio>
                    <el-radio value="express">标快</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label-width="0">
                  <el-radio-group
                    v-model="formData.services"
                    class="radio-group"
                  >
                    <el-radio value="pickup">
                      <div class="radio-label">揽收&分拣</div>
                      <div class="radio-content">我们将会提供揽收分拣服务</div>
                    </el-radio>
                    <el-radio value="delivery">
                      <div class="radio-label">揽收&派送</div>
                      <div class="radio-content">我们将会提供揽收派送服务</div>
                    </el-radio>
                    <el-radio value="selfService">
                      <div class="radio-label">自派送服务</div>
                      <div class="radio-content">我们将会提供自派送服务</div>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row
              :gutter="20"
              v-if="['pickup', 'delivery'].includes(formData.services)"
            >
              <el-col :span="8">
                <el-form-item
                  label="揽收开始时间"
                  prop="queryCollectStartTime"
                  :rules="[
                    {
                      required:
                        formData.queryCollectStartTime ||
                        formData.queryCollectEndTime,
                      message: '请输入揽收开始时间',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-date-picker
                    v-model="formData.queryCollectStartTime"
                    placeholder="请输入时间"
                    type="datetime"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="揽收结束时间"
                  prop="queryCollectEndTime"
                  :rules="[
                    {
                      required:
                        formData.queryCollectStartTime ||
                        formData.queryCollectEndTime,
                      message: '请输入揽收结束时间',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-date-picker
                    v-model="formData.queryCollectEndTime"
                    placeholder="请输入时间"
                    type="datetime"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24" class="form-actions">
                <el-button type="primary" @click="onNext">下一步</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div v-else class="summary-container">
          <div class="flex-col summary-content">
            <p class="text-base">
              {{ formData.productType === "economy" ? "普惠" : "标快" }}
            </p>
            <div class="radio-group">
              <div class="radio-check">
                <div class="radio-label">揽收&分拣</div>
                <div class="radio-content">我们将会提供揽收分拣服务</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="step-placeholder">
        <p>请选择物流产品信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  stepNumber: {
    type: Number,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["next", "edit", "update:formData"]);

const formRef = ref(null);

const rules = ref({
  productType: [
    { required: true, message: "请选择产品类型", trigger: "change" }
  ],
  services: [{ required: true, message: "请选择增值服务", trigger: "change" }]
});

const formData = ref({
  productType: "economy",
  services: "",
  queryCollectStartTime: "",
  queryCollectEndTime: "",
  ...props.initialData
});

const serviceMap = {
  pickup: "提取&分拣",
  delivery: "提取&派送",
  selfService: "自派送服务"
};

watch(
  formData,
  (newValue) => {
    emit("update:formData", newValue);
  },
  { deep: true }
);

const onNext = () => {
  emit("next");
};

const onClear = () => {
  formData.value = {
    productType: "economy",
    services: "",
    ...props.initialData
  };
};

const onEdit = () => {
  emit("edit");
};
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";

.step-content-form {
  @apply -mt-2;
}

.radio-group {
  @apply flex flex-col w-full  gap-y-3 -mt-4;

  .el-radio,
  .radio-check {
    @apply w-full h-[84px] px-3 border rounded-xl mx-0;

    .radio-label {
      @apply text-base text-[#4E5969] h-5 leading-5;
    }

    .radio-content {
      @apply text-info text-sm h-5 leading-5 mt-1;
    }

    :deep(.el-radio__label) {
      @apply pl-4;
    }
  }
}

.summary-content {
  .radio-group {
    @apply mt-2;

    .radio-check {
      @apply flex flex-col  justify-center;
    }
  }
}
</style>
