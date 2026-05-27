<template>
  <PageContainer>
    <div class="order-container">
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
      <ClaimTable v-model:status="activeTab" v-if="activeTab === 999" />
      <CostTable v-model:status="activeTab" v-else />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ClaimTable from "@/views/finance/components/ClaimTable.vue";
import CostTable from "@/views/finance/components/CostTable.vue";

import PageContainer from "@/components/PageContainer/index.vue";
// import { useDict } from "@/hooks/useDict";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "AccountList"
});

const activeTab = ref(0);
const activeTabOptions = computed(() => [
  {
    value: 0,
    label: t("web.gfuc.freight_bill" /** 运费账单 */)
  },
  {
    value: 999,
    label: t("web.gfuc.claim_bill" /** 理赔账单 */)
  }
]);

const handleTabClick = (tab: any, event: Event) => {
  console.log(tab.props.label, tab.props.name);
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

.order-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
