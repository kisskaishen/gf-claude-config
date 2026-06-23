<template>
  <page-container :loading="loading">
    <CommonTitle
      :title="$t('web.gfuc.balance')"
      :tip="$t('web.gfuc.balance_tip')"
    />
    <div class="mt-6 balance-header">
      <!-- 可下单金额 -->
      <div class="balance-card primary-card">
        <div class="card-content">
          <div class="label">
            {{ $t("gfuc.available_order_amount" /** 可下单金额 **/) }}
            <el-tooltip
              :content="
                $t(
                  'gfuc.total_available_order_amount' /** 总的可用于下单的金额 **/
                )
              "
              placement="top"
            >
              <el-icon class="tip-icon">
                <svg-icon name="question" />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.availableOrderAmount) }}
          </div>
          <el-button class="recharge-btn" @click="handleRecharge">
            {{ $t("gfuc.recharge" /** 充值 **/) }}
          </el-button>
        </div>
      </div>

      <div class="separator" data-symbol="="></div>

      <!-- 账号余额 -->
      <div class="balance-card">
        <div class="card-content">
          <div class="label">
            {{ $t("gfuc.account_balance" /** 账号余额 **/) }}
            <el-tooltip
              :content="
                $t('gfuc.customer_recharge_amount' /** 客户充值进账号的金额 **/)
              "
              placement="top"
            >
              <el-icon class="tip-icon">
                <svg-icon name="question" />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">€ {{ formatAmount(balanceInfo.balance) }}</div>
        </div>
      </div>

      <div class="separator" data-symbol="+"></div>

      <!-- 可用信用额度 -->
      <div class="balance-card">
        <div class="card-content">
          <div class="label">
            {{ $t("gfuc.available_credit_line" /** 可用信用额度 **/) }}
            <el-tooltip
              :content="
                $t('gfuc.remaining_available_credit' /** 剩余可用的信用额度 **/)
              "
              placement="top"
            >
              <el-icon class="tip-icon"><svg-icon name="question" /> </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.creditLimit) }}
          </div>
        </div>
      </div>

      <div class="separator" data-symbol="-"></div>

      <!-- 预扣费金额 -->
      <div class="balance-card">
        <div class="card-content">
          <div class="label">
            {{ $t("gfuc.pre_deducted_amount" /** 预扣费金额 **/) }}
            <el-tooltip
              :content="
                $t(
                  'gfuc.pre_deduction_amount_description' /** 下单时，对订单进行预扣费的金额，也叫冻结金额 **/
                )
              "
              placement="top"
            >
              <el-icon class="tip-icon"><svg-icon name="question" /> </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.freezeAmount) }}
          </div>
        </div>
      </div>
    </div>

    <RechargeDialog v-model="rechargeVisible" @success="init" />
  </page-container>
</template>

<script setup lang="ts">
import { getBalance } from "@/api/finance";
import { ref, onMounted } from "vue";
import CommonTitle from "@/components/CommonTitle/index.vue";
import RechargeDialog from "@/views/finance/components/RechargeDialog/index.vue";

defineOptions({
  name: "Balance"
});

const loading = ref(false);
const rechargeVisible = ref(false);

const balanceInfo = ref({
  /** 可下单金额 */
  availableOrderAmount: 0,
  /** 账号余额 */
  balance: 0,
  /** 可用信用额度 */
  creditLimit: 0,
  /** 预扣费额度 */
  freezeAmount: 0
});

const formatAmount = (num: number) => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const handleRecharge = () => {
  rechargeVisible.value = true;
};

const init = async () => {
  try {
    loading.value = true;
    const res = await getBalance();
    balanceInfo.value = res || {};
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.balance-header {
  display: flex;
  align-items: center;
  height: 164px;
  font-size: var(--font-size-base);
  background-image:
    linear-gradient(89.18deg, #fff 15.41%, #fffdfc 106.78%),
    // 内容区背景（白色渐变）
    linear-gradient(88.04deg, #fff 28.79%, #ffefe9 138.31%); // 边框渐变色

  background-clip:
    padding-box, border-box; // 3. 关键：第一层背景裁切到内容区，第二层裁切到边框区

  background-origin: border-box; // 2. 让背景延伸到边框区域

  // 核心逻辑：
  border: 2px solid transparent; // 1. 设置透明边框占位
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;

  .balance-card {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 0 30px 0 70px;
    container-type: inline-size; // 启用容器查询 (方案 1)
    &::after {
      position: absolute;
      top: 50%;
      right: 0;
      height: 114px;
      content: "";
      border: 1px solid rgb(248 248 248 / 100%);
      transform: translate(-50%, -50%);
    }

    &:last-child::after {
      display: none;
    }

    .card-content {
      .label {
        display: flex;
        align-items: center;
        color: var(--text-color-tertiary);
        white-space: nowrap;

        .tip-icon {
          margin-left: 6px;
        }
      }

      .amount {
        font-family: "Source Han Sans CN", sans-serif;
        font-size: 20px;
        font-size: clamp(24px, 10cqw, 24px);
        font-weight: 400;
        color: var(--text-color-regular);
        white-space: nowrap;
      }

      .recharge-btn {
        min-width: 85px;
        margin-top: 10px;
        font-weight: 500;
        color: var(--color-primary);
        background: transparent;
        border-color: var(--color-primary);

        &:hover {
          color: #fff;
          background-color: var(--color-primary);
        }
      }
    }

    &.primary-card {
      flex: 1.5;
      padding: 0 24px;
      background: linear-gradient(
        257.38deg,
        rgb(252 76 2 / 4%) -1.03%,
        rgb(255 228 72 / 4%) 99.22%
      );
      border-left: 2px solid var(--color-primary);
      border-radius: 4px;

      &::after {
        content: none;
      }

      .amount {
        font-size: 28px;
        font-size: clamp(28px, 12cqw, 32px);
      }
    }
  }

  .separator {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1px;

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-size: 32px;
      font-weight: 400;
      line-height: 32px;
      color: var(--color-primary);
      content: attr(data-symbol);
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 4px 8px 0 rgb(150 44 0 / 4%);
      transform: translate(-50%, -50%);
    }
  }
}
</style>
