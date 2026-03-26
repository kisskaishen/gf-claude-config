# SelectDropdown 组件

## 作用

SelectDropdown 是一个下拉选择组件，基于 Element Plus 的 el-dropdown 组件封装，提供了更多的功能和自定义选项。

## 功能

- 支持下拉选择功能
- 支持搜索过滤选项
- 支持自定义选项内容
- 支持自定义触发器内容
- 支持显示/隐藏箭头
- 支持自定义下拉菜单样式

## 组件属性

| 属性名      | 类型             | 默认值    | 描述                 |
| ----------- | ---------------- | --------- | -------------------- |
| modelValue  | string \| number | undefined | 当前选中的值         |
| options     | OptionItem[]     | -         | 选项列表             |
| placeholder | string           | "请输入"  | 搜索框占位符         |
| searchable  | boolean          | false     | 是否支持搜索         |
| popperClass | string           | ""        | 下拉菜单的自定义类名 |
| showArrow   | boolean          | true      | 是否显示箭头         |

## OptionItem 接口

| 属性名 | 类型             | 必需 | 描述           |
| ------ | ---------------- | ---- | -------------- |
| label  | string           | 是   | 选项的显示文本 |
| value  | string \| number | 是   | 选项的值       |
| ...    | any              | 否   | 其他自定义属性 |

## 事件

| 事件名            | 描述             |
| ----------------- | ---------------- |
| update:modelValue | 选中值变化时触发 |
| change            | 选中值变化时触发 |

## 插槽

| 插槽名  | 描述                            |
| ------- | ------------------------------- |
| default | 自定义触发器内容                |
| option  | 自定义选项内容，参数为 { item } |

## 使用示例

### 基本用法

```vue
<template>
  <SelectDropdown
    v-model="selectedValue"
    :options="options"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import SelectDropdown from "./index.vue";
import { ref } from "vue";

const selectedValue = ref("option1");
const options = [
  { label: "选项1", value: "option1" },
  { label: "选项2", value: "option2" },
  { label: "选项3", value: "option3" }
];

const handleChange = (value) => {
  console.log("选中值:", value);
};
</script>
```

### 带搜索功能

```vue
<template>
  <SelectDropdown
    v-model="selectedValue"
    :options="options"
    :searchable="true"
    placeholder="请搜索选项"
  />
</template>

<script setup lang="ts">
import SelectDropdown from "./index.vue";
import { ref } from "vue";

const selectedValue = ref("");
const options = [
  { label: "选项1", value: "option1" },
  { label: "选项2", value: "option2" },
  { label: "选项3", value: "option3" },
  { label: "选项4", value: "option4" },
  { label: "选项5", value: "option5" }
];
</script>
```

### 自定义触发器

```vue
<template>
  <SelectDropdown v-model="selectedValue" :options="options">
    <el-button type="primary">
      {{ currentLabel }}
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </el-button>
  </SelectDropdown>
</template>

<script setup lang="ts">
import SelectDropdown from "./index.vue";
import { ref, computed } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";

const selectedValue = ref("option1");
const options = [
  { label: "选项1", value: "option1" },
  { label: "选项2", value: "option2" },
  { label: "选项3", value: "option3" }
];

const currentLabel = computed(() => {
  const selected = options.find((item) => item.value === selectedValue.value);
  return selected ? selected.label : "请选择";
});
</script>
```

### 自定义选项内容

```vue
<template>
  <SelectDropdown v-model="selectedValue" :options="options">
    <template #option="{ item }">
      <div class="custom-option">
        <el-avatar :size="24" :src="item.avatar" />
        <span class="option-label">{{ item.label }}</span>
      </div>
    </template>
  </SelectDropdown>
</template>

<script setup lang="ts">
import SelectDropdown from "./index.vue";
import { ref } from "vue";

const selectedValue = ref("1");
const options = [
  {
    label: "用户1",
    value: "1",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    label: "用户2",
    value: "2",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    label: "用户3",
    value: "3",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg"
  }
];
</script>

<style scoped>
.custom-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  font-size: 14px;
}
</style>
```

## 组件依赖

- Element Plus - 提供基础的下拉菜单组件

## 注意事项

- 当搜索框显示时，会根据输入内容过滤选项
- 当弹窗关闭时，搜索词会自动重置
- 选中的选项会高亮显示
