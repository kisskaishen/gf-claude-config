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
        @show-success-dialog="successVisible = true"
        v-if="activeTab === 1"
      />
      <CostTable
        v-model:status="activeTab"
        @show-success-dialog="successVisible = true"
        @search-claim-bill="handleSearchClaimBill"
        v-else
      />
    </div>

    <SuccessDialog
      v-model="successVisible"
      :showIcon="false"
      :title="$t('web.gfuc.tip' /** 温馨提示 **/)"
      :description="
        $t(
          'web.gfuc.account_download_tip' /** 你的账单正在下载中，预计5分钟完成下载，请前往任务中心查看 **/
        )
      "
      :primary-btn-text="
        $t('web.gfuc.stay_on_current_page' /** 留在当前页面 **/)
      "
      :secondary-btn-text="
        $t('web.gfuc.go_to_task_center' /** 去任务中心查看 **/)
      "
      @primary-click="handleStayOnCurrentPage"
      @secondary-click="handleGoToTaskCenter"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ClaimTable from "@/views/finance/components/ClaimTable.vue";
import CostTable from "@/views/finance/components/CostTable.vue";
import SuccessDialog from "@/components/SuccessDialog/index.vue";

import PageContainer from "@/components/PageContainer/index.vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

defineOptions({
  name: "AccountList"
});

const successVisible = ref(false);

const activeTab = ref(0);
const claimBillSearchNo = ref("");

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

const handleStayOnCurrentPage = () => {
  successVisible.value = false;
};

const handleGoToTaskCenter = () => {
  successVisible.value = false;

  router.push("/task/list");
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
