<template>
  <div class="home-empty">
    <svg-icon name="empty" width="197px" height="178px" class="empty-icon" />
    <div class="empty-text">{{ $t("gfuc.no_data_available") }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Home"
});
</script>

<style scoped lang="scss">
.home-empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - var(--tags-height) - 16px);
}

.empty-icon {
  flex: 0 0 auto;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--text-color-tertiary);
}
</style>
