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
        :searchConfig="{ cols: 3, rowNum: 2 }"
        @search="fetchData"
        @reset="handleReset"
        @selection-change="handleSelectionChange"
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
            prop="orderNumber"
          >
            <el-input
              v-model="searchForm.orderNumber"
              clearable
              :placeholder="
                $t('web.gfuc.please_enter' /** 请输入订单号或运单号 **/)
              "
            />
          </el-form-item>
          <el-form-item
            v-if="currentStatus === 888"
            :label="$t('gfuc.order_status' /** 订单状态 **/)"
            prop="orderStatusSet"
          >
            <el-select
              v-model="searchForm.orderStatus"
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
            prop="orderTimeRange"
          >
            <el-date-picker
              v-model="searchForm.orderTimeRange"
              type="daterange"
              :disabled-date="disabledDate"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleChange"
            />
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.recipient_postal_code' /** 收件人邮编 **/)"
            prop="consigneeCodeList"
          >
            <el-input
              v-model="searchForm.consigneeCodeList"
              clearable
              :placeholder="$t('gfuc.please_enter' /** 请输入 **/)"
            />
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.recipient_phone' /** 收件人电话 **/)"
            prop="shipperCodeList"
          >
            <el-input
              v-model="searchForm.shipperPhone"
              clearable
              :placeholder="$t('web.gfuc.please_enter' /** 请输入 **/)"
            />
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.product' /** 产品 **/)"
            prop="productCodeList"
          >
            <el-select
              v-model="searchForm.productCodeList"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in productList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
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
                  :title="$t('web.gfuc.view_order' /** 查看订单 **/)"
                />

                <!-- 已下单: 打印、编辑、取消 -->
                <template v-if="row.orderStatus === 1">
                  <el-button
                    link
                    type="primary"
                    :icon="Printer"
                    @click="handlePrint(row)"
                    :title="$t('web.gfuc.print_order' /** 打印订单 **/)"
                  />
                  <el-button
                    link
                    type="primary"
                    :icon="Edit"
                    @click="handleEdit(row)"
                    :title="$t('web.gfuc.edit_order' /** 编辑订单 **/)"
                  />
                  <el-button
                    link
                    type="danger"
                    :icon="Delete"
                    @click="handleCancel(row)"
                    :title="$t('web.gfuc.cancel_order' /** 取消订单 **/)"
                  />
                </template>

                <!-- 取消: 复制订单 -->
                <template v-if="row.orderStatus === 2">
                  <el-button
                    link
                    type="primary"
                    :icon="CopyDocument"
                    @click="handleCopy(row)"
                    :title="$t('web.gfuc.copy_order' /** 复制订单 **/)"
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import { spliceArray, commaToArr } from "@/utils/index";
import { downloadFile } from "@/utils/download";
import {
  View,
  Edit,
  Delete,
  Printer,
  CopyDocument
} from "@element-plus/icons-vue";
import {
  getOrderList,
  getOrderLabelUrl,
  batchPrintOrderLabel,
  getOrderProductList,
  cancelOrder
} from "@/api/order";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";

import { useUserStore } from "@/store/user";
import { cloneDeep } from "lodash-es";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

const userStore = useUserStore();

const router = useRouter();

defineOptions({
  name: "OrderList"
});

const props = defineProps({
  status: {
    type: Number,
    default: 0
  }
});

const currentStatus = computed(() => props.status);

const orderStatusDict = useDict("order_status");

// // 是否有权限编辑
// const orderUpdateFlag = computed(() => {
//   return userStore.loginInfo
// })

// 异常订单状态
const exceptionOrderStatusOptions = computed(() => {
  return orderStatusDict.options.value.filter(
    (item: any) => ![6, 7, 8].includes(item.value)
  );
});

const columns = [
  {
    prop: "orderNo",
    label: "gfuc.customer_order_number",
    minWidth: 180
  },
  { prop: "waybillNo", label: "gfuc.waybill_number", minWidth: 200 },
  { prop: "productTypeName", label: "gfuc.product_name", minWidth: 120 },
  { prop: "orderStatusName", label: "gfuc.order_status", width: 100 },
  {
    prop: "orderConsigneeVO.consigneeName",
    label: "gfuc.recipient",
    minWidth: 120
  },
  {
    prop: "orderConsigneeVO.consigneePhone",
    label: "gfuc.recipient_phone",
    minWidth: 130
  },
  {
    prop: "orderConsigneeVO.address1",
    label: "gfuc.recipient_address",
    minWidth: 200
  },
  { prop: "orderCreateTime", label: "gfuc.submission_time", width: 200 }
];

const loading = ref(false);

// 初始表单状态
const initialFormState = {
  orderNumber: "",
  orderStatus: "",
  orderStatusSet: [],
  orderSource: undefined,
  consigneeCodeList: "",
  shipperCodeList: "",
  productCodeList: [],
  transferRequired: undefined,
  deliveryStationIdList: [],
  orderTimeRange: ["", ""]
};

const searchForm = reactive({ ...initialFormState });

// 重置表单函数
const handleResetForm = () => {
  Object.assign(searchForm, JSON.parse(JSON.stringify(initialFormState)));
  console.log(searchForm, "重置表单");
  // 重新设置默认日期范围
  setDefaultRange();
};

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const tableData = ref([]);

const productList = ref([]);

// 禁用日期逻辑
const disabledDate = (time) => {
  if (!searchForm.orderTimeRange || !searchForm.orderTimeRange[0]) {
    // 未选择开始日期时，只禁用未来日期
    return time.getTime() > Date.now();
  }

  const startTime = new Date(searchForm.orderTimeRange[0]).getTime();
  const minTime = startTime - 30 * 24 * 3600 * 1000;
  const maxTime = startTime + 30 * 24 * 3600 * 1000;

  // 禁用超出30天范围或未来的日期
  return (
    time.getTime() < minTime ||
    time.getTime() > maxTime ||
    time.getTime() > Date.now()
  );
};

// 设置默认值（前30天）
const setDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 30 * 24 * 3600 * 1000);
  // value-format="YYYY-MM-DD HH:mm:ss" 需要传入字符串格式的日期
  searchForm.orderTimeRange = [
    dayjs(start).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(end).format("YYYY-MM-DD HH:mm:ss")
  ];
};
setDefaultRange();

// 处理日期变化
const handleChange = (value) => {
  if (value && value[0] && value[1]) {
    const start = dayjs(value[0]);
    const end = dayjs(value[1]);
    const diffDays = end.diff(start, "day");

    if (diffDays > 30) {
      // 超过30天时，自动调整结束日期
      const newEnd = start.add(30, "day").toDate();
      searchForm.orderTimeRange = [value[0], newEnd];
      console.log("已自动调整为30天范围");
    }
  }
  console.log("选择的日期范围:", value);
};
// 处理订单状态集合
const handleOrderStatusSet = () => {
  const status = currentStatus.value;

  // 异常订单：不传状态，置空
  if (status === 0) {
    return [];
  }

  // 综合查询：888 走自定义逻辑
  if (status === 888) {
    return searchForm.orderStatus ? [searchForm.orderStatus] : [6, 7, 8];
  }

  // 其他状态：直接使用当前值
  return [status];
};
const getParams = () => {
  const {
    orderNumber,
    shipperCodeList,
    consigneeCodeList,
    orderTimeRange,
    ...args
  } = searchForm;
  const params: any = {
    ...args
  };
  // 处理单号
  if (orderNumber) {
    params.orderNumber = spliceArray(commaToArr(orderNumber), 500).join("\n");
  } else {
    params.orderNumber = "";
  }
  // 时间参数
  if (orderTimeRange?.length === 2) {
    params.queryStartTime = orderTimeRange[0];
    params.queryEndTime = orderTimeRange[1];
  }
  // 收件地邮编
  if (consigneeCodeList) {
    params.consigneeCodeList = spliceArray(commaToArr(consigneeCodeList), 100);
  }
  // 寄件地邮编
  if (shipperCodeList) {
    params.shipperCodeList = spliceArray(commaToArr(shipperCodeList), 100);
  }

  params.orderType = "";
  // 赋值
  params.orderStatusSet = handleOrderStatusSet();

  params.customerIdList = userStore.loginInfo?.shipperCustomerList?.map(
    (item: any) => item.customerId
  );
  return params;
};

const getOrderProductListData = async () => {
  const params = getParams();

  const res = await getOrderList({
    data: {
      ...params
    },
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  tableData.value = res.records || [];
  pagination.total = res.total || 0;
};

const fetchData = () => {
  loading.value = true;
  getOrderProductListData();

  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleView = (row: any) => {
  console.log("View", row);
  router.push(`/order/detail/${row.orderId}/order`);
};

const handlePrint = (row: any) => {
  console.log("Print", row);
  // 打印订单
  getOrderLabelUrl({
    waybillNo: row.waybillNo,
    customerId: row.customerId
  }).then((res) => {
    downloadFile(res.url, "面单打印");
  });
};

const handleEdit = (row: any) => {
  router.push(`/order/single/${row.orderId}/order`);
};

const handleCancel = (row: any) => {
  console.log("Cancel", row);
  // 这里可以调用取消订单的接口，成功后刷新列表
  ElMessageBox.confirm("您将操作取消订单，是否确定取消？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消"
  }).then(async () => {
    await cancelOrder({
      orderId: row.orderId,
      orderNo: row.orderNo
    });
    ElMessage.success("订单取消成功");
    await fetchData();
  });
};

const handleCopy = (row: any) => {
  router.push(`/order/single/${row.orderId}/order`);
};

const selectedOrders = ref([]);

const handleSelectionChange = (val: any) => {
  console.log("选择变化:", val);

  selectedOrders.value = val.map((item: any) => ({
    waybillNo: item.waybillNo,
    orderId: item.orderId,
    customerId: item.customerId
  }));
};

// 处理重置事件
const handleReset = () => {
  handleResetForm();
  fetchData();
};

// 批量打印
const handleBatchPrint = () => {
  // 获取选中的订单

  if (selectedOrders.value.length === 0) {
    ElMessage.warning("请先选择要打印的订单");
    return;
  }

  ElMessageBox.confirm(
    `您将进行打印面单的操作，已勾选${selectedOrders.value.length}单，是否确认打印？`,
    "温馨提示",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    }
  ).then(async () => {
    console.log(
      "批量打印订单:",
      selectedOrders.value.map((item: any) => item.waybillNo)
    );

    const res = await batchPrintOrderLabel(
      selectedOrders.value.map((item: any) => item.waybillNo)
    );

    ElMessage.success(`已开始批量打印 ${selectedOrders.value.length} 个订单`);

    downloadFile(res.url, "面单打印");
  });
};
// 获取产品列表select数据
const getProductList = async () => {
  const res = await getOrderProductList({
    countryCode: userStore.userInfo?.country || ""
  });
  productList.value = res || [];
};

onMounted(() => {
  getProductList();
  fetchData();
});

watch(
  () => currentStatus.value,
  () => {
    fetchData();
  }
);
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
  height: calc(100vh - 200px);
  overflow: hidden;
}
</style>
