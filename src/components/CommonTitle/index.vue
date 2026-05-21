<template>
  <!-- 标题区域 -->
  <div>
    <h1 class="mb-2 text-xl font-bold text-gray-800">
      {{ $t(title) }}
    </h1>
    <p class="text-sm text-info">
      {{ $t(tip) }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  tip: {
    type: String,
    default: ""
  }
});
</script>
