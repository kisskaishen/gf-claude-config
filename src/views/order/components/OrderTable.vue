<template>
  <div>
    <div class="order-content">
      <TableLayout
        v-model:searchFormModel="searchForm"
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :data="tableData"
        :total="pagination.total"
        :loading="loading"
        :searchConfig="{ cols: 3, rowNum: 1 }"
        @search="fetchData"
      >
        <template #action-left>
          <el-button type="primary" @click="handleBatchPrint">
            <el-icon><Printer /></el-icon>
            批量打印
          </el-button>
        </template>
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
            v-if="[0, 888].includes(activeTab)"
            :label="$t('gfuc.order_status' /** 订单状态 **/)"
            prop="status"
          >
            <el-select
              v-model="searchForm.status"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
            >
              <el-option
                v-for="item in exceptionOrderStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
          <el-form-item :label="$t('gfuc.product' /** 产品 **/)" prop="product">
            <el-select
              v-model="searchForm.product"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
            >
              <el-option
                v-for="item in productList"
                :key="item.ProductCode"
                :label="item.ProductName"
                :value="item.ProductCode"
              />
            </el-select>
          </el-form-item>
        </template>

        <template #columns>
          <el-table-column type="selection" width="55" />
          <el-table-column
            v-for="item in columns"
            :key="item.prop"
            :prop="item.prop"
            :label="$t(item.label)"
            :width="item.width || undefined"
            :min-width="item.minWidth || undefined"
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
import {
  getOrderProductList,
  getOrderLabelUrl,
  batchPrintOrderLabel
} from "@/api/order";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";

import download from "download-file-by-url";
import { useUserStore } from "@/store/user";

const userInfo = useUserStore();

defineOptions({
  name: "OrderList"
});

const orderStatusDict = useDict("order_status");

const orderStatusOptions = computed(() => {
  return orderStatusDict.options.value.filter(
    (item: any) => !["查没", "派送失败", "异常完结"].includes(item.label)
  );
});
// 异常订单状态
const exceptionOrderStatusOptions = computed(() => {
  return orderStatusDict.options.value.filter((item: any) =>
    ["查没", "派送失败", "异常完结"].includes(item.label)
  );
});

const columns = [
  {
    prop: "customerOrderNo",
    label: "gfuc.customer_order_number",
    minWidth: 180
  },
  { prop: "waybillNo", label: "gfuc.waybill_number", minWidth: 180 },
  { prop: "productName", label: "gfuc.product_name", minWidth: 120 },
  { prop: "status", label: "gfuc.order_status", width: 100 },
  { prop: "recipient", label: "gfuc.recipient", minWidth: 120 },
  { prop: "recipientPhone", label: "gfuc.recipient_phone", minWidth: 130 },
  { prop: "recipientAddress", label: "gfuc.recipient_address", minWidth: 200 },
  { prop: "submitTime", label: "gfuc.submission_time", width: 180 }
];

const activeTab = ref(0);
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

const tableData = ref([]);

const productList = ref([]);
const getOrderProductListData = async () => {
  const res = await getOrderProductList({
    CountryCode: userInfo.userInfo?.country || ""
  });
  productList.value = res.data || [];
};

getOrderProductListData();

const fetchData = () => {
  loading.value = true;
  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleView = (row: any) => {
  console.log("View", row);
};

const handlePrint = (row: any) => {
  console.log("Print", row);
  // 打印订单
  getOrderLabelUrl({
    waybillNo: row.waybillNo,
    customerId: row.customerId
  }).then((res) => {
    console.log(res, "+++++");
    // download(res.data, 'order-label')
  });
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

// 批量打印
const handleBatchPrint = () => {
  // 获取选中的订单
  const selectedOrders = tableData.value.filter((item: any) => item.selected);

  if (selectedOrders.length === 0) {
    ElMessage.warning("请先选择要打印的订单");
    return;
  }

  console.log("批量打印订单:", selectedOrders);

  batchPrintOrderLabel({
    waybillNos: selectedOrders.map((item: any) => item.waybillNo)
  }).then((res) => {
    console.log(res);
    // download(res.data, 'order-label')
  });

  ElMessage.success(`已开始批量打印 ${selectedOrders.length} 个订单`);
};
</script>

<style lang="scss" scoped>
.table-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;

  .el-button {
    padding: 0;
    font-size: 18px;
  }
}

.order-content {
  flex: 1;
  overflow: hidden;
}
</style>
