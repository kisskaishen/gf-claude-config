# ProTable 组件

## 作用

ProTable 是对 Element Plus 的 ElTable 组件的封装，提供了一些增强功能，使表格的使用更加便捷，特别是在处理操作按钮时。

## 功能

- 继承了 Element Plus 的 ElTable 的所有属性
- 支持配置操作按钮列，自动生成操作按钮
- 支持为操作按钮配置图标、标题、点击事件和隐藏条件
- 暴露了 ElTable 的实例方法，如 clearSelection 等
- 操作按钮列默认固定在右侧

## 组件属性

| 属性名             | 类型           | 默认值    | 描述                                         |
| ------------------ | -------------- | --------- | -------------------------------------------- |
| actions            | ActionConfig[] | undefined | 操作按钮配置数组                             |
| actionColumnConfig | Object         | undefined | 操作列配置，如宽度等                         |
| ...                | TableProps     | -         | 继承自 Element Plus 的 TableProps 的所有属性 |

## ActionConfig 接口

| 属性名 | 类型                  | 必需 | 描述                       |
| ------ | --------------------- | ---- | -------------------------- |
| title  | string                | 是   | 操作按钮的标题             |
| icon   | string \| Component   | 否   | 操作按钮的图标             |
| handle | (row: any) => void    | 是   | 点击操作按钮时的回调函数   |
| hidden | (row: any) => boolean | 否   | 控制操作按钮是否隐藏的函数 |

## 使用示例

### 基本用法

```vue
<template>
  <ProTable :data="tableData">
    <ProTableColumn prop="name" label="姓名" />
    <ProTableColumn prop="age" label="年龄" />
    <ProTableColumn prop="address" label="地址" />
  </ProTable>
</template>

<script setup lang="ts">
import ProTable from "./index.vue";
import ProTableColumn from "../ProTableColumn/index.vue";

const tableData = [
  { name: "张三", age: 18, address: "北京市朝阳区" },
  { name: "李四", age: 20, address: "上海市浦东新区" }
];
</script>
```

### 带操作按钮

```vue
<template>
  <ProTable :data="tableData" :actions="actions">
    <ProTableColumn prop="name" label="姓名" />
    <ProTableColumn prop="age" label="年龄" />
    <ProTableColumn prop="address" label="地址" />
  </ProTable>
</template>

<script setup lang="ts">
import ProTable from "./index.vue";
import ProTableColumn from "../ProTableColumn/index.vue";
import { Edit, Delete } from "@element-plus/icons-vue";

const tableData = [
  { id: 1, name: "张三", age: 18, address: "北京市朝阳区", status: "active" },
  {
    id: 2,
    name: "李四",
    age: 20,
    address: "上海市浦东新区",
    status: "inactive"
  }
];

const actions = [
  {
    title: "编辑",
    icon: Edit,
    handle: (row) => {
      console.log("编辑:", row);
    }
  },
  {
    title: "删除",
    icon: Delete,
    handle: (row) => {
      console.log("删除:", row);
    },
    hidden: (row) => {
      // 只有状态为 active 的行才显示删除按钮
      return row.status !== "active";
    }
  }
];
</script>
```

### 自定义操作列宽度

```vue
<template>
  <ProTable
    :data="tableData"
    :actions="actions"
    :actionColumnConfig="{ width: 200 }"
  >
    <ProTableColumn prop="name" label="姓名" />
    <ProTableColumn prop="age" label="年龄" />
    <ProTableColumn prop="address" label="地址" />
  </ProTable>
</template>

<script setup lang="ts">
import ProTable from "./index.vue";
import ProTableColumn from "../ProTableColumn/index.vue";

const tableData = [
  { id: 1, name: "张三", age: 18, address: "北京市朝阳区" },
  { id: 2, name: "李四", age: 20, address: "上海市浦东新区" }
];

const actions = [
  {
    title: "查看",
    handle: (row) => {
      console.log("查看:", row);
    }
  },
  {
    title: "编辑",
    handle: (row) => {
      console.log("编辑:", row);
    }
  },
  {
    title: "删除",
    handle: (row) => {
      console.log("删除:", row);
    }
  }
];
</script>
```

## 组件依赖

- Element Plus - 提供基础的表格组件

## 注意事项

- 组件继承了 Element Plus 的 ElTable 的所有属性，可以直接使用 ElTable 的所有功能
- 操作按钮列默认固定在右侧
- 当 actions 为空或 undefined 时，不会显示操作按钮列
