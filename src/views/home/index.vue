<template>
  <div class="home-welcome">
    <div class="slogan-container">
      <div class="img-container">
        <img :src="iconLeftCar" alt="" />Drive Efficiency,<br />
      </div>
      <span class="second-line">Deliver Trust.</span>
    </div>
    <div class="welcome-bg-container">
      <img :src="imgWelcomeCar" alt="" />
    </div>
    <!-- <div class="empty-text">{{ $t("gfuc.no_data_available") }}</div> -->
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Home"
});

import iconLeftCar from "@/assets/home/icon-left-car.png";
import imgWelcomeCar from "@/assets/home/img-welcome-car.png";
</script>

<style scoped lang="scss">
.home-welcome {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1168px;
  min-height: calc(100vh - var(--header-height) - var(--tags-height) - 16px);
  margin: 0 auto;

  /* 文字容器，控制整体排版 */
  .slogan-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 300px;
    margin-top: 80px;
    margin-left: -520px;
    font-size: 48px;
    font-weight: 700;
    color: #fc4c02;
    text-align: center;

    .img-container {
      display: flex;
      align-items: center;
    }
  }

  .welcome-bg-container {
    margin-top: -200px;
    margin-right: -340px;

    img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }
  }
}

.empty-icon {
  flex: 0 0 auto;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--text-color-tertiary);
}
</style>
