<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="icon">
        <img src="@/assets/lock.png" />
      </div>
      <p class="desc">
        {{ $t("你的账号还没有绑定客户信息，暂无权限，请先授权") }}
      </p>
      <div class="action">
        <el-button type="primary" @click="showAuthModal = true">{{
          $t("去授权")
        }}</el-button>
      </div>
    </div>
    <AuthModal v-model="showAuthModal" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import AuthModal from "./AuthModal.vue";
defineOptions({
  name: "AuthView"
});

const showAuthModal = ref(false);
</script>

<style scoped lang="scss">
.auth-wrapper {
  height: 100%;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: 15%;

  .icon {
    width: 197px;

    img {
      width: 100%;
    }
  }

  .desc {
    font-size: var(--font-size-xs);
    color: #c1c4d7;
  }

  .action {
    margin-top: 20px;
  }
}
</style>
