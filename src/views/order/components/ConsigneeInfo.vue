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
          {{ $t("web.gfuc.consignee_info_title") }}
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
            ref="consigneeFormRef"
            :model="orderConsignee"
            :rules="rules"
            label-width="80px"
            label-position="top"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.name')" prop="consigneeName">
                  <el-input
                    v-model="orderConsignee.consigneeName"
                    :placeholder="$t('web.gfuc.please_enter_name')"
                    maxlength="100"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.phone')"
                  prop="consigneePhone"
                >
                  <el-input
                    v-model="orderConsignee.consigneePhone"
                    :placeholder="$t('web.gfuc.please_enter_phone')"
                    maxlength="30"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.email')"
                  prop="consigneeEmail"
                  :rules="[
                    {
                      required: orderConsignee.consigneeEmail,
                      message: $t('web.gfuc.email_format_incorrect'),
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
                    v-model="orderConsignee.consigneeEmail"
                    type="email"
                    :placeholder="$t('web.gfuc.please_enter_email')"
                    maxlength="70"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.address')" prop="address1">
                  <el-input
                    v-model="orderConsignee.address1"
                    :placeholder="$t('web.gfuc.please_enter_address')"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item prop="address2">
                  <template #label>
                    <div class="flex items-center gap-1">
                      {{ $t("web.gfuc.address2") }}
                      <el-tooltip
                        :content="$t('web.gfuc.address2_tip' /** 补充地址1 **/)"
                        placement="top"
                      >
                        <el-icon class="tip-icon">
                          <svg-icon name="question" />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>

                  <el-input
                    v-model="orderConsignee.address2"
                    :placeholder="$t('web.gfuc.please_enter_address')"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item prop="address3">
                  <template #label>
                    <div class="flex items-center gap-1">
                      {{ $t("web.gfuc.address3") }}
                      <el-tooltip
                        :content="$t('web.gfuc.address3_tip' /** 补充地址2 **/)"
                        placement="top"
                      >
                        <el-icon class="tip-icon">
                          <svg-icon name="question" />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </template>
                  <el-input
                    v-model="orderConsignee.address3"
                    :placeholder="$t('web.gfuc.please_enter_address')"
                    maxlength="255"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.internal_number')"
                  prop="consigneeNumIn"
                >
                  <el-input
                    v-model="orderConsignee.consigneeNumIn"
                    :placeholder="$t('web.gfuc.internal_number_placeholder')"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.external_number')"
                  prop="consigneeNumExt"
                >
                  <el-input
                    v-model="orderConsignee.consigneeNumExt"
                    :placeholder="$t('web.gfuc.external_number_placeholder')"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.postal_code' /** 邮编 **/)"
                  prop="consigneeCode"
                >
                  <el-input
                    v-model="orderConsignee.consigneeCode"
                    :placeholder="$t('web.gfuc.please_enter_postal_code')"
                    @blur="handleZipCodeInput"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.area')" prop="consigneeArea">
                  <el-select
                    v-model="orderConsignee.consigneeArea"
                    :placeholder="$t('web.gfuc.please_enter_area')"
                    maxlength="50"
                    filterable
                  >
                    <!-- <el-option
                      v-for="area in areas"
                      :key="area"
                      :label="area"
                      :value="area"
                    /> -->
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('web.gfuc.city')" prop="consigneeCity">
                  <el-select
                    v-model="orderConsignee.consigneeCity"
                    :placeholder="$t('web.gfuc.please_enter_city')"
                    maxlength="50"
                    filterable
                    @change="handleCityChange"
                  >
                    <el-option
                      v-for="city in cities"
                      :key="city.id"
                      :label="city.cityName"
                      :value="city.cityName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('web.gfuc.state')"
                  prop="consigneeState"
                >
                  <el-select
                    v-model="orderConsignee.consigneeState"
                    :placeholder="$t('web.gfuc.please_enter_state')"
                    maxlength="35"
                    filterable
                    @change="handleStateChange"
                  >
                    <el-option
                      v-for="state in states"
                      :key="state.id"
                      :label="state.state_name"
                      :value="state.state_name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <!-- 国家默认显示当时配置站点的国家不允许更改。 -->
                <el-form-item
                  :label="$t('web.gfuc.country')"
                  prop="consigneeCountry"
                >
                  <el-input
                    v-model="orderConsignee.consigneeCountry"
                    :placeholder="$t('web.gfuc.please_enter_country')"
                    maxlength="20"
                    disabled
                  />
                </el-form-item>
              </el-col>

              <el-col :span="16">
                <el-form-item :label="$t('web.gfuc.remark')" prop="remarks">
                  <el-input
                    v-model="orderConsignee.remarks"
                    :placeholder="$t('web.gfuc.please_enter')"
                    maxlength="100"
                  />
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
              {{ orderConsignee.consigneeName }}
            </p>
            <p>{{ orderConsignee.consigneePhone }}</p>
            <p>{{ orderConsignee.consigneeEmail }}</p>
            <p>
              {{ consigneeAddress(orderConsignee) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="step-placeholder">
        <p>{{ $t("web.gfuc.consignee_info_placeholder") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Edit } from "@element-plus/icons-vue";
import {
  getAddressByCode,
  getListCityBySid,
  getStateList,
  getPostcodeByCity
} from "@/api/order";
import { useUserStore } from "@/store/user";
import { useAppStore } from "@/store/app";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const appStore = useAppStore();

const userStore = useUserStore();

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

const states = ref([]);

const cities = ref([]);

const areas = ref([]);

const consigneeFormRef = ref(null);
const orderConsignee = ref({
  consigneeName: "",
  consigneePhone: "",
  consigneeEmail: "",
  address1: "",
  address2: "",
  address3: "",
  consigneeNumIn: "",
  consigneeNumExt: "",
  consigneeCode: "",
  consigneeArea: "",
  consigneeCity: "",
  consigneeState: "",
  consigneeCountry: appStore.site,
  remarks: "",
  ...props.initialData
});
const site = computed(() => {
  return appStore.site || "";
});
watch(
  () => site.value,
  (newSite) => {
    orderConsignee.value.consigneeCountry = newSite;
  }
);

// 监听 initialData 变化，当父组件数据加载完成后更新表单数据
watch(
  () => props.initialData,
  (newInitialData) => {
    if (newInitialData && Object.keys(newInitialData).length > 0) {
      // 合并现有数据和新的初始数据
      Object.assign(orderConsignee.value, newInitialData);
    }
  },
  { immediate: true, deep: true }
);

const rules = computed(() => ({
  consigneeName: [
    {
      required: true,
      message: t("web.gfuc.please_enter_name"),
      trigger: "blur"
    }
  ],
  consigneePhone: [
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
  address1: [
    {
      required: true,
      message: t("web.gfuc.please_enter_address"),
      trigger: "blur"
    }
  ],
  consigneeCode: [
    {
      required: true,
      message: t("web.gfuc.please_enter_postal_code"),
      trigger: "blur"
    }
  ],
  consigneeCity: [
    {
      required: true,
      message: t("web.gfuc.please_enter_city"),
      trigger: "change"
    }
  ],
  consigneeCountry: [
    {
      required: true,
      message: t("web.gfuc.please_enter_country"),
      trigger: "change"
    }
  ]
}));

watch(
  orderConsignee,
  (newValue) => {
    emit("update:orderConsignee", newValue);
  },
  { deep: true }
);

const handleZipCodeInput = () => {
  if (!orderConsignee.value.consigneeCode) {
    return;
  }
  // 填写邮编，带出省市区，支持编辑。
  getAddressByCode({ postcode: orderConsignee.value.consigneeCode }).then(
    (res) => {
      // getStateListData();
      if (!res?.city?.stateId) {
        return;
      }
      // getCityListData(res?.city?.stateId);

      setTimeout(() => {
        orderConsignee.value.consigneeCity = res.city?.cityName || "";

        orderConsignee.value.consigneeState = res.state?.stateName || "";
      }, 300);
    }
  );
};

const onNext = () => {
  consigneeFormRef.value.validate().then(() => {
    emit("next");
  });
};

const onClear = () => {
  orderConsignee.value = {
    consigneeName: "",
    consigneePhone: "",
    consigneeEmail: "",
    address1: "",
    address2: "",
    address3: "",
    consigneeNumIn: "",
    consigneeNumExt: "",
    consigneeCode: "",
    consigneeArea: "",
    consigneeCity: "",
    consigneeState: "",
    consigneeCountry: appStore.site || "",
    remarks: ""
  };
};

const resetForm = () => {
  onClear();
};

const onEdit = () => {
  emit("edit");
};

// 获取州/省列表
const getStateListData = () => {
  getStateList().then((res) => {
    states.value = res || [];
    if (orderConsignee.value.consigneeState) {
      let stateId = states.value.find(
        (item) => item.state_name === orderConsignee.value.consigneeState
      )?.id;

      getCityListData(stateId);
    }
  });
};
getStateListData();

// 城市列表
const getCityListData = (stateId) => {
  getListCityBySid({ stateId }).then((res) => {
    cities.value = res || [];
  });
};

// 根据城市获取邮编
const handleCityChange = async (val) => {
  let cityId = cities.value.find((item) => item.cityName === val)?.id;

  const res = await getPostcodeByCity({
    cityId
  });
  console.log(res, "=====");
};

const handleStateChange = async (val) => {
  let stateId = states.value.find((item) => item.state_name === val)?.id;

  orderConsignee.value.consigneeCity = "";
  orderConsignee.value.consigneeCode = "";

  await getCityListData(stateId);
};

// 法国：外门牌 地址1，地址2，地址3，内门牌，邮编，区域，城市，洲，国家
// 意大利：地址1，外门牌，内门牌， 地址2，地址3，邮编，区域，城市，国家
// 荷兰：地址1，地址2，地址3，外门牌，内门牌，邮编，区域，城市，洲，国家
const consigneeAddress = (obj) => {
  if (obj?.consigneeCountry === "FR") {
    return [
      obj?.consigneeNumExt,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else if (obj?.consigneeCountry === "IT") {
    return [
      obj?.address1,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.address2,
      obj?.address3,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else if (obj?.consigneeCountry === "NL") {
    return [
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  } else {
    return [
      obj?.consigneeCountry,
      obj?.consigneeCode,

      obj?.consigneeState,
      obj?.consigneeCity,
      obj?.consigneeArea,

      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn
    ]
      .filter(Boolean) // 过滤掉 undefined/null/空字符串
      .join(" "); // 用空格连接
  }
};
defineExpose({
  resetForm
});
</script>

<style scoped lang="scss">
@use "@/views/order/style/base";
</style>
