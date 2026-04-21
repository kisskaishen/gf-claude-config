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
        <h3 class="step-content-header-title">收件人信息</h3>
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
            ref="consigneeFormRef"
            :model="orderConsignee"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="名字" prop="consigneeName">
                  <el-input
                    v-model="orderConsignee.consigneeName"
                    placeholder="请输入名字"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="电话号码" prop="consigneePhone">
                  <el-input
                    v-model="orderConsignee.consigneePhone"
                    placeholder="请输入电话号码"
                    maxlength="30"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="邮箱"
                  prop="consigneeEmail"
                  :rules="[
                    {
                      required: orderConsignee.consigneeEmail,
                      message: '请输入邮箱',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                    v-model="orderConsignee.consigneeEmail"
                    type="email"
                    placeholder="请输入邮箱"
                    maxlength="70"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="地址1" prop="address1">
                  <el-input
                    v-model="orderConsignee.address1"
                    placeholder="请输入详细地址"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="地址2" prop="address2">
                  <el-input
                    v-model="orderConsignee.address2"
                    placeholder="请输入详细地址"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="地址3" prop="address3">
                  <el-input
                    v-model="orderConsignee.address3"
                    placeholder="请输入详细地址"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="内门牌号" prop="internalNumber">
                  <el-input
                    v-model="orderConsignee.internalNumber"
                    placeholder="请输入内门牌号"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="外门牌号" prop="externalNumber">
                  <el-input
                    v-model="orderConsignee.externalNumber"
                    placeholder="请输入外门牌号"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="邮编" prop="consigneeCode">
                  <el-input
                    v-model="orderConsignee.consigneeCode"
                    placeholder="请输入邮编"
                    @input="handleZipCodeInput"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="城市" prop="consigneeCity">
                  <el-input
                    v-model="orderConsignee.consigneeCity"
                    placeholder="请输入城市"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="州/省" prop="consigneeState">
                  <el-input
                    v-model="orderConsignee.consigneeState"
                    placeholder="请输入州/省"
                    maxlength="35"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <!-- 国家默认显示当时配置站点的国家不允许更改。 -->
                <el-form-item label="国家" prop="consigneeCountry">
                  <el-input
                    v-model="orderConsignee.consigneeCountry"
                    placeholder="请输入国家"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24" class="form-actions">
                <el-button type="primary" @click="onNext">下一步</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div v-else class="summary-container" @click="onEdit">
          <div class="summary-content">
            <p>
              {{ orderConsignee.consigneeName }}
            </p>
            <p>{{ orderConsignee.consigneePhone }}</p>
            <p>{{ orderConsignee.consigneeEmail }}</p>
            <p>
              {{ orderConsignee.address1 }}{{ orderConsignee.consigneeCity
              }}{{ orderConsignee.consigneeState }}
              {{ orderConsignee.consigneeCountry }}
            </p>
            <p>
              {{ orderConsignee.internalNumber }}
              {{ orderConsignee.externalNumber }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="step-placeholder">
        <p>请填写包裹的收件人信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Edit } from "@element-plus/icons-vue";

const props = defineProps({
  stepNumber: {
    type: Number,
    default: 2
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

const emit = defineEmits(["next", "edit", "update:orderConsignee"]);

const consigneeFormRef = ref(null);
const orderConsignee = ref({
  consigneeName: "",
  consigneePhone: "",
  consigneeEmail: "",
  address1: "",
  internalNumber: "",
  externalNumber: "",
  consigneeCode: "",
  consigneeCity: "",
  consigneeState: "",
  consigneeCountry: "",
  ...props.initialData
});

const rules = reactive({
  consigneeName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  address1: [{ required: true, message: "请输入地址", trigger: "blur" }],
  consigneeCode: [
    { required: true, message: "请输入邮政编码", trigger: "blur" }
  ],
  consigneeCity: [{ required: true, message: "请选择城市", trigger: "change" }],
  consigneeCountry: [
    { required: true, message: "请选择国家", trigger: "change" }
  ]
});

watch(
  orderConsignee,
  (newValue) => {
    emit("update:orderConsignee", newValue);
  },
  { deep: true }
);

const handleZipCodeInput = (val) => {
  // orderConsignee.value.consigneeCode = val.replace(/\D/g, "");
  // 填写邮编，带出省市区，支持编辑。
};

const onNext = () => {
  // consigneeFormRef.value.validate().then(() => {
  //   emit("next");
  // });
  emit("next");
};

const onClear = () => {
  orderConsignee.value = {
    consigneeName: "",
    consigneePhone: "",
    consigneeEmail: "",
    address1: "",
    internalNumber: "",
    externalNumber: "",
    consigneeCode: "",
    consigneeCity: "",
    consigneeState: "",
    consigneeCountry: "",
    ...props.initialData
  };
};

const onEdit = () => {
  emit("edit");
};
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";
</style>
