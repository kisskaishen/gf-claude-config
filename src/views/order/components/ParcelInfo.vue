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
          {{ $t("web.gfuc.parcel_info") }}
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
        <div v-if="isActive || isCompleted" class="form-container">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item
                  :label="$t('web.gfuc.total_parcel_weight')"
                  prop="orderGoods.weight"
                >
                  <el-input
                    v-model="formData.orderGoods.weight"
                    :placeholder="
                      $t('web.gfuc.total_parcel_weight_placeholder')
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  :label="$t('web.gfuc.parcel_length')"
                  prop="orderGoods.length"
                >
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.length"
                    :precision="2"
                    :placeholder="$t('web.gfuc.parcel_length_placeholder')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  :label="$t('web.gfuc.parcel_width')"
                  prop="orderGoods.width"
                >
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.width"
                    :precision="2"
                    :placeholder="$t('web.gfuc.parcel_width_placeholder')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  :label="$t('web.gfuc.parcel_height')"
                  prop="orderGoods.height"
                >
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.height"
                    :precision="2"
                    :placeholder="$t('web.gfuc.parcel_height_placeholder')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col
                :span="24"
                class="flex justify-between w-full"
                style="min-width: 0"
              >
                <el-form-item label-width="0" required class="w-full">
                  <el-table
                    :data="formData.orderItemList"
                    border
                    :style="{ width: tableWidth, minWidth: 0 }"
                    class="goods-table"
                  >
                    <el-table-column
                      prop="itemNameZh"
                      :label="$t('web.gfuc.product_name_cn')"
                      min-width="150"
                    >
                      <template #default="{ row, $index }">
                        <el-form-item
                          :prop="`orderItemList.${$index}.itemNameZh`"
                          :rules="rules.tableItem.itemNameZh"
                          class="table-form-item"
                        >
                          <el-input
                            v-model="row.itemNameZh"
                            :placeholder="$t('web.gfuc.enter_product_name_cn')"
                            maxlength="60"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="itemNameEn" min-width="200">
                      <template #header>
                        <span class="text-[#ff0014] mr-1">*</span>
                        <span> {{ $t("web.gfuc.product_name_en") }}</span>
                      </template>
                      <template #default="{ row, $index }">
                        <el-form-item
                          :prop="`orderItemList.${$index}.itemNameEn`"
                          :rules="rules.tableItem.itemNameEn"
                          class="table-form-item"
                          required
                        >
                          <el-input
                            v-model="row.itemNameEn"
                            :placeholder="$t('web.gfuc.enter_product_name_en')"
                            maxlength="256"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="itemQty"
                      :label="$t('web.gfuc.quantity')"
                      min-width="100"
                    >
                      <template #header>
                        <span class="text-[#ff0014] mr-1">*</span>
                        <span> {{ $t("web.gfuc.quantity") }}</span>
                      </template>
                      <template #default="{ row, $index }">
                        <el-form-item
                          :prop="`orderItemList.${$index}.itemQty`"
                          :rules="rules.tableItem.itemQty"
                          class="table-form-item"
                          required
                        >
                          <el-input-number
                            :controls="false"
                            v-model="row.itemQty"
                            :placeholder="$t('web.gfuc.enter_product_quantity')"
                            :min="1"
                            :max="9999"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      :label="$t('web.gfuc.actions')"
                      width="120"
                      fixed="right"
                    >
                      <template #default="{ $index }">
                        <div class="flex items-center table-actions">
                          <svg-icon
                            name="order-goods-add"
                            class="mr-2 cursor-pointer step-content-header-icon"
                            width="24"
                            height="24"
                            @click="addGoods"
                          />

                          <svg-icon
                            name="order-goods-reduce"
                            class="cursor-pointer step-content-header-icon"
                            width="24"
                            height="24"
                            @click="removeGoods($index)"
                          />
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- <div class="goods-table-tips">
                  <span>最多可添加5个商品</span>
                </div> -->
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item
                  :label="$t('web.gfuc.declared_value')"
                  prop="declaredValue"
                >
                  <el-input-number
                    :controls="false"
                    v-model="formData.declaredValue"
                    :precision="2"
                    :min="0.0"
                    :max="100.0"
                    :placeholder="$t('web.gfuc.enter_total_declared_value')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.customer_order_no')"
                  prop="cOrderNo"
                >
                  <el-input
                    v-model="formData.cOrderNo"
                    maxlength="30"
                    :placeholder="$t('web.gfuc.unique_customer_order_no')"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.reference_no')"
                  prop="referenceNo"
                >
                  <el-input
                    v-model="formData.referenceNo"
                    :placeholder="$t('web.gfuc.platform_reference_no')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.service_provider_tracking_no')"
                  prop="reference3"
                >
                  <el-input
                    v-model="formData.reference3"
                    :placeholder="$t('web.gfuc.service_provider_tracking_no')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.channel_code')"
                  prop="channelCode"
                >
                  <el-input
                    v-model="formData.channelCode"
                    :placeholder="$t('web.gfuc.enter_channel_code')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- <div v-else class="summary-container" @click="onEdit">
          <div class="summary-content">
            这里预览的逻辑先不写，因为第四步确实还没有完成呢
          </div>
        </div> -->
      </div>

      <div v-else class="step-placeholder">
        <p>{{ $t("web.gfuc.fill_parcel_info") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
const { t } = useI18n();
const route = useRoute();
const props = defineProps({
  stepNumber: {
    type: Number,
    default: 4
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

const emit = defineEmits(["edit", "submit", "update:formData"]);

const formRef = ref(null);

const formData = ref({
  orderGoods: {
    weight: undefined,
    length: undefined,
    width: undefined,
    height: undefined
  },
  orderItemList: [
    {
      itemNameZh: "",
      itemNameEn: "",
      itemQty: undefined
    }
  ],
  declaredValue: undefined,
  cOrderNo: "",
  referenceNo: "",
  reference3: "",
  channelCode: "",
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

// 自定义校验函数：包裹长宽高总和不超过150,且每个维度不能小于1不能超过150
// 自定义校验函数：包裹长宽高校验
const validateDimensions = (rule, value, callback) => {
  const numValue = parseFloat(value) || 0;

  // 校验单个维度范围：1-150
  if (numValue < 1 || numValue > 150) {
    callback(new Error(t("web.gfuc.dimension_range")));
    return;
  }

  // 校验长宽高总和不超过150
  const length = parseFloat(formData.value.orderGoods.length) || 0;
  const width = parseFloat(formData.value.orderGoods.width) || 0;
  const height = parseFloat(formData.value.orderGoods.height) || 0;
  const total = length + width + height;

  if (total > 150) {
    callback(new Error(t("web.gfuc.total_range")));
  } else {
    callback();
  }
};

const isEdit = computed(() => !!route.params?.orderId);

const validateWeight = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t("web.gfuc.enter_parcel_weight")));
  } else if (value < 0.001 || value > 50) {
    callback(new Error(t("web.gfuc.weight_range")));
  } else {
    callback();
  }
};

const rules = computed(() => ({
  declaredValue: [
    {
      required: true,
      message: t("web.gfuc.enter_total_declared_value"),
      trigger: ["blur", "change"]
    }
  ],
  "orderGoods.weight": [
    {
      required: true,
      validator: validateWeight,
      trigger: ["blur", "change"]
    }
  ],
  "orderGoods.length": [
    {
      required: true,
      message: t("web.gfuc.enter_parcel_length"),
      trigger: ["blur", "change"]
    },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  "orderGoods.width": [
    {
      required: true,
      message: t("web.gfuc.enter_parcel_width"),
      trigger: ["blur", "change"]
    },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  "orderGoods.height": [
    {
      required: true,
      message: t("web.gfuc.enter_parcel_height"),
      trigger: ["blur", "change"]
    },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  tableItem: {
    itemNameEn: [
      {
        required: true,
        message: t("web.gfuc.enter_product_name_en"),
        trigger: ["blur", "change"]
      }
    ],
    itemQty: [
      {
        required: true,
        message: t("web.gfuc.enter_product_quantity"),
        trigger: ["blur", "change"]
      }
    ]
  }
}));

watch(
  formData,
  (newValue) => {
    emit("update:formData", newValue);
  },
  { deep: true }
);

const addGoods = () => {
  if (formData.value.orderItemList.length < 5) {
    formData.value.orderItemList.push({
      itemNameZh: "",
      itemNameEn: "",
      itemQty: undefined
    });
  }
};

const removeGoods = (index) => {
  if (formData.value.orderItemList.length > 1) {
    formData.value.orderItemList.splice(index, 1);
  }
};

const tableWidth = ref("100%");

// 监听窗口大小变化
onMounted(() => {
  const updateTableWidth = () => {
    const container = document.querySelector(".step-content");
    if (container) {
      tableWidth.value = `${container.clientWidth - 48}px`;
    }
  };

  window.addEventListener("resize", updateTableWidth);
  updateTableWidth();
});

const onClear = () => {
  formData.value = {
    orderGoods: {
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined
    },
    orderItemList: [
      {
        itemNameZh: "",
        itemNameEn: "",
        itemQty: undefined
      }
    ],
    declaredValue: undefined,
    cOrderNo: "",
    referenceNo: "",
    reference3: ""
  };
};

const onEdit = () => {
  emit("edit");
};

const validate = () => {
  return new Promise((resolve) => {
    formRef.value.validate((valid) => {
      resolve(valid);
    });
  });
};

const resetForm = () => {
  onClear();
};
defineExpose({
  validate,
  resetForm
});
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

.table-actions {
}

:deep(.el-input-number) {
  width: 100%;

  .el-input__inner {
    text-align: left;
  }
}
</style>
