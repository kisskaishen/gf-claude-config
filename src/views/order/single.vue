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
            <SubmitOrder
              :step-number="5"
              :completedSteps="completedSteps"
              :currentStep="currentStep"
              @submit="submitOrder"
            />
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
        <h3 class="mb-3 text-2xl font-bold text-gray-800">
          {{
            isEdit
              ? $t("web.gfuc.order_update_success")
              : $t("web.gfuc.order_created_success")
          }}
        </h3>

        <!-- 描述文本 -->
        <p class="text-sm text-info">
          {{
            isEdit
              ? $t("web.gfuc.order_update_success_message")
              : $t("web.gfuc.order_created_success_message")
          }}
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
            {{ $t("web.gfuc.view_order") }}
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="px-10 py-3 text-lg"
            @click="handleContinueBuy"
          >
            {{ $t("web.gfuc.continue_order") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, watch } from "vue";

import ShipperInfo from "./components/ShipperInfo.vue";
import ConsigneeInfo from "./components/ConsigneeInfo.vue";
import ProductInfo from "./components/ProductInfo.vue";
import ParcelInfo from "./components/ParcelInfo.vue";
import SubmitOrder from "./components/SubmitOrder.vue";

import {
  createOrder,
  getOrderDetail,
  getExceptionOrderDetail
} from "@/api/order";

import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => route.params.orderId);
defineOptions({
  name: "SingleOrder"
});

const STORAGE_KEY = "single_order_form_data";

const shipperInfoRef = ref(null);
const consigneeInfoRef = ref(null);
const productInfoRef = ref(null);
const parcelInfoRef = ref(null);

// 当前步骤
const currentStep = ref(1);

// 已完成的步骤
const completedSteps = ref([]);

// 表单数据
const formData = reactive({
  shipper: {},
  consignee: {},
  product: {},
  parcel: {}
});

// 从 sessionStorage 恢复数据
const restoreFormData = () => {
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.formData) {
        Object.assign(formData, parsed.formData);
      }
      if (parsed.currentStep) {
        currentStep.value = parsed.currentStep;
      }
      if (parsed.completedSteps) {
        completedSteps.value = parsed.completedSteps;
      }
    }
  } catch (e) {
    console.error("Failed to restore form data:", e);
  }
};

// 保存数据到 sessionStorage
const saveFormData = () => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formData,
        currentStep: currentStep.value,
        completedSteps: completedSteps.value
      })
    );
  } catch (e) {
    console.error("Failed to save form data:", e);
  }
};

const successVisible = ref(false);

// 更新发件人数据
const updateShipperData = (data) => {
  console.log(data, "updateShipperData");
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

// 编辑步骤
const editStep = (step) => {
  console.log(step, currentStep.value);
  if (currentStep.value != step) {
    completedSteps.value.push(currentStep.value);

    console.log(completedSteps.value);
  }
  currentStep.value = step;
};

// 提交订单
const submitOrder = async () => {
  // 先校验第四步的信息是否填写
  if (parcelInfoRef.value) {
    try {
      if (!isEdit.value) {
        // 调用第四步组件的校验方法
        let valid = await parcelInfoRef.value.validate();
        if (!valid) {
          return;
        }

        // 校验通过，继续提交订单逻辑
        console.log("第四步表单校验通过，开始提交订单", formData);
      }

      // formData格式化
      let data = {
        customerId:
          formData.shipper?.customerId ||
          sessionStorage.getItem("createOrderCustomerId") ||
          "",

        orderShipper: formData.shipper,
        orderConsignee: formData.consignee,

        orderProduct: formData.product,

        shippingType: "HDN", // ZT/HDN
        productName: formData.product?.productName,
        productCode: formData.product?.productCode,
        productType: formData.product?.productType,

        queryCollectStartTime: formData.product?.queryCollectStartTime,
        queryCollectEndTime: formData.product?.queryCollectEndTime,

        orderParcel: formData.parcel,
        orderGoods: formData.parcel?.orderGoods,
        orderItemList: formData.parcel?.orderItemList,

        cOrderNo: formData.parcel?.cOrderNo,
        declaredValue: formData.parcel?.declaredValue,
        reference3: formData.parcel?.reference3,
        referenceNo: formData.parcel?.referenceNo,
        channelCode: formData.parcel?.channelCode
      };

      const res = await createOrder(data);
      let customerId = sessionStorage.getItem("createOrderCustomerId");
      if (customerId) {
        sessionStorage.removeItem("createOrderCustomerId");
      }
      if (res.waybillNo) {
        successVisible.value = true;
      } else {
        ElMessage.error("订单创建失败，请重试");
      }

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

onMounted(() => {
  if (route.params.orderId) {
    fetchOrderDetail();
    currentStep.value = 4;
    completedSteps.value = [1, 2, 3, 4];
  } else {
    restoreFormData();
  }
});

onActivated(() => {
  if (!route.params.orderId) {
    restoreFormData();
  }
});

watch(
  () => route.params.orderId,
  (newVal) => {
    if (newVal) {
      fetchOrderDetail();
    }
  }
);

watch(
  formData,
  () => {
    if (!route.params.orderId) {
      saveFormData();
    }
  },
  { deep: true }
);

const fetchOrderDetail = async () => {
  try {
    let orderId = route.params.orderId;
    let orderType = route.params.orderType;
    let response = {};
    if (orderType === "order") {
      // 普通订单详情
      response = await getOrderDetail({ id: orderId });
      console.log(response, "订单详情数据");
      // 格式化回显数据，确保数据结构与组件期望一致
      if (response.customerId) {
        sessionStorage.setItem("createOrderCustomerId", response.customerId);
      }
      formData.shipper =
        formatShipperData(response.orderShipper, response.customerId) || {};
      formData.consignee = formatConsigneeData(response.orderConsignee) || {};
      formData.product = formatProductData(response) || {};

      formData.parcel = formatParcelData(response) || {};
    } else {
      // 异常订单详情
      response = await getExceptionOrderDetail({ unusualOrderId: orderId });
      let data = JSON.parse(response?.requestBody || "{}");
      console.log(data, "订单详情数据");
      // 格式化回显数据，确保数据结构与组件期望一致
      if (data.customerId) {
        sessionStorage.setItem("createOrderCustomerId", data.customerId);
      }
      formData.shipper =
        formatShipperData(data.orderShipper, data.customerId) || {};
      formData.consignee = formatConsigneeData(data.orderConsignee) || {};
      formData.product = formatProductData(data) || {};

      formData.parcel = formatParcelData(data) || {};
    }
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
  }
};

// 格式化发件人数据
const formatShipperData = (shipperData: any, customerId: string) => {
  if (!shipperData) return {};

  return {
    customerId: customerId || "",
    shipperName: shipperData.shipperName || "",
    shipperPhone: shipperData.shipperPhone || "",
    shipperEmail: shipperData.shipperEmail || "",
    shipperStreet: shipperData.shipperStreet || "",
    shipperCity: shipperData.shipperCity || "",
    shipperState: shipperData.shipperState || "",
    shipperPostcode: shipperData.postcode || "",
    shipperCountry: shipperData.shipperCountry || "",
    shipperCode: shipperData.shipperCode || ""
  };
};

// 格式化收件人数据
const formatConsigneeData = (consigneeData: any) => {
  if (!consigneeData) return {};

  return {
    consigneeName: consigneeData.consigneeName || "",
    consigneePhone: consigneeData.consigneePhone || "",
    consigneeEmail: consigneeData.consigneeEmail || "",
    address1: consigneeData.address1 || "",
    address2: consigneeData?.address2 || "",
    address3: consigneeData?.address3 || "",
    consigneeNumIn: consigneeData.consigneeNumIn || "",
    consigneeNumExt: consigneeData.consigneeNumExt || "",
    consigneeCode: consigneeData.consigneeCode || "",
    consigneeArea: consigneeData.consigneeArea || "",
    consigneeCity: consigneeData.consigneeCity || "",
    consigneeState: consigneeData.consigneeState || "",
    consigneeCountry: consigneeData.consigneeCountry || "",
    remarks: consigneeData.remarks || ""
  };
};

// 格式化产品数据
const formatProductData = (productData: any) => {
  if (!productData) return {};

  return {
    productType: productData.productType || "",
    productCode: productData.productCode || "",
    productName: productData.productName || "",
    queryCollectStartTime: productData?.queryCollectStartTime || "",
    queryCollectEndTime: productData?.queryCollectEndTime || ""
  };
};

// 格式化包裹数据
const formatParcelData = (parcelData: any) => {
  if (!parcelData) return {};
  // 这里的highth是后端接口拼写错误，保持和接口一致,但是另一个详情接口又是height，所以这里都兼容一下
  return {
    orderGoods: {
      weight: parcelData.orderGoods.weight || undefined,
      length: parcelData.orderGoods.length || undefined,
      width: parcelData.orderGoods.width || undefined,
      height:
        parcelData.orderGoods.heigth ||
        parcelData.orderGoods.height ||
        undefined
    },
    orderItemList: parcelData.orderItemList || [
      {
        itemNameZh: "",
        itemNameEn: "",
        itemQty: undefined
      }
    ],
    declaredValue: parcelData.declaredValue || undefined,
    cOrderNo: parcelData?.cOrderNo || "",
    referenceNo: parcelData?.referenceNo || "",
    reference3: parcelData?.reference3 || "",
    channelCode: parcelData?.channelCode || ""
  };
};

//// 重置表单
const resetForm = () => {
  currentStep.value = 1;
  completedSteps.value = [];
  formData.shipper = {};
  formData.consignee = {};
  formData.product = {};
  formData.parcel = {};

  shipperInfoRef.value?.resetForm();
  consigneeInfoRef.value?.resetForm();
  productInfoRef.value?.resetForm();
  parcelInfoRef.value?.resetForm();

  sessionStorage.removeItem(STORAGE_KEY);
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

  router.replace("/order/single");
};
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

.order-form {
  background-color: var(--bg-color);

  @apply pr-4;
}
</style>
