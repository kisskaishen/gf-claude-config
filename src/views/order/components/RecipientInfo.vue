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
        <h3 class="step-content-header-title">发件人信息</h3>
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
            ref="recipientFormRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="名字" prop="firstName">
                  <el-input
                    v-model="formData.firstName"
                    placeholder="请输入名字"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="姓氏" prop="lastName">
                  <el-input
                    v-model="formData.lastName"
                    placeholder="请输入姓氏"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="电话号码" prop="phone">
                  <el-input
                    v-model="formData.phone"
                    placeholder="请输入电话号码"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="formData.email"
                    type="email"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="地址" prop="address">
                  <el-input
                    v-model="formData.address"
                    placeholder="请输入详细地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="内门牌号" prop="internalNumber">
                  <el-select
                    v-model="formData.internalNumber"
                    placeholder="请选择内门牌号"
                  >
                    <el-option
                      v-for="item in doorNumbers"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="外门牌号" prop="externalNumber">
                  <el-select
                    v-model="formData.externalNumber"
                    placeholder="请选择外门牌号"
                  >
                    <el-option
                      v-for="item in doorNumbers"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="邮编" prop="zipCode">
                  <el-input
                    v-model="formData.zipCode"
                    placeholder="请输入邮编"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="城市" prop="city">
                  <el-select v-model="formData.city" placeholder="请选择城市">
                    <el-option
                      v-for="item in cities"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="州/省" prop="state">
                  <el-select v-model="formData.state" placeholder="请选择州/省">
                    <el-option
                      v-for="item in states"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="国家" prop="country">
                  <el-select
                    v-model="formData.country"
                    placeholder="请选择国家"
                  >
                    <el-option
                      v-for="item in countries"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
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

        <div v-else class="summary-container">
          <div class="summary-content">
            <p>
              {{ formData.firstName }}
              {{ formData.lastName }}
            </p>
            <p>{{ formData.phone }}</p>
            <p>{{ formData.email || "-" }}</p>
            <p>
              {{ formData.address }}{{ formData.city }}{{ formData.state }}
              {{ formData.zipCode }}
              {{ formData.country }}
            </p>
            <p>
              {{ formData.internalNumber || "-" }}
              {{ formData.externalNumber || "-" }}
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

const emit = defineEmits(["next", "edit", "update:formData"]);

const recipientFormRef = ref(null);
const formData = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  internalNumber: "",
  externalNumber: "",
  zipCode: "",
  city: "",
  state: "",
  country: "",
  ...props.initialData
});

const rules = reactive({
  firstName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  lastName: [{ required: true, message: "请输入姓氏", trigger: "blur" }],
  phone: [{ required: true, message: "请输入电话", trigger: "blur" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  zipCode: [{ required: true, message: "请输入邮政编码", trigger: "blur" }],
  city: [{ required: true, message: "请选择城市", trigger: "change" }],
  state: [{ required: true, message: "请选择州/省", trigger: "change" }],
  country: [{ required: true, message: "请选择国家", trigger: "change" }]
});

// 模拟数据
const doorNumbers = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" }
];

const cities = [
  { label: "城市1", value: "city1" },
  { label: "城市2", value: "city2" }
];

const states = [
  { label: "州1", value: "state1" },
  { label: "州2", value: "state2" }
];

const countries = [
  { label: "中国", value: "China" },
  { label: "美国", value: "USA" },
  { label: "法国", value: "France" },
  { label: "意大利", value: "Italy" },
  { label: "荷兰", value: "Netherlands" }
];

watch(
  formData,
  (newValue) => {
    emit("update:formData", newValue);
  },
  { deep: true }
);

const onNext = () => {
  // recipientFormRef.value.validate().then(() => {
  //   emit("next");
  // });
  emit("next");
};

const onClear = () => {
  formData.value = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    internalNumber: "",
    externalNumber: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
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
