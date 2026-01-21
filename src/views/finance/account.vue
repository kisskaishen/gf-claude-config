<template>
  <div class="page">
    <TableLayout
      v-model:search-form-model="searchFormModel"
      :data="data"
      :total="total"
      @search="handleSearch"
    >
      <template #search>
        <el-form-item :label="$t('名称')">
          <el-input
            v-model="searchFormModel.name"
            :placeholder="$t('请输入名称')"
          />
        </el-form-item>
        <el-form-item :label="$t('年龄')">
          <el-input
            v-model="searchFormModel.age"
            :placeholder="$t('请输入年龄')"
          />
        </el-form-item>
        <el-form-item :label="$t('登记时间')">
          <el-date-picker
            v-model="searchFormModel.registerTime"
            type="daterange"
            range-separator="至"
            :start-placeholder="$t('开始日期')"
            :end-placeholder="$t('结束日期')"
          />
        </el-form-item>
        <el-form-item :label="$t('地址')" :span="16">
          <el-input
            v-model="searchFormModel.address"
            placeholder="请输入地址"
          />
        </el-form-item>
      </template>
      <!-- <template #toolbar-left>
      <el-button type="primary" @click="handleSearch">导出</el-button>
    </template> -->
      <template #columns>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="registerTime" label="登记时间" />
      </template>
    </TableLayout>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: "Account"
});
import TableLayout from "@/components/TableLayout/index.vue";
import { onMounted, ref } from "vue";
const loading = ref(false);
const searchFormModel = ref({
  name: "",
  age: "",
  address: "",
  registerTime: []
});
const data = ref<any[]>([]);

const total = ref(0);

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    data.value = Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      name: `test${index + 1}`,
      age: 18,
      address: `test${index + 1}`,
      registerTime: new Date()
    }));
    total.value = 10;
  }, 1000);
};

const handleSearch = () => {
  console.log("search");
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
<style lang="scss" scoped>
.page {
  height: 100%;
  padding: 24px 24px 0;
}
</style>
