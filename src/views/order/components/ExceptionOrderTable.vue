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
        <template #search>
          <!-- Search Fields -->
          <el-form-item
            :label="$t('gfuc.tracking_number' /** 单号 **/)"
            prop="orderNo"
          >
            <!-- <template #label>
              <el-radio-group v-model="searchForm.searchType">
                <el-radio label="cusOrderNumList">客户单号</el-radio>
                <el-radio label="waybillNoList">运单号</el-radio>
                <el-radio label="referenceNumber">参考号</el-radio>
              </el-radio-group>
            </template> -->
            <el-input
              v-model="searchForm.orderNo"
              :placeholder="
                $t('web.gfuc.please_enter' /** 请输入订单号或运单号 **/)
              "
            />
          </el-form-item>
          <el-form-item label="邮编" prop="consigneeCode">
            <el-input
              v-model="searchForm.consigneeCode"
              :placeholder="$t('web.gfuc.please_enter' /** 请输入邮编 **/)"
            />
          </el-form-item>
          <el-form-item label="客户名称" prop="customerName">
            <el-input
              v-model="searchForm.customerName"
              :placeholder="$t('web.gfuc.please_enter' /** 请输入客户名称 **/)"
            />
          </el-form-item>

          <el-form-item label="异常类型" prop="unusualType">
            <el-select
              v-model="searchForm.unusualType"
              :placeholder="$t('web.gfuc.please_enter' /** 请输入异常类型 **/)"
            >
              <el-option
                v-for="item in unusualTypeOptions.options.value"
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
        </template>

        <template #columns>
          <el-table-column
            v-for="item in exceptionOrderColumns"
            :key="item.prop"
            :prop="item.prop"
            :label="$t(item.label)"
            :width="item?.width || undefined"
            :min-width="item?.minWidth || undefined"
          />

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            width="160"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-button
                  link
                  type="primary"
                  :icon="View"
                  @click="handleView(row)"
                  :title="$t('web.gfuc.view_order' /** 查看订单 **/)"
                />
                <el-button
                  link
                  type="primary"
                  @click="handleReOrder(row)"
                  :title="$t('web.gfuc.re_order' /** 重新下单 **/)"
                />
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
import { View } from "@element-plus/icons-vue";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";
import { getExceptionOrderList } from "@/api/order";
import { spliceArray, commaToArr } from "@/utils/index";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash-es";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

const { t } = useI18n();

import { useUserStore } from "@/store/user";
const userStore = useUserStore();

const router = useRouter();

defineOptions({
  name: "ExceptionOrderTable"
});

const defaultFormData = {
  consigneeCode: "",
  consigneeCodeList: [],
  orderNo: "",
  cusOrderNumList: [],

  customerName: "",
  customerNameSet: [],

  pageNum: 0,
  pageSize: 0,

  orderTimeRange: [],
  queryEndTime: "",
  queryStartTime: "",
  referenceNoList: [],
  unusualType: "",
  userTimeZone: "",
  waybillNoList: []
};

const exceptionOrderColumns = [
  { prop: "customerName", label: "客户名称", minWidth: "120" },
  { prop: "orderSource", label: "订单来源", width: "100" },
  { prop: "waybillNo", label: "系统单号", minWidth: "200" },
  { prop: "cusOrderNo", label: "客户单号", minWidth: "160" },
  { prop: "consigneeCode", label: "收件邮编", width: "110" },
  { prop: "unusualTypeValue", label: "异常类型值", width: "120" },
  {
    prop: "describe",
    label: "描述",
    minWidth: "240",
    showOverflowTooltip: true
  },
  { prop: "unusualField", label: "异常字段", minWidth: "140" },
  {
    prop: "fieldValue",
    label: "异常字段值",
    minWidth: "200",
    showOverflowTooltip: true
  },
  {
    prop: "rule",
    label: "字段校验规则",
    minWidth: "200",
    showOverflowTooltip: true
  },
  { prop: "orderCreateTime", label: "下单时间", width: "200" },
  {
    prop: "requestBody",
    label: "请求参数",
    minWidth: "220",
    showOverflowTooltip: true
  },
  {
    prop: "responseBody",
    label: "响应报文",
    minWidth: "220",
    showOverflowTooltip: true
  },
  { prop: "referenceNo", label: "参考号", minWidth: "150" }
];

const loading = ref(false);

const searchForm = reactive(cloneDeep(defaultFormData));

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

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
const tableData = ref([]);

const unusualTypeOptions = useDict("UnusualOrderType");

const getParams = () => {
  const { orderNo, consigneeCode, orderTimeRange, ...args } = searchForm;
  const params: any = {
    ...args
  };
  // 处理单号
  if (orderNo) {
    params.orderNo = spliceArray(commaToArr(orderNo), 500).join("\n");
    params.orderNumberList = [orderNo];
  } else {
    params.orderNo = "";
    params.orderNumberList = [];
  }
  // 时间参数
  if (orderTimeRange?.length === 2) {
    params.queryStartTime = orderTimeRange[0];
    params.queryEndTime = orderTimeRange[1];
  }
  // 收件地邮编
  if (consigneeCode) {
    params.consigneeCodeList = [consigneeCode];
  }
  // // 寄件地邮编
  // if (shipperCodeList) {
  //   params.shipperCodeList = spliceArray(commaToArr(shipperCodeList), 100);
  // }

  params.orderType = "";

  console.log(params, "查询参数");
  params.customerIdList = userStore.loginInfo?.shipperCustomerList?.map(
    (item: any) => item.customerId
  );
  return params;
};
const getOrderProductListData = async () => {
  const params = getParams();

  const res = await getExceptionOrderList({
    ...params,
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
fetchData();

const handleView = (row: any) => {
  console.log("View", row);

  router.push(`/order/detail/${row.id}/exception`);
};

const handleReOrder = (row: any) => {
  router.push(`/order/single/${row.id}/exception`);
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.el-form-item__label {
  height: 32px;

  .el-radio {
    height: 22px;
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

.order-content {
  flex: 1;
  height: calc(100vh - 200px);
  overflow: hidden;
}
</style>
