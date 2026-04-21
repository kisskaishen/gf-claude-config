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
          :label="$t('gfuc.all_orders' /** 全部订单 **/)"
          name="all"
        />
        <el-tab-pane
          :label="$t('gfuc.ordered' /** 已下单 **/)"
          name="ordered"
        />
        <el-tab-pane
          :label="$t('gfuc.ready_to_dispatch' /** 准备派送 **/)"
          name="ready"
        />
        <el-tab-pane
          :label="$t('gfuc.dispatching' /** 派送中 **/)"
          name="delivering"
        />
        <el-tab-pane
          :label="$t('gfuc.delivered' /** 派送成功 **/)"
          name="success"
        />
        <el-tab-pane
          :label="$t('gfuc.abnormal' /** 异常 **/)"
          name="exception"
        />
        <el-tab-pane
          :label="$t('gfuc.cancelled' /** 已取消 **/)"
          name="cancelled"
        />
        <el-tab-pane
          :label="$t('gfuc.failed' /** 下单失败 **/)"
          name="failed"
        />
      </el-tabs>
      <div class="order-content">
        <TableLayout
          v-model:searchFormModel="searchForm"
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :data="tableData"
          :total="pagination.total"
          :loading="loading"
          :searchConfig="{ cols: 3, rowNum: 3 }"
          @search="fetchData"
        >
          <template #search>
            <!-- Search Fields -->
            <el-form-item
              :label="$t('gfuc.tracking_number' /** 单号 **/)"
              prop="orderNo"
            >
              <el-input
                v-model="searchForm.orderNo"
                :placeholder="
                  $t(
                    'gfuc.please_enter_order_or_tracking_number' /** 请输入订单号或运单号 **/
                  )
                "
              />
            </el-form-item>
            <el-form-item
              :label="$t('gfuc.order_status' /** 订单状态 **/)"
              prop="status"
            >
              <el-select
                v-model="searchForm.status"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                clearable
              >
                <el-option
                  :label="$t('gfuc.ordered' /** 已下单 **/)"
                  value="ordered"
                />
                <el-option
                  :label="$t('gfuc.failed' /** 下单失败 **/)"
                  value="failed"
                />
                <el-option
                  :label="$t('gfuc.ready_to_dispatch' /** 准备派送 **/)"
                  value="ready"
                />
                <el-option
                  :label="$t('gfuc.dispatching' /** 派送中 **/)"
                  value="delivering"
                />
                <el-option
                  :label="$t('gfuc.delivered' /** 派送成功 **/)"
                  value="success"
                />
                <el-option
                  :label="$t('gfuc.abnormal' /** 异常 **/)"
                  value="exception"
                />
                <el-option
                  :label="$t('gfuc.cancelled' /** 已取消 **/)"
                  value="cancelled"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('gfuc.order_time' /** 下单时间 **/)"
              prop="orderTime"
            >
              <el-date-picker
                v-model="searchForm.orderTime"
                type="daterange"
                :start-placeholder="$t('gfuc.start_date' /** 开始日期 **/)"
                :end-placeholder="$t('gfuc.end_date' /** 结束日期 **/)"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item
              :label="$t('gfuc.recipient_postal_code' /** 收件人邮编 **/)"
              prop="recipientPostcode"
            >
              <el-input
                v-model="searchForm.recipientPostcode"
                :placeholder="$t('gfuc.please_enter' /** 请输入 **/)"
              />
            </el-form-item>
            <el-form-item
              :label="$t('gfuc.recipient_phone' /** 收件人电话 **/)"
              prop="recipientPhone"
            >
              <el-select
                v-model="searchForm.recipientPhone"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                clearable
              >
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('gfuc.product' /** 产品 **/)"
              prop="product"
            >
              <el-select
                v-model="searchForm.product"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                clearable
              >
                <el-option
                  :label="$t('gfuc.pickup_delivery' /** 揽收派送 **/)"
                  value="揽收派送"
                />
              </el-select>
            </el-form-item>
          </template>

          <template #columns>
            <el-table-column type="selection" width="55" />
            <el-table-column
              prop="customerOrderNo"
              :label="$t('gfuc.customer_order_number' /** 客户订单号 **/)"
              min-width="180"
            />
            <el-table-column
              prop="waybillNo"
              :label="$t('gfuc.waybill_number' /** 运单号 **/)"
              min-width="180"
            />
            <el-table-column
              prop="productName"
              :label="$t('gfuc.product_name' /** 产品名称 **/)"
              min-width="120"
            />
            <el-table-column
              prop="status"
              :label="$t('gfuc.order_status' /** 订单状态 **/)"
              width="100"
            >
              <template #default="{ row }">
                <span
                  :style="{ color: row.status === '下单失败' ? 'red' : '' }"
                >
                  {{ $t(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="recipient"
              :label="$t('gfuc.recipient' /** 收件人 **/)"
              min-width="120"
            />
            <el-table-column
              prop="recipientPhone"
              :label="$t('gfuc.recipient_phone' /** 收件人电话 **/)"
              min-width="130"
            />
            <el-table-column
              prop="recipientAddress"
              :label="$t('gfuc.recipient_address' /** 收件人地址 **/)"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="submitTime"
              :label="$t('gfuc.submission_time' /** 提交时间 **/)"
              width="180"
            />
            <el-table-column
              :label="$t('gfuc.operation' /** 操作 **/)"
              width="180"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="table-actions">
                  <!-- 查看 (所有状态都有) -->
                  <el-button
                    link
                    type="primary"
                    :icon="View"
                    @click="handleView(row)"
                  />

                  <!-- 已下单: 打印、编辑、取消 -->
                  <template v-if="row.status === '已下单'">
                    <el-button
                      link
                      type="primary"
                      :icon="Printer"
                      @click="handlePrint(row)"
                    />
                    <el-button
                      link
                      type="primary"
                      :icon="Edit"
                      @click="handleEdit(row)"
                    />
                    <el-button
                      link
                      type="danger"
                      :icon="Delete"
                      @click="handleCancel(row)"
                    />
                  </template>

                  <!-- 取消: 复制订单 -->
                  <template v-if="row.status === '已取消'">
                    <el-button
                      link
                      type="primary"
                      :icon="CopyDocument"
                      @click="handleCopy(row)"
                    />
                  </template>
                </div>
              </template>
            </el-table-column>
          </template>
        </TableLayout>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  View,
  Edit,
  Delete,
  Printer,
  CopyDocument
} from "@element-plus/icons-vue";
import PageContainer from "@/components/PageContainer/index.vue";
import TableLayout from "@/components/TableLayout/index.vue";

defineOptions({
  name: "OrderList"
});

const activeTab = ref("all");
const loading = ref(false);

const searchForm = reactive({
  orderNo: "",
  status: "",
  orderTime: [],
  recipientPostcode: "",
  recipientPhone: "",
  product: ""
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const tableData = ref([
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "已下单",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "准备派送",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "派送中",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "派送成功",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "异常",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "已取消",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "查没",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  },
  {
    customerOrderNo: "TASK202512180009",
    waybillNo: "CY2512020002",
    productName: "揽收派送",
    status: "下单失败",
    recipient: "迪迦的转运...",
    recipientPhone: "123456799511",
    recipientAddress: "Gebaude...",
    submitTime: "2025-12-18 10:00:00"
  }
]);

const fetchData = () => {
  loading.value = true;
  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleTabClick = () => {
  fetchData();
};

const handleView = (row: any) => {
  console.log("View", row);
};

const handlePrint = (row: any) => {
  console.log("Print", row);
};

const handleEdit = (row: any) => {
  console.log("Edit", row);
};

const handleCancel = (row: any) => {
  console.log("Cancel", row);
};

const handleCopy = (row: any) => {
  console.log("Copy", row);
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.order-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__item) {
    height: 28px;
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

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;

  .el-button {
    padding: 0;
    font-size: 18px;
  }
}

.order-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .order-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
