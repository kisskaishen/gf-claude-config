<template>
  <div>
    <div class="task-container">
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
      >
        <template #search>
          <!-- Search Fields -->
          <!-- task_type task_status -->
          <el-form-item
            :label="$t('web.gfuc.file_name' /** 文件名称 **/)"
            prop="fileName"
          >
            <el-input
              v-model="searchForm.fileName"
              :placeholder="$t('gfuc.please_enter' /** 请输入 **/)"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('web.gfuc.type' /** 类型 **/)"
            prop="taskType"
          >
            <el-select
              v-model="searchForm.taskTypeSet"
              :placeholder="$t('web.gfuc.please_select' /** 请选择 **/)"
              clearable
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in taskTypeDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.status' /** 状态 **/)"
            prop="taskStatus"
          >
            <el-select
              v-model="searchForm.taskStatusSet"
              :placeholder="$t('gfuc.please_select' /** 请选择 **/)"
              clearable
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in taskStatusDict.options.value"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.order_time' /** 操作时间 **/)"
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
            :label="$t('web.gfuc.customer_name' /** 下单客户 **/)"
            prop="customerId"
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
          <el-table-column
            v-for="item in columns"
            :key="item.prop"
            :prop="item.prop"
            :label="$t(item.label)"
            :width="item?.width || undefined"
            :min-width="item?.minWidth || undefined"
            :align="item?.textAlign || 'left'"
            show-overflow-tooltip
          >
            <template #default="{ row, index }">
              <div v-if="item.prop === 'taskStatusName'">
                <span :class="['status-tag', getStatusClass(row.taskStatus)]">
                  {{ taskStatusDict.getLabel(row.taskStatus) ?? "-" }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            :width="columnWidth(160, 180, 200, 200, 180, 180)"
            fixed="right"
            align="center"
          >
            <template #default="{ row, index }">
              <div class="flex justify-center gap-2 table-actions">
                <!-- <el-tooltip
                  :content="$t('web.gfuc.view_order')"
                  placement="top"
                >
                  <svg-icon name="order-view" width="24" height="24" />
                </el-tooltip> -->

                <el-tooltip
                  :content="$t('web.gfuc.download_original_file')"
                  placement="top"
                >
                  <svg-icon
                    name="download-original"
                    width="24"
                    height="24"
                    @click="handleDownload(row)"
                    v-if="row.rawFileUrl"
                  />
                </el-tooltip>

                <el-tooltip
                  :content="
                    row.taskType === 2
                      ? $t('web.gfuc.download_freight_bill')
                      : row.taskType === 4
                        ? $t('web.gfuc.download_claim_bill')
                        : ''
                  "
                  placement="top"
                >
                  <svg-icon
                    name="download-original"
                    width="24"
                    height="24"
                    @click="handleBillDownload(row)"
                    v-if="row.relatedTaskIds?.length > 0"
                  />
                </el-tooltip>

                <el-tooltip :content="$t('gfuc.refresh')" placement="top">
                  <svg-icon
                    name="refresh"
                    width="24"
                    height="24"
                    @click="handleRefresh(row, index)"
                  />
                </el-tooltip>
                <el-tooltip
                  :content="$t('web.gfuc.download_error_data')"
                  placement="top"
                  v-if="row.errorFileUrl"
                >
                  <svg-icon
                    name="download-error"
                    width="24"
                    height="24"
                    @click="handleErrorDownload(row)"
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
import { downloadFile } from "@/utils/download";
import { getTaskList } from "@/api/task";
import { downloadFailedOrderData } from "@/api/order";
import { downloadBill } from "@/api/finance";
import TableLayout from "@/components/TableLayout/index.vue";
import { useDict } from "@/hooks/useDict";
import { columnWidth } from "@/utils/index";
import { downloadZip } from "@/utils/download";

import { useUserStore } from "@/store/user";

import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/app";

const userStore = useUserStore();

const router = useRouter();

const { t } = useI18n();
const appStore = useAppStore();
defineOptions({
  name: "TaskList"
});

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

const customerNameList = computed(() => {
  return userStore.loginInfo?.shipperCustomerList || [];
});

const lang = computed(() => appStore.lang);
const timezone = computed(() => appStore.timezone);

const currentStatus = computed(() => props.status);

const taskStatusDict = useDict("task_status");
const taskTypeDict = useDict("task_type");

const columns = computed(() => [
  {
    prop: "fileName",
    label: "web.gfuc.file_name", // 文件名
    minWidth: columnWidth(160, 200, 200, 200, 180, 200)
  },
  {
    prop: "createTime",
    label: "web.gfuc.date", // 日期
    minWidth: columnWidth(120, 180, 200, 180, 160, 180)
  },
  {
    prop: "taskTypeName",
    label: "web.gfuc.type", // 类型
    minWidth: columnWidth(100, 160, 180, 180, 140, 160)
  },
  {
    prop: "taskStatusName",
    label: "web.gfuc.status", // 状态
    minWidth: columnWidth(100, 160, 180, 200, 160, 160),
    textAlign: "center"
  },

  {
    prop: "totalCount",
    label: "web.gfuc.total_orders", // 总订单
    minWidth: columnWidth(100, 160, 200, 200, 220, 160),
    textAlign: "center"
  },

  {
    prop: "successCount",
    label: "web.gfuc.success", // 成功
    minWidth: columnWidth(80, 140, 160, 160, 120, 140),
    textAlign: "center"
  },

  {
    prop: "failCount",
    label: "web.gfuc.fail", // 失败,
    minWidth: columnWidth(80, 140, 160, 160, 120, 140),
    textAlign: "center"
  }
]);

const loading = ref(false);

// 初始表单状态
const initialFormState = {
  fileName: "",
  taskStatusSet: [],
  taskTypeSet: [],
  customerIdList: [],

  orderTimeRange: ["", ""]
};

const searchForm = reactive({ ...initialFormState });

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const tableData = ref([]);

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

const getStatusClass = (status) => {
  switch (status) {
    case 0:
      return "status-info";
    case 1:
      return "status-pending";
    case 2:
      return "status-success";
    case 3:
      return "status-failed";
    default:
      return "status-info";
  }
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
  const { orderTimeRange, ...args } = searchForm;
  const params: any = {
    ...args
  };

  // 时间参数
  if (orderTimeRange?.length === 2) {
    params.queryStartTime = orderTimeRange[0];
    params.queryEndTime = orderTimeRange[1];
  }

  return params;
};

const handleResetForm = () => {
  // Object.assign(searchForm, initialFormState);
  // setDefaultRange();
};
const getTaskListData = async () => {
  const params = getParams();

  const res = await getTaskList({
    data: {
      ...params
    },
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize
  });
  tableData.value = res.records;
  pagination.total = res.total || 0;
};

const fetchData = () => {
  loading.value = true;
  getTaskListData();

  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

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

const handleBillDownload = async (row: any) => {
  const res = await downloadBill({ id: row.id });
  let urlList = res.map((item) => item.downloadUrl);
  await downloadZip(urlList);
};

const handleDownload = async (row: any) => {
  const res = await downloadFailedOrderData(row.rawFileUrl);
  if (!res) {
    return;
  }
  await downloadFile(res, row.fileName);
};

const handleErrorDownload = async (row: any) => {
  const res = await downloadFailedOrderData(row.errorFileUrl);
  if (!res) {
    return;
  }
  await downloadFile(res, "错误数据" + row.fileName);
};
const handleRefresh = async (row: any, index: number) => {
  // const res = await getOrderImportResult(row.importTaskId);

  // tableData.value[index].taskStatusName = res?.taskStatusName || "";
  // tableData.value[index].successCount = res?.successCount || 0;
  // tableData.value[index].failCount = res?.failCount || 0;
  // tableData.value[index].totalCount = res?.totalCount || 0;
  // tableData.value[index].errorFileUrl = res?.errorFileUrl || "";
  // tableData.value[index].taskStatus = res?.taskStatus || 0;
  await fetchData();
};

// 处理重置事件
const handleReset = () => {
  handleResetForm();
  fetchData();
};

onMounted(() => {
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
.task-container {
  @apply p-6;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .status-tag {
    padding: 2px 8px;
    font-size: var(--font-size-base);
    white-space: nowrap;
    border-radius: 12px;
  }
  .status-info {
    color: #4e5969;
    background-color: #e5e7eb;
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
}
</style>
