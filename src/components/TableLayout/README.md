# TableLayout 组件

## 作用

TableLayout 是一个完整的表格布局组件，包含搜索区域、工具栏、表格和分页功能。它提供了统一的表格页面布局，简化了表格相关页面的开发。

## 功能

- 包含搜索区域，支持自定义搜索表单
- 包含工具栏，支持左右两侧自定义操作
- 包含表格区域，支持自定义列配置
- 包含分页区域，支持分页功能
- 支持加载状态显示
- 支持搜索、重置、分页等事件处理

## 组件属性

| 属性名           | 类型                                   | 默认值                 | 描述             |
| ---------------- | -------------------------------------- | ---------------------- | ---------------- |
| data             | any[]                                  | []                     | 表格数据         |
| searchFormModel  | any                                    | undefined              | 搜索表单数据     |
| loading          | boolean                                | false                  | 是否显示加载状态 |
| total            | number                                 | 0                      | 总数据条数       |
| currentPage      | number                                 | 1                      | 当前页码         |
| pageSize         | number                                 | 10                     | 每页条数         |
| showSearch       | boolean                                | true                   | 是否显示搜索区域 |
| searchConfig     | SearchConfig                           | { cols: 3, rowNum: 1 } | 搜索区域配置     |
| tableConfig      | Partial<Omit<TableProps<any>, "data">> | {}                     | 表格配置         |
| paginationConfig | Partial<PaginationProps>               | {}                     | 分页配置         |
| searchFormConfig | Partial<FormProps>                     | {}                     | 搜索表单配置     |

## 事件

| 事件名                 | 描述                   |
| ---------------------- | ---------------------- |
| search                 | 搜索或分页变化时触发   |
| reset                  | 重置搜索条件时触发     |
| update:currentPage     | 当前页码变化时触发     |
| update:pageSize        | 每页条数变化时触发     |
| update:searchFormModel | 搜索表单数据变化时触发 |

## 插槽

| 插槽名        | 描述           |
| ------------- | -------------- |
| search        | 搜索表单内容   |
| toolbar-left  | 工具栏左侧内容 |
| toolbar-right | 工具栏右侧内容 |
| columns       | 表格列配置     |

## 使用示例

### 基本用法

```vue
<template>
  <TableLayout
    :data="tableData"
    :loading="loading"
    :total="total"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    v-model:search-form-model="searchForm"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template #search>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="年龄">
        <el-input
          v-model="searchForm.age"
          type="number"
          placeholder="请输入年龄"
        />
      </el-form-item>
    </template>

    <template #toolbar-left>
      <el-button type="primary" @click="handleAdd"> 新增 </el-button>
    </template>

    <template #toolbar-right>
      <el-button @click="handleExport"> 导出 </el-button>
    </template>

    <template #columns>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button size="small" type="danger" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </template>
  </TableLayout>
</template>

<script setup lang="ts">
import TableLayout from "./index.vue";
import { ref, reactive } from "vue";

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
const searchForm = reactive({ name: "", age: "" });
const tableData = ref([]);

const handleSearch = () => {
  loading.value = true;
  console.log("搜索:", searchForm, currentPage.value, pageSize.value);
  // 模拟搜索过程
  setTimeout(() => {
    tableData.value = Array.from({ length: pageSize.value }, (_, i) => ({
      name: `用户${(currentPage.value - 1) * pageSize.value + i + 1}`,
      age: 18 + i,
      address: `地址${i + 1}`
    }));
    loading.value = false;
  }, 1000);
};

const handleReset = () => {
  console.log("重置");
};

const handleAdd = () => {
  console.log("新增");
};

const handleExport = () => {
  console.log("导出");
};

const handleEdit = (row) => {
  console.log("编辑:", row);
};

const handleDelete = (row) => {
  console.log("删除:", row);
};

// 初始加载数据
handleSearch();
</script>
```

### 自定义搜索配置

```vue
<template>
  <TableLayout
    :data="tableData"
    :loading="loading"
    :total="total"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    v-model:search-form-model="searchForm"
    :search-config="{ cols: 4, rowNum: 2 }"
    @search="handleSearch"
  >
    <template #search>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="年龄">
        <el-input
          v-model="searchForm.age"
          type="number"
          placeholder="请输入年龄"
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="searchForm.gender" placeholder="请选择性别">
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
        </el-select>
      </el-form-item>
      <el-form-item label="职业">
        <el-input v-model="searchForm.occupation" placeholder="请输入职业" />
      </el-form-item>
    </template>

    <template #columns>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="gender" label="性别" />
      <el-table-column prop="occupation" label="职业" />
    </template>
  </TableLayout>
</template>

<script setup lang="ts">
import TableLayout from "./index.vue";
import { ref, reactive } from "vue";

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
const searchForm = reactive({ name: "", age: "", gender: "", occupation: "" });
const tableData = ref([]);

const handleSearch = () => {
  loading.value = true;
  console.log("搜索:", searchForm);
  // 模拟搜索过程
  setTimeout(() => {
    tableData.value = Array.from({ length: pageSize.value }, (_, i) => ({
      name: `用户${(currentPage.value - 1) * pageSize.value + i + 1}`,
      age: 18 + i,
      gender: i % 2 === 0 ? "男" : "女",
      occupation: `职业${i + 1}`
    }));
    loading.value = false;
  }, 1000);
};

// 初始加载数据
handleSearch();
</script>
```

## 组件依赖

- Element Plus - 提供基础的表格、表单、分页等组件
- SearchContainer - 提供搜索容器功能
- useResetableRef - 提供可重置的引用功能

## 注意事项

- 组件使用 flex 布局，需要确保父容器有足够的高度
- 搜索表单的重置会将表单数据重置为初始值
- 搜索操作会自动将当前页码重置为 1
- 分页变化会自动触发搜索操作
