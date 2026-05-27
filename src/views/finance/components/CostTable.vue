<template>
  <div>
    <div class="account-content">
      <TableLayout
        v-model:searchFormModel="searchForm"
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :data="tableData"
        :total="pagination.total"
        :loading="loading"
        :searchConfig="{ cols: 3, rowNum: 1 }"
        @search="fetchData"
        @reset="handleReset"
        @selection-change="handleSelectionChange"
      >
        <template #action-left>
          <el-button @click="handleBatchDownload" :loading="downloadLoading">
            {{ $t("web.gfuc.download_bill" /** 下载账单 **/) }}
          </el-button>
        </template>

        <template #search>
          <!-- Search Fields -->
          <el-form-item
            :label="$t('gfuc.tracking_number' /** 单号 **/)"
            prop="orderNumber"
            :span="8"
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
            :label="$t('web.gfuc.settlement_cycle' /** 结算周期 **/)"
            prop="orderStatusSet"
          >
            <el-select
              v-model="searchForm.orderStatus"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
            >
              <el-option
                v-for="item in [1, 2, 3]"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.account_period' /** 账期 **/)"
            prop="orderTimeRange"
          >
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
          <el-form-item
            :label="$t('web.gfuc.account_number' /** 账单编号 **/)"
            prop="consigneeCodeList"
          >
            <el-input
              v-model="searchForm.consigneeCodeList"
              clearable
              :placeholder="$t('gfuc.please_enter' /** 请输入 **/)"
            />
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.account_status' /** 账单状态 **/)"
            prop="accountStatus"
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
          <el-form-item
            :label="$t('web.gfuc.invoice_status' /** 开票状态 **/)"
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
            show-overflow-tooltip
          >
            <template
              #default="{ row }"
              v-if="item.prop === 'orderConsigneeVO.address1'"
            >
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            width="180"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-tooltip
                  :content="$t('web.gfuc.view_order')"
                  placement="top"
                >
                  <svg-icon
                    name="upload-download"
                    width="24"
                    height="24"
                    @click="handleDownload(row)"
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import { spliceArray, commaToArr, columnWidth } from "@/utils/index";
import { downloadFile } from "@/utils/download";

// import {} from "@/api/finance";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";

import { useUserStore } from "@/store/user";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/app";

const userStore = useUserStore();

const { t } = useI18n();
const appStore = useAppStore();
defineOptions({
  name: "CostTable"
});
const emits = defineEmits(["show-success-dialog"]);

const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0), // 开始时间默认00:00:00
  new Date(2000, 1, 1, 23, 59, 59) // 结束时间默认23:59:59
];
const props = defineProps({
  status: {
    type: Number,
    default: 0
  }
});

const lang = computed(() => appStore.lang);
const timezone = computed(() => appStore.timezone);

// 根据lang动态设置表头宽度

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

const columns = computed(() => [
  {
    prop: "corderNo",
    label: t("web.gfuc.account_number" /** 账单编号 */),
    minWidth: columnWidth(120, 180, 200, 180, 160, 180)
  },
  {
    prop: "settlementCycle",
    label: t("web.gfuc.settlement_cycle" /** 结算周期 */),
    minWidth: columnWidth(120, 200, 220, 240, 180, 200)
  },
  {
    prop: "accountPeriod",
    label: t("web.gfuc.account_period" /** 账期 */),
    minWidth: columnWidth(80, 160, 200, 180, 160, 160)
  },
  {
    prop: "settlementCurrency",
    label: t("web.gfuc.settlement_currency" /** 结算币种 */),
    minWidth: columnWidth(120, 220, 220, 240, 180, 200)
  },
  {
    prop: "orderStatusName",
    label: t("web.gfuc.account_status" /** 账单状态 */),
    width: columnWidth(100, 160, 180, 200, 160, 160)
  },
  {
    prop: "ticketCount",
    label: t("web.gfuc.ticket_count" /** 票数 */),
    minWidth: columnWidth(80, 140, 200, 220, 160, 160)
  },
  {
    prop: "taxRate",
    label: t("web.gfuc.tax_rate_status" /** 税率 */),
    minWidth: columnWidth(80, 100, 160, 180, 160, 120)
  },
  {
    prop: "billAmountIncludingTax",
    label: t("web.gfuc.bill_amount_including_tax" /** 账单金额_含税 */),
    minWidth: columnWidth(150, 240, 240, 240, 240, 220),
    align: "right" // 金额类字段一般右对齐更规范
  },
  {
    prop: "billAmountExcludingTax",
    label: t("web.gfuc.bill_amount_excluding_tax" /** 账单金额_未税 */),
    minWidth: columnWidth(150, 240, 240, 260, 260, 220),
    align: "right"
  },
  {
    prop: "billAmountTax",
    label: t("web.gfuc.bill_amount_tax" /** 账单金额_税额 */),
    minWidth: columnWidth(150, 240, 240, 220, 220, 180),
    align: "right"
  },
  {
    prop: "billDetailExcludingTax",
    label: t("web.gfuc.bill_detail_excluding_tax" /** 账单明细_未税 */),
    minWidth: columnWidth(160, 240, 240, 280, 260, 240)
  },
  {
    prop: "adjustmentTotalExcludingTax",
    label: t("web.gfuc.adjustment_total_excluding_tax" /** 调账总额_未税 */),
    minWidth: columnWidth(160, 280, 260, 300, 300, 280),
    align: "right"
  },
  {
    prop: "adjustmentDetailExcludingTax",
    label: t("web.gfuc.adjustment_detail_excluding_tax" /** 调账明细_未税 */),
    minWidth: columnWidth(160, 300, 280, 320, 320, 280)
  },
  {
    prop: "adjustmentBillNo",
    label: t("web.gfuc.claim_bill_no" /** 理赔账单编号 */),
    minWidth: columnWidth(160, 180, 360, 220, 200, 200)
  },
  {
    prop: "adjustmentBillAmountExcludingTax",
    label: t("web.gfuc.claim_bill_amount_ex_tax" /** 理赔账单金额_未税 */),
    minWidth: columnWidth(180, 280, 360, 320, 320, 300),
    align: "right"
  },
  {
    prop: "adjustmentBillAmountIncludingTax",
    label: t("web.gfuc.claim_bill_amount_in_tax" /** 理赔账单金额_含税 */),
    minWidth: columnWidth(180, 280, 360, 320, 320, 300),
    align: "right"
  },
  {
    prop: "adjustmentStatus",
    label: t("web.gfuc.invoice_status" /** 开票状态 */),
    minWidth: columnWidth(100, 160, 200, 180, 160, 160)
  }
]);

// 批量打印的loading
const downloadLoading = ref(false);
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
  customerName: "",
  customerId: "",
  consigneePhone: "",
  transferRequired: undefined,
  deliveryStationIdList: [],
  orderTimeRange: ["", ""]
};

const searchForm = reactive({ ...initialFormState });

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

  console.log(params.orderStatusSet, "++++====");

  if (searchForm.customerId) {
    params.customerIdList = [searchForm.customerId];
  } else {
    params.customerIdList = userStore.loginInfo?.shipperCustomerList?.map(
      (item: any) => item.customerId
    );
  }
  return params;
};

const handleResetForm = () => {
  searchForm.orderNumber = "";
  // Object.assign(searchForm, initialFormState);
  // setDefaultRange();
};

const fetchData = () => {
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleDownload = (row: any) => {
  emits("show-success-dialog", true);
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

// 批量下载
const handleBatchDownload = () => {
  emits("show-success-dialog", true);
  return;
  // 获取选中的订单
  if (selectedOrders.value.length === 0) {
    ElMessage.warning(t("web.gfuc.select_bill_first"));
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
      downloadLoading.value = true;
      ElMessage.info(t("web.gfuc.printing_order"));
      let data = [];
      data = selectedOrders.value.map((item: any) => {
        return {
          waybillNo: item.waybillNo,
          customerId: item.customerId
        };
      });

      const res = await batchPrintOrderLabel(data);

      downloadLoading.value = false;

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

      downloadFile(url, t("web.gfuc.order_file"));
    })
    .catch(() => {
      downloadLoading.value = false;
    });
};

onMounted(() => {
  fetchData();
});
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

.account-content {
  flex: 1;
  height: calc(100vh - 200px);
  overflow: hidden;
}
</style>
