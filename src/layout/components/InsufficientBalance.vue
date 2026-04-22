<template>
  <el-dialog
    title=""
    v-model="visible"
    @close="handleClose"
    width="600px"
    :close-on-click-modal="false"
    class="custom-alert-dialog"
  >
    <template #header>
      <div class="flex items-center justify-center gap-2">
        <!-- 警告图标 -->
        <svg
          class="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span class="text-2xl font-bold text-gray-800">余额不足提醒</span>
      </div>
    </template>

    <div class="py-6">
      <!-- 金额对比区域 -->
      <div class="flex justify-around mb-8">
        <div class="text-center">
          <div class="mb-2 text-lg text-gray-500">当前余额</div>
          <div class="text-2xl font-bold text-primary">
            {{ balanceInfo.availableOrderAmount }} €
          </div>
        </div>
        <div class="text-center">
          <div class="mb-2 text-lg text-gray-500">提醒额度</div>
          <div class="text-2xl font-bold text-primary">
            {{ balanceInfo.alertBalance }} €
          </div>
        </div>
      </div>

      <!-- 提示文字 -->
      <div class="text-base text-center text-info">
        您的可下单余额已低于设定额度，请及时充值以确保正常使用
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center gap-4">
        <el-button
          @click="handleClose"
          class="px-12 py-3 text-lg text-orange-500 border-orange-500 hover:bg-orange-50"
        >
          稍后再说
        </el-button>
        <el-button
          type="primary"
          class="flex items-center gap-2 px-12 py-3 text-lg bg-orange-500 border-orange-500 hover:bg-orange-600"
          @click="handleRecharge"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          立即充值
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getBalanceAlertInfo } from "@/api/finance";

const router = useRouter();

const visible = ref(false);

const handleClose = () => {
  visible.value = false;
};

const handleRecharge = () => {
  ElMessage.success("正在跳转到充值页面...");
  router.push({ name: "Recharge" });
  handleClose();
};

const balanceInfo = ref({
  availableOrderAmount: undefined,
  alertBalance: undefined
});

const getBalanceInfo = async () => {
  const res = await getBalanceAlertInfo();
  console.log(res, "=====+++");
  if (res.code === 200) {
    visible.value = res.needPopup;
    balanceInfo.value = {
      availableOrderAmount: res.availableOrderAmount,
      alertBalance: res.alertBalance
    };
  }
};
onMounted(() => {
  getBalanceInfo();
});
</script>

<style scoped>
.custom-alert-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0;
  margin: 0;
}

.custom-alert-dialog :deep(.el-dialog__body) {
  padding: 0 24px;
}

.custom-alert-dialog :deep(.el-dialog__footer) {
  padding: 0 24px 24px;
}

.custom-alert-dialog :deep(.el-button) {
  height: auto;
  border-radius: 8px;
}
</style>
