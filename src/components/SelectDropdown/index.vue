<template>
  <el-dropdown
    v-model:visible="visible"
    trigger="click"
    :popper-class="['select-dropdown-popper', popperClass]"
    @command="handleCommand"
  >
    <div class="dropdown-trigger">
      <slot>
        <span class="menu-item">
          {{ currentLabel }}
          <el-icon class="el-icon--right" v-if="showArrow"
            ><arrow-down
          /></el-icon>
        </span>
      </slot>
    </div>
    <template #dropdown>
      <div class="select-dropdown-wrapper">
        <div v-if="searchable" class="search-container">
          <el-input
            v-model="searchValue"
            :placeholder="displayPlaceholder"
            :prefix-icon="Search"
            clearable
          />
        </div>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in filteredOptions"
            :key="item.value"
            :command="item.value"
            :class="{ 'is-active': modelValue === item.value }"
          >
            <slot name="option" :item="item">
              <span>{{ item.label }}</span>
            </slot>
          </el-dropdown-item>
          <div v-if="filteredOptions.length === 0" class="no-data">
            {{ $t("web.gfuc.no_data") }}
          </div>
        </el-dropdown-menu>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Search, ArrowDown } from "@element-plus/icons-vue";
const { t } = useI18n();

defineOptions({
  name: "SelectDropdown"
});

interface OptionItem {
  label: string;
  value: string | number;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options: OptionItem[];
    placeholder?: string;
    searchable?: boolean;
    popperClass?: string;
    showArrow?: boolean;
  }>(),
  {
    placeholder: "",
    searchable: false,
    popperClass: "",
    showArrow: true
  }
);
// 处理多语言的 placeholder
const displayPlaceholder = computed(() => {
  return props.placeholder || t("web.gfuc.please_enter" /** 请输入 **/);
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "change", value: string | number): void;
}>();

const visible = ref(false);
const searchValue = ref("");

const currentLabel = computed(() => {
  const selected = props.options.find(
    (item) => item.value === props.modelValue
  );
  return selected ? selected.label : "";
});

const filteredOptions = computed(() => {
  if (!searchValue.value) return props.options;
  const query = searchValue.value.toLowerCase();
  return props.options.filter((item) =>
    item.label.toLowerCase().includes(query)
  );
});

const handleCommand = (command: string | number) => {
  visible.value = false;
  emit("update:modelValue", command);
  emit("change", command);
};

// 当弹窗关闭时重置搜索词
watch(visible, (val) => {
  if (!val) {
    searchValue.value = "";
  }
});
</script>

<style scoped lang="scss">
.dropdown-trigger {
  display: inline-block;
  cursor: pointer;
}

.menu-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-base);
  color: var(--text-color-tertiary);

  .el-icon--right {
    margin-left: 4px;
    font-size: var(--font-size-base);
  }
}

.select-dropdown-wrapper {
  .search-container {
    padding: 16px 16px 0;

    :deep(.el-input) {
      .el-input__wrapper {
        background-color: #eff0f533;
        border-bottom: 1px solid #eff0f5;
        border-radius: 0;
        box-shadow: none;
      }
    }
  }

  .no-data {
    padding: 12px 0;
    font-size: var(--font-size-base);
    color: var(--text-color-tertiary);
    text-align: center;
  }
}

:deep(.el-dropdown-menu__item) {
  &.is-active {
    color: var(--color-primary);
    background-color: var(--el-dropdown-menuItem-hover-fill);
  }
}
</style>
