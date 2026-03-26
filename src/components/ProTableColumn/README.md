# ProTableColumn 组件

## 作用

ProTableColumn 是对 Element Plus 的 ElTableColumn 组件的封装，提供了一些增强功能，使表格列的使用更加便捷。

## 功能

- 继承了 Element Plus 的 ElTableColumn 的所有属性
- 自动处理空值，将 null、undefined 和空字符串显示为 "-"
- 当没有自定义插槽时，自动显示内容的溢出提示
- 支持自定义表头和内容插槽

## 使用示例

### 基本用法

```vue
<template>
  <el-table :data="tableData">
    <ProTableColumn prop="name" label="姓名" />
    <ProTableColumn prop="age" label="年龄" />
    <ProTableColumn prop="address" label="地址" />
  </el-table>
</template>

<script setup lang="ts">
import ProTableColumn from "./index.vue";

const tableData = [
  { name: "张三", age: 18, address: "北京市朝阳区" },
  { name: "李四", age: 20, address: "上海市浦东新区" },
  { name: "王五", age: null, address: "" }
];
</script>
```

### 使用自定义插槽

```vue
<template>
  <el-table :data="tableData">
    <ProTableColumn prop="name" label="姓名" />
    <ProTableColumn label="操作">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTableColumn>
  </el-table>
</template>

<script setup lang="ts">
import ProTableColumn from "./index.vue";

const tableData = [
  { name: "张三", age: 18, address: "北京市朝阳区" },
  { name: "李四", age: 20, address: "上海市浦东新区" }
];

const handleEdit = (row) => {
  console.log("编辑:", row);
};

const handleDelete = (row) => {
  console.log("删除:", row);
};
</script>
```

### 使用自定义表头

```vue
<template>
  <el-table :data="tableData">
    <ProTableColumn prop="name">
      <template #header>
        <div class="custom-header">
          <span>姓名</span>
          <el-button size="small" @click="sortByName">排序</el-button>
        </div>
      </template>
    </ProTableColumn>
  </el-table>
</template>

<script setup lang="ts">
import ProTableColumn from "./index.vue";

const tableData = [
  { name: "张三", age: 18, address: "北京市朝阳区" },
  { name: "李四", age: 20, address: "上海市浦东新区" }
];

const sortByName = () => {
  console.log("按姓名排序");
};
</script>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
```

## 组件依赖

- Element Plus - 提供基础的表格列组件

## 类型定义

组件使用 `ProColumnProps` 接口，继承自 Element Plus 的 `TableColumnCtx` 类型，支持所有 ElTableColumn 的属性。

## 注意事项

- 当使用自定义插槽时，组件不会自动处理空值和溢出提示，需要自行实现
- 组件的所有属性都与 Element Plus 的 ElTableColumn 保持一致
