<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">404</div>
      <h2 class="error-title">
        {{ $t("gfuc.page_not_found" /** 页面不见了 **/) }}
      </h2>
      <p class="error-message">
        {{
          $t(
            "gfuc.page_not_found_description" /** 抱歉，您访问的页面不存在或已被移除。 **/
          )
        }}
      </p>
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          {{ $t("gfuc.return_to_home" /** 返回首页 **/) }}
        </el-button>
        <el-button size="large" @click="goBack">
          {{ $t("gfuc.return_to_previous" /** 返回上一页 **/) }}
        </el-button>
      </div>
    </div>
    <div class="error-image">
      <!-- 这里可以使用一个插画或者简单的装饰 -->
      <div class="illustration">
        <div class="circle large"></div>
        <div class="circle medium"></div>
        <div class="circle small"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 20px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.error-content {
  z-index: 1;
  max-width: 500px;

  .error-code {
    margin-bottom: 20px;
    font-size: 120px;
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary) 0%, #ff7875 100%);
    background-clip: text;
    opacity: 0.8;
    -webkit-text-fill-color: transparent;
  }

  .error-title {
    margin-bottom: 16px;
    font-size: 32px;
    font-weight: 600;
    color: #1d2129;
  }

  .error-message {
    margin-bottom: 40px;
    font-size: 16px;
    line-height: 1.6;
    color: #86909c;
  }

  .error-actions {
    display: flex;
    gap: 16px;
  }
}

.error-image {
  position: absolute;
  top: 50%;
  right: 10%;
  pointer-events: none;
  opacity: 0.5;
  transform: translateY(-50%);

  .illustration {
    position: relative;
    width: 400px;
    height: 400px;

    .circle {
      position: absolute;
      background: var(--color-primary);
      border-radius: 50%;
      opacity: 0.1;
      filter: blur(60px);

      &.large {
        top: 0;
        right: 0;
        width: 300px;
        height: 300px;
      }

      &.medium {
        bottom: 50px;
        left: 50px;
        width: 200px;
        height: 200px;
        background: #ff7875;
      }

      &.small {
        top: 100px;
        left: 150px;
        width: 100px;
        height: 100px;
        background: #ffa940;
      }
    }
  }
}

@media (width <= 768px) {
  .error-image {
    display: none;
  }

  .error-content {
    text-align: center;

    .error-actions {
      justify-content: center;
    }
  }
}
</style>
