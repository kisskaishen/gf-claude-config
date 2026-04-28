<template>
  <div class="pt-5 step-container">
    <div
      class="mr-4 step-left"
      :class="{ 'step-completed': isCompleted, 'step-active': isActive }"
    >
      <div class="step-number" v-if="!isCompleted">
        {{ stepNumber }}
      </div>
      <svg-icon
        name="order-step-complated"
        class="step-content-completed-icon"
        width="24"
        height="24"
        v-if="isCompleted"
      />
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <div class="step-content-header">
        <h3 class="step-content-header-title">
          {{ $t("web.gfuc.product_info") }}
        </h3>
        <!-- 清除数据 -->
        <svg-icon
          name="order-clear"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onClear"
          v-if="isActive"
        />
        <!-- 编辑数据 -->
        <svg-icon
          name="order-edit"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onEdit"
          v-if="!isActive && isCompleted"
        />
      </div>

      <div v-if="isActive || isCompleted" class="step-content-form">
        <div v-if="isActive" class="form-container">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item label-width="0">
                  <el-radio-group v-model="formData.productType">
                    <el-radio value="ECO">{{
                      $t("web.gfuc.express_delivery")
                    }}</el-radio>
                    <el-radio value="EXP">{{
                      $t("web.gfuc.standard_delivery")
                    }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label-width="0">
                  <el-radio-group
                    v-model="formData.productCode"
                    class="radio-group"
                    @change="handleProductChange"
                  >
                    <el-radio
                      v-for="item in productList"
                      :key="item.code"
                      :value="item.code"
                    >
                      <div class="radio-label">{{ item.name }}</div>
                      <div class="radio-content">{{ item.desc }}</div>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row
              :gutter="20"
              v-if="formData.productName.indexOf('揽收') > -1"
            >
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.collection_start_time')"
                  prop="queryCollectStartTime"
                  :rules="[
                    {
                      required:
                        formData.queryCollectStartTime ||
                        formData.queryCollectEndTime,
                      message: $t(
                        'web.gfuc.please_enter_collection_start_time'
                      ),
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-date-picker
                    v-model="formData.queryCollectStartTime"
                    :placeholder="
                      $t('web.gfuc.please_enter_collection_start_time')
                    "
                    type="datetime"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.collection_end_time')"
                  prop="queryCollectEndTime"
                  :rules="[
                    {
                      required:
                        formData.queryCollectStartTime ||
                        formData.queryCollectEndTime,
                      message: $t('web.gfuc.please_enter_collection_end_time'),
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-date-picker
                    v-model="formData.queryCollectEndTime"
                    :placeholder="
                      $t('web.gfuc.please_enter_collection_end_time')
                    "
                    type="datetime"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24" class="form-actions">
                <el-button type="primary" @click="onNext">{{
                  $t("web.gfuc.next_step")
                }}</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div v-else class="summary-container">
          <div class="flex-col summary-content">
            <p class="text-base">
              {{
                formData.productType === "ECO"
                  ? $t("web.gfuc.express_delivery")
                  : $t("web.gfuc.standard_delivery")
              }}
            </p>
            <div class="radio-group">
              <div class="radio-check">
                <div class="radio-label">{{ formData.productName }}</div>
                <div class="radio-content">
                  {{
                    productList.find(
                      (item) => item.code === formData.productCode
                    )?.desc || t("gfuc.no_data_available")
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="step-placeholder">
        <p>{{ $t("web.gfuc.please_select_product_info") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { getOrderProductList, getProductStepInfo } from "@/api/order";
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();
const appStore = useAppStore();
const props = defineProps({
  stepNumber: {
    type: Number,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["next", "edit", "update:formData"]);

const formRef = ref(null);

const rules = ref({
  productType: [
    { required: true, message: "请选择产品类型", trigger: "change" }
  ],
  productCode: [
    { required: true, message: "请选择增值服务", trigger: "change" }
  ],
  queryCollectStartTime: [
    {
      validator: (rule, value, callback) => {
        if (!value && !formData.value.queryCollectEndTime) {
          callback();
          return;
        }
        if (!value && formData.value.queryCollectEndTime) {
          callback(new Error(t("web.gfuc.please_enter_collection_start_time")));
          return;
        }
        if (value && formData.value.queryCollectEndTime) {
          const startTime = new Date(value);
          const endTime = new Date(formData.value.queryCollectEndTime);
          if (startTime >= endTime) {
            callback(
              new Error(
                t(
                  "web.gfuc.collection_start_time_must_be_earlier_than_end_time"
                )
              )
            );
            return;
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ],
  queryCollectEndTime: [
    {
      validator: (rule, value, callback) => {
        if (!value && !formData.value.queryCollectStartTime) {
          callback();
          return;
        }
        if (!value && formData.value.queryCollectStartTime) {
          callback(new Error(t("web.gfuc.please_enter_collection_end_time")));
          return;
        }
        if (value && formData.value.queryCollectStartTime) {
          const startTime = new Date(formData.value.queryCollectStartTime);
          const endTime = new Date(value);
          if (startTime >= endTime) {
            callback(
              new Error(
                t(
                  "web.gfuc.collection_start_time_must_be_earlier_than_end_time"
                )
              )
            );
            return;
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ]
});

const formData = ref({
  productType: "ECO",
  productCode: "",
  productName: "",
  queryCollectStartTime: "",
  queryCollectEndTime: "",
  ...props.initialData
});

// 监听 initialData 变化，当父组件数据加载完成后更新表单数据
watch(
  () => props.initialData,
  (newInitialData) => {
    if (newInitialData && Object.keys(newInitialData).length > 0) {
      // 合并现有数据和新的初始数据
      Object.assign(formData.value, newInitialData);
    }
  },
  { immediate: true, deep: true }
);

const productList = ref([]);

watch(
  formData,
  (newValue) => {
    emit("update:formData", newValue);
  },
  { deep: true }
);

const handleProductChange = (val) => {
  formData.value.productName =
    productList.value.find((item) => item.code === val)?.name || "";
};

const onNext = () => {
  emit("next");
};

const onClear = () => {
  formData.value = {
    productType: "ECO",
    productCode: "",
    productName: "",
    queryCollectStartTime: "",
    queryCollectEndTime: ""
  };
};

const resetForm = () => {
  onClear();
};

const onEdit = () => {
  emit("edit");
};

const toPascalCase = (str) => {
  return str
    .replace(/[_-](\w)/g, (_, char) => char.toUpperCase())
    .replace(/^\w/, (firstChar) => firstChar.toUpperCase());
};

const getProductList = async (customerId) => {
  const res = await getProductStepInfo({
    country: userStore.userInfo?.country || "",
    customerId: customerId || ""
  });

  const res2 = await getOrderProductList({
    countryCode: userStore.userInfo?.country || ""
  });

  console.log(res, res2, "+++++");

  // res的数据和res2数据对比，然后根据productCode合并数据
  const mergedRes = res.map((item) => ({
    ...item,
    ...res2.find((item2) => item2.code === item.productCode)
  }));

  productList.value = mergedRes.map((item) => ({
    ...item,
    name: item.productName,
    code: item.productCode,
    desc:
      item["description" + toPascalCase(appStore.lang.toLocaleLowerCase())] ||
      t("gfuc.no_data_available")
  }));

  if (productList.value.length === 1) {
    formData.value.productCode = productList.value[0].code;
    formData.value.productName = productList.value[0].name;
  }
};

watch(
  () => props.isActive,
  (value) => {
    if (value) {
      if (sessionStorage.getItem("createOrderCustomerId")) {
        let customerId = sessionStorage.getItem("createOrderCustomerId");
        getProductList(customerId);
      }
    }
  }
);
defineExpose({
  resetForm
});
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

.step-content-form {
  @apply -mt-2;
}

.radio-group {
  @apply flex flex-col w-full  gap-y-3 -mt-4;

  .el-radio,
  .radio-check {
    @apply w-full h-[84px] px-3 border rounded-xl mx-0;

    .radio-label {
      @apply text-base text-[#4E5969] h-5 leading-5;
    }

    .radio-content {
      @apply text-info text-sm h-5 leading-5 mt-1;
    }

    :deep(.el-radio__label) {
      @apply pl-4;
    }
  }
}

.summary-content {
  .radio-group {
    @apply mt-2;

    .radio-check {
      @apply flex flex-col  justify-center;
    }
  }
}
</style>
