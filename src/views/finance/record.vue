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
        <el-form-item :label="$t('付款方式')" prop="paymentMethod">
          <el-select
            v-model="searchForm.paymentMethod"
            :placeholder="$t('请选择')"
            clearable
          >
            <el-option
              v-for="item in paymentOptions"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('状态')" prop="status">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('请选择')"
            multiple
            collapse-tags
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="date-range-item">
          <template #label>
            <el-radio-group v-model="searchForm.dateType">
              <el-radio value="submit">{{ $t("提交日期") }}</el-radio>
              <el-radio value="recharge">{{ $t("充值日期") }}</el-radio>
            </el-radio-group>
          </template>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            :start-placeholder="$t('开始日期')"
            :end-placeholder="$t('结束日期')"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </template>

      <!-- 表格区域 -->
      <template #columns>
        <el-table-column
          prop="amount"
          :label="$t('充值金额')"
          min-width="120"
        />
        <el-table-column prop="currency" :label="$t('币种')" min-width="80" />
        <el-table-column
          prop="paymentMethod"
          :label="$t('付款方式')"
          min-width="120"
        >
          <template #default="{ row }">
            {{ $t(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="rechargeDate"
          :label="$t('充值日期')"
          min-width="120"
        />
        <el-table-column prop="remark" :label="$t('备注')" min-width="150" />
        <el-table-column prop="status" :label="$t('状态')" min-width="100">
          <template #default="{ row }">
            <span :class="['status-tag', getStatusClass(row.status)]">
              {{ $t(getStatusLabel(row.status)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="failReason"
          :label="$t('失败原因')"
          min-width="150"
        />
        <el-table-column
          prop="submitTime"
          :label="$t('提交时间')"
          min-width="160"
        />
      </template>
    </TableLayout>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import TableLayout from "@/components/TableLayout/index.vue";
import PageContainer from "@/components/PageContainer/index.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "RechargeRecord"
});

const { t } = useI18n();

// --- 搜索相关 ---
const searchForm = ref({
  paymentMethod: "",
  status: [],
  dateType: "submit",
  dateRange: []
});

const paymentOptions = [
  { label: t("银行转账"), value: "bank_transfer" },
  { label: t("支票"), value: "check" },
  { label: t("承兑汇票"), value: "acceptance_bill" }
];

const statusOptions = [
  { label: t("充值中"), value: "pending" },
  { label: t("充值成功"), value: "success" },
  { label: t("充值失败"), value: "failed" }
];

// --- 表格相关 ---
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

const getStatusLabel = (status: string) => {
  const found = statusOptions.find((item) => item.value === status);
  return found ? found.label : status;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "status-pending";
    case "success":
      return "status-success";
    case "failed":
      return "status-failed";
    default:
      return "";
  }
};

// 模拟数据获取
const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    // 模拟数据
    const mockData = [
      {
        id: 1,
        amount: "32",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-19",
        remark: "银行打款充值",
        status: "pending",
        failReason: "-",
        submitTime: "2023-03-19 08:59"
      },
      {
        id: 2,
        amount: "5212",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-17",
        remark: "-",
        status: "failed",
        failReason: "充值记录不存在",
        submitTime: "2023-03-17 04:05"
      },
      {
        id: 3,
        amount: "621",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-19",
        remark: "-",
        status: "success",
        failReason: "-",
        submitTime: "2023-03-19 12:27"
      },
      {
        id: 4,
        amount: "223",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-15",
        remark: "-",
        status: "pending",
        failReason: "-",
        submitTime: "2023-03-15 08:20"
      },
      {
        id: 5,
        amount: "622",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-18",
        remark: "-",
        status: "failed",
        failReason: "-",
        submitTime: "2023-03-18 11:52"
      },
      {
        id: 6,
        amount: "422",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-18",
        remark: "-",
        status: "success",
        failReason: "-",
        submitTime: "2023-03-18 08:29"
      },
      {
        id: 7,
        amount: "722",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-18",
        remark: "-",
        status: "pending",
        failReason: "-",
        submitTime: "2023-03-18 11:34"
      },
      {
        id: 8,
        amount: "922",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-14",
        remark: "-",
        status: "failed",
        failReason: "-",
        submitTime: "2023-03-14 22:59"
      },
      {
        id: 9,
        amount: "101",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-14",
        remark: "-",
        status: "success",
        failReason: "-",
        submitTime: "2023-03-14 00:56"
      },
      {
        id: 10,
        amount: "132",
        currency: "USB",
        paymentMethod: "银行转账",
        rechargeDate: "2023-03-18",
        remark: "-",
        status: "pending",
        failReason: "-",
        submitTime: "2023-03-18 16:35"
      }
    ];

    tableData.value = mockData;
    total.value = 320;
    loading.value = false;
  }, 500);
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
  border-radius: 2px;
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
}
</style>
