<template>
  <PageContainer>
    <div class="account-container">
      <!-- Tabs -->
      <el-tabs
        v-model="activeTab"
        class="order-tabs"
        span="24"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="item in activeTabOptions"
          :key="item.value"
          :label="item.label"
          :name="item.value"
        />
      </el-tabs>
      <ClaimTable
        v-model:status="activeTab"
        :search-claim-bill-no="claimBillSearchNo"
        :settle-cycle-data="settleCycleData"
        @fly-to-task-center="handleFlyToTaskCenter"
        v-if="activeTab === 1"
      />
      <CostTable
        v-model:status="activeTab"
        :settle-cycle-data="settleCycleData"
        @fly-to-task-center="handleFlyToTaskCenter"
        @search-claim-bill="handleSearchClaimBill"
        v-else
      />
    </div>

    <!-- 飞入导航栏任务中心图标的动效 -->
    <FlyToTaskCenter
      v-model:visible="flyVisible"
      :from-element="flyFromElement"
      @done="handleFlyDone"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import ClaimTable from "@/views/finance/components/ClaimTable.vue";
import CostTable from "@/views/finance/components/CostTable.vue";
import FlyToTaskCenter from "@/views/finance/components/FlyToTaskCenter/index.vue";

import PageContainer from "@/components/PageContainer/index.vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { getCustomerSettleCycle } from "@/api/finance";
import { useAppStore } from "@/store/app";

const { t } = useI18n();
const appStore = useAppStore();

defineOptions({
  name: "AccountList"
});

/** 飞入动画状态 */
const flyVisible = ref(false);
const flyFromElement = ref<HTMLElement | null>(null);

const activeTab = ref(0);
const claimBillSearchNo = ref("");

/** 客户结算周期数据 */
const settleCycleData = ref(null);

/** 获取客户结算周期 */
const fetchCustomerSettleCycle = async () => {
  try {
    const res = await getCustomerSettleCycle();
    settleCycleData.value = res;
    console.log("客户结算周期:", res);
  } catch (error) {
    console.error("获取客户结算周期失败:", error);
  }
};

onMounted(() => {
  fetchCustomerSettleCycle();
});

/** 监听语言切换，重新获取客户结算周期 */
watch(
  () => appStore.lang,
  () => {
    fetchCustomerSettleCycle();
  }
);

const handleSearchClaimBill = (claimBillNo: string) => {
  claimBillSearchNo.value = claimBillNo;
  activeTab.value = 1;
};

const activeTabOptions = computed(() => [
  {
    value: 0,
    label: t("web.gfuc.freight_bill" /** 运费账单 */)
  },
  {
    value: 1,
    label: t("web.gfuc.claim_bill" /** 理赔账单 */)
  }
]);

const handleTabClick = (tab: any, event: Event) => {
  console.log(tab.props.label, tab.props.name);
};

/** 触发飞入动画：子组件点击下载/导出后 */
const handleFlyToTaskCenter = (element: HTMLElement | null) => {
  if (!element) return;
  flyFromElement.value = element;
  flyVisible.value = true;
};

/** 飞入动画完成 */
const handleFlyDone = () => {
  ElMessage.success(
    t(
      "web.gfuc.download_task_submitted" /** 下载任务已提交，请前往任务中心查看 **/
    )
  );
};
</script>

<style lang="scss" scoped>
.order-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__item) {
    height: 32px;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      height: 1px;
    }
  }
}

.account-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
