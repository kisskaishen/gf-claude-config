<template>
  <div class="page-container">
    <div>单个下单<el-input v-model="orderNo"></el-input></div>
    <el-table mb-1 :data="[]" />
    <el-pagination
      :total="100"
      layout="total, prev, pager, next, sizes"
      size="default"
    />
    <el-button type="primary">确定</el-button>
    <el-button type="primary" disabled>确定</el-button>
    <el-button>普通</el-button>
    <el-button disabled>普通</el-button>

    <el-button text>文本</el-button>
    <el-button disabled text>文本</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "SingleOrder"
});

const orderNo = ref("");
</script>
