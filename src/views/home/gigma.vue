<template>
  <div class="container p-6 mx-auto">
    <!-- 欢迎信息 -->
    <h1 class="mb-6 text-xl font-medium">
      {{ $t("web.gfuc.halo") }}， {{ userAccount }}
    </h1>

    <!-- 总金额和状态卡片 -->
    <div class="flex justify-between gap-6 mb-10">
      <!-- 总下单金额 -->
      <div
        class="flex-1 p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50"
      >
        <p class="mb-2 text-sm text-gray-600">
          {{ $t("web.gfuc.available_balance") }}
        </p>
        <p class="text-2xl font-bold text-primary">
          € {{ formatAmount(balance) }}
        </p>
        <div class="pt-4 mt-4 border-t border-orange-200">
          <a
            href="#"
            class="text-sm text-primary hover:underline"
            @click="handleViewDetail('Balance')"
            >{{ $t("web.gfuc.view_detail") }}</a
          >
        </div>
      </div>

      <!-- 派送中 -->
      <div
        class="flex flex-col p-4 bg-white border rounded-lg cursor-pointer border-card min-w-[320px]"
        @click="handleViewDetail('OrderList', 4)"
      >
        <p class="mb-4 text-sm text-left text-gray-600">
          {{ $t("web.gfuc.days_delivery_in_progress") }}
        </p>
        <div class="flex flex-col items-center">
          <p class="mb-2 text-3xl font-bold text-center text-primary">
            {{ recentDeliveryCount }}
          </p>
          <p class="text-center text-gray-600">
            {{ $t("web.gfuc.delivery_in_progress") }}
          </p>
        </div>
      </div>

      <!-- 已签收 -->
      <div
        class="flex flex-col p-4 bg-white border rounded-lg cursor-pointer border-card min-w-[320px]"
        @click="handleViewDetail('OrderList', 5)"
      >
        <p class="mb-4 text-sm text-left text-gray-600">
          {{ $t("web.gfuc.days_signed_orders") }}
        </p>
        <div class="flex flex-col items-center">
          <p class="mb-2 text-3xl font-bold text-center text-primary">
            {{ SignedOrdersCount }}
          </p>
          <p class="text-center text-gray-600">
            {{ $t("web.gfuc.signed_orders") }}
          </p>
        </div>
      </div>
    </div>

    <!-- 运单号查询 -->
    <div class="flex mb-10">
      <!-- <input
        type="text"
        placeholder="请输入你的运单号"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        class="px-6 py-2 text-white transition-colors rounded-r-md bg-primary hover:bg-primary-hover"
      >
        查询
      </button> -->
      <el-input
        v-model="trackingNo"
        :placeholder="$t('web.gfuc.tracking_no')"
        class="flex-1 custom-input"
      >
        <template #append>
          <!-- 追加按钮 -->
          <el-button
            type="primary"
            class="custom-append-btn"
            @click="handleQuery"
          >
            {{ $t("web.gfuc.track_query") }}
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 gap-4 mb-10 md:grid-cols-3">
      <!-- 单票下单 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg cursor-pointer border-card hover:shadow-md"
        @click="handleViewDetail('SingleOrder')"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          {{ $t("web.gfuc.single_ticket_order") }}
        </h3>
        <p class="text-sm text-center text-gray-600">
          {{ $t("web.gfuc.forecast_order_tip") }}
        </p>
      </div>

      <!-- 批量下单 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg cursor-pointer border-card hover:shadow-md"
        @click="handleViewDetail('BatchOrder')"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.77-1.732-.77-2.502 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          {{ $t("web.gfuc.batch_order") }}
        </h3>
        <p class="text-sm text-center text-gray-600">
          {{ $t("web.gfuc.problem_management_tip") }}
        </p>
      </div>

      <!-- 查看账单 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg cursor-pointer border-card hover:shadow-md"
        @click="handleViewDetail('Account')"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          {{ $t("web.gfuc.view_bill") }}
        </h3>
        <p class="text-sm text-center text-gray-600">
          {{ $t("web.gfuc.view_bill_tip") }}
        </p>
      </div>
    </div>

    <!-- 流程步骤 -->
    <div class="flex flex-wrap items-center justify-around step">
      <!-- 开通服务 -->
      <div class="flex flex-col items-center" v-if="!hasShipperList">
        <div
          class="flex items-center justify-center w-16 h-16 mb-2 border rounded-full border-text-primary"
        >
          <svg-icon name="home-step1" width="32px" height="32px" />
        </div>
        <p class="text-base text-info">{{ $t("web.gfuc.open_service") }}</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2" v-if="!hasShipperList">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 预报订单 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-16 h-16 mb-2 border rounded-full border-text-primary"
        >
          <svg-icon name="home-step2" width="32px" height="32px" />
        </div>
        <p class="text-base text-info">{{ $t("web.gfuc.forecast_order") }}</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 打印面单 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-16 h-16 mb-2 border rounded-full border-text-primary"
        >
          <svg-icon name="home-step3" width="32px" height="32px" />
        </div>
        <p class="text-base text-info">{{ $t("web.gfuc.print_order") }}</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 发货运输 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-16 h-16 mb-2 border rounded-full border-text-primary"
        >
          <svg-icon name="home-step4" width="32px" height="32px" />
        </div>
        <p class="text-base text-info">
          {{ $t("web.gfuc.shipment_transport") }}
        </p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 派送签收 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-16 h-16 mb-2 border rounded-full border-text-primary"
        >
          <svg-icon name="home-step5" width="32px" height="32px" />
        </div>
        <p class="text-base text-info">{{ $t("web.gfuc.delivery_sign") }}</p>
      </div>
    </div>
  </div>

  <!-- 右侧帮助和反馈 -->
  <div
    class="flex fixed right-0 bottom-[10%] flex-col gap-2 px-1.5 py-3 bg-white shadow-md -translate-y-1/2 min-w-14"
  >
    <!-- 帮助（暂时隐藏） -->
    <!-- <div
      class="flex flex-col items-center justify-center transition-shadow bg-white cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-sm whitespace-nowrap text-info">帮助</span>
    </div>
    <el-divider style="margin: 0" /> -->
    <!-- 反馈 -->
    <div
      class="flex flex-col items-center justify-center transition-shadow bg-white cursor-pointer"
      @click="handleOpenFeedback"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span class="text-sm whitespace-nowrap text-info">{{
        $t("web.gfuc.feedback")
      }}</span>
    </div>
  </div>

  <!-- 用户反馈弹框 -->
  <FeedbackDialog v-model:visible="feedbackVisible" :country="appStore.site" />
</template>

<script setup lang="ts">
import { getBalanceInfo, getRecentCount } from "@/api/home";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
import FeedbackDialog from "@/components/FeedbackDialog/index.vue";
import { formatAmount } from "@/utils";
import { useAppStore } from "@/store/app";
const appStore = useAppStore();
const userStore = useUserStore();
const router = useRouter();

const { t } = useI18n();

const lang = computed(() => appStore.lang);
const currentCountry = computed(() => appStore.site?.toLowerCase() || "");

const userAccount = computed(() => {
  return userStore?.userInfo?.account;
});

const hasShipperList = computed(() => {
  return userStore?.loginInfo?.shipperCustomerList?.length > 0;
});

const balance = ref(0);
const recentDeliveryCount = ref(0);
const SignedOrdersCount = ref(0);
const trackingNo = ref("");

// 用户反馈
const feedbackVisible = ref(false);

const handleOpenFeedback = () => {
  feedbackVisible.value = true;
};

const dataLoaded = ref(false);

const fetchHomeData = async () => {
  if (!hasShipperList.value) {
    return;
  }
  const balanceInfo = await getBalanceInfo();
  balance.value = balanceInfo || 0;

  const res = await getRecentCount();
  recentDeliveryCount.value = res?.recentDeliveryCount || 0;
  SignedOrdersCount.value = res?.signedOrdersCount || 0;
};

onMounted(() => {
  fetchHomeData();
});

onActivated(() => {
  if (dataLoaded.value) {
    fetchHomeData();
  }
  dataLoaded.value = true;
});

const handleQuery = async () => {
  if (!trackingNo.value) {
    ElMessage.error(t("web.gfuc.please_input_tracking_no"));
    return;
  }

  const extractedCountry = trackingNo.value.substring(2, 4).toLowerCase();
  const supportedCountries = ["nl", "it", "fr", "es"];

  // 确定目标国家：优先使用订单号中的国家，否则使用当前国家
  const targetCountry = supportedCountries.includes(extractedCountry)
    ? extractedCountry
    : currentCountry.value;

  // 判断是否需要英文站：如果目标国家与当前语言不匹配，则跳转英文站
  const needEnglish = targetCountry !== lang.value;

  // 构建跳转URL
  const url = needEnglish
    ? `https://www.gofo.com/${targetCountry}/en/tracking-results/?id=${trackingNo.value}`
    : `https://www.gofo.com/${targetCountry}/tracking-results/?id=${trackingNo.value}`;

  window.open(url, "_blank");
};

const handleViewDetail = (name: string, type?: number) => {
  if (type) {
    sessionStorage.setItem("homeOrderType", type.toString());
  }

  router.push({ name });
};
</script>

<style scoped lang="scss">
/* 额外的样式可以在这里添加 */
// .custom-input {
//   --el-input-border-color: #ff7d00;
//   --el-input-hover-border-color: #ff7d00;
//   --el-input-focus-border-color: #ff7d00;
// }

.custom-input {
  :deep(.el-input__wrapper) {
    height: 48px;
    padding: 0 18px;
    text-align: center;
    background-color: #fff;
    border: 2px solid var(--color-primary);
    border-radius: 24px 0 0 2px; /* 超大圆角 */
    box-shadow: none;

    .el-input__inner {
      font-size: 16px;
      color: #333;
      text-align: center;
    }
  }

  :deep(.el-input-group__append) {
    background-color: transparent !important;
    box-shadow: none !important;
  }
}

.custom-append-btn {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 500;
  color: #fff !important;
  cursor: pointer !important;
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  border-radius: 0 2px 24px 0; /* 右侧圆角匹配 */
}

.step {
  .svg-icon {
    cursor: default;
  }
}
</style>
