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
      <div class="flex mt-2">
        <div>
          <div class="tips text-sm text-[#BBBDBF]">
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
                  style="width: 800px"
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
            ref="uploadRef"
            v-model="fileList"
            :http-request="customHttpRequest"
            type="file"
            :width="800"
            :dragAreaWidth="800"
            :dragAreaHeight="194"
            drag
            :multiple="true"
            :limit="1"
            :needFrontMsg="false"
            :progress="taskStatus"
            :buttonText="$t('web.gfuc.upload_task_button_text')"
            accept=".xls,.xlsx"
            :hint="$t('web.gfuc.upload_task_file_format_tip')"
            @refresh="handleRefresh"
            @remove="handleRemove"
          />
        </div>

        <div
          class="flex-1 min-w-0 p-4 ml-4 text-white bg-gray-50 rounded-xl h-fit"
        >
          <h3
            class="flex items-center gap-2 mb-4 text-base font-semibold text-info"
          >
            <svg
              class="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            批量导入操作说明
          </h3>
          <div class="space-y-2 text-sm text-gray-600">
            <!-- 步骤1 -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-4 h-4 text-xs font-medium text-white bg-orange-500 rounded-full"
              >
                1
              </div>
              <div>
                <p class="font-normal text-info">下载官方模板</p>
              </div>
            </div>
            <!-- 步骤2 -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-4 h-4 text-xs font-medium text-white bg-orange-500 rounded-full"
              >
                2
              </div>
              <div>
                <p class="font-normal text-info">填写订单信息</p>
              </div>
            </div>
            <!-- 步骤3 -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-4 h-4 text-xs font-medium text-white bg-orange-500 rounded-full"
              >
                3
              </div>
              <div>
                <p class="font-normal text-info">选择下单账户</p>
              </div>
            </div>
            <!-- 步骤4 -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-4 h-4 text-xs font-medium text-white bg-orange-500 rounded-full"
              >
                4
              </div>
              <div>
                <p class="font-normal text-info">上传并确认</p>
              </div>
            </div>
            <!-- 注意事项 -->
            <div class="pt-4 mt-4 border-t border-gray-200">
              <p class="mb-2 font-normal text-info">⚠️ 注意事项</p>
              <ul
                class="space-y-1 list-none text-sm text-[#BBBDBF] font-normal"
              >
                <li>
                  1、模版第一行是示例数据，请先删除或覆盖它再填写您的订单。
                </li>
                <li>2、产品编码需要找商务提供</li>
                <li>
                  3、当产品编码为EU003第三方跟踪号和渠道编码必填(该编码由我方系统生成，对接时找我方获取，必须有效)
                </li>
                <li>4、寄件人国家和收件人国家需要填写国家二字码，如示例所示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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

    <SuccessDialog
      v-model="successVisible"
      :title="$t('web.gfuc.order_success' /** 下单成功 **/)"
      :description="
        $t('web.gfuc.order_success_description', {
          successCount
        }) /** 您已成功下单 { successCount } 条 **/
      "
      :primary-btn-text="$t('web.gfuc.view_order' /** 查看订单 **/)"
      :secondary-btn-text="$t('web.gfuc.continue_upload' /** 继续上传 **/)"
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
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const tableData = ref([]);
const totalCount = ref(0);
const successCount = ref(0);
const failCount = ref(0);
const errorFileUrl = ref("");
const taskStatus = ref(0);
const uploadRef = ref(null);
const fileList = ref([]);

const successVisible = ref(false);

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
  const valid = await (isCj.value
    ? formRef.value.validate()
    : Promise.resolve(true));
  if (!valid) {
    return;
  }
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append(
    "customerId",
    form.customerId || shipperOptions.value[0]?.customerId
  );

  const res = await uploadOrder(formData);
  importTaskId.value = res;
  if (importTaskId.value) {
    // 启动5秒轮询，直到任务完成（状态为2）
    startPolling(
      (result) => result?.taskStatus === 2 || result?.taskStatus === 3,
      getImportResult,
      5000
    );
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
  if (taskStatus.value === 2 && successCount.value === totalCount.value) {
    successVisible.value = true;
  }
  return res; // 返回结果供轮询条件判断使用
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
    form.customerId = shipperOptions.value[0]?.customerId;
  }

  formRef.value && formRef.value.resetFields();

  handleRemove();
  uploadRef.value?.clearFiles();
};

//
// const resetForm = () => {
// }

watch(
  () => currentLang.value,
  () => {
    formRef.value && formRef.value.resetFields();
  }
);

const goTaskList = () => {
  router.push("/task/list");
};
</script>
