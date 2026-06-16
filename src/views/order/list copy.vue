<template>
  <PageContainer>
    <div class="order-container">
      <!-- Tabs -->
      <!-- <el-tabs
        v-model="activeTab"
        class="order-tabs"
        span="24"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="item in orderStatusOptions"
          :key="item.value"
          :label="item.label"
          :name="item.value"
        />
      </el-tabs>
      <ExceptionOrderTable
        v-model:status="activeTab"
        v-if="activeTab === 999"
      /> -->
      <OrderTable />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ExceptionOrderTable from "@/views/order/components/ExceptionOrderTable.vue";
import OrderTable from "@/views/order/components/OrderTable.vue";

import PageContainer from "@/components/PageContainer/index.vue";
import { useDict } from "@/hooks/useDict";

defineOptions({
  name: "OrderList"
});

const orderStatusDict = useDict("order_status");

const orderStatusOptions = computed(() => {
  return orderStatusDict.options.value.filter(
    (item: any) => ![6, 7, 8].includes(item.value)
  );
});

const activeTab = ref(0);

onMounted(() => {
  activeTab.value = Number(sessionStorage.getItem("homeOrderType") || "0");

  setTimeout(() => {
    sessionStorage.removeItem("homeOrderType");
  }, 100);
});
onActivated(() => {
  activeTab.value = Number(sessionStorage.getItem("homeOrderType") || "0");
  setTimeout(() => {
    sessionStorage.removeItem("homeOrderType");
  }, 100);
});

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
