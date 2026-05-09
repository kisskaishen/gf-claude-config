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
        <!-- <el-tooltip
          content="上传任务可以查看所有历史上传的记录"
          placement="bottom"
        >
          <el-button @click="uploadSubmit">
            <svg-icon
              name="upload-submit"
              width="20"
              height="20"
              class="mr-2"
            />
            {{ $t("web.gfuc.upload_task") }}
          </el-button>
        </el-tooltip> -->
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
            :rules="[
              {
                required: isCj,
                message: $t('web.gfuc.please_select_order_account'),
                trigger: 'blur'
              }
            ]"
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
        :limit="10"
        :buttonText="$t('web.gfuc.upload_task_button_text')"
        accept=".xls,.xlsx"
        :hint="$t('web.gfuc.upload_task_file_format_tip')"
        @change="handleChange"
      />
    </div>

    <div class="mt-6 table-list">
      <div class="flex items-center justify-between">
        <!-- 调试步骤 -->
        <div class="text-sm font-normal text-text-placeholder">
          {{ $t("web.gfuc.upload_task_total_prefix") }}
          <span class="font-normal">100</span>
          {{ $t("web.gfuc.upload_task_suffix") }}，

          {{ $t("web.gfuc.upload_task_success_prefix") }}
          <span class="font-normal text-success">23</span>
          {{ $t("web.gfuc.upload_task_suffix") }}，

          {{ $t("web.gfuc.upload_task_failed_prefix") }}
          <span class="font-normal text-danger">77</span>
          {{ $t("web.gfuc.upload_task_suffix") }}
        </div>

        <el-button type="primary" link @click="downloadErrorData">{{
          $t("web.gfuc.download_error_data")
        }}</el-button>
      </div>

      <el-table :data="tableData" class="mt-4" border max-height="300px">
        <el-table-column :label="$t('web.gfuc.row_number')" prop="orderNo" />
        <el-table-column
          :label="$t('web.gfuc.customer_order_no')"
          prop="orderStatus"
        />
        <el-table-column
          :label="$t('web.gfuc.error_message')"
          prop="createTime"
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

import { downloadFile } from "@/utils/download";
import { downloadOrderTemplate, uploadOrder } from "@/api/order";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
const appStore = useAppStore();

const { t } = useI18n();
const tableData = ref([]);

const fileList = ref([]);

const userInfo = useUserStore();
const isCj = computed(() =>
  userInfo.userInfo?.userIdentity === 2 ? true : false
);
const shipperOptions = computed(() => {
  return userInfo.loginInfo?.shipperCustomerList || [];
});
const site = computed(() => appStore.site);
const formRef = ref(null);
const form = reactive({
  customerId: ""
});

// 在脚本部分添加
const totalTip = computed(() => {
  const text = $t("web.gfuc.upload_task_total_tip");
  return text.replace(
    "{count}",
    '<span style="color:#007AFF;font-weight:bold">100</span>'
  );
});

const successTip = computed(() => {
  const text = $t("web.gfuc.upload_task_success_tip");
  return text.replace(
    "{count}",
    '<span style="color:#52C41A;font-weight:bold">23</span>'
  );
});

const failedTip = computed(() => {
  const text = $t("web.gfuc.upload_task_failed_tip");
  return text.replace(
    "{count}",
    '<span style="color:#FF4D4F;font-weight:bold">77</span>'
  );
});

const handleCustomerChange = (val: string) => {
  form.customerId = val;
};

// 下载模板文件
const downloadTemplate = async () => {
  const res = await downloadOrderTemplate();
  await downloadFile(res, `模板文件-${site.value}`);
};

const downloadErrorData = (url) => {
  downloadFile(url, "错误数据");
};

// 上传文件
const handleChange = (val) => {
  fileList.value = val;
};

const customHttpRequest = async (options) => {
  const valid = await formRef.value.validate();
  if (!valid) {
    return;
  }
  console.log(options, "======");
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("customerId", form.customerId);
  console.log(formData, "======");

  const res = await uploadOrder(formData);
  console.log(res, "======");
  options.onProgress(res);
  options.onSuccess(res);
};

// const uploadSubmit = async () => {
//   const valid = await formRef.value.validate();
//   if (!valid) {
//     return;
//   }
//   if (fileList.value.length === 0) {
//     ElMessage.error("请上传文件");
//     return;
//   }
//   // const formData = new FormData();
//   // formData.append("file", fileList.value[0]);
//   // formData.append("customerId", form.customerId);
//   // const res = await uploadOrder(formData);
// };
</script>
