<template>
  <div
    class="page-wrapper"
    style="min-height: 100vh; padding: 20px; background: #f5f7fa"
  >
    <el-form
      ref="searchFormRef"
      :model="queryParams"
      label-width="100px"
      label-position="top"
    >
      <SearchContainer
        :loading="loading"
        :cols="3"
        :row-num="1"
        :throttle-timer="500"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="订单编号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
          />
        </el-form-item>

        <el-form-item label="订单状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="待付款" value="1" />
            <el-option label="已发货" value="2" />
            <el-option label="已完成" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="待付款" value="1" />
            <el-option label="已发货" value="2" />
            <el-option label="已完成" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="下单时间" prop="dateRange" :span="12">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="支付方式" prop="payType">
          <el-radio-group v-model="queryParams.payType">
            <el-radio label="1">支付宝</el-radio>
            <el-radio label="2">微信</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="配送方式" prop="shipping">
          <el-checkbox-group v-model="queryParams.shipping">
            <el-checkbox label="1">顺丰</el-checkbox>
            <el-checkbox label="2">京东</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="搜索备注" prop="remark" :span="24">
          <el-input v-model="queryParams.remark" placeholder="支持模糊搜索" />
        </el-form-item>
      </SearchContainer>
    </el-form>

    <el-table :data="tableData" style="margin-top: 20px" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "BatchOrder"
});
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import SearchContainer from "@/components/SearchContainer/index.vue"; // 刚才封装的组件

const searchFormRef = ref(null);
const loading = ref(false);
const tableData = ref([]);

// 搜索参数
const queryParams = reactive({
  orderNo: "",
  status: "",
  dateRange: [],
  payType: "1",
  shipping: [],
  remark: ""
});

// 搜索事件 (已由组件内部实现节流)
const handleSearch = () => {
  loading.value = true;
  console.log("提交查询参数:", queryParams);

  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
    ElMessage.success("查询成功");
  }, 1000);
};

// 重置事件
const handleReset = () => {
  if (!searchFormRef.value) return;
  // 使用 el-form 原生的重置功能
  searchFormRef.value.resetFields();
  ElMessage.info("表单已重置");
  handleSearch();
};
</script>
