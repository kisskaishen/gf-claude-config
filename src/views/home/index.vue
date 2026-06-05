<template>
  <div class="home">
    <component :is="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import Welcome from "@/views/home/welcome.vue";
import Gigma from "@/views/home/gigma.vue";
import { ref } from "vue";
defineOptions({
  name: "Home"
});

const currentComponent = ref(Gigma);
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  min-height: calc(100vh - var(--header-height) - var(--tags-height) - 16px);
}
</style>
