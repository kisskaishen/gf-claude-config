<template>
  <div class="common-tag" :style="tagStyle" @click="handleClick">
    {{ count }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  bgColor?: string;
  textColor?: string;
  count?: string | number;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: "#f5f5f5",
  textColor: "#333",
  count: ""
});

const emit = defineEmits<{
  (e: "click"): void;
}>();

const tagStyle = computed(() => ({
  backgroundColor: props.bgColor,
  color: props.textColor,
  borderColor: props.active ? props.textColor : "transparent"
}));

const handleClick = () => {
  emit("click");
};
</script>

<style scoped>
.common-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 14px;
  line-height: 14px;
  cursor: pointer;
  user-select: none;
  border: 1px solid;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.common-tag:hover {
  opacity: 0.8;
}
</style>
