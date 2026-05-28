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
          <el-button @click="handleBatchExport" :loading="exportLoading">
            <svg-icon name="export" width="16" height="16" class="mr-2" />
            {{ $t("web.gfuc.export" /** 导出 **/) }}
          </el-button>
          <el-button @click="handleBatchDownload" :loading="downloadLoading">
            {{ $t("web.gfuc.download_bill" /** 下载账单 **/) }}
          </el-button>
        </template>

        <template #search>
          <!-- Search Fields -->
          <el-form-item
            :label="$t('gfuc.tracking_number' /** 单号 **/)"
            prop="waybillNo"
            :span="8"
          >
            <el-input
              v-model="searchForm.waybillNo"
              clearable
              :placeholder="
                $t('web.gfuc.please_enter' /** 请输入订单号或运单号 **/)
              "
            />
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.settlement_cycle' /** 结算周期 **/)"
            prop="cycle"
          >
            <el-select
              v-model="searchForm.cycle"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              @change="handleCycleChange"
            >
              <el-option
                v-for="item in cycleTypeListDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.account_period' /** 账期 **/)"
            prop="dateValue"
          >
            <!-- 半月结 -->
            <template v-if="searchForm.cycle == 1">
              <div class="flex items-center w-full gap-2">
                <el-date-picker
                  v-model="searchForm.dateValue"
                  type="week"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                  class="flex-2"
                  @change="halfMonthChange"
                />
                <el-select
                  v-model="searchForm.halfMonth"
                  :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                  clearable
                  class="flex-1"
                >
                  <el-option
                    v-for="item in halfMonthList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
            <!-- 月结 -->
            <template v-if="searchForm.cycle == 2 || searchForm.cycle == 5">
              <el-date-picker
                v-model="searchForm.dateValue"
                type="month"
                value-format="YYYY-MM"
                format="YYYY-MM"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                style="width: 100%"
                @change="monthChange"
              />
            </template>
            <!-- 周结/双周结 -->
            <template v-if="searchForm.cycle == 3 || searchForm.cycle == 4">
              <el-date-picker
                v-model="searchForm.dateValue"
                type="week"
                format="YYYY[w]ww"
                value-format="YYYY-MM-ww"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                style="width: 100%"
                @change="weekChange"
              />
            </template>
            <template v-if="searchForm.cycle == undefined">
              <el-date-picker
                v-model="searchForm.dateValue"
                type="week"
                format="YYYY[w]ww"
                value-format="YYYY-MM-ww"
                :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
                style="width: 100%"
                disabled
              />
            </template>
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.account_number' /** 账单编号 **/)"
            prop="number"
          >
            <el-input
              v-model="searchForm.number"
              clearable
              :placeholder="$t('gfuc.please_enter' /** 请输入 **/)"
            />
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.account_status' /** 账单状态 **/)"
            prop="billStatusList"
          >
            <el-select
              v-model="searchForm.billStatusList"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in billStatusListDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.invoice_status' /** 开票状态 **/)"
            prop="invoiceStatusList"
          >
            <el-select
              v-model="searchForm.invoiceStatusList"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in invoiceStatusListDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.customer_name' /** 下单客户 **/)"
            prop="customerIdList"
            v-if="customerNameList.length > 1"
          >
            <el-select
              v-model="searchForm.customerIdList"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              filterable
              multiple
              collapse-tags
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
import {
  getClaimBill,
  downloadClaimBill,
  exportClaimBill
} from "@/api/finance";

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

const cycleTypeListDict = useDict("fms_receivable_cycle_type");
const billStatusListDict = useDict("lcs.finance.bill.status");
const invoiceStatusListDict = useDict("fms.receivable.invoice.status.type");

const halfMonthList = [
  {
    value: 1,
    label: t("web.gfuc.half_month1" /** 上半月 */)
  },
  {
    value: 2,
    label: t("web.gfuc.half_month2" /** 下半月 */)
  }
];

const customerNameList = computed(() => {
  return userStore.loginInfo?.shipperCustomerList || [];
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
    label: t("web.gfuc.adjustment_total_excluding_tax" /** 调总账_未税 */),
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
    prop: "adjustmentStatus",
    label: t("web.gfuc.invoice_status" /** 开票状态 */),
    minWidth: columnWidth(100, 160, 200, 180, 160, 160)
  }
]);

// loading
const exportLoading = ref(false);
const downloadLoading = ref(false);
const loading = ref(false);

// 初始表单状态
const initialFormState = {
  dateValue: "",
  // 账单月份数组，如 ["01", "02"]
  billMonth: [],
  // 账单状态数组，如 [1, 2]
  billStatusList: [],
  // 账单年份，如 2026
  billYear: undefined,
  // 客户ID列表
  customerIdList: [],
  // 客户负责人ID
  customerPrincipalId: undefined,
  // 周期
  cycle: undefined,
  // 半月标识
  halfMonth: undefined,
  // 发票状态数组，如 [1, 2]
  invoiceStatusList: [],
  // 账单编号，如 "BILL20260527001"
  number: undefined,
  // 运单编号，如 "YD1234567890"
  waybillNo: undefined,
  // 周数数组，如 [1, 2, 3]
  weeks: undefined
};

const searchForm = reactive({ ...initialFormState });

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const tableData = ref([]);

const handleCycleChange = () => {
  searchForm.dateValue = "";
  searchForm.billYear = undefined;
  searchForm.billMonth = [];
  searchForm.weeks = undefined;
};

const halfMonthChange = (value) => {
  searchForm.billYear = value.split("-")[0];
  searchForm.billMonth[0] = value.split("-")[1];
};

const monthChange = (value) => {
  searchForm.billYear = value.split("-")[0];
  searchForm.billMonth[0] = value.split("-")[1];
};

const weekChange = (value) => {
  searchForm.billYear = value.split("-")[0];
  searchForm.billMonth[0] = value.split("-")[1];
  searchForm.weeks = value.split("-")[2].split(",");
};

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
    waybillNo,

    ...args
  } = searchForm;
  const params: any = {
    ...args
  };
  // 处理单号
  // if (waybillNo) {
  //   params.waybillNo = spliceArray(commaToArr(waybillNo), 500).join("\n");
  // } else {
  //   params.waybillNo = "";
  // }

  return params;
};

const handleResetForm = () => {};

const getListData = async () => {
  const params = getParams();

  const res = await getClaimBill({
    ...params,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  console.log(res, "====");
  tableData.value = res.records;
  pagination.total = res.total || 0;
};

const fetchData = () => {
  loading.value = true;
  getListData();
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

// 导出
const handleBatchExport = async () => {
  const params = getParams();

  exportLoading.value = true;
  await exportClaimBill({
    ...params,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  exportLoading.value = false;
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

      const res = await downloadClaimBill(data);

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
