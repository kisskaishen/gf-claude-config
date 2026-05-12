<template>
  <div class="p-6 rounded order-batch">
    <div class="mb-6 text-lg font-bold">
      <div class="flex items-center justify-between">
        <el-button type="primary" link @click="downloadTemplate">
          <svg-icon
            name="upload-download"
            width="24"
            height="24"
            class="mr-2"
          />
          {{ $t("web.gfuc.batch_order_template_download") }}
        </el-button>
        <el-tooltip
          :content="$t('web.gfuc.upload_task_tooltip')"
          placement="bottom"
        >
          <el-button @click="goTaskList">
            <svg-icon
              name="upload-submit"
              width="20"
              height="20"
              class="mr-2"
            />
            {{ $t("web.gfuc.upload_task") }}
          </el-button>
        </el-tooltip>
      </div>
      <div class="tips text-sm text-[#BBBDBF] mt-2">
        {{ $t("web.gfuc.upload_task_tip") }}
      </div>
      <div class="mt-2">
        <el-form
          ref="formRef"
          :model="form"
          label-width="80px"
          label-position="top"
          v-if="isCj"
        >
          <el-form-item
            :label="$t('web.gfuc.order_account')"
            prop="customerId"
            :rules="customerRules"
          >
            <el-select
              v-model="form.customerId"
              filterable
              :placeholder="$t('web.gfuc.please_select_order_account')"
              @change="handleCustomerChange"
              style="width: 380px"
            >
              <el-option
                v-for="item in shipperOptions"
                :key="item.customerId"
                :label="item.customerName"
                :value="item.customerId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <common-upload
        v-model="fileList"
        :http-request="customHttpRequest"
        type="file"
        :width="380"
        :dragAreaWidth="380"
        :dragAreaHeight="194"
        drag
        :multiple="true"
        :limit="1"
        :progress="taskStatus"
        :buttonText="$t('web.gfuc.upload_task_button_text')"
        accept=".xls,.xlsx"
        :hint="$t('web.gfuc.upload_task_file_format_tip')"
        @refresh="handleRefresh"
        @remove="handleRemove"
      />
    </div>

    <div class="mt-6 table-list" v-if="totalCount > 0">
      <div class="flex items-center justify-between">
        <!-- 调试步骤 -->
        <div
          class="text-sm font-normal text-text-placeholder"
          v-if="taskStatus === 2"
        >
          {{ $t("web.gfuc.upload_task_total_prefix") }}
          <span class="font-normal">{{ totalCount }}</span>
          {{ $t("web.gfuc.upload_task_suffix") }}，

          {{ $t("web.gfuc.upload_task_success_prefix") }}
          <span class="font-normal text-success">{{ successCount }}</span>
          {{ $t("web.gfuc.upload_task_suffix") }}，

          {{ $t("web.gfuc.upload_task_failed_prefix") }}
          <span class="font-normal text-danger">{{ failCount }}</span>
          {{ $t("web.gfuc.upload_task_suffix") }}
        </div>
        <div class="text-sm font-normal text-text-placeholder" v-else>
          文件正在上传中，请稍等
        </div>

        <el-button
          type="primary"
          link
          @click="downloadErrorData"
          v-if="errorFileUrl"
          >{{ $t("web.gfuc.download_error_data") }}</el-button
        >
      </div>

      <el-table
        :data="tableData"
        class="mt-4"
        border
        max-height="300px"
        v-if="taskStatus === 2"
      >
        <el-table-column :label="$t('web.gfuc.row_number')" prop="rowNum" />
        <el-table-column
          :label="$t('web.gfuc.customer_order_no')"
          prop="customerOrderNo"
        />
        <el-table-column
          :label="$t('web.gfuc.error_message')"
          prop="errorMsg"
        />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "BatchOrder"
});
import CommonUpload from "@/components/CommonUpload/index.vue";

import { useI18n } from "vue-i18n";
import { downloadFile } from "@/utils/download";
import {
  downloadOrderTemplate,
  uploadOrder,
  getOrderImportResult,
  downloadFailedOrderData
} from "@/api/order";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const tableData = ref([]);
const totalCount = ref(0);
const successCount = ref(0);
const failCount = ref(0);
const errorFileUrl = ref("");
const taskStatus = ref(0);

const fileList = ref([]);

const userInfo = useUserStore();
const isCj = computed(() =>
  userInfo.userInfo?.userIdentity === 2 ? true : false
);
const shipperOptions = computed(() => {
  return userInfo.loginInfo?.shipperCustomerList || [];
});
// 表单验证规则 - 使用 computed 使其响应语言切换
const customerRules = computed(() => [
  {
    required: isCj.value,
    message: t("web.gfuc.please_select_order_account"),
    trigger: ["blur", "change"]
  }
]);
const currentLang = computed(() => appStore.lang);

const site = computed(() => appStore.site);
const formRef = ref(null);
const form = reactive({
  customerId: ""
});

const handleCustomerChange = (val: string) => {
  form.customerId = val;
};

// 下载模板文件
const downloadTemplate = async () => {
  const res = await downloadOrderTemplate();
  const blob = new Blob([res], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
  });
  await downloadFile(blob, `模板文件-${site.value}`);
};

const downloadErrorData = async () => {
  const res = await downloadFailedOrderData(errorFileUrl.value);
  if (!res) {
    return;
  }
  await downloadFile(res, "错误数据");
};

const importTaskId = ref();
let pollingTimer = null; // 轮询定时器

// 5秒自动轮询方法 - 直到满足条件
const startPolling = (condition, callback, interval = 5000) => {
  // 清除之前的定时器
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  // 立即执行一次
  const checkCondition = async () => {
    try {
      const result = await callback();
      // 检查是否满足条件
      if (condition(result)) {
        stopPolling();
      }
    } catch (error) {
      console.error("轮询请求失败:", error);
      stopPolling();
    }
  };

  // 立即执行
  checkCondition();

  // 启动定时轮询
  pollingTimer = setInterval(checkCondition, interval);
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

const customHttpRequest = async (options) => {
  const valid = await formRef.value.validate();
  if (!valid) {
    return;
  }
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("customerId", form.customerId);

  const res = await uploadOrder(formData);
  importTaskId.value = res;
  if (importTaskId.value) {
    // 启动5秒轮询，直到任务完成（状态为2或3）
    startPolling((result) => result?.taskStatus === 2, getImportResult, 5000);
  }
};

// 刷新上传结果
const handleRefresh = async () => {
  if (importTaskId.value) {
    getImportResult();
  }
};
const handleRemove = () => {
  tableData.value = [];
  totalCount.value = 0;
  successCount.value = 0;
  failCount.value = 0;
  errorFileUrl.value = "";
  taskStatus.value = 0;
};
// 文件上传结果监听
const getImportResult = async () => {
  const res = await getOrderImportResult(importTaskId.value);
  tableData.value = res.errorItems || [];
  totalCount.value = res?.totalCount || 0;
  successCount.value = res?.successCount || 0;
  failCount.value = res?.failCount || 0;
  errorFileUrl.value = res?.errorFileUrl || "";
  taskStatus.value = res?.taskStatus || 0;
  return res; // 返回结果供轮询条件判断使用
};

//
// const resetForm = () => {
// }

watch(
  () => currentLang.value,
  () => {
    formRef.value.resetFields();
  }
);

const goTaskList = () => {
  router.push("/task/list");
};
</script>
