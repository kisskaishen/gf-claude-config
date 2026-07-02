<template>
  <PageContainer>
    <div class="order-container">
      <!-- 正常订单表格 (orderStatus !== 999) -->
      <div class="order-content" v-if="searchForm.orderStatus !== 999">
        <TableLayout
          :searchFormModel="searchForm"
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :data="tableData"
          :total="pagination.total"
          :loading="loading"
          :searchConfig="{ cols: 4, rowNum: 1, operationCols: 2 }"
          @update:searchFormModel="(val) => Object.assign(searchForm, val)"
          @search="fetchData"
          @reset="handleReset"
          @selection-change="handleSelectionChange"
        >
          <template #action-status>
            <div class="flex gap-2">
              <CommonTag
                v-for="item in exceptionOrderStatusOptions"
                :key="item.value"
                :bg-color="item.bgColor"
                :text-color="item.textColor"
                :count="item.label"
                :active="searchForm.orderStatus === item.value"
                @click="searchForm.orderStatus = item.value"
              />
            </div>
          </template>
          <template #action-left>
            <el-button plain @click="handleBatchPrint" :loading="printLoading">
              <el-icon class="mr-1.5"><Printer /></el-icon>
              {{ $t("web.gfuc.batch_print" /** 批量打印 **/) }}
            </el-button>
          </template>

          <template #search>
            <!-- Search Fields -->
            <el-form-item prop="orderNumber">
              <el-input
                v-model="searchForm.orderNumber"
                clearable
                :placeholder="
                  $t('gfuc.please_enter' /** 请输入 **/) +
                  $t('gfuc.tracking_number' /** 单号 **/)
                "
              />
            </el-form-item>
            <el-form-item prop="orderTimeRange">
              <el-date-picker
                v-model="searchForm.orderTimeRange"
                type="datetimerange"
                :disabled-date="disabledDate"
                range-separator="~"
                :start-placeholder="$t('web.gfuc.start_time')"
                :end-placeholder="$t('web.gfuc.end_time')"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                @change="handleChange"
              />
            </el-form-item>
            <el-form-item prop="consigneeCodeList">
              <el-input
                v-model="searchForm.consigneeCodeList"
                clearable
                :placeholder="
                  $t('gfuc.please_enter' /** 请输入 **/) +
                  $t('gfuc.recipient_postal_code' /** 收件人邮编 **/)
                "
              />
            </el-form-item>
            <el-form-item prop="shipperCodeList">
              <el-input
                v-model="searchForm.consigneePhone"
                clearable
                :placeholder="
                  $t('gfuc.please_enter' /** 请输入 **/) +
                  $t('gfuc.recipient_phone' /** 收件人电话 **/)
                "
              />
            </el-form-item>
            <el-form-item prop="productCodeList">
              <el-select
                v-model="searchForm.productCodeList"
                :placeholder="
                  $t('gfuc.please_select' /** 请选择 **/) +
                  $t('gfuc.product' /** 产品 **/)
                "
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
            <el-form-item prop="customerId" v-if="customerNameList.length > 1">
              <el-select
                v-model="searchForm.customerId"
                :placeholder="
                  $t('gfuc.please_select' /** 请选择 **/) +
                  $t('web.gfuc.customer_name' /** 下单客户 **/)
                "
                clearable
                filterable
              >
                <el-option
                  v-for="item in customerNameList"
                  :key="item.customerId"
                  :label="item.customerName"
                  :value="item.customerId"
                />
              </el-select>
            </el-form-item>
          </template>

          <template #columns>
            <el-table-column
              type="selection"
              :width="columnWidth(55, 55, 55, 55, 55, 55)"
            />
            <el-table-column
              v-for="item in columns"
              :key="item.prop"
              :prop="item.prop"
              :label="$t(item.label)"
              :width="item.width || undefined"
              :min-width="item.minWidth || undefined"
              :show-overflow-tooltip="item.type !== 'text-wrap'"
            >
              <template #default="{ row }">
                <template v-if="item.prop === 'orderStatusName'">
                  <!-- 6、7、8 按异常类型888展示 -->
                  <CommonTag
                    v-if="[6, 7, 8].includes(row.orderStatus)"
                    :bg-color="statusColorMap[888].bgColor"
                    :text-color="statusColorMap[888].textColor"
                    :count="
                      orderStatusDict.options.value.find(
                        (o) => o.value === row.orderStatus
                      )?.label || row.orderStatusName
                    "
                  />
                  <template
                    v-for="item in exceptionOrderStatusOptions"
                    :key="item.value"
                  >
                    <CommonTag
                      v-if="row.orderStatus === item.value"
                      :bg-color="item.bgColor"
                      :text-color="item.textColor"
                      :count="item.label"
                      :active="row.orderStatus === item.value"
                    ></CommonTag>
                  </template>
                </template>
                <template v-else-if="item.prop === 'orderConsigneeVO.address1'">
                  <el-tooltip
                    :content="getAddress(row.orderConsigneeVO)"
                    placement="top"
                    effect="dark"
                    hide-after="200"
                  >
                    <span class="text-wrap-cell">{{
                      getAddress(row.orderConsigneeVO)
                    }}</span>
                  </el-tooltip>
                </template>
              </template>
            </el-table-column>

            <el-table-column
              :label="$t('gfuc.operation' /** 操作 **/)"
              :width="columnWidth(180, 180, 180, 180, 180, 180)"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="table-actions">
                  <!-- 查看 (所有状态都有) -->
                  <el-tooltip
                    :content="$t('web.gfuc.view_order')"
                    placement="top"
                  >
                    <el-button class="action-btn" @click="handleView(row)">
                      <svg-icon name="order-view" width="16" height="16" />
                    </el-button>
                  </el-tooltip>

                  <!-- 已下单: 打印、编辑、取消 -->
                  <template v-if="row.orderStatus === 1">
                    <el-tooltip
                      :content="$t('web.gfuc.print_order')"
                      placement="top"
                    >
                      <el-button class="action-btn" @click="handlePrint(row)">
                        <svg-icon name="order-printer" width="16" height="16" />
                      </el-button>
                    </el-tooltip>
                    <el-tooltip
                      :content="$t('web.gfuc.edit_order')"
                      placement="top"
                      v-if="row.orderUpdateFlag"
                    >
                      <el-button class="action-btn" @click="handleEdit(row)">
                        <svg-icon
                          name="order-list-edit"
                          width="16"
                          height="16"
                        />
                      </el-button>
                    </el-tooltip>
                    <el-tooltip
                      :content="$t('web.gfuc.cancel_order')"
                      placement="top"
                    >
                      <el-button class="action-btn" @click="handleCancel(row)">
                        <svg-icon name="order-delete" width="16" height="16" />
                      </el-button>
                    </el-tooltip>
                  </template>

                  <!-- 取消: 复制订单 -->
                  <template v-if="row.orderStatus === 2">
                    <el-tooltip
                      :content="$t('web.gfuc.copy_order')"
                      placement="top"
                    >
                      <el-button class="action-btn" @click="handleCopy(row)">
                        <svg-icon name="order-copy" width="16" height="16" />
                      </el-button>
                    </el-tooltip>
                  </template>
                </div>
              </template>
            </el-table-column>
          </template>
        </TableLayout>
      </div>

      <!-- 异常订单表格 (orderStatus === 999) -->
      <div class="order-content order-content--exception" v-else>
        <TableLayout
          :searchFormModel="exceptionSearchForm"
          v-model:currentPage="exceptionPagination.currentPage"
          v-model:pageSize="exceptionPagination.pageSize"
          :data="exceptionTableData"
          :total="exceptionPagination.total"
          :loading="exceptionLoading"
          :searchConfig="{ cols: 4, rowNum: 1 }"
          @update:searchFormModel="
            (val) => Object.assign(exceptionSearchForm, val)
          "
          @search="fetchExceptionData"
          @reset="handleExceptionReset"
        >
          <template #action-status>
            <div class="flex gap-2">
              <CommonTag
                v-for="item in exceptionOrderStatusOptions"
                :key="item.value"
                :bg-color="item.bgColor"
                :text-color="item.textColor"
                :count="item.label"
                :active="searchForm.orderStatus === item.value"
                @click="searchForm.orderStatus = item.value"
              />
            </div>
          </template>
          <template #search>
            <el-form-item prop="orderNumber">
              <el-input
                v-model="exceptionSearchForm.orderNumber"
                clearable
                :placeholder="
                  $t('gfuc.tracking_number' /** 请输入订单号或运单号 **/)
                "
              />
            </el-form-item>
            <el-form-item prop="consigneeCode">
              <el-input
                v-model="exceptionSearchForm.consigneeCode"
                :placeholder="$t('web.gfuc.postal_code' /** 请输入邮编 **/)"
              />
            </el-form-item>
            <el-form-item prop="unusualType">
              <el-select
                v-model="exceptionSearchForm.unusualType"
                :placeholder="
                  $t('web.gfuc.unusual_type' /** 请选择异常类型 **/)
                "
              >
                <el-option
                  v-for="item in unusualTypeOptions.options.value"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item prop="orderTime">
              <el-date-picker
                v-model="exceptionSearchForm.orderTimeRange"
                type="datetimerange"
                :disabled-date="exceptionDisabledDate"
                range-separator="~"
                :start-placeholder="$t('web.gfuc.start_time' /** 开始时间 **/)"
                :end-placeholder="$t('web.gfuc.end_time' /** 结束时间 **/)"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                @change="handleExceptionChange"
              />
            </el-form-item>
            <el-form-item
              prop="customerName"
              v-if="exceptionCustomerNameList.length > 1"
            >
              <el-select
                v-model="exceptionSearchForm.customerName"
                :placeholder="
                  $t('web.gfuc.customer_name' /** 请选择客户名称 **/)
                "
                clearable
                filterable
              >
                <el-option
                  v-for="item in exceptionCustomerNameList"
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
              :label="item.label"
              :width="item?.width || undefined"
              :min-width="item?.minWidth || undefined"
              show-overflow-tooltip
            />
            <el-table-column
              :label="$t('gfuc.operation' /** 操作 **/)"
              :width="columnWidth(120, 120, 120, 120, 120, 180)"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="table-actions">
                  <el-tooltip
                    :content="$t('web.gfuc.view_order')"
                    placement="top"
                  >
                    <el-button
                      class="action-btn"
                      @click="handleExceptionView(row)"
                    >
                      <svg-icon name="order-view" width="16" height="16" />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip
                    :content="$t('web.gfuc.re_order')"
                    placement="top"
                  >
                    <el-button
                      class="action-btn"
                      @click="handleExceptionReOrder(row)"
                    >
                      <svg-icon name="order-copy" width="16" height="16" />
                    </el-button>
                  </el-tooltip>
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import { spliceArray, commaToArr, columnWidth } from "@/utils/index";

import { Printer } from "@element-plus/icons-vue";
import {
  getOrderList,
  getOrderLabelUrl,
  batchPrintOrderLabel,
  getOrderProductList,
  cancelOrder,
  getExceptionOrderList
} from "@/api/order";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";
import PageContainer from "@/components/PageContainer/index.vue";
import { useUserStore } from "@/store/user";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/app";
import { cloneDeep } from "lodash-es";

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();
const appStore = useAppStore();

defineOptions({
  name: "OrderList"
});

const defaultTime: [Date, Date] = [
  new Date(2000, 1, 1, 0, 0, 0), // 开始时间默认00:00:00
  new Date(2000, 1, 1, 23, 59, 59) // 结束时间默认23:59:59
];

const lang = computed(() => appStore.lang);
const timezone = computed(() => appStore.timezone);

watch(
  () => lang.value,
  () => {
    getProductList();
    if (searchForm.orderStatus === 999) {
      fetchExceptionData();
    } else {
      fetchData();
    }
  }
);
watch(
  () => timezone.value,
  () => {
    if (searchForm.orderStatus === 999) {
      fetchExceptionData();
    } else {
      fetchData();
    }
  }
);

// ===== 异常订单状态 =====
const exceptionInitialState = {
  consigneeCode: "",
  consigneeCodeList: [] as string[],
  orderNumber: "",
  cusOrderNumList: [] as string[],
  orderNumberList: [] as string[],
  customerName: "",
  customerNameSet: [] as string[],
  pageNum: 0,
  pageSize: 0,
  orderTimeRange: ["", ""] as any,
  queryEndTime: "",
  queryStartTime: "",
  referenceNoList: [] as string[],
  unusualType: "",
  userTimeZone: "",
  waybillNoList: [] as string[]
};

const exceptionSearchForm: Record<string, any> = reactive(
  cloneDeep(exceptionInitialState)
);

const exceptionPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const exceptionTableData = ref<any[]>([]);
const exceptionLoading = ref(false);

const exceptionCustomerNameList = computed(() => {
  return userStore.loginInfo?.shipperCustomerList || [];
});

const exceptionOrderColumns = computed(() => [
  {
    prop: "customerName",
    label: t("web.gfuc.customer_name2"),
    minWidth: columnWidth(120, 180, 200, 200, 180, 180)
  },
  {
    prop: "orderSource",
    label: t("web.gfuc.order_source"),
    width: columnWidth(100, 160, 180, 180, 160, 160)
  },
  {
    prop: "waybillNo",
    label: t("web.gfuc.system_order_no"),
    minWidth: columnWidth(160, 200, 240, 200, 200, 200)
  },
  {
    prop: "cusOrderNo",
    label: t("web.gfuc.customer_order_no"),
    minWidth: columnWidth(140, 200, 260, 220, 200, 200)
  },
  {
    prop: "consigneeCode",
    label: t("web.gfuc.consignee_postal_code"),
    width: columnWidth(100, 200, 240, 240, 240, 140)
  },
  {
    prop: "unusualTypeValue",
    label: t("web.gfuc.unusual_type_value"),
    width: columnWidth(120, 200, 200, 200, 180, 180)
  },
  {
    prop: "describe",
    label: t("web.gfuc.description"),
    minWidth: columnWidth(200, 240, 260, 260, 240, 240),
    showOverflowTooltip: true
  },
  {
    prop: "unusualField",
    label: t("web.gfuc.unusual_field"),
    minWidth: columnWidth(140, 200, 220, 220, 200, 200)
  },
  {
    prop: "fieldValue",
    label: t("web.gfuc.unusual_field_value"),
    minWidth: columnWidth(200, 200, 200, 200, 200, 200),
    showOverflowTooltip: true
  },
  {
    prop: "rule",
    label: t("web.gfuc.field_validation_rule"),
    minWidth: columnWidth(200, 240, 260, 260, 240, 240),
    showOverflowTooltip: true
  },
  {
    prop: "orderCreateTime",
    label: t("web.gfuc.order_time"),
    width: columnWidth(200, 180, 200, 200, 180, 180)
  },
  {
    prop: "requestBody",
    label: t("web.gfuc.request_parameters"),
    minWidth: columnWidth(200, 220, 240, 240, 220, 220),
    showOverflowTooltip: true
  },
  {
    prop: "responseBody",
    label: t("web.gfuc.response_message"),
    minWidth: columnWidth(200, 220, 240, 240, 220, 220),
    showOverflowTooltip: true
  },
  {
    prop: "referenceNo",
    label: t("web.gfuc.reference_no"),
    minWidth: columnWidth(140, 180, 200, 200, 180, 180)
  }
]);

// 异常订单禁用日期逻辑
const exceptionDisabledDate = (time: Date) => {
  if (
    !exceptionSearchForm.orderTimeRange ||
    !exceptionSearchForm.orderTimeRange[0]
  ) {
    return time.getTime() > Date.now();
  }
  const startTime = new Date(exceptionSearchForm.orderTimeRange[0]).getTime();
  const minTime = startTime - 30 * 24 * 3600 * 1000;
  const maxTime = startTime + 30 * 24 * 3600 * 1000;
  return (
    time.getTime() < minTime ||
    time.getTime() > maxTime ||
    time.getTime() > Date.now()
  );
};

// 异常订单设置默认范围
const setExceptionDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 30 * 24 * 3600 * 1000);
  const startDate = dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endDate = dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss");
  exceptionSearchForm.orderTimeRange = [startDate, endDate];
};

setExceptionDefaultRange();

// 异常订单日期变化
const handleExceptionChange = (value: any) => {
  if (value && value[0] && value[1]) {
    const start = dayjs(value[0]);
    const end = dayjs(value[1]);
    const diffDays = end.diff(start, "day");
    if (diffDays > 30) {
      const newEnd = start.add(30, "day").toDate();
      exceptionSearchForm.orderTimeRange = [value[0], newEnd];
    }
  }
};

// 异常订单获取参数
const getExceptionParams = () => {
  const { orderNumber, consigneeCode, orderTimeRange, ...args } =
    exceptionSearchForm;
  const params: any = { ...args };
  if (orderNumber) {
    params.orderNumber = spliceArray(commaToArr(orderNumber), 500).join("\n");
    params.orderNumberList = [orderNumber];
  } else {
    params.orderNumber = "";
    params.orderNumberList = [];
  }
  if (exceptionSearchForm.customerName) {
    params.customerNameSet = [exceptionSearchForm.customerName];
  } else {
    params.customerName = "";
    params.customerNameSet = [];
  }
  if (orderTimeRange?.length === 2) {
    params.queryStartTime = orderTimeRange[0];
    params.queryEndTime = orderTimeRange[1];
  }
  if (consigneeCode) {
    params.consigneeCodeList = [consigneeCode];
  }
  params.orderType = "";
  params.customerIdList = userStore.loginInfo?.shipperCustomerList?.map(
    (item: any) => item.customerId
  );
  return params;
};

// 异常订单获取数据
const getExceptionOrderListData = async () => {
  const params = getExceptionParams();
  const res = await getExceptionOrderList({
    ...params,
    pageNum: exceptionPagination.currentPage,
    pageSize: exceptionPagination.pageSize
  });
  exceptionTableData.value = res.records || [];
  exceptionPagination.total = res.total || 0;
};

// 异常订单查询
const fetchExceptionData = () => {
  exceptionLoading.value = true;
  getExceptionOrderListData();
  setTimeout(() => {
    exceptionLoading.value = false;
  }, 500);
};

// 异常订单重置
const handleExceptionReset = () => {
  setExceptionDefaultRange();
};

// 异常订单查看
const handleExceptionView = (row: any) => {
  router.push(`/order/detail/${row.id}/exception`);
};

// 异常订单重新下单
const handleExceptionReOrder = (row: any) => {
  router.push(`/order/single/${row.id}/exception/reorder`);
};
// ===== 异常订单状态结束 =====
const unusualTypeOptions = useDict("UnusualOrderType");

// 异常订单状态颜色映射
const statusColorMap: Record<number, { bgColor: string; textColor: string }> = {
  0: { bgColor: "#FEF3EB", textColor: "#FC4C02" },
  1: { bgColor: "#DFEDFF", textColor: "#237BEB" },
  2: { bgColor: "#F0F0F0", textColor: "#999" },
  3: { bgColor: "#FFF4E1", textColor: "#F59E0B" },
  4: { bgColor: "#FFF4E1", textColor: "#F59E0B" },
  5: { bgColor: "#E7F5F0", textColor: "#02B578" },
  888: { bgColor: "#FFE1E4", textColor: "#FF0014" },
  999: { bgColor: "#FFE1E4", textColor: "#FF0014" }
};

const orderStatusDict = useDict("order_status");

// 异常订单状态
const currentStatus = ref(0);
const exceptionOrderStatusOptions = computed(() => {
  let arr: any[] = [];
  if (currentStatus.value === 0) {
    arr = orderStatusDict.options.value.filter(
      (item: any) => ![6, 7, 8].includes(item.value)
    );
  } else if (currentStatus.value === 888) {
    arr = orderStatusDict.options.value.filter((item: any) =>
      [6, 7, 8].includes(item.value)
    );
  }
  return arr.map((item: any) => ({
    ...item,
    bgColor: statusColorMap[item.value]?.bgColor || "#f5f5f5",
    textColor: statusColorMap[item.value]?.textColor || "#333"
  }));
});

const columns = computed(() => [
  {
    prop: "corderNo",
    label: "gfuc.customer_order_number",
    minWidth: columnWidth(200, 220, 260, 220, 200, 200)
  },
  {
    prop: "waybillNo",
    label: "gfuc.waybill_number",
    minWidth: columnWidth(200, 200, 200, 200, 180, 200)
  },
  {
    prop: "productName",
    label: "gfuc.product_name",
    minWidth: columnWidth(120, 180, 200, 200, 180, 180)
  },
  {
    prop: "orderStatusName",
    label: "gfuc.order_status",
    width: columnWidth(120, 160, 220, 200, 160, 160)
  },
  {
    prop: "orderConsigneeVO.consigneeName",
    label: "gfuc.recipient",
    minWidth: columnWidth(100, 160, 180, 180, 160, 160)
  },
  {
    prop: "orderConsigneeVO.consigneePhone",
    label: "gfuc.recipient_phone",
    minWidth: columnWidth(120, 240, 320, 320, 320, 160)
  },
  {
    prop: "orderConsigneeVO.address1",
    label: "gfuc.recipient_address",
    type: "text-wrap",
    minWidth: columnWidth(200, 200, 240, 240, 240, 200)
  },
  {
    prop: "orderCreateTime",
    label: "gfuc.submission_time",
    width: columnWidth(200, 200, 200, 200, 200, 180)
  }
]);

// 批量打印的loading
const printLoading = ref(false);
const loading = ref(false);

// 初始表单状态
const initialFormState = {
  orderNumber: "",
  orderStatus: 0,
  orderStatusSet: [],
  orderSource: undefined,
  consigneeCodeList: "",
  shipperCodeList: "",
  productCodeList: [],
  customerName: "",
  customerId: "",
  consigneePhone: "",
  transferRequired: undefined,
  deliveryStationIdList: [],
  orderTimeRange: ["", ""]
};

const customerNameList = computed(() => {
  return userStore.loginInfo?.shipperCustomerList || [];
});

const searchForm = reactive({ ...initialFormState });

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const tableData = ref<any[]>([]);

const productList = ref([]);

// 禁用日期逻辑
const disabledDate = (time: Date) => {
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
const setDefaultRange = (defaultDays: number = 30) => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - defaultDays * 24 * 3600 * 1000);

  // 设置开始时间为00:00:00，结束时间为23:59:59
  const startDate = dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const endDate = dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss");

  searchForm.orderTimeRange = [startDate, endDate];
};

setDefaultRange();

// 处理日期变化
const handleChange = (value: any) => {
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

// 处理订单状态集合
const handleOrderStatusSet = (status?: number) => {
  if (currentStatus.value === 888) {
    return searchForm.orderStatus ? [searchForm.orderStatus] : [6, 7, 8];
  } else {
    if (status === 0 || !status) {
      return [];
    } else if (status === 888) {
      return [6, 7, 8];
    } else {
      return [status];
    }
  }
};
const getParams = () => {
  const {
    orderNumber,
    shipperCodeList,
    consigneeCodeList,
    orderTimeRange,
    orderStatus,
    ...args
  } = searchForm;
  const params: any = {
    ...args
  };
  // 处理单号（支持多单查询：空格/逗号分隔）
  if (orderNumber) {
    params.orderNumber = orderNumber
      .split(/[\s,]+/)
      .filter(Boolean)
      .join("\n");
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
  params.orderStatusSet = handleOrderStatusSet(
    orderStatus || currentStatus.value
  );

  if (searchForm.customerId) {
    params.customerIdList = [searchForm.customerId];
  } else {
    params.customerIdList = userStore.loginInfo?.shipperCustomerList?.map(
      (item: any) => item.customerId
    );
  }
  return params;
};

const getAddress = (obj: any) => {
  if (obj?.consigneeCountry === "FR") {
    return [
      obj?.consigneeNumExt,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else if (obj?.consigneeCountry === "IT") {
    return [
      obj?.address1,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.address2,
      obj?.address3,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else if (obj?.consigneeCountry === "NL") {
    return [
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else {
    return [
      obj?.consigneeCountry,
      obj?.consigneeCode,
      obj?.consigneeState,
      obj?.consigneeCity,
      obj?.consigneeArea,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn
    ]
      .filter(Boolean)
      .join(" ");
  }
};

const handleResetForm = () => {
  setDefaultRange();
  if (sessionStorage.getItem("trackingNo")) {
    sessionStorage.removeItem("trackingNo");
  }
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
  tableData.value = res.records.map((item: any) => ({
    ...item,
    orderUpdateFlag:
      userStore.loginInfo.shipperCustomerList.find(
        (v: any) => v.customerId === item.customerId
      )?.orderUpdateFlag === 1
        ? true
        : false
  }));
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
  router.push(`/order/detail/${row.orderId}/order`);
};

const handlePrint = (row: any) => {
  // 打印订单 — 新标签页预览
  getOrderLabelUrl({
    waybillNo: row.waybillNo,
    customerId: row.customerId
  }).then((res) => {
    window.open(res.url, "_blank");
  });
};

const handleEdit = (row: any) => {
  router.push(`/order/single/${row.orderId}/order`);
};

const handleCancel = (row: any) => {
  // 这里可以调用取消订单的接口，成功后刷新列表
  ElMessageBox.confirm(t("web.gfuc.order_cancel_confirm"), t("web.gfuc.tip"), {
    confirmButtonText: t("web.gfuc.confirm"),
    cancelButtonText: t("web.gfuc.cancel")
  }).then(async () => {
    await cancelOrder({
      orderId: row.orderId,
      orderNo: row.orderNo,
      waybillNo: row.waybillNo
    });
    ElMessage.success(t("web.gfuc.order_cancel_success"));
    await fetchData();
  });
};

const handleCopy = (row: any) => {
  router.push(`/order/single/${row.orderId}/order/copy`);
};

const selectedOrders = ref([]);

const handleSelectionChange = (val: any) => {
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
    ElMessage.warning(t("web.gfuc.select_orders_first"));
    return;
  }

  ElMessageBox.confirm(
    t("web.gfuc.batch_print_confirm", { count: selectedOrders.value.length }),
    t("web.gfuc.tip"),
    {
      confirmButtonText: t("web.gfuc.confirm"),
      cancelButtonText: t("web.gfuc.cancel")
    }
  )
    .then(async () => {
      printLoading.value = true;
      ElMessage.info(t("web.gfuc.printing_order"));
      let data = [];
      data = selectedOrders.value.map((item: any) => {
        return {
          waybillNo: item.waybillNo,
          customerId: item.customerId
        };
      });

      const res = await batchPrintOrderLabel(data);

      printLoading.value = false;

      ElMessage.success(
        t("web.gfuc.batch_print_success", {
          count: selectedOrders.value.length
        })
      );
      let url = "";
      if (Array.isArray(res)) {
        url = res[0].url;
      } else {
        url = res.url;
      }

      window.open(url, "_blank");
    })
    .catch(() => {
      printLoading.value = false;
    });
};
// 获取产品列表select数据
const getProductList = async () => {
  const res = await getOrderProductList({
    countryCode: userStore.userInfo?.country || ""
  });
  productList.value = res || [];
};

const formatTypeParam = () => {
  const homeOrderType = sessionStorage.getItem("homeOrderType");
  if (homeOrderType) {
    searchForm.orderStatus = Number(homeOrderType);

    // 根据 orderStatus 设置下单时间
    if (searchForm.orderStatus === 4) {
      // orderStatus 为 4，下单时间默认为最近7天
      setDefaultRange(7);
    }
  } else {
    searchForm.orderStatus = 0;
  }
};

watch(
  () => searchForm.orderStatus,
  (val) => {
    if (val === 999) {
      if (!exceptionSearchForm.orderTimeRange?.[0]) {
        setExceptionDefaultRange();
      }
      fetchExceptionData();
    } else {
      fetchData();
    }
  }
);

onMounted(() => {
  // 初始化时获取产品列表
  getProductList();
  setExceptionDefaultRange();
  // formatTypeParam 会设置 searchForm.orderStatus，由 watch 自动触发 fetchData / fetchExceptionData
  formatTypeParam();
});

onActivated(() => {
  // formatTypeParam 会设置 searchForm.orderStatus，由 watch 自动触发 fetchData / fetchExceptionData
  // 如果 formatTypeParam 未改变 orderStatus（与当前值相同），则需要手动触发
  const prevStatus = searchForm.orderStatus;
  formatTypeParam();
  if (searchForm.orderStatus === prevStatus) {
    // watch 未触发，手动拉取数据
    if (searchForm.orderStatus === 999) {
      fetchExceptionData();
    } else {
      fetchData();
    }
  }
});
</script>

<style lang="scss" scoped>
.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;

  .el-button {
    padding: 0;
    font-size: 18px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 8px;
    margin: 0;
    color: #999;
    cursor: pointer;
    background: transparent;
    border: 1px solid #ebebeb;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }
}

.order-content {
  flex: 1;
  height: calc(100vh - 148px);
  overflow: hidden;
}

.order-content--exception {
  height: calc(100vh - 200px);

  :deep(.el-form-item__label) {
    height: 32px;

    .el-radio {
      height: 22px;
    }
  }
}

.order-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.text-wrap-cell {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  line-height: 1.4;
  overflow-wrap: break-word;
  -webkit-box-orient: vertical;
}
</style>
