# SearchContainer 组件

## 作用

SearchContainer 是一个搜索容器组件，用于包裹搜索表单，提供统一的布局和操作按钮。它支持自动布局、搜索条件的展开/收起，以及搜索和重置操作。

## 功能

- 自动布局搜索表单，支持自定义列数和行数
- 当搜索条件过多时，自动显示展开/收起按钮
- 提供搜索和重置按钮
- 支持搜索操作的节流，防止频繁触发
- 支持加载状态显示
- 支持自定义左侧操作区域

## 组件属性

| 属性名        | 类型    | 默认值 | 描述                       |
| ------------- | ------- | ------ | -------------------------- |
| cols          | number  | 3      | 每一行的列数               |
| rowNum        | number  | 1      | 默认显示的行数             |
| throttleTimer | number  | 300    | 搜索操作的节流时间（毫秒） |
| loading       | boolean | false  | 是否显示加载状态           |
| gutter        | number  | 12     | 栅格间距                   |
| isAutoLayout  | boolean | true   | 是否自动布局               |

## 事件

| 事件名 | 描述               |
| ------ | ------------------ |
| search | 点击搜索按钮时触发 |
| reset  | 点击重置按钮时触发 |

## 使用示例

### 基本用法

```vue
<template>
  <SearchContainer @search="handleSearch" @reset="handleReset">
    <el-form-item label="姓名">
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="年龄">
      <el-input v-model="form.age" type="number" placeholder="请输入年龄" />
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="form.address" placeholder="请输入地址" />
    </el-form-item>
  </SearchContainer>
</template>

<script setup lang="ts">
import SearchContainer from "./index.vue";
import { reactive } from "vue";

const form = reactive({
  name: "",
  age: "",
  address: ""
});

const handleSearch = () => {
  console.log("搜索:", form);
};

const handleReset = () => {
  form.name = "";
  form.age = "";
  form.address = "";
  console.log("重置");
};
</script>
```

### 自定义列数和行数

```vue
<template>
  <SearchContainer
    @search="handleSearch"
    @reset="handleReset"
    :cols="4"
    :rowNum="2"
  >
    <el-form-item label="姓名">
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="年龄">
      <el-input v-model="form.age" type="number" placeholder="请输入年龄" />
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="form.address" placeholder="请输入地址" />
    </el-form-item>
    <el-form-item label="性别">
      <el-select v-model="form.gender" placeholder="请选择性别">
        <el-option label="男" value="male" />
        <el-option label="女" value="female" />
      </el-select>
    </el-form-item>
    <el-form-item label="职业">
      <el-input v-model="form.occupation" placeholder="请输入职业" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
  </SearchContainer>
</template>

<script setup lang="ts">
import SearchContainer from "./index.vue";
import { reactive } from "vue";

const form = reactive({
  name: "",
  age: "",
  address: "",
  gender: "",
  occupation: "",
  email: ""
});

const handleSearch = () => {
  console.log("搜索:", form);
};

const handleReset = () => {
  Object.keys(form).forEach((key) => {
    form[key] = "";
  });
  console.log("重置");
};
</script>
```

### 带加载状态和左侧操作

```vue
<template>
  <SearchContainer
    @search="handleSearch"
    @reset="handleReset"
    :loading="loading"
  >
    <template #action-left>
      <el-button type="primary" @click="handleAdd"> 新增 </el-button>
    </template>
    <el-form-item label="姓名">
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="年龄">
      <el-input v-model="form.age" type="number" placeholder="请输入年龄" />
    </el-form-item>
  </SearchContainer>
</template>

<script setup lang="ts">
import SearchContainer from "./index.vue";
import { reactive, ref } from "vue";

const loading = ref(false);
const form = reactive({
  name: "",
  age: ""
});

const handleSearch = () => {
  loading.value = true;
  console.log("搜索:", form);
  // 模拟搜索过程
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const handleReset = () => {
  form.name = "";
  form.age = "";
  console.log("重置");
};

const handleAdd = () => {
  console.log("新增");
};
</script>
```

## 组件依赖

- Element Plus - 提供基础的表单和按钮组件
- lodash-es - 提供节流功能

## 注意事项

- 组件使用 Element Plus 的栅格系统，每个表单项默认占据的宽度由 cols 属性决定
- 当表单项数量超过 rowNum \* cols 时，会自动显示展开/收起按钮
- 搜索操作默认有 300ms 的节流，可通过 throttleTimer 属性调整
- 组件支持国际化，使用 vue-i18n 进行文本翻译
