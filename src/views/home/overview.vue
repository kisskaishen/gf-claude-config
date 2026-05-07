<template>
  <div class="overview">
    <div class="welcome">
      <h1>您好：***</h1>
    </div>
    <div class="menu flex justify-center text-center">
      <div class="menu-item amount-card flex-3">
        <div class="card-title">总下单金额</div>
        <div class="card-amount">€ 5,415,654.51</div>
        <div class="divider"></div>
        <div class="detail-link">查看明细</div>
      </div>
      <div class="menu-item flex-1 text-yellow-500">我的</div>
      <div class="menu-item flex-1">我的</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Overview"
});
</script>

<style scoped lang="scss">
.menu {
  padding: 20px;
}

.amount-card {
  width: 100%;
  max-width: 1200px;
  padding: 40px 32px;
  background-color: #fff5f0; /* 浅粉色背景，匹配原图 */
  border-left: 4px solid #ff5722; /* 左侧橙色竖线 */
  border-radius: 16px;
}

/* 标题文字 */
.card-title {
  margin-bottom: 24px;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.2;
  color: #4a5568;
}

/* 金额数字 */
.card-amount {
  margin-bottom: 32px;
  font-size: 88px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-primary); /* 橙色主色 */
  letter-spacing: 2px;
}

/* 分隔线 */
.divider {
  width: 100%;
  height: 1px;
  margin-bottom: 24px;
  background-color: #ffccb3;
}

/* 查看明细按钮/文字 */
.detail-link {
  display: inline-block;
  font-size: 48px;
  font-weight: 600;
  color: #ff5722;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}
</style>
