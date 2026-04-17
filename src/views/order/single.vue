<template>
  <div class="order-form">
    <div class="order-container">
      <!-- 左侧步骤条，融合在右侧里面 -->

      <!-- 右侧表单内容 -->
      <div class="flex-1 overflow-auto">
        <div class="order-content">
          <div class="order-steps">
            <!-- 发件人信息 -->
            <SenderInfo
              ref="senderInfoRef"
              :step-number="1"
              :is-active="currentStep === 1"
              :is-completed="completedSteps.includes(1)"
              :initial-data="formData.sender"
              @next="goToNextStep"
              @edit="editStep(1)"
              @update:formData="updateSenderData"
            />

            <!-- 收件人信息 -->
            <RecipientInfo
              ref="recipientInfoRef"
              :step-number="2"
              :is-active="currentStep === 2"
              :is-completed="completedSteps.includes(2)"
              :initial-data="formData.recipient"
              @next="goToNextStep"
              @edit="editStep(2)"
              @update:formData="updateRecipientData"
            />

            <!-- 产品信息 -->
            <ProductInfo
              ref="productInfoRef"
              :step-number="3"
              :is-active="currentStep === 3"
              :is-completed="completedSteps.includes(3)"
              :initial-data="formData.product"
              @next="goToNextStep"
              @edit="editStep(3)"
              @update:formData="updateProductData"
            />

            <!-- 包裹信息 -->
            <ParcelInfo
              ref="parcelInfoRef"
              :step-number="4"
              :is-active="currentStep === 4"
              :is-completed="completedSteps.includes(4)"
              :initial-data="formData.parcel"
              @edit="editStep(4)"
              @update:formData="updateParcelData"
            />

            <!-- 第五步，提交订单 -->
            <SubmitOrder
              :step-number="5"
              :is-active="currentStep === 5"
              :is-completed="completedSteps.includes(5)"
              :initial-data="formData.submit"
              @submit="submitOrder"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";

import SenderInfo from "./components/SenderInfo.vue";
import RecipientInfo from "./components/RecipientInfo.vue";
import ProductInfo from "./components/ProductInfo.vue";
import ParcelInfo from "./components/ParcelInfo.vue";
import SubmitOrder from "./components/SubmitOrder.vue";

defineOptions({
  name: "SingleOrder"
});

// 步骤配置
interface Step {
  number: number;
  title: string;
  active: boolean;
  completed?: boolean;
  disabled?: boolean;
  description?: string;
}

// 引用步骤组件
const senderInfoRef = ref(null);
const recipientInfoRef = ref(null);
const productInfoRef = ref(null);
const parcelInfoRef = ref(null);

// 当前步骤
const currentStep = ref(1);

// 已完成的步骤
const completedSteps = ref([]);

// 表单数据
const formData = reactive({
  sender: {},
  recipient: {},
  product: {},
  parcel: {}
});

// 更新发件人数据
const updateSenderData = (data) => {
  formData.sender = data;
};

// 更新收件人数据
const updateRecipientData = (data) => {
  formData.recipient = data;
};

// 更新产品数据
const updateProductData = (data) => {
  formData.product = data;
};

// 更新包裹数据
const updateParcelData = (data) => {
  formData.parcel = data;
};

// 进入下一步
const goToNextStep = () => {
  if (!completedSteps.value.includes(currentStep.value)) {
    completedSteps.value.push(currentStep.value);
  }
  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

// 回到上一步
const goToPrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 编辑步骤
const editStep = (step) => {
  currentStep.value = step;
};

// 提交订单
const submitOrder = async () => {
  console.log(parcelInfoRef.value, "====");

  // 先校验第四步的信息是否填写
  if (parcelInfoRef.value && parcelInfoRef.value.validate) {
    try {
      // 调用第四步组件的校验方法
      await parcelInfoRef.value.validate();

      // 校验通过，继续提交订单逻辑
      console.log("第四步表单校验通过，开始提交订单");

      // 这里可以添加实际的提交逻辑
      // 例如：调用API提交订单数据
    } catch (error) {
      // 校验失败，显示错误信息
      console.error("第四步表单校验失败:", error);
      // 可以在这里添加错误提示，比如使用Element Plus的Message组件
      // ElMessage.error('请先完善包裹信息');
      return;
    }
  } else {
    console.error("第四步组件引用或校验方法不存在");
    return;
  }
};

// // 重置表单
// resetForm();

// 重置表单
const resetForm = () => {
  currentStep.value = 1;
  completedSteps.value = [];
  formData.sender = {};
  formData.recipient = {};
  formData.product = {};
  formData.parcel = {};
};
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";

.order-form {
  background-color: var(--bg-color);

  @apply pr-4;
}
</style>
