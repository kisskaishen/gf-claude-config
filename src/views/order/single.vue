<template>
  <div class="order-form">
    <div class="order-container">
      <!-- 左侧步骤条，融合在右侧里面 -->

      <!-- 右侧表单内容 -->
      <div class="flex-1 overflow-auto">
        <div class="order-content">
          <div class="order-steps">
            <!-- 发件人信息 -->
            <ShipperInfo
              ref="shipperInfoRef"
              :step-number="1"
              :is-active="currentStep === 1"
              :is-completed="completedSteps.includes(1)"
              :initial-data="formData.shipper"
              @next="goToNextStep"
              @edit="editStep(1)"
              @update:orderShipper="updateShipperData"
            />

            <!-- 收件人信息 -->
            <ConsigneeInfo
              ref="consigneeInfoRef"
              :step-number="2"
              :is-active="currentStep === 2"
              :is-completed="completedSteps.includes(2)"
              :initial-data="formData.consignee"
              @next="goToNextStep"
              @edit="editStep(2)"
              @update:orderConsignee="updateConsigneeData"
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
            <SubmitOrder :step-number="5" @submit="submitOrder" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="successVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="480px"
      class="success-dialog"
    >
      <div class="py-6 text-center">
        <!-- 成功图标 -->
        <div
          class="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full"
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
        <h3 class="mb-3 text-2xl font-bold text-gray-800">订单创建成功</h3>

        <!-- 描述文本 -->
        <p class="text-sm text-info">
          您的订单已经创建成功，您可以查看订单或继续下单
        </p>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="flex justify-center gap-4 py-4">
          <el-button
            size="large"
            class="px-10 py-3 text-lg border-gray-300"
            @click="handleViewOrder"
          >
            查看订单
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="px-10 py-3 text-lg"
            @click="handleContinueBuy"
          >
            继续下单
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import ShipperInfo from "./components/ShipperInfo.vue";
import ConsigneeInfo from "./components/ConsigneeInfo.vue";
import ProductInfo from "./components/ProductInfo.vue";
import ParcelInfo from "./components/ParcelInfo.vue";
import SubmitOrder from "./components/SubmitOrder.vue";

import { createOrder } from "@/api/order";

import { useRouter } from "vue-router";

const router = useRouter();

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

const parcelInfoRef = ref(null);

// 当前步骤
const currentStep = ref(2);

// 已完成的步骤
const completedSteps = ref([]);

// 表单数据
const formData = reactive({
  shipper: {},
  consignee: {},
  product: {},
  parcel: {}
});

const successVisible = ref(false);

// 更新发件人数据
const updateShipperData = (data) => {
  formData.shipper = data;
};

// 更新收件人数据
const updateConsigneeData = (data) => {
  formData.consignee = data;
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
  // 先校验第四步的信息是否填写
  if (parcelInfoRef.value && parcelInfoRef.value.validate) {
    try {
      // 调用第四步组件的校验方法
      let valid = await parcelInfoRef.value.validate();
      if (!valid) {
        return;
      }

      // 校验通过，继续提交订单逻辑
      console.log("第四步表单校验通过，开始提交订单", formData);

      // formData格式化
      let data = {
        customerId: formData.shipper?.customerId,

        orderShipper: formData.shipper,
        orderConsignee: formData.consignee,

        orderProduct: formData.product,

        shippingType: formData.parcel?.shippingType,
        services: formData.product?.services,

        queryCollectStartTime: formData.parcel?.queryCollectStartTime,
        queryCollectEndTime: formData.parcel?.queryCollectEndTime,

        orderParcel: formData.parcel,
        orderGoods: formData.parcel?.orderGoods,
        orderItemList: formData.parcel?.orderItemList,

        cOrderNo: formData.parcel?.cOrderNo,
        declaredValue: formData.parcel?.declaredValue,
        sOrderNo: formData.parcel?.sOrderNo,
        referenceNo: formData.parcel?.referenceNo,
        channelCode: formData.parcel?.channelCode
      };

      await createOrder(data);

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
  formData.shipper = {};
  formData.consignee = {};
  formData.product = {};
  formData.parcel = {};
};

const handleViewOrder = () => {
  successVisible.value = false;
  router.push("/order/list");
  // 重置表单
  resetForm();
};

const handleContinueBuy = () => {
  resetForm();

  successVisible.value = false;
};
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";

.order-form {
  background-color: var(--bg-color);

  @apply pr-4;
}
</style>
