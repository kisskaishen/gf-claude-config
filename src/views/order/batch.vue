<template>
  <div class="min-h-screen bg-bg">
    <!-- 批量上传卡片 -->
    <div
      class="bg-white rounded-lg shadow-[0_2px_16px_rgba(79,87,125,0.08)] p-6 flex flex-col gap-6"
    >
      <!-- 标题区域 -->
      <div class="flex flex-col gap-2">
        <h1
          class="text-xl font-medium text-text-regular leading-[100%] tracking-[0.6%]"
        >
          {{ $t("web.gfuc.batch_order") }}
        </h1>
        <p
          class="text-sm font-medium text-text-tertiary leading-[100%] tracking-[0.6%]"
        >
          {{ $t("web.gfuc.batch_order_tip") }}
        </p>
      </div>

      <!-- 内容区域 -->
      <div class="flex gap-3">
        <!-- 左侧区域 -->
        <div class="flex flex-col flex-1 gap-3">
          <!-- 提示框 -->
          <div
            class="bg-[#fef3eb] border border-primary rounded-lg p-6 flex gap-1 flex-col items-start"
          >
            <div class="flex items-center gap-2">
              <svg-icon name="icon-tips" width="16" height="16" />

              <span class="text-sm text-text-regular">{{
                $t("web.gfuc.upload_task_tip")
              }}</span>
            </div>
            <el-button
              type="primary"
              link
              @click="downloadTemplate"
              class="ml-6"
            >
              <svg-icon
                name="batch-upload-download"
                width="16"
                height="16"
                class="mr-2"
              />
              {{ $t("web.gfuc.batch_order_template_download") }}
            </el-button>
          </div>

          <!-- 下单账户选择 -->
          <div v-if="isMoreCustomer">
            <el-form ref="formRef" :model="form" label-position="top">
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
                  class="w-full"
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

          <!-- 上传区域 -->
          <div class="bg-white min-h-[241px] flex flex-col justify-center">
            <common-upload
              ref="uploadRef"
              v-model="fileList"
              :http-request="customHttpRequest"
              type="file"
              drag
              :multiple="true"
              :limit="1"
              :needFrontMsg="false"
              :progress="taskStatus"
              :buttonText="$t('web.gfuc.upload_task_button_text')"
              accept=".xls,.xlsx"
              :hint="$t('web.gfuc.upload_task_file_format_tip')"
              :hint2="$t('web.gfuc.upload_task_file_size_tip')"
              @refresh="handleRefresh"
              @remove="handleRemove"
            />
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="w-[335px] flex flex-col gap-3">
          <!-- 步骤说明卡片 -->
          <div class="p-6 bg-white border rounded-lg border-border">
            <div class="flex gap-2.5 items-center mb-4">
              <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
              <span class="text-base font-semibold text-[#525252]">{{
                $t("web.gfuc.batch_import_title")
              }}</span>
            </div>
            <div class="flex flex-col gap-2.5">
              <div
                class="flex items-center gap-3"
                v-for="(step, index) in [1, 2, 3, 4, 5]"
                :key="index"
              >
                <span
                  class="flex items-center justify-center w-4 h-4 text-xs font-medium text-white rounded-full bg-primary"
                >
                  {{ step }}
                </span>
                <span class="text-sm text-text-secondary" v-if="step === 1">{{
                  $t("web.gfuc.batch_import_step1")
                }}</span>
                <span
                  class="text-sm text-text-secondary"
                  v-else-if="step === 2"
                  >{{ $t("web.gfuc.batch_import_step2") }}</span
                >
                <span
                  class="text-sm text-text-secondary"
                  v-else-if="step === 3"
                  >{{ $t("web.gfuc.batch_import_step3") }}</span
                >
                <span
                  class="text-sm text-text-secondary"
                  v-else-if="step === 4"
                  >{{ $t("web.gfuc.batch_import_step4") }}</span
                >
                <span class="text-sm text-text-secondary" v-else>
                  {{ $t("web.gfuc.upload_task_click") }}
                  <span
                    class="underline cursor-pointer text-primary"
                    @click="goTaskList"
                    >{{ $t("web.gfuc.task_list") }}</span
                  >
                  {{ $t("web.gfuc.view") }}
                </span>
              </div>
            </div>
          </div>

          <!-- 注意事项卡片 -->
          <div class="p-6 bg-white border rounded-lg border-border">
            <div class="mb-2.5">
              <span class="text-sm font-medium text-primary"
                ><svg-icon name="icon-warning" width="16" height="16" />{{
                  $t("web.gfuc.batch_import_notice_title")
                }}</span
              >
            </div>
            <div class="flex flex-col">
              <div
                class="flex items-center gap-3 px-4 py-2 bg-[#ffece5] border-l-2 border-primary rounded-r"
              >
                <!-- <span class="w-1.5 h-1.5 rounded-full bg-primary"></span> -->
                <span class="text-xs font-medium text-primary">{{
                  $t("web.gfuc.batch_import_notice1")
                }}</span>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-[#c8c8c8] flex-shrink-0"
                ></span>
                <span class="text-xs font-medium text-text-tertiary">{{
                  $t("web.gfuc.batch_import_notice2")
                }}</span>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-[#c8c8c8] flex-shrink-0"
                ></span>
                <span class="text-xs font-medium text-text-tertiary">{{
                  $t("web.gfuc.batch_import_notice3")
                }}</span>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-[#c8c8c8] flex-shrink-0"
                ></span>
                <span class="text-xs font-medium text-text-tertiary">{{
                  $t("web.gfuc.batch_import_notice4")
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传结果区域 -->
    <div
      class="mt-6 bg-white rounded-lg shadow-[0_2px_16px_rgba(79,87,125,0.08)] p-6"
      v-if="totalCount > 0"
    >
      <div class="flex items-center justify-between">
        <div v-if="taskStatus === 2" class="text-sm text-text-placeholder">
          <span
            >{{ $t("web.gfuc.upload_task_total_prefix") }}{{ totalCount
            }}{{ $t("web.gfuc.upload_task_suffix") }}</span
          >
          <span class="ml-2 text-success"
            >{{ $t("web.gfuc.upload_task_success_prefix") }}{{ successCount
            }}{{ $t("web.gfuc.upload_task_suffix") }}</span
          >
          <span class="ml-2 text-danger"
            >{{ $t("web.gfuc.upload_task_failed_prefix") }}{{ failCount
            }}{{ $t("web.gfuc.upload_task_suffix") }}</span
          >
        </div>
        <div v-else class="text-sm text-text-placeholder">
          <span>{{ $t("web.gfuc.file_uploading") }}</span>
        </div>
        <el-button @click="downloadErrorData" v-if="errorFileUrl">
          {{ $t("web.gfuc.download_error_data") }}
        </el-button>
      </div>

      <el-table
        :data="tableData"
        class="mt-4"
        border
        max-height="300px"
        v-if="taskStatus === 2 && successCount !== totalCount"
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

    <!-- 成功弹窗 -->
    <SuccessDialog
      v-model="successVisible"
      :title="$t('web.gfuc.order_success')"
      :description="$t('web.gfuc.order_success_description', { successCount })"
      :primary-btn-text="$t('web.gfuc.view_order')"
      :secondary-btn-text="$t('web.gfuc.continue_upload')"
      @primary-click="handleViewUpload"
      @secondary-click="handleContinue"
    />
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
import SuccessDialog from "@/components/SuccessDialog/index.vue";

import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
import {
  ElMessage,
  type FormInstance,
  type UploadInstance
} from "element-plus";

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const tableData = ref<any[]>([]);
const totalCount = ref(0);
const successCount = ref(0);
const failCount = ref(0);
const errorFileUrl = ref("");
const taskStatus = ref(0);
const uploadRef = ref<UploadInstance | null>(null);
const fileList = ref<any[]>([]);

const successVisible = ref(false);

const userInfo = useUserStore();

const isMoreCustomer = computed(() => {
  return userInfo.loginInfo?.shipperCustomerList?.length > 1;
});

const shipperOptions = computed(() => {
  return (userInfo.loginInfo?.shipperCustomerList || []) as Array<{
    customerId: string;
    customerName: string;
  }>;
});

const customerRules = computed(() => [
  {
    required: isMoreCustomer.value,
    message: t("web.gfuc.please_select_order_account"),
    trigger: ["blur", "change"]
  }
]);

const currentLang = computed(() => appStore.lang);
const site = computed(() => appStore.site);
const formRef = ref<FormInstance | null>(null);
const form = reactive({
  customerId: ""
});

const handleCustomerChange = (val: string) => {
  form.customerId = val;
};

const downloadTemplate = async () => {
  let customerId = "";

  if (isMoreCustomer.value) {
    customerId = form.customerId;
  } else {
    customerId = shipperOptions.value[0]?.customerId || "";
  }

  if (!customerId) {
    ElMessage.warning(
      t("web.gfuc.please_select_order_account_first" /** 请先选择下单帐户 **/)
    );
    return;
  }

  const res = await downloadOrderTemplate({
    customerId
  });
  const blob = new Blob([res], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
  });
  const fileName = `${t("web.gfuc.batch_order_template_filename")}-${site.value}`;
  await downloadFile(blob, fileName);
};

const downloadErrorData = async () => {
  const res = await downloadFailedOrderData(errorFileUrl.value);
  if (!res) {
    return;
  }
  await downloadFile(res, "错误数据");
};

const importTaskId = ref<string>();
let pollingTimer: ReturnType<typeof setInterval> | null = null;

const startPolling = (
  condition: (result: any) => boolean,
  callback: () => Promise<any>,
  interval = 5000
) => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  const checkCondition = async () => {
    try {
      const result = await callback();
      if (condition(result)) {
        stopPolling();
      }
    } catch (error) {
      console.error("轮询请求失败:", error);
      stopPolling();
    }
  };

  checkCondition();
  pollingTimer = setInterval(checkCondition, interval);
};

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

const customHttpRequest = async (options: { file: File }) => {
  const valid = await (isMoreCustomer.value
    ? formRef.value?.validate()
    : Promise.resolve(true));
  if (!valid) {
    return;
  }
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append(
    "customerId",
    form.customerId || shipperOptions.value[0]?.customerId || ""
  );

  const res = await uploadOrder(formData);
  importTaskId.value = res;
  if (importTaskId.value) {
    startPolling(
      (result) => result?.taskStatus === 2 || result?.taskStatus === 3,
      getImportResult,
      5000
    );
  }
};

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

const getImportResult = async () => {
  if (!importTaskId.value) return;
  const res = await getOrderImportResult(importTaskId.value);
  tableData.value = res.errorItems || [];
  totalCount.value = res?.totalCount || 0;
  successCount.value = res?.successCount || 0;
  failCount.value = res?.failCount || 0;
  errorFileUrl.value = res?.errorFileUrl || "";
  taskStatus.value = res?.taskStatus || 0;
  if (taskStatus.value === 2 && successCount.value === totalCount.value) {
    successVisible.value = true;
  }
  return res;
};

const handleViewUpload = () => {
  handleContinue();
  router.push("/order/list");
};

const handleContinue = () => {
  successVisible.value = false;
  if (shipperOptions.value.length > 1) {
    form.customerId = "";
  } else {
    form.customerId = shipperOptions.value[0]?.customerId || "";
  }
  if (formRef.value) {
    formRef.value.resetFields();
  }
  handleRemove();
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

watch(
  () => currentLang.value,
  () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  }
);

const goTaskList = () => {
  router.push("/task/list");
};
</script>
