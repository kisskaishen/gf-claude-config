<template>
  <PageContainer>
    <TableLayout
      v-model:searchFormModel="searchForm"
      :data="tableData"
      :total="total"
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :loading="loading"
      @search="fetchData"
      @reset="fetchData"
    >
      <!-- 搜索区域 -->
      <template #search>
        <el-form-item
          :label="$t('gfuc.payment_method' /** 付款方式 **/)"
          prop="paymentMethod"
        >
          <el-select
            v-model="searchForm.paymentMethod"
            :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
            clearable
            :options="receiptMethodDict.options.value"
            multiple
            collapse-tags
          >
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('gfuc.status' /** 状态 **/)" prop="status">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
            multiple
            collapse-tags
            clearable
            :options="statusDict.options.value"
          >
          </el-select>
        </el-form-item>

        <el-form-item
          class="date-range-item"
          :class="lang === 'nl' ? 'date-range-item-nl' : ''"
        >
          <template #label>
            <el-radio-group
              v-model="searchForm.dateType"
              :options="dateTypeOptions"
            >
            </el-radio-group>
          </template>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            :start-placeholder="$t('gfuc.start_date' /** 开始日期 **/)"
            :end-placeholder="$t('gfuc.end_date' /** 结束日期 **/)"
            value-format="YYYY-MM-DD"
            :fallback-placements="['bottom']"
          />
        </el-form-item>
      </template>

      <!-- 表格区域 -->
      <template #columns>
        <el-table-column
          prop="receiptAmount"
          :label="$t('gfuc.recharge_amount' /** 充值金额 **/)"
          :min-width="columnWidth(120, 180, 200, 200, 180, 180)"
          show-overflow-tooltip
        />
        <el-table-column
          prop="currency"
          :label="$t('gfuc.currency' /** 币种 **/)"
          :min-width="columnWidth(80, 140, 160, 160, 120, 140)"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{
              currencyOptions.find((item) => item.value === row.currency)
                ?.label ?? "-"
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="receiptMethod"
          :label="$t('gfuc.payment_method' /** 付款方式 **/)"
          :min-width="columnWidth(120, 180, 220, 220, 180, 200)"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ receiptMethodDict.getLabel(row.receiptMethod) ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="receiptDate"
          :label="$t('gfuc.recharge_date' /** 充值日期 **/)"
          :min-width="columnWidth(120, 180, 200, 180, 240, 180)"
          show-overflow-tooltip
        />
        <el-table-column
          prop="remark"
          :label="$t('gfuc.remark' /** 备注 **/)"
          :min-width="columnWidth(100, 160, 180, 180, 160, 160)"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          :label="$t('gfuc.status' /** 状态 **/)"
          :min-width="columnWidth(80, 160, 180, 200, 160, 160)"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span :class="['status-tag', getStatusClass(row.status)]">
              {{ statusDict.getLabel(row.status) ?? "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="rejectionReason"
          :label="$t('gfuc.failure_reason' /** 失败原因 **/)"
          :min-width="columnWidth(140, 200, 240, 240, 200, 200)"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createTimeStr"
          :label="$t('gfuc.submission_time' /** 提交时间 **/)"
          :min-width="columnWidth(140, 180, 200, 200, 180, 180)"
          show-overflow-tooltip
        />
      </template>
    </TableLayout>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import TableLayout from "@/components/TableLayout/index.vue";
import PageContainer from "@/components/PageContainer/index.vue";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";
import { getRechargeRecord } from "@/api/finance";
import { useAppStore } from "@/store/app";
import { columnWidth } from "@/utils/index";
import { computed, watch } from "vue";

const appStore = useAppStore();
const lang = computed(() => appStore.lang);

defineOptions({
  name: "RechargeRecord"
});

const { t } = useI18n();

/** 日期类型 */
const enum DateType {
  /** 提交日期 */
  Submit = "submit",
  /** 充值日期 */
  Recharge = "recharge"
}

/** 状态 */
const enum Status {
  /** 充值中 */
  Recharging,
  /** 充值失败 */
  RechargeFailed,
  /** 充值成功 */
  RechargeSuccess
}

/** 日期类型选项 */
const dateTypeOptions = computed(() => {
  return [
    {
      label: t("gfuc.submission_date" /** 提交日期 **/),
      value: DateType.Submit
    },
    {
      label: t("gfuc.recharge_date" /** 充值日期 **/),
      value: DateType.Recharge
    }
  ];
});

/** 币种 */
const enum Currency {
  EUR = 1,
  USD = 2
}

/** 币种选项 */
const currencyOptions = [
  { label: "EUR", value: Currency.EUR },
  { label: "USD", value: Currency.USD }
];

// --- 搜索相关 ---
const searchForm = ref({
  paymentMethod: [],
  status: [],
  dateType: DateType.Submit,
  dateRange: []
});

const receiptMethodDict = useDict("fms.provider.paymentMode.type");

const statusDict = useDict<Status>("gfuc.fms.recharge.status");

// --- 表格相关 ---
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

const getStatusClass = (status: Status) => {
  switch (status) {
    case Status.Recharging:
      return "status-pending";
    case Status.RechargeFailed:
      return "status-failed";
    case Status.RechargeSuccess:
      return "status-success";
    default:
      return "";
  }
};

const timezone = computed(() => appStore.timezone);
watch(
  () => timezone.value,
  (val) => {
    fetchData();
  }
);
const fetchData = async () => {
  loading.value = true;

  let status = [];
  status.push(...searchForm.value.status);
  if (searchForm.value.status.find((item) => item === 1) > -1) {
    status.push(3);
  }
  if (searchForm.value.status.find((item) => item === 5) > -1) {
    status.push(4);
  }

  console.log(status, searchForm.value.status);
  try {
    const res = await getRechargeRecord({
      pageNumber: currentPage.value,
      pageSize: pageSize.value,
      receiptMethod: searchForm.value.paymentMethod,
      status: status,
      ...(searchForm.value.dateType === DateType.Submit
        ? {
            submitStart: searchForm.value.dateRange?.[0] || "",
            submitEnd: searchForm.value.dateRange?.[1] || ""
          }
        : {
            receiptDateStart: searchForm.value.dateRange?.[0] || "",
            receiptDateTimeEnd: searchForm.value.dateRange?.[1] || ""
          })
    });
    if (res) {
      tableData.value =
        res.items?.map((item) => ({
          ...item,
          status: [1, 3].includes(item.status)
            ? 1
            : [4, 5].includes(item.status)
              ? 5
              : item.status
        })) || [];
      total.value = res.totalCount || 0;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
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

.date-range-item {
  :deep(.el-radio) {
    height: auto;
  }
  &.date-range-item-nl {
    :deep(.el-radio) {
      margin-right: 7px;
    }
  }
}
</style>
