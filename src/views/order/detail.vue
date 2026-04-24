<template>
  <div class="order-detail">
    <!-- 订单状态跟踪 -->
    <div class="order-status-tracker">
      <div class="order-info">
        <div class="flex items-center">
          <div class="flex flex-col items-center mr-6">
            <svg-icon name="orderStatus" width="50" height="48" />
            <div class="flex items-center w-full text-white bg-[#FFEAEC] mt-1">
              <span class="text-sm text-[#FF3141] text-center flex-1">{{
                orderData?.orderStatusName || orderData?.orderStatus || "-"
              }}</span>
            </div>
          </div>
          <div class="section-item">
            <div class="label">
              <span>客户订单号</span>
              <svg-icon
                v-if="orderData?.orderNo"
                name="copy"
                width="20"
                height="20"
                @click="copyText(orderData?.orderNo)"
              />
            </div>
            <span class="value">{{ orderData?.orderNo || "-" }}</span>
          </div>
        </div>
        <el-divider direction="vertical" />
        <div class="section-item">
          <div class="label">
            <span>运单编号</span>
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
        <el-divider direction="vertical" v-if="orderType === 'order'" />
      </div>
      <!-- 进度条容器 -->
      <div class="status-steps" v-if="orderType === 'order'">
        <!-- 步骤背景（带箭头） -->
        <div
          v-for="(step, index) in statusSteps"
          class="step-item"
          :class="{
            'step-active': index == currentStep,
            'step-complated': index < currentStep,
            'step-default': index > currentStep
          }"
        >
          <span class="step-text">{{ step.label }}</span>

          <!-- 箭头 -->
          <div
            v-if="index < statusSteps.length - 1"
            class="step-arrow"
            :class="{
              'arrow-active': index <= currentStep,
              'arrow-default': index > currentStep
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
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">参考单号</span>
              <span class="info-value">{{
                orderData?.referenceNo || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">第三方跟踪号</span>
              <span class="info-value">{{ orderData?.reference3 || "-" }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">产品类型</span>
              <span class="info-value">{{
                orderData?.productType === "ECO" ? "特惠" : "标快" || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">产品</span>
              <span class="info-value">{{
                orderData?.productName || "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 发货和收件人信息 -->
        <div class="section shipping-section">
          <div class="flex items-center justify-between">
            <h3 class="section-title">发货信息</h3>
            <div class="flex items-center">
              <svg-icon name="recipeType" width="24px" height="24px" />
              <span class="ml-2">送货上门</span>
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex flex-col flex-1 ml-3">
              <div class="section-info-title">
                <svg-icon name="sender" width="24px" height="24px" />
                <span>寄件人信息</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">寄件人姓名</span>
                  <span class="info-value">{{
                    orderData?.orderShipper?.shipperName || "-"
                  }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">寄件人地址</span>
                  <span class="info-value">{{
                    orderData?.orderShipper?.shipperStreet || "-"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">寄件人电话</span>
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
                <span>收件人信息</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">收件人姓名</span>
                  <span class="info-value">{{
                    orderData?.orderConsignee?.consigneeName || "-"
                  }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">收件人地址</span>
                  <span class="info-value">{{
                    orderData?.orderConsignee?.address1 || "-"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">收件人电话</span>
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
          <h3 class="section-title">包裹信息</h3>
          <el-table
            :data="orderData.orderItemList"
            border
            style="width: 100%"
            class="goods-table"
          >
            <el-table-column
              prop="itemNameZh"
              label="商品名称(CN)"
              min-width="200"
            >
              <template #default="{ row, $index }">
                {{ row.itemNameZh || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemNameEn"
              label="商品名称(EN)"
              min-width="200"
            >
              <template #default="{ row, $index }">
                {{ row.itemNameEn || "-" }}
              </template>
            </el-table-column>
            <el-table-column prop="itemQty" label="数量" width="120">
              <template #default="{ row, $index }">
                {{ row.itemQty || "-" }}
              </template>
            </el-table-column>
          </el-table>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">总数量</span>
              <span class="info-value">{{
                orderData?.orderItemList?.reduce(
                  (acc, cur) => acc + cur.itemQty,
                  0
                ) || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">申报价值 (EUR)</span>
              <span class="info-value">{{
                orderData?.declaredValue || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">总重量 (kg)</span>
              <span class="info-value">{{
                orderData?.orderGoods?.weight || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">包裹体积</span>
              <span class="info-value">{{
                orderData?.orderGoods?.width *
                  orderData?.orderGoods?.height *
                  orderData?.orderGoods?.length || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">计费重量 (kg)</span>
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
          <h3 class="sidebar-title">轨迹信息</h3>
          <div class="tracking-info">
            <div v-for="item in orderData.trackingInfo" :key="item.date">
              <div class="tracking-date">
                <el-divider content-position="center">
                  {{ item.date }}
                </el-divider>
              </div>
              <div
                class="tracking-item active"
                v-for="son in item.events"
                :key="son.time"
              >
                <div class="tracking-dot">
                  <!-- <svg-icon name="locationStep" width="24" height="24" /> -->
                  <svg-icon name="completedStep" width="24" height="24" />
                </div>
                <div class="tracking-content">
                  <div class="tracking-message">
                    {{ son.message }}
                  </div>
                  <div class="tracking-time">{{ son.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 增值服务 -->
        <div class="sidebar-section service-section">
          <h3 class="sidebar-title">增值服务</h3>
          <div class="service-info">
            <div class="service-item">
              <span class="service-label">保险金额 (EUR)</span>
              <span class="service-value">{{
                orderData?.orderCod?.currency || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="service-item">
              <span class="service-label">COD金额 (EUR)</span>
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
import { getOrderDetail, getExceptionOrderDetail } from "@/api/order";
// import { useDict } from "@/hooks/useDict";

import { useRoute } from "vue-router";
const route = useRoute();

// const orderStatusDict = useDict("order_status");

// 步骤数据
const statusSteps = ref([
  { label: "提交订单" },
  { label: "包裹收货" },
  { label: "派送中" },
  { label: "已签收" }
]);

// 当前步骤（从0开始，对应数组索引）
const currentStep = ref(1);

const orderType = ref(route.params.type);

// 模拟数据
const orderData = ref({
  orderId: "GFFR2253045097778",
  trackingNumber: "GFFR2253045097778",
  status: "包裹收货",
  statusSteps: [
    { name: "提交订单", completed: true },
    { name: "包裹收货", completed: true, active: true },
    { name: "派送中", completed: false },
    { name: "已签收", completed: false }
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
      date: "2 Dec.2025",
      events: [
        {
          time: "12:00:00",
          message: "Le Havre,76600,FR / package is delivered",
          active: true
        },
        {
          time: "12:00:00",
          message: "Le Havre,76600,FR / package is delivered",
          active: false
        }
      ]
    },
    {
      date: "1 Dec.2025",
      events: [
        {
          time: "12:00:00",
          message: "Le Havre,76600,FR / package is delivered",
          active: false
        },
        {
          time: "12:00:00",
          message: "Le Havre,76600,FR / package is delivered",
          active: false
        },
        {
          time: "12:00:00",
          message: "Le Havre,76600,FR / package is delivered",
          active: false
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
    console.log(route);
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
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
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
  @apply flex items-center bg-white rounded-lg p-6 border gap-8;

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
    @apply flex items-center gap-8 flex-1;

    .step-item {
      &:first-child {
        @apply ml-0 pl-0;
      }
    }

    .step-item {
      @apply h-14 flex items-center justify-center relative  bg-bg -ml-[31px] pl-[31px];
    }

    .step-text {
      @apply text-sm font-medium  px-10 text-text-regular;
    }

    .step-arrow {
      @apply absolute -right-[30px] top-0 w-0 h-0 border-t-[28px] border-b-[28px] border-l-[30px] border-transparent;
    }

    /* 激活状态 */
    .step-active {
      @apply bg-primary;

      .step-text {
        @apply text-white;
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

    /* 默认状态 */
    .step-default {
      @apply bg-bg  -ml-[31px];

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
    @apply relative border p-4 rounded-lg bg-white;
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
        @apply flex items-center border mt-5 px-4 py-2.5 bg-bg;
      }
    }

    .section-title {
      @apply relative flex items-center justify-between mb-4 pl-2.5 text-lg;

      &::before {
        @apply absolute top-1/2 -translate-y-1/2 left-0 w-1 h-[22px] bg-primary rounded-full;

        content: "";
      }
    }

    .info-item {
      @apply flex-1 flex flex-col mx-4;

      .info-label {
        @apply text-info text-sm;
      }

      .info-value {
        @apply text-text-regular text-sm;
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

  .service-section {
  }

  .sidebar-section {
    @apply bg-white p-4 rounded-lg border;

    .sidebar-title {
      @apply relative flex items-center justify-between mb-4 pl-2.5 text-lg;

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
        @apply relative flex items-baseline mb-6;

        gap: 14px;

        &::before {
          @apply absolute top-5 -bottom-10 left-[11px] w-0.5 bg-bg;

          content: "";
        }

        &:last-child::before {
          @apply hidden;
        }

        .tracking-dot {
          @apply relative;
        }

        .tracking-content {
          @apply flex-1;

          .tracking-time {
            @apply text-text-regular text-sm mt-1;
          }

          .tracking-message {
            @apply text-text-secondary text-sm;
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
          @apply text-sm text-info;
        }

        .service-value {
          @apply text-sm text-text-regular;
        }
      }
    }
  }
}
</style>
