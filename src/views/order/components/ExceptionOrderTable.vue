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
      >
        <template #order-number>
          <el-form-item
            :label="$t('gfuc.tracking_number' /** 单号 **/)"
            prop="orderNumber"
            class="order-number-item"
            :span="8"
          >
            <el-input
              v-model="searchForm.orderNumber"
              type="textarea"
              resize="none"
              clearable
              :rows="5"
              :placeholder="
                $t('web.gfuc.please_enter' /** 请输入订单号或运单号 **/)
              "
            />
          </el-form-item>
        </template>
        <template #search>
          <el-form-item
            :label="$t('web.gfuc.postal_code')"
            prop="consigneeCode"
          >
            <el-input
              v-model="searchForm.consigneeCode"
              :placeholder="$t('web.gfuc.please_enter' /** 请输入邮编 **/)"
            />
          </el-form-item>
          <!-- <el-form-item label="客户名称" prop="customerName">
            <el-input
              v-model="searchForm.customerName"
              :placeholder="$t('web.gfuc.please_enter' /** 请输入客户名称 **/)"
            />
          </el-form-item> -->

          <el-form-item :label="$t('web.gfuc.unusual_type')" prop="unusualType">
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
              type="datetimerange"
              :disabled-date="disabledDate"
              range-separator="~"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTime"
              @change="handleChange"
            />
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.customer_name' /** 下单客户 **/)"
            prop="customerName"
            v-if="customerNameList.length > 1"
          >
            <el-select
              v-model="searchForm.customerName"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
            >
              <el-option
                v-for="item in customerNameList"
                :key="item.customerId"
                :label="item.customerName"
                :value="item.customerName"
              />
            </el-select>
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
            show-overflow-tooltip
          />

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            width="160"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-tooltip
                  :content="$t('web.gfuc.view_order')"
                  placement="top"
                >
                  <svg-icon
                    name="order-view"
                    width="24"
                    height="24"
                    @click="handleView(row)"
                  />
                </el-tooltip>
                <el-tooltip :content="$t('web.gfuc.re_order')" placement="top">
                  <svg-icon
                    name="order-copy"
                    width="24"
                    height="24"
                    @click="handleReOrder(row)"
                  />
                </el-tooltip>
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

import { useAppStore } from "@/store/app";
const appStore = useAppStore();

const router = useRouter();

defineOptions({
  name: "ExceptionOrderTable"
});

const customerNameList = computed(() => {
  return userStore.loginInfo?.shipperCustomerList || [];
});

const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0), // 开始时间默认00:00:00
  new Date(2000, 1, 1, 23, 59, 59) // 结束时间默认23:59:59
];

const defaultFormData = {
  consigneeCode: "",
  consigneeCodeList: [],
  orderNumber: "",
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

const exceptionOrderColumns = computed(() => [
  {
    prop: "customerName",
    label: t("web.gfuc.customer_name2"),
    minWidth: "120"
  },
  { prop: "orderSource", label: t("web.gfuc.order_source"), width: "100" },
  {
    prop: "waybillNo",
    label: t("web.gfuc.system_order_no"),
    minWidth: "200"
  },
  {
    prop: "cusOrderNo",
    label: t("web.gfuc.customer_order_no"),
    minWidth: "160"
  },
  {
    prop: "consigneeCode",
    label: t("web.gfuc.consignee_postal_code"),
    width: "110"
  },
  {
    prop: "unusualTypeValue",
    label: t("web.gfuc.unusual_type_value"),
    width: "120"
  },
  {
    prop: "describe",
    label: t("web.gfuc.description"),
    minWidth: "240",
    showOverflowTooltip: true
  },
  { prop: "unusualField", label: t("web.gfuc.unusual_field"), minWidth: "140" },
  {
    prop: "fieldValue",
    label: t("web.gfuc.unusual_field_value"),
    minWidth: "200",
    showOverflowTooltip: true
  },
  {
    prop: "rule",
    label: t("web.gfuc.field_validation_rule"),
    minWidth: "200",
    showOverflowTooltip: true
  },
  { prop: "orderCreateTime", label: t("web.gfuc.order_time"), width: "200" },
  {
    prop: "requestBody",
    label: t("web.gfuc.request_parameters"),
    minWidth: "220",
    showOverflowTooltip: true
  },
  {
    prop: "responseBody",
    label: t("web.gfuc.response_message"),
    minWidth: "220",
    showOverflowTooltip: true
  },
  { prop: "referenceNo", label: t("web.gfuc.reference_no"), minWidth: "150" }
]);

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

  // 设置开始时间为00:00:00，结束时间为23:59:59
  const startDate = dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endDate = dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss");

  searchForm.orderTimeRange = [startDate, endDate];
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
    }
  }
};
const tableData = ref([]);

const unusualTypeOptions = useDict("UnusualOrderType");

const getParams = () => {
  const { orderNumber, consigneeCode, orderTimeRange, ...args } = searchForm;
  const params: any = {
    ...args
  };
  // 处理单号
  if (orderNumber) {
    params.orderNumber = spliceArray(commaToArr(orderNumber), 500).join("\n");
    params.orderNumberList = [orderNumber];
  } else {
    params.orderNumber = "";
    params.orderNumberList = [];
  }
  // 客户名称
  if (searchForm.customerName) {
    params.customerNameSet = [searchForm.customerName];
  } else {
    params.customerName = "";

    params.customerNameSet = [];
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

const handleReset = () => {
  searchForm.orderNumber = "";
  searchForm.orderNumberList = [];
  setDefaultRange();
};

const handleView = (row: any) => {
  router.push(`/order/detail/${row.id}/exception`);
};

const handleReOrder = (row: any) => {
  router.push(`/order/single/${row.id}/exception/reorder`);
};
const lang = computed(() => appStore.lang);
const timezone = computed(() => appStore.timezone);

watch(
  () => lang.value,
  (val) => {
    fetchData();
  }
);
watch(
  () => timezone.value,
  (val) => {
    fetchData();
  }
);
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
