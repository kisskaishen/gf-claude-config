<template>
  <div class="h-full">
    <div class="p-6 mx-auto">
      <!-- 标题区域 -->
      <div class="mb-8">
        <h1 class="mb-2 text-xl font-bold text-gray-800">消息通知订阅配置</h1>
        <p class="text-sm text-info">
          配置余额不足提醒和账单邮件提醒，及时掌握账户动态
        </p>
      </div>

      <!-- 余额不足提醒卡片 -->
      <div
        class="p-6 mb-4 bg-white border border-t-4 border-orange-200 rounded-lg shadow-sm border-t-orange-500"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="flex items-center justify-center w-12 h-12 mr-4 rounded-lg bg-orange-50"
            >
              <!-- 钱包图标 -->
              <svg
                class="w-6 h-6 text-orange-500"
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
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">余额不足提醒</h2>
              <p class="mt-1 text-sm text-info">
                当可下单余额低于设定额度时发送邮件提醒
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <div
              class="flex items-center"
              v-if="balanceAlertConfig?.state === 1"
            >
              <el-button
                type="primary"
                plain
                class="flex items-center mr-6 text-orange-500 hover:text-orange-600"
                @click="showBalanceReminderDialog = true"
              >
                <svg
                  class="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                编辑
              </el-button>
              <span
                class="inline-flex items-center px-3 py-1 mr-3 text-sm font-medium text-orange-500 rounded-full bg-orange-50"
              >
                已开启
              </span>
            </div>
            <div v-if="balanceAlertConfig?.state === 0">
              <span
                class="inline-flex items-center px-3 py-1 mr-3 text-sm font-medium text-gray-500 bg-gray-100 rounded-full"
              >
                已关闭
              </span>
            </div>
            <!-- 开关 -->
            <el-switch
              v-model="balanceReminder"
              :active-value="1"
              :inactive-value="0"
              class="w-12 h-6"
              @change="handleBalanceReminderChange"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 余额不足提醒dialog -->
    <NotificationDialog
      v-model:visible="showBalanceReminderDialog"
      :balanceReminder="balanceReminder"
      :balanceAlertConfig="balanceAlertConfig"
    />
  </div>
</template>

<script setup lang="ts">
import NotificationDialog from "./components/notificationDialog.vue";
import { ref } from "vue";
import { updateBalanceAlertConfig } from "@/api/finance";

import { getBalanceAlertConfig } from "@/api/finance";
import { useUserStore } from "@/store/user";
const userInfo = useUserStore();

const balanceReminder = ref(0);

const showBalanceReminderDialog = ref(false);

const handleBalanceReminderChange = async (val: boolean) => {
  if (!val) {
    await updateBalanceAlertConfig({
      ...balanceAlertConfig.value,
      ...{
        account: userInfo.userInfo?.account,
        country: userInfo.userInfo?.country,
        state: 0
      }
    });
    // await getBalanceConfig();
    ElMessage.success("已关闭余额不足提醒");
  }
  showBalanceReminderDialog.value = val;

  balanceReminder.value = val ? 1 : 0;
};

watch(
  () => showBalanceReminderDialog.value,
  async (val) => {
    if (!val) {
      await getBalanceConfig();
    }
  }
);

const balanceAlertConfig = ref(null);

const getBalanceConfig = async () => {
  const res = await getBalanceAlertConfig(userInfo.userInfo?.id);
  balanceAlertConfig.value = res;
  balanceReminder.value = res.state;
};

onMounted(() => {
  getBalanceConfig();
});
</script>

<style scoped>
/* 可以在这里加自定义样式，也可以完全靠Tailwind */
</style>
