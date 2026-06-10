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
        <h3 class="step-content-header-title">
          {{ $t("web.gfuc.shipper_info") }}
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
          v-if="!isActive"
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
            require-asterisk-position="right"
          >
            <el-row :gutter="12">
              <!-- 成交客户的用户中心登录进去，下单需要选择下单账户
走货账户的用户中心登录进去，隐藏下单账户选择。 -->
              <el-col :span="8" v-if="isMoreCustomer">
                <el-form-item
                  :label="$t('web.gfuc.order_account')"
                  prop="customerId"
                  :rules="[
                    {
                      required: isMoreCustomer,
                      message: $t('web.gfuc.please_select_order_account'),
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-select
                    v-model="orderShipper.customerId"
                    filterable
                    :placeholder="$t('web.gfuc.please_select_order_account')"
                    @change="handleCustomerChange"
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
                <el-form-item :label="$t('web.gfuc.name')" prop="shipperName">
                  <el-dropdown
                    trigger="hover"
                    max-height="300px"
                    style="width: 100%"
                    @command="shipperNameChange"
                  >
                    <el-input
                      v-model="orderShipper.shipperName"
                      :placeholder="$t('web.gfuc.please_enter_name')"
                      maxlength="100"
                      filterable
                      allow-create
                      clearable
                      style="width: 100%"
                    />
                    <template #dropdown v-if="shipperNameList.length > 0">
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="item in shipperNameList"
                          :key="item.id"
                          :command="item.shipperName"
                        >
                          <div class="shipperNameOption">
                            <span
                              class="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis"
                              >{{ item.shipperName }}</span
                            >
                            <span
                              class="text-xs text-info w-[300px] overflow-hidden whitespace-nowrap text-ellipsis text-right"
                            >
                              {{ item.shipperStreet }}
                            </span>
                          </div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <!-- <el-select
                    v-model="orderShipper.shipperName"
                    :placeholder="$t('web.gfuc.please_enter_name')"
                    maxlength="100"
                    filterable
                    allow-create
                    clearable
                    @change="shipperNameChange"
                  >
                    <el-option
                      v-for="item in shipperNameList"
                      :key="item.id"
                      :label="item.shipperName"
                      :value="item.shipperName"
                    >
                      
                    </el-option>
                  </el-select> -->
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.phone')" prop="shipperPhone">
                  <el-input
                    v-model="orderShipper.shipperPhone"
                    :placeholder="$t('web.gfuc.please_enter_phone')"
                    maxlength="14"
                    minlength="8"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.email')"
                  prop="shipperEmail"
                  :rules="[
                    {
                      required: orderShipper.shipperEmail,
                      message: $t('web.gfuc.please_enter_email'),
                      trigger: 'blur'
                    },
                    {
                      type: 'email',
                      message: $t('gfuc.please_enter_correct_email_format'),
                      trigger: 'blur'
                    }
                  ]"
                >
                  <el-input
                    v-model="orderShipper.shipperEmail"
                    type="email"
                    :placeholder="$t('web.gfuc.please_enter_email')"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="isMoreCustomer ? 8 : 16">
                <el-form-item
                  :label="t('web.gfuc.address')"
                  prop="shipperStreet"
                >
                  <el-input
                    v-model="orderShipper.shipperStreet"
                    :placeholder="$t('web.gfuc.please_enter_address')"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.postal_code')"
                  prop="shipperCode"
                >
                  <el-input
                    v-model="orderShipper.shipperCode"
                    :placeholder="$t('web.gfuc.please_enter_postal_code')"
                    minlength="5"
                    maxlength="12"
                    @blur="getAddressByCodeBlur"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.area')" prop="shipperArea">
                  <el-input
                    v-model="orderShipper.shipperArea"
                    :placeholder="$t('web.gfuc.please_enter_area')"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.city')" prop="shipperCity">
                  <el-input
                    v-model="orderShipper.shipperCity"
                    :placeholder="$t('web.gfuc.please_enter_city')"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.state')" prop="shipperState">
                  <el-input
                    v-model="orderShipper.shipperState"
                    :placeholder="$t('web.gfuc.please_enter_state')"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.country')"
                  prop="shipperCountry"
                >
                  <el-select
                    v-model="orderShipper.shipperCountry"
                    filterable
                    :placeholder="$t('web.gfuc.please_enter_country')"
                    maxlength="20"
                  >
                    <el-option
                      v-for="item in countryList.options.value"
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
                <el-button type="primary" @click="onNext">
                  {{ $t("web.gfuc.next_step") }}
                </el-button>
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
              {{ shipperAddress(orderShipper) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="step-content-placeholder" @click="onEdit">
        <p>{{ $t("web.gfuc.please_enter_shipper_info") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted } from "vue";

import { getAddressByCode, getSenderName } from "@/api/order";
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";
import { useI18n } from "vue-i18n";
import { useDict } from "@/hooks/useDict";

const { t } = useI18n();

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

const emit = defineEmits([
  "next",
  "edit",
  "update:orderShipper",
  "update:isChange"
]);

const orderShipperRef = ref(null);

const userInfo = useUserStore();
const appStore = useAppStore();

// userIdentity 用户身份：1-潜在客户 2-成交客户 3-走货账户
// const isMoreCustomer = computed(() =>
//   userInfo.userInfo?.userIdentity === 2 ? true : false
// );
const isMoreCustomer = computed(
  () => userInfo.loginInfo?.shipperCustomerList?.length > 1
);
const shipperOptions = computed(() => {
  return userInfo.loginInfo?.shipperCustomerList || [];
});
const countryList = useDict("gfuc.send.country");

const lang = computed(() => appStore.lang);

watch(
  () => lang.value,
  (val) => {
    countryList.refresh();
  }
);

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

// 监听 initialData 变化，当父组件数据加载完成后更新表单数据
watch(
  () => props.initialData,
  (newInitialData) => {
    if (newInitialData && Object.keys(newInitialData).length > 0) {
      // 合并现有数据和新的初始数据
      Object.assign(orderShipper.value, newInitialData);
      // 立即同步数据到父组件
      emit("update:orderShipper", orderShipper.value);
    }
  },
  { immediate: true, deep: true }
);

// 组件挂载时立即同步数据到父组件
onMounted(() => {
  if (Object.keys(orderShipper.value).length > 0) {
    emit("update:orderShipper", orderShipper.value);
  }
});

const rules = computed(() => ({
  shipperName: [
    {
      required: true,
      message: t("web.gfuc.please_enter_name"),
      trigger: ["blur", "change"]
    }
  ],
  shipperPhone: [
    {
      required: true,
      message: t("web.gfuc.please_enter_phone"),

      trigger: "blur"
    },
    {
      min: 8,
      max: 14,
      message: t("web.gfuc.phone_length"),
      trigger: "blur"
    }
  ],
  shipperCode: [
    {
      required: true,
      message: t("web.gfuc.please_enter_postal_code"),
      trigger: "blur"
    }
  ],
  shipperStreet: [
    {
      required: true,
      message: t("web.gfuc.please_enter_address"),
      trigger: "blur"
    }
  ],
  shipperCity: [
    {
      required: true,
      message: t("web.gfuc.please_enter_city"),
      trigger: "change"
    }
  ],
  shipperState: [
    {
      required: true,
      message: t("web.gfuc.please_enter_state"),
      trigger: "change"
    }
  ],
  shipperCountry: [
    {
      required: true,
      message: t("web.gfuc.please_enter_country"),
      trigger: "change"
    }
  ]
}));

watch(
  orderShipper,
  (newValue) => {
    emit("update:orderShipper", newValue);
  },
  { deep: true }
);

// 法国：地址1，邮编，区域，城市，洲，国家
// 意大利：地址1，邮编，区域，城市，国家
// 荷兰：地址1邮编，区域，城市，洲，国家
const shipperAddress = (obj) => {
  if (obj?.shipperCountry !== "ZH") {
    return [
      obj?.shipperStreet,
      obj?.shipperCode,
      obj?.shipperArea,
      obj?.shipperCity,
      obj?.shipperState,
      countryList.options.value.find(
        (item) => item.value === obj.shipperCountry
      )?.label
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else {
    return [
      countryList.options.value.find(
        (item) => item.value === obj.shipperCountry
      )?.label,
      obj?.shipperState,
      obj?.shipperCity,
      obj?.shipperArea,
      obj?.shipperStreet,
      obj?.shipperCode
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  }
};

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

// 获取发件人姓名列表
const shipperNameList = ref([]);
const getSenderNameList = async () => {
  if (orderShipper.value.customerId) {
    const res = await getSenderName({
      customerId:
        shipperOptions.value.length > 0
          ? orderShipper.value.customerId
          : shipperOptions.value[0]?.customerId || ""
    });
    shipperNameList.value = res;
  }
};

watch(
  () => shipperOptions.value,
  (val) => {
    if (val.length === 1) {
      orderShipper.value.customerId = val[0]?.customerId || "";
      getSenderNameList();
    }
  },
  {
    immediate: true
  }
);

watch(
  () => orderShipper.value.customerId,
  (newCustomerId) => {
    if (newCustomerId) {
      getSenderNameList();
    }
  }
);

const shipperNameChange = (val) => {
  orderShipper.value.shipperName = val;

  const selected = shipperNameList.value.find(
    (item) => item.shipperName === val
  );
  if (selected) {
    orderShipper.value.shipperPhone = selected.shipperPhone || "";
    orderShipper.value.shipperEmail = selected.shipperEmail || "";
    orderShipper.value.shipperArea = selected.shipperArea || "";
    orderShipper.value.shipperCity = selected.shipperCity || "";
    orderShipper.value.shipperState = selected.shipperState || "";
    orderShipper.value.shipperCountry = selected.shipperCountry || "";
    orderShipper.value.shipperCode = selected.shipperCode || "";
    orderShipper.value.shipperStreet = selected.shipperStreet || "";
  }
};

const getAddressByCodeBlur = async () => {
  if (orderShipper.value.shipperCode) {
    const res = await getAddressByCode(orderShipper.value.shipperCode);
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
    customerId: "",
    shipperName: "",
    shipperPhone: "",
    shipperEmail: "",
    shipperArea: "",
    shipperCode: "",
    shipperStreet: "",
    shipperCity: "",
    shipperState: "",
    shipperCountry: ""
  };
};

const handleCustomerChange = (val) => {
  orderShipper.value.customerId = val;
  sessionStorage.setItem("createOrderCustomerId", val);
  emit("update:isChange", true);
};

const onEdit = () => {
  emit("edit");
};
const resetForm = () => {
  onClear();
};

defineExpose({
  resetForm
});
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";

.shipperNameOption {
  @apply flex justify-between w-full;
}

.el-dropdown-menu__item {
  width: 100%;
}
</style>
