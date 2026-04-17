<template>
  <div class="order-detail">
    <!-- 订单状态跟踪 -->
    <div class="order-status-tracker">
      <div class="order-info">
        <div class="flex items-center">
          <div class="flex flex-col items-center">
            <svg-icon name="earth" width="50" height="48" />
            <span class="text-sm text-[#909399]">状态</span>
          </div>
          <div class="section-item">
            <div class="label">
              <span>客户订单号</span>
              <svg-icon name="earth" width="20" height="20" />
            </div>
            <span class="value">GFFR2253045097778</span>
          </div>
        </div>
        <el-divider direction="vertical" />
        <div class="section-item">
          <div class="label">
            <span>运单编号</span>
            <svg-icon name="earth" width="20" height="20" />
          </div>
          <span class="value">GFFR2253045097778</span>
        </div>
        <el-divider direction="vertical" />
      </div>
      <!-- 进度条容器 -->
      <div class="status-steps">
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
              <span class="info-value">autotest_ad_FRA</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">第三方跟踪号</span>
              <span class="info-value">-</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">产品类型</span>
              <span class="info-value">autotest_ad_FRA</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">产品</span>
              <span class="info-value">……</span>
            </div>
          </div>
        </div>

        <!-- 发货和收件人信息 -->
        <div class="section shipping-section">
          <h3 class="section-title">发货信息</h3>
          <div class="flex items-center">
            <div class="flex flex-col ml-3">
              <div class="section-info-title">
                <svg-icon name="earth" />
                <span>寄件人信息</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">寄件人姓名</span>
                  <span class="info-value">test</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">寄件人地址</span>
                  <span class="info-value"
                    >207 TELLURIDE DR GEORGETOWN, TX 78626-7103, China.</span
                  >
                </div>
                <div class="info-item">
                  <span class="info-label">寄件人电话</span>
                  <span class="info-value">5860698233</span>
                </div>
              </div>
            </div>
            <el-divider direction="vertical" />
            <div class="flex flex-col ml-3">
              <div class="section-info-title">
                <svg-icon name="earth" />
                <span>收件人信息</span>
              </div>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">收件人姓名</span>
                  <span class="info-value">test</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">收件人地址</span>
                  <span class="info-value"
                    >207 TELLURIDE DR GEORGETOWN, TX 78626-7103, China.</span
                  >
                </div>
                <div class="info-item">
                  <span class="info-label">收件人电话</span>
                  <span class="info-value">5860698233</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 包裹信息 -->
        <div class="section package-section">
          <h3 class="section-title">包裹信息</h3>
          <el-table
            :data="orderData.packageInfo.goods"
            border
            style="width: 100%"
            class="goods-table"
          >
            <el-table-column prop="nameCn" label="商品名称(CN)" min-width="200">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`goods.${$index}.nameCn`"
                  class="table-form-item"
                >
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="nameEn" label="商品名称(EN)" min-width="200">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`goods.${$index}.nameEn`"
                  class="table-form-item"
                >
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="120">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`goods.${$index}.quantity`"
                  class="table-form-item"
                >
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">总数量</span>
              <span class="info-value">2</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">申报价值 (EUR)</span>
              <span class="info-value">2312</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">总重量 (kg)</span>
              <span class="info-value">1.4</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">包裹体积</span>
              <span class="info-value">10*10*10 CM</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">计费重量 (kg)</span>
              <span class="info-value">1.25</span>
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
                  <svg-icon name="earth" width="12" height="12" />
                  <!-- <svg-icon name="home" width="12" height="12" /> -->
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
              <span class="service-value">120</span>
            </div>
            <el-divider direction="vertical" />
            <div class="service-item">
              <span class="service-label">COD金额 (EUR)</span>
              <span class="service-value">110</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// 步骤数据
const statusSteps = ref([
  { label: "提交订单" },
  { label: "包裹收货" },
  { label: "派送中" },
  { label: "已签收" }
]);

// 当前步骤（从0开始，对应数组索引）
const currentStep = ref(1);

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
      { nameCN: "连衣裙", nameEN: "dress", quantity: 1 },
      { nameCN: "鞋子", nameEN: "shoes", quantity: 1 }
    ],
    totalQuantity: 2,
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
  // 可以在这里添加获取订单数据的逻辑
  console.log("Order detail component mounted");
});
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
          @apply my-2;
        }
      }

      .el-divider {
        @apply h-48;
      }
    }

    &.package-section {
      .info-grid {
        @apply flex items-center border mt-5 px-4 py-2.5;
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
          @apply absolute top-5 -bottom-10 left-[5px] w-0.5 bg-bg;

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
