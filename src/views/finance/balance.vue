<template>
  <page-container>
    <div class="balance-header">
      <!-- 可下单金额 -->
      <div class="balance-card primary-card">
        <div class="card-content">
          <div class="label">
            {{ $t("可下单金额") }}
            <el-tooltip :content="$t('总的可用于下单的金额')" placement="top">
              <el-icon class="tip-icon">
                <svg-icon name="question" />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.availableAmount) }}
          </div>
          <el-button class="recharge-btn" @click="handleRecharge">
            {{ $t("充值") }}
          </el-button>
        </div>
      </div>

      <div class="separator" data-symbol="="></div>

      <!-- 账号余额 -->
      <div class="balance-card">
        <div class="card-content">
          <div class="label">
            {{ $t("账号余额") }}
            <el-tooltip :content="$t('客户充值进账号的金额')" placement="top">
              <el-icon class="tip-icon">
                <svg-icon name="question" />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.accountBalance) }}
          </div>
        </div>
      </div>

      <div class="separator" data-symbol="+"></div>

      <!-- 可用信用额度 -->
      <div class="balance-card">
        <div class="card-content">
          <div class="label">
            {{ $t("可用信用额度") }}
            <el-tooltip :content="$t('剩余可用的信用额度')" placement="top">
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
            {{ $t("预扣费金额") }}
            <el-tooltip
              :content="$t('下单时，对订单进行预扣费的金额，也叫冻结金额')"
              placement="top"
            >
              <el-icon class="tip-icon"><svg-icon name="question" /> </el-icon>
            </el-tooltip>
          </div>
          <div class="amount">
            € {{ formatAmount(balanceInfo.frozenAmount) }}
          </div>
        </div>
      </div>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "Balance"
});

const router = useRouter();

// 模拟数据
const balanceInfo = ref({
  availableAmount: 5415654.54561,
  accountBalance: 5415654456464,
  creditLimit: 5415654456464,
  frozenAmount: 544564
});

const formatAmount = (num: number) => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const handleRecharge = () => {
  router.push("/finance/recharge");
};
</script>

<style lang="scss" scoped>
.balance-header {
  display: flex;
  align-items: center;
  height: 164px;
  font-size: var(--font-size-base);
  background-image:
    linear-gradient(89.18deg, #ffffff 15.41%, #fffdfc 106.78%),
    // 内容区背景（白色渐变）
    linear-gradient(88.04deg, #ffffff 28.79%, #ffefe9 138.31%); // 边框渐变色

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
        font-size: clamp(16px, 10cqw, 24px);
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
