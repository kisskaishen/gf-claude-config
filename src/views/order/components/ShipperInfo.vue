<template>
  <div class="step-container">
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
            ref="orderShipperRef"
            :model="orderShipper"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row :gutter="20">
              <!-- 成交客户的用户中心登录进去，下单需要选择下单账户
走货账户的用户中心登录进去，隐藏下单账户选择。 -->
              <el-col :span="8" v-if="isCj">
                <el-form-item
                  label="下单账户"
                  prop="customerId"
                  :rules="[
                    {
                      required: isCj,
                      message: '请选择下单账户',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-select
                    v-model="orderShipper.customerId"
                    filterable
                    placeholder="请选择下单账户"
                  >
                    <el-option
                      v-for="item in shipperOptions"
                      :key="item.customerId"
                      :label="item.customerName"
                      :value="item.customerId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="姓名" prop="shipperName">
                  <el-input
                    v-model="orderShipper.shipperName"
                    placeholder="请输入姓名"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="电话号码" prop="shipperPhone">
                  <el-input
                    v-model="orderShipper.shipperPhone"
                    placeholder="请输入电话号码"
                    maxlength="30"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="邮箱"
                  prop="shipperEmail"
                  :rules="[
                    {
                      required: orderShipper.shipperEmail,
                      type: 'email',
                      message: '请输入邮箱',
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                    v-model="orderShipper.shipperEmail"
                    type="email"
                    placeholder="请输入邮箱"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="isCj ? 8 : 16">
                <el-form-item label="详细地址" prop="shipperStreet">
                  <el-input
                    v-model="orderShipper.shipperStreet"
                    placeholder="请输入详细地址"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="邮编" prop="shipperCode">
                  <el-input
                    v-model="orderShipper.shipperCode"
                    placeholder="请输入邮编"
                    minlength="5"
                    maxlength="12"
                    @blur="getAddressByCodeBlur"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区域" prop="shipperArea">
                  <el-input
                    v-model="orderShipper.shipperArea"
                    placeholder="请输入区域"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" prop="shipperCity">
                  <el-input
                    v-model="orderShipper.shipperCity"
                    placeholder="请输入城市"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="州" prop="shipperState">
                  <el-input
                    v-model="orderShipper.shipperState"
                    placeholder="请输入州"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="国家" prop="shipperCountry">
                  <el-input
                    v-model="orderShipper.shipperCountry"
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
              {{ orderShipper.shipperName }}
            </p>
            <p>{{ orderShipper.shipperPhone }}</p>
            <p>{{ orderShipper.shipperEmail }}</p>
            <p>
              {{ orderShipper.shipperArea }}{{ orderShipper.shipperCity
              }}{{ orderShipper.shipperState }}
              {{ orderShipper.shipperCode }}
              {{ orderShipper.shipperCountry }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="step-content-placeholder">
        <p>请填写发件人信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted } from "vue";

import { getAddressByCode } from "@/api/order";
import { useUserStore } from "@/store/user";
const props = defineProps({
  stepNumber: {
    type: Number,
    default: 1
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

const emit = defineEmits(["next", "edit", "update:orderShipper"]);

const orderShipperRef = ref(null);

const userInfo = useUserStore();
// userIdentity 用户身份：1-潜在客户 2-成交客户 3-走货账户
console.log(userInfo.loginInfo?.shipperCustomerList, "====");
const isCj = computed(() =>
  userInfo.userInfo?.userIdentity === 2 ? true : false
);
const shipperOptions = computed(() => {
  return userInfo.loginInfo?.shipperCustomerList || [];
});

const orderShipper = ref({
  customerId: "",
  shipperName: "",
  shipperPhone: "",
  shipperEmail: "",
  shipperArea: "",
  shipperCode: "",
  shipperStreet: "",
  shipperCity: "",
  shipperState: "",
  shipperCountry: "",
  ...props.initialData
});

const rules = reactive({
  shipperName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  shipperCode: [{ required: true, message: "请输入邮政编码", trigger: "blur" }],
  shipperCity: [{ required: true, message: "请选择城市", trigger: "change" }],
  shipperState: [{ required: true, message: "请选择州", trigger: "change" }],
  shipperCountry: [{ required: true, message: "请选择国家", trigger: "change" }]
});

watch(
  orderShipper,
  (newValue) => {
    emit("update:orderShipper", newValue);
  },
  { deep: true }
);

const onNext = () => {
  // 验证表单
  orderShipperRef.value.validate((valid) => {
    if (valid) {
      // 表单验证通过，触发下一步事件
      emit("next");
    }
  });
  // emit("next");
};

const getAddressByCodeBlur = async () => {
  if (orderShipper.value.shipperCode) {
    const res = await getAddressByCode(orderShipper.value.shipperCode);
    console.log(res);
    // if (res?.data === "success") {
    //   orderShipper.value.shipperStreet = res?.data?.address1 || "";
    //   orderShipper.value.shipperCity = res?.data?.city || "";
    //   orderShipper.value.shipperState = res?.data?.state || "";
    //   orderShipper.value.shipperCountry = res?.data?.country || "";
    // }
  }
};

const onClear = () => {
  orderShipper.value = {
    shipperName: "",
    shipperPhone: "",
    shipperEmail: "",
    shipperArea: "",
    shipperCode: "",
    shipperStreet: "",
    shipperCity: "",
    shipperState: "",
    shipperCountry: "",
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
