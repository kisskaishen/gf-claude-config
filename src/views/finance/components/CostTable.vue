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
        :searchConfig="{ cols: 4, rowNum: 1, operationCols: 2 }"
        @search="fetchData"
        @reset="handleReset"
        @selection-change="handleSelectionChange"
      >
        <template #action-left>
          <el-button @click="handleBatchExport" :loading="exportLoading">
            <svg-icon
              name="upload-download"
              width="20"
              height="20"
              class="mr-1"
            />
            {{ $t("web.gfuc.export" /** 导出 **/) }}
          </el-button>
          <el-button @click="handleBatchDownload" :loading="downloadLoading">
            {{ $t("web.gfuc.download_bill" /** 下载账单 **/) }}
          </el-button>
        </template>

        <template #search>
          <!-- Search Fields -->
          <el-form-item prop="waybillNo">
            <el-input
              v-model="searchForm.waybillNo"
              clearable
              :placeholder="
                $t('gfuc.tracking_number' /** 请输入订单号或运单号 **/)
              "
            />
          </el-form-item>
          <el-form-item prop="cycle">
            <el-select
              v-model="searchForm.cycle"
              :placeholder="
                $t('web.gfuc.settlement_cycle' /** 请选择结算周期 **/)
              "
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
          <el-form-item prop="dateValue">
            <!-- 半月结 -->
            <template v-if="searchForm.cycle == 1">
              <div class="flex items-center w-full gap-2">
                <el-date-picker
                  v-model="searchForm.dateValue"
                  type="week"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  :placeholder="
                    $t('web.gfuc.account_period' /** 请选择账期 **/)
                  "
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
                    v-for="item in halfMonthListDict.options.value"
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
                :placeholder="$t('web.gfuc.account_period' /** 请选择账期 **/)"
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
                :placeholder="$t('web.gfuc.account_period' /** 请选择账期 **/)"
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
                :placeholder="$t('web.gfuc.account_period' /** 请选择账期 **/)"
                style="width: 100%"
                disabled
              />
            </template>
          </el-form-item>
          <el-form-item prop="number">
            <el-input
              v-model="searchForm.number"
              clearable
              :placeholder="
                $t('web.gfuc.account_number' /** 请输入账单编号 **/)
              "
            />
          </el-form-item>
          <el-form-item prop="billStatusList">
            <el-select
              v-model="searchForm.billStatusList"
              :placeholder="
                $t('web.gfuc.account_status' /** 请选择账单状态 **/)
              "
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
          <el-form-item prop="invoiceStatusList">
            <el-select
              v-model="searchForm.invoiceStatusList"
              :placeholder="
                $t('web.gfuc.invoice_status' /** 请选择开票状态 **/)
              "
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
            prop="customerIdList"
            v-if="customerNameList.length > 1"
          >
            <el-select
              v-model="searchForm.customerIdList"
              :placeholder="$t('web.gfuc.customer_name' /** 请选择下单客户 **/)"
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
            <template #default="{ row }" v-if="item.prop === 'statusName'">
              <span :class="['status-tag', getStatusClass(row.status)]">
                {{ billStatusListDict.getLabel(row.status) ?? "-" }}
              </span>
            </template>
            <!-- 金额字段格式化 -->
            <template
              #default="{ row }"
              v-else-if="amountProps.includes(item.prop)"
            >
              {{ formatAmount(row[item.prop]) }}
            </template>
            <!-- 理赔账单编号 -->
            <template
              #default="{ row }"
              v-else-if="item.prop === 'claimBillTotalNumber'"
            >
              <span
                class="cursor-pointer text-primary"
                @click.stop="handleSearchClaimBill(row.claimBillTotalNumber)"
              >
                {{ row.claimBillTotalNumber ?? "-" }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            :width="columnWidth(80, 120, 120, 120, 80, 80)"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-tooltip
                  :content="$t('web.gfuc.download_bill')"
                  placement="top"
                >
                  <el-button class="action-btn" @click="handleDownload(row)">
                    <svg-icon name="upload-download" width="16" height="16" />
                  </el-button>
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
  getFreightBill,
  downloadFreightBill,
  exportFreightBill
} from "@/api/finance";
import { formatAmount } from "@/utils/index";

import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/app";

const userStore = useUserStore();

const { t } = useI18n();
const appStore = useAppStore();
defineOptions({
  name: "CostTable"
});
const emits = defineEmits(["show-success-dialog", "searchClaimBill"]);

const cycleTypeListDict = useDict("fms_receivable_cycle_type");
const billStatusListDict = useDict("lcs.finance.bill.status");
const invoiceStatusListDict = useDict("fms.receivable.invoice.status.type");
const halfMonthListDict = useDict("fms.bill.month.type");

// 账单状态
const accountStatus = useDict("fms.receivable.invoice.status.type");

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

// 金额字段列表（需要格式化的字段）
const amountProps = [
  "taxedTotal",
  "untaxedTotal",
  "taxTotal",
  "detailUntaxedTotal",
  "adjustGeneralTotal",
  "adjustmentDetailExcludingTax",
  "claimUntaxedTotal",
  "claimTaxedTotal"
];

const columns = computed(() => [
  {
    prop: "number",
    label: t("web.gfuc.account_number" /** 账单编号 */),
    minWidth: columnWidth(160, 180, 200, 180, 160, 180)
  },
  {
    prop: "cycleName",
    label: t("web.gfuc.settlement_cycle" /** 结算周期 */),
    minWidth: columnWidth(120, 200, 220, 240, 180, 200)
  },
  {
    prop: "phaseName",
    label: t("web.gfuc.account_period" /** 账期 */),
    minWidth: columnWidth(80, 160, 200, 180, 160, 160)
  },
  {
    prop: "currencyName",
    label: t("web.gfuc.settlement_currency" /** 结算币种 */),
    minWidth: columnWidth(120, 220, 220, 240, 180, 200)
  },
  {
    prop: "statusName",
    label: t("web.gfuc.account_status" /** 账单状态 */),
    width: columnWidth(100, 160, 180, 200, 160, 160)
  },
  {
    prop: "detailCount",
    label: t("web.gfuc.ticket_count" /** 票数 */),
    minWidth: columnWidth(80, 140, 200, 220, 160, 160)
  },
  {
    prop: "taxRatio",
    label: t("web.gfuc.tax_rate_status" /** 税率 */),
    minWidth: columnWidth(80, 100, 160, 180, 160, 120)
  },
  {
    prop: "taxedTotal",
    label: t("web.gfuc.bill_amount_including_tax" /** 账单金额_含税 */),
    minWidth: columnWidth(150, 240, 240, 240, 240, 220),
    align: "right"
  },
  {
    prop: "untaxedTotal",
    label: t("web.gfuc.bill_amount_excluding_tax" /** 账单金额_未税 */),
    minWidth: columnWidth(150, 240, 240, 260, 260, 220),
    align: "right"
  },
  {
    prop: "taxTotal",
    label: t("web.gfuc.bill_amount_tax" /** 账单金额_税额 */),
    minWidth: columnWidth(150, 240, 240, 220, 220, 180),
    align: "right"
  },
  {
    prop: "detailUntaxedTotal",
    label: t("web.gfuc.bill_detail_excluding_tax" /** 账单明细_未税 */),
    minWidth: columnWidth(160, 240, 240, 280, 260, 240)
  },
  {
    prop: "adjustGeneralLedgerUntaxedTotal",
    label: t("web.gfuc.adjustment_total_excluding_tax" /** 调总账_未税 */),
    minWidth: columnWidth(160, 280, 260, 300, 300, 280),
    align: "right"
  },
  {
    prop: "adjustUntaxedTotal",
    label: t("web.gfuc.adjustment_detail_excluding_tax" /** 调账明细_未税 */),
    minWidth: columnWidth(160, 300, 280, 320, 320, 280)
  },
  {
    prop: "claimBillTotalNumber",
    label: t("web.gfuc.claim_bill_no" /** 理赔账单编号 */),
    minWidth: columnWidth(160, 180, 360, 220, 200, 200)
  },
  {
    prop: "claimUntaxedTotal",
    label: t("web.gfuc.claim_bill_amount_ex_tax" /** 理赔账单金额_未税 */),
    minWidth: columnWidth(180, 280, 360, 320, 320, 300),
    align: "right"
  },
  {
    prop: "claimTaxedTotal",
    label: t("web.gfuc.claim_bill_amount_in_tax" /** 理赔账单金额_含税 */),
    minWidth: columnWidth(180, 280, 360, 320, 320, 300),
    align: "right"
  },
  {
    prop: "invoiceStatusName",
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

const getStatusClass = (status: any) => {
  switch (status) {
    case 5:
      return "status-pending";
    case 7:
      return "status-failed";
    case 6:
      return "status-success";
    default:
      return "";
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
  params.waybillNo = waybillNo;

  return params;
};

const handleResetForm = () => {};

const getListData = async () => {
  const params = getParams();

  const res = await getFreightBill({
    ...params,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  console.log(res, "====");
  tableData.value = res.list;
  pagination.total = res.total || 0;
};

const fetchData = () => {
  loading.value = true;
  getListData();
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleDownload = async (row: any) => {
  await downloadFreightBill({
    numbers: [row.number]
  });

  emits("show-success-dialog", true);
};

const handleSearchClaimBill = (claimBillNo: string) => {
  if (!claimBillNo) return;
  emits("searchClaimBill", claimBillNo);
};

const selectedOrders = ref([]);

const handleSelectionChange = (val: any) => {
  selectedOrders.value = val.map((item: any) => ({
    number: item.number,
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
  setTimeout(() => {
    exportLoading.value = false;
  }, 1000);
  await exportFreightBill({
    ...params,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  emits("show-success-dialog", true);

  exportLoading.value = false;
};
// 批量下载
const handleBatchDownload = async () => {
  try {
    // 获取选中的订单
    if (selectedOrders.value.length === 0) {
      ElMessage.warning(t("web.gfuc.select_bill_first"));
      return;
    }

    downloadLoading.value = true;
    await downloadFreightBill({
      numbers: selectedOrders.value.map((item: any) => item.number)
    });

    emits("show-success-dialog", true);

    downloadLoading.value = false;
  } catch (error) {
    downloadLoading.value = false;
  }
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

.account-content {
  flex: 1;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.status-tag {
  padding: 2px 8px;
  font-size: var(--font-size-base);
  white-space: nowrap;
  border-radius: 12px;
}

.status-pending {
  color: rgb(255 123 41 / 100%);
  background-color: rgb(255 242 229 / 100%);
}

.status-success {
  color: rgb(43 143 1 / 100%);
  background-color: rgb(238 255 230 / 100%);
}

.status-failed {
  color: rgb(255 49 65 / 100%);
  background-color: rgb(255 227 230 / 100%);
}
</style>
