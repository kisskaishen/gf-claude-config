<template>
  <div class="pt-5 step-container">
    <div
      class="mr-4 step-left"
      :class="{ 'step-completed': isCompleted, 'step-active': isActive }"
    >
      <div class="step-number">{{ stepNumber }}</div>
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <div class="step-content-header">
        <h3 class="step-content-header-title">包裹信息&其他信息</h3>
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
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="总包裹重 (kg)" prop="orderGoods.weight">
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.weight"
                    :min="0.001"
                    :max="50"
                    placeholder="请填写包裹总重量"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="长(cm)" prop="orderGoods.length">
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.length"
                    :precision="2"
                    :min="1"
                    :max="150"
                    placeholder="请填写包裹长度"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="宽(cm)" prop="orderGoods.width">
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.width"
                    :precision="2"
                    :min="1"
                    :max="150"
                    placeholder="请填写包裹宽度"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="高(cm)" prop="orderGoods.height">
                  <el-input-number
                    :controls="false"
                    v-model="formData.orderGoods.height"
                    :precision="2"
                    :min="1"
                    :max="150"
                    placeholder="请填写包裹高度"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label-width="0" required>
                  <el-table
                    :data="formData.orderItemList"
                    border
                    style="width: 100%"
                    class="goods-table"
                  >
                    <el-table-column
                      prop="itemNameZh"
                      label="商品名称(CN)"
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
                            placeholder="请填写商品名称(CN)"
                            maxlength="60"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="itemNameEn"
                      label="商品名称(EN)"
                      min-width="200"
                    >
                      <template #default="{ row, $index }">
                        <el-form-item
                          :prop="`orderItemList.${$index}.itemNameEn`"
                          :rules="rules.tableItem.itemNameEn"
                          class="table-form-item"
                          required
                        >
                          <el-input
                            v-model="row.itemNameEn"
                            placeholder="请填写商品名称(EN)"
                            maxlength="256"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="itemQty"
                      label="数量"
                      min-width="100"
                    >
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
                            placeholder="数量"
                            :min="1"
                            :max="9999"
                          />
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                      <template #default="{ $index }">
                        <div class="table-actions">
                          <el-button size="small" @click="addGoods" circle>
                            <svg-icon
                              name="order-goods-add"
                              class="step-content-header-icon"
                              width="20"
                              height="20"
                            />
                          </el-button>
                          <el-button
                            size="small"
                            @click="removeGoods($index)"
                            circle
                          >
                            <svg-icon
                              name="order-goods-reduce"
                              class="step-content-header-icon"
                              width="20"
                              height="20"
                            />
                          </el-button>
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

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="申报价值 (EUR)" prop="declaredValue">
                  <el-input-number
                    :controls="false"
                    v-model="formData.declaredValue"
                    :precision="2"
                    :min="0.0"
                    :max="100.0"
                    placeholder="请填写商品总申报价值"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="客户单号" prop="cOrderNo">
                  <el-input
                    v-model="formData.cOrderNo"
                    maxlength="30"
                    placeholder="客户唯一的订单号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="参考单号" prop="referenceNo">
                  <el-input
                    v-model="formData.referenceNo"
                    placeholder="平台参考号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="服务商跟踪号" prop="reference3">
                  <el-input
                    v-model="formData.reference3"
                    placeholder="第三方服务商的跟踪号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="渠道编码" prop="channelCode">
                  <el-input
                    v-model="formData.channelCode"
                    placeholder="第三方服务商的渠道编码"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>

      <div v-else class="step-placeholder">
        <p>请填写包裹信息、重量、材质、品类信息等</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

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

// 自定义校验函数：包裹长宽高总和不超过150
const validateDimensions = (rule, value, callback) => {
  const length = parseFloat(formData.value.orderGoods.length) || 0;
  const width = parseFloat(formData.value.orderGoods.width) || 0;
  const height = parseFloat(formData.value.orderGoods.height) || 0;

  const total = length + width + height;

  if (total > 150) {
    callback(new Error("包裹长宽高总和不能超过150"));
  } else {
    callback();
  }
};

const rules = reactive({
  "orderGoods.weight": [
    { required: true, message: "请输入总包裹重", trigger: ["blur", "change"] }
  ],
  "orderGoods.length": [
    { required: true, message: "请输入包裹长度", trigger: ["blur", "change"] },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  "orderGoods.width": [
    { required: true, message: "请输入包裹宽度", trigger: ["blur", "change"] },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  "orderGoods.height": [
    { required: true, message: "请输入包裹高度", trigger: ["blur", "change"] },
    { validator: validateDimensions, trigger: ["blur", "change"] }
  ],
  tableItem: {
    itemNameEn: [
      {
        required: true,
        message: "请输入商品名称(EN)",
        trigger: ["blur", "change"]
      }
    ],
    itemQty: [
      { required: true, message: "请输入商品数量", trigger: ["blur", "change"] }
    ]
  }
});

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
    reference3: "",
    ...props.initialData
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
defineExpose({
  validate
});
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

.table-actions {
  .el-button {
    border: none;
  }
}

:deep(.el-input-number) {
  width: 100%;

  .el-input__inner {
    text-align: left;
  }
}
</style>
