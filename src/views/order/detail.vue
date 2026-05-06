<template>
  <div class="order-detail">
    <!-- 订单状态跟踪 -->
    <div class="order-status-tracker">
      <div class="order-info">
        <div class="flex items-center">
          <div class="flex flex-col items-center mr-6">
            <svg-icon name="orderStatus" width="50" height="48" />
            <div
              class="flex items-center w-full text-white bg-[#FFEAEC] mt-1"
              v-if="orderType === 'order'"
            >
              <span class="text-sm text-[#FF3141] text-center flex-1">{{
                orderData?.orderStatusName || orderData?.orderStatus || "-"
              }}</span>
            </div>
          </div>
          <div class="section-item">
            <div class="label">
              <span>{{ $t("web.gfuc.customer_order_no") }}</span>
              <svg-icon
                v-if="orderData?.cOrderNo"
                name="copy"
                width="20"
                height="20"
                @click="copyText(orderData?.cOrderNo)"
              />
            </div>
            <span class="value">{{ orderData?.cOrderNo || "-" }}</span>
          </div>
        </div>
        <el-divider direction="vertical" />
        <div class="section-item">
          <div class="label">
            <span>{{ $t("web.gfuc.waybill_no") }}</span>
            <svg-icon
              v-if="orderData?.waybillNo"
              name="copy"
              width="20"
              height="20"
              @click="copyText(orderData?.waybillNo)"
            />
          </div>
          <span class="value">{{ orderData?.waybillNo || "-" }}</span>
        </div>
        <el-divider direction="vertical" />
      </div>
      <!-- 进度条容器 -->
      <div class="status-steps">
        <!-- 步骤背景（带箭头） -->
        <div
          v-for="(step, index) in statusSteps"
          :key="index"
          class="step-item"
          :class="{
            'step-disabled':
              orderData?.orderStatus == 2 || orderType === 'exception',
            'step-active':
              orderData?.orderStatus !== 2 &&
              orderType !== 'exception' &&
              step.status == orderData.orderStatus,
            'step-complated':
              orderData?.orderStatus !== 2 &&
              orderType !== 'exception' &&
              step.status < orderData.orderStatus,
            'step-default':
              orderData?.orderStatus !== 2 &&
              orderType !== 'exception' &&
              step.status > orderData?.orderStatus
          }"
        >
          <span class="step-text">{{ step.label }}</span>

          <!-- 箭头 -->
          <div
            v-if="shouldShowArrow(index)"
            class="step-arrow"
            :class="{
              'arrow-active':
                orderData?.orderStatus !== 2 &&
                orderType !== 'exception' &&
                step.status == orderData.orderStatus,
              'arrow-complated':
                orderData?.orderStatus !== 2 &&
                orderType !== 'exception' &&
                step.status < orderData.orderStatus,
              'arrow-default':
                orderData?.orderStatus !== 2 &&
                orderType !== 'exception' &&
                step.status > orderData?.orderStatus
            }"
          />
        </div>
      </div>
    </div>
    <div class="flex">
      <!-- 订单详情内容 -->
      <div class="mr-3 order-content">
        <!-- 基本信息 -->
        <div class="section base-section">
          <h3 class="section-title">{{ $t("web.gfuc.basic_info") }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t("web.gfuc.reference_no") }}</span>
              <span class="info-value">{{
                orderData?.referenceNo || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.third_party_tracking")
              }}</span>
              <span class="info-value">{{ orderData?.reference3 || "-" }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">{{ $t("web.gfuc.product_type") }}</span>
              <span class="info-value">{{
                orderData?.productType === "ECO"
                  ? $t("web.gfuc.express_delivery") || "-"
                  : $t("web.gfuc.standard_delivery") || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">{{ $t("web.gfuc.product") }}</span>
              <span class="info-value">{{
                orderData?.productName || "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 发货和收件人信息 -->
        <div class="section shipping-section">
          <div class="flex items-center justify-between">
            <h3 class="section-title">{{ $t("web.gfuc.shipment_info") }}</h3>
            <div class="flex items-center text-[#4e5965] font-semibold">
              <svg-icon name="recipeType" width="24px" height="24px" />
              <span class="ml-2">{{ $t("web.gfuc.delivery_info") }}</span>
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex flex-col flex-1 ml-3">
              <div class="section-info-title">
                <svg-icon name="sender" width="24px" height="24px" />
                <span>{{ $t("web.gfuc.shipper_info") }}</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">{{ $t("web.gfuc.name") }}</span>
                  <span class="info-value">{{
                    orderData?.orderShipper?.shipperName || "-"
                  }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">{{ $t("web.gfuc.address") }}</span>
                  <span class="info-value">{{
                    shipperAddress(orderData?.orderShipper) || "-"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t("web.gfuc.phone") }}</span>
                  <span class="info-value">{{
                    orderData?.orderShipper?.shipperPhone || "-"
                  }}</span>
                </div>
              </div>
            </div>
            <el-divider direction="vertical" />
            <div class="flex flex-col flex-1 ml-3">
              <div class="section-info-title">
                <svg-icon name="recipient" width="24px" height="24px" />
                <span>{{ $t("web.gfuc.consignee_info_title") }}</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">{{ $t("web.gfuc.name") }}</span>
                  <span class="info-value">{{
                    orderData?.orderConsignee?.consigneeName || "-"
                  }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">{{ $t("web.gfuc.address") }}</span>
                  <span class="info-value">{{
                    consigneeAddress(orderData?.orderConsignee)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t("web.gfuc.phone") }}</span>
                  <span class="info-value">{{
                    orderData?.orderConsignee?.consigneePhone || "-"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 包裹信息 -->
        <div class="section package-section">
          <h3 class="section-title">{{ $t("web.gfuc.parcel_info") }}</h3>
          <el-table
            :data="orderData.orderItemList"
            border
            style="width: 100%"
            class="goods-table"
          >
            <el-table-column
              prop="itemNameZh"
              :label="$t('web.gfuc.product_name_cn')"
              min-width="200"
            >
              <template #default="{ row }">
                {{ row.itemNameZh || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemNameEn"
              :label="$t('web.gfuc.product_name_en')"
              min-width="200"
            >
              <template #default="{ row }">
                {{ row.itemNameEn || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemQty"
              :label="$t('web.gfuc.quantity')"
              width="120"
            >
              <template #default="{ row }">
                {{ row.itemQty || "-" }}
              </template>
            </el-table-column>
          </el-table>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.total_quantity")
              }}</span>
              <span class="info-value">{{
                orderData?.orderItemList?.reduce(
                  (acc, cur) => acc + cur.itemQty,
                  0
                ) || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.declared_value")
              }}</span>
              <span class="info-value">{{
                orderData?.declaredValue || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label"
                >{{ $t("web.gfuc.total_weight") }}(kg)</span
              >
              <span class="info-value">{{
                orderData?.orderGoods?.weight || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">{{ $t("web.gfuc.parcel_volume") }}</span>
              <span class="info-value">{{
                orderData?.orderGoods?.length +
                  "*" +
                  orderData?.orderGoods?.width +
                  "*" +
                  orderData?.orderGoods?.height +
                  "CM" || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label"
                >{{ $t("web.gfuc.charging_weight") }}(kg)</span
              >
              <span class="info-value">{{
                orderData?.orderGoods?.weight || "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="order-sidebar">
        <!-- 轨迹信息 -->
        <div class="sidebar-section tracking-section">
          <h3 class="sidebar-title">{{ $t("web.gfuc.tracking_info") }}</h3>
          <div class="tracking-info">
            <div v-for="item in orderData.trackingInfo" :key="item.trackDate">
              <div class="tracking-date">
                <el-divider content-position="center">
                  {{ item.trackDate }}
                </el-divider>
              </div>
              <div
                class="tracking-item active"
                v-for="son in item.trackDetailItemList"
                :key="son.processTime"
              >
                <div class="tracking-dot">
                  <!-- <svg-icon name="locationStep" width="24" height="24" /> -->
                  <svg-icon
                    name="completedStep"
                    width="24"
                    height="24"
                    color="#D9D9D9"
                  />
                </div>
                <div class="tracking-content">
                  <div class="tracking-message">
                    {{ son.externalTrackContent }}
                  </div>
                  <div class="tracking-time">{{ son.processTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 增值服务 -->
        <div class="sidebar-section service-section" v-if="orderData?.orderCod">
          <h3 class="sidebar-title">
            {{ $t("web.gfuc.additional_services") }}
          </h3>
          <div class="service-info">
            <div class="service-item">
              <span class="service-label">{{
                $t("web.gfuc.insurance_amount")
              }}</span>
              <span class="service-value">{{
                orderData?.orderCod?.currency || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="service-item">
              <span class="service-label">{{ $t("web.gfuc.cod_amount") }}</span>
              <span class="service-value">{{
                orderData?.orderCod?.codAmount || "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { copyText } from "@/utils/index";
import {
  getOrderDetail,
  getExceptionOrderDetail,
  getOrderTracking
} from "@/api/order";
import { useDict } from "@/hooks/useDict";

import { useRoute } from "vue-router";
const route = useRoute();

const orderStatusDict = useDict("order_status");

// 步骤数据
const statusSteps = computed(() => {
  let arr = [1, 3, 4];
  if ([6, 7, 8].includes(orderData.value?.orderStatus)) {
    arr[4] = orderData.value?.orderStatus;
  }
  return orderStatusDict.options.value
    .filter((item) => arr.includes(item.value))
    .map((item) => ({
      label: item.label,
      status: item.value
    }));
});

// 当前步骤（从0开始，对应数组索引）

// 判断是否显示箭头（只在相邻节点之间显示）
const shouldShowArrow = (index) => {
  if (index >= statusSteps.value.length - 1) {
    return false; // 最后一个节点不显示箭头
  }

  const currentStatus = orderData.value?.orderStatus;
  if (!currentStatus) return false;

  // 找到当前状态在步骤数组中的索引
  const currentStepIndex = statusSteps.value.findIndex(
    (step) => step.status === currentStatus
  );
  if (currentStepIndex === -1) return false;

  // 箭头只在当前节点的前后相邻节点之间显示
  // 即：箭头在索引为currentStepIndex-1和currentStepIndex之间，或者currentStepIndex和currentStepIndex+1之间
  return index === currentStepIndex - 1 || index === currentStepIndex;
};

const orderType = ref(route.params.orderType);

// 模拟数据
const orderData = ref({
  orderId: "GFFR2253045097778",
  trackingNumber: "GFFR2253045097778",
  status: "包裹收货",
  statusSteps: [
    // { name: "提交订单", completed: true },
    // { name: "包裹收货", completed: true, active: true },
    // { name: "派送中", completed: false },
    // { name: "已签收", completed: false }
  ],
  basicInfo: {
    referenceNumber: "autotest_ad_FRA",
    thirdPartyTracking: "-",
    productType: "autotest_ad_FRA",
    product: "……"
  },
  senderInfo: {
    name: "test",
    address: "207 TELLURIDE DR GEORGETOWN, TX 78626-7103, China.",
    phone: "5860698233"
  },
  recipientInfo: {
    name: "test",
    address: "207 TELLURIDE DR GEORGETOWN, TX 78626-7103, China.",
    phone: "5860698233"
  },
  packageInfo: {
    goods: [
      { itemNameZh: "连衣裙", itemNameEn: "dress", itemQty: 1 },
      { itemNameZh: "鞋子", itemNameEn: "shoes", itemQty: 1 }
    ],
    totalitemQty: 2,
    declaredValue: 2312,
    totalWeight: 1.4,
    volume: "10*10*10 CM",
    chargeableWeight: 1.25
  },
  trackingInfo: [
    {
      trackDate: "2 Dec.2025",
      trackDetailItemList: [
        {
          processTime: "12:00:00",
          externalTrackContent: "Le Havre,76600,FR / package is delivered",
          active: true
        }
      ]
    }
  ],
  services: {
    insurance: 120,
    cod: 110
  }
});

onMounted(() => {
  fetchOrderDetail();
});

const fetchOrderDetail = async () => {
  try {
    let orderId = route.params.orderId;
    let response = {};
    if (orderType.value === "order") {
      // 普通订单详情
      response = await getOrderDetail({ id: orderId });
      orderData.value = response;
    } else {
      // 异常订单详情
      response = await getExceptionOrderDetail({ unusualOrderId: orderId });
      orderData.value = JSON.parse(response?.requestBody || "{}");
    }

    // 获取订单轨迹信息
    if (orderData.value?.waybillNo) {
      let data = await getOrderTracking({
        orderNumber: orderData.value?.waybillNo
      });
      orderData.value.trackingInfo = data[0]?.trackDetailItemList || [];
    }
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
  }
};
// 法国：地址1，邮编，区域，城市，洲，国家
// 意大利：地址1，邮编，区域，城市，国家
// 荷兰：地址1邮编，区域，城市，洲，国家
const shipperAddress = (obj: any) => {
  if (obj?.shipperCountry !== "ZH") {
    return [
      obj?.shipperStreet,
      obj?.shipperCode,
      obj?.shipperArea,
      obj?.shipperCity,
      obj?.shipperState,
      obj?.shipperCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else {
    return [
      obj?.shipperCountry,
      obj?.shipperState,
      obj?.shipperCity,
      obj?.shipperArea,
      obj?.shipperStreet,
      obj?.shipperCode
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  }
};

// 法国：外门牌 地址1，地址2，地址3，内门牌，邮编，区域，城市，洲，国家
// 意大利：地址1，外门牌，内门牌， 地址2，地址3，邮编，区域，城市，国家
// 荷兰：地址1，地址2，地址3，外门牌，内门牌，邮编，区域，城市，洲，国家
const consigneeAddress = (obj: any) => {
  if (obj?.consigneeCountry === "FR") {
    return [
      obj?.consigneeNumExt,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else if (obj?.consigneeCountry === "IT") {
    return [
      obj?.address1,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.address2,
      obj?.address3,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else if (obj?.consigneeCountry === "NL") {
    return [
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else {
    return [
      obj?.consigneeCountry,
      obj?.consigneeState,
      obj?.consigneeCity,
      obj?.consigneeArea,
      obj?.consigneeCode,

      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  }
};
</script>

<style scoped lang="scss">
.order-detail {
  @apply flex flex-col gap-3 bg-bg;

  min-width: 1200px;
}

/* 订单状态跟踪 */
.order-status-tracker {
  @apply flex items-center bg-white rounded-lg p-6 gap-8;

  .el-divider {
    height: 40px;
  }

  .order-info {
    @apply flex items-center gap-8;

    .section-item {
      @apply flex flex-col;

      .label {
        @apply flex justify-between items-center text-info;
      }

      .value {
        @apply text-text-regular;
      }
    }
  }

  .status-steps {
    @apply flex items-center flex-1;

    .step-item {
      &:first-child {
        @apply ml-0 pl-0;
      }
    }

    .step-item {
      @apply h-14 flex-1 flex items-center justify-center relative  bg-bg text-base;
    }

    .step-text {
      @apply text-sm font-medium  text-text-regular;
    }

    .step-arrow {
      @apply absolute right-0 top-0 w-0 h-0 border-t-[28px] border-b-[28px] border-l-[32px] border-transparent;
    }

    /* 激活状态 */
    .step-active {
      @apply bg-primary;

      .step-text {
        @apply text-white font-semibold;
      }
    }

    /* 完成状态 */
    .step-complated {
      @apply bg-[#FFEDE6];

      z-index: 2;

      .step-arrow {
        @apply border-l-[#FFEDE6];
      }
    }

    .arrow-active {
      @apply border-l-primary;

      z-index: 1;

      .step-arrow {
        @apply border-l-primary;
      }
    }

    .arrow-complated {
      @apply bg-primary;

      z-index: 1;

      .step-arrow {
        @apply border-l-[#fd7c28];
      }
    }

    /* 默认状态 */
    .step-default {
      @apply bg-bg  -ml-[32px];

      // .step-arrow {
      //   @apply border-l-[#FFEDE6];
      // }
    }

    .arrow-default {
      @apply border-l-bg;
    }
  }
}

/* 订单内容 */
.order-content {
  @apply flex flex-col gap-3 flex-1;

  .section {
    @apply relative  p-4 rounded-lg bg-white;

    .section-info-title {
      @apply flex items-center gap-2;
    }

    &.base-section {
      .info-grid {
        @apply flex items-center flex-wrap w-full;

        .el-divider {
          @apply h-6;
        }
      }
    }

    &.shipping-section {
      .info-grid {
        .info-item {
          @apply my-2 mx-8;
        }
      }

      .el-divider {
        @apply h-48;
      }
    }

    &.package-section {
      .info-grid {
        @apply flex items-center  mt-5 px-4 py-2.5 bg-bg;
      }
    }

    .section-title {
      @apply relative flex items-center justify-between mb-4 pl-2.5 text-lg font-semibold text-[#4e5965];

      &::before {
        @apply absolute top-1/2 -translate-y-1/2 left-0 w-1 h-[22px] bg-primary rounded-full;

        content: "";
      }
    }

    .info-item {
      @apply flex-1 flex flex-col mx-4;

      .info-label {
        @apply text-info text-base;
      }

      .info-value {
        @apply text-text-regular text-base;
      }
    }
  }
}

/* 右侧信息 */
.order-sidebar {
  @apply flex flex-col gap-5 flex-shrink-0 w-[430px];

  .tracking-section {
    @apply flex-1;
  }

  .sidebar-section {
    @apply bg-white p-4 rounded-lg;

    .sidebar-title {
      @apply relative flex items-center justify-between mb-4 pl-2.5 text-[18px] font-semibold text-text-regular;

      &::before {
        @apply absolute top-1/2 -translate-y-1/2 left-0 w-1 h-[22px] bg-primary rounded-full;

        content: "";
      }
    }

    :deep(.el-divider) {
      .el-divider__text {
        @apply text-text-placeholder text-base;
      }
    }

    .tracking-info {
      @apply flex flex-col;

      .tracking-date {
        @apply text-xs text-info mr-2 mb-1 text-center;
      }

      .tracking-item {
        @apply relative flex mb-6;

        gap: 14px;

        &::before {
          @apply absolute top-5 -bottom-10 left-[11px] w-0.5 bg-bg;

          content: "";
        }

        &:last-child::before {
          @apply hidden;
        }

        .tracking-dot {
          @apply relative text-[#BBBDBF];
        }

        .tracking-content {
          @apply flex-1;

          .tracking-time {
            @apply text-[#7a869a] text-sm mt-1;
          }

          .tracking-message {
            @apply text-[#4e5965] text-base font-semibold;
          }
        }
      }
    }

    /* 增值服务 */
    .service-info {
      @apply flex items-center gap-4;

      .service-item {
        @apply flex flex-col;

        .service-label {
          @apply text-base text-info;
        }

        .service-value {
          @apply text-base text-text-regular;
        }
      }
    }
  }
}
</style>
