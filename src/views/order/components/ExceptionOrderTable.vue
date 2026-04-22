<template>
  <div>
    <div class="order-content">
      <TableLayout
        v-model:searchFormModel="searchForm"
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :data="tableData"
        :total="pagination.total"
        :loading="loading"
        :searchConfig="{ cols: 3, rowNum: 1 }"
        @search="fetchData"
      >
        <template #search>
          <!-- Search Fields -->
          <el-form-item
            :label="$t('gfuc.tracking_number' /** 单号 **/)"
            prop="orderNo"
          >
            <template #label>
              <el-radio-group v-model="searchForm.searchType">
                <el-radio label="cusOrderNumList">客户单号</el-radio>
                <el-radio label="waybillNoList">运单号</el-radio>
                <el-radio label="referenceNumber">参考号</el-radio>
              </el-radio-group>
              <!-- {{ $t('gfuc.tracking_number' /** 单号 **/) }} -->
            </template>
            <el-input
              v-model="searchForm.searchValue"
              :placeholder="
                $t(
                  'gfuc.please_enter_order_or_tracking_number' /** 请输入订单号或运单号 **/
                )
              "
            />
          </el-form-item>
          <el-form-item label="邮编" prop="consigneeCodeList">
            <el-input
              v-model="searchForm.consigneeCodeList"
              :placeholder="
                $t('gfuc.please_enter_postal_code' /** 请输入邮编 **/)
              "
            />
          </el-form-item>
          <el-form-item label="客户名称" prop="customerNameSet">
            <el-input
              v-model="searchForm.customerNameSet"
              :placeholder="
                $t('gfuc.please_enter_postal_code' /** 请输入邮编 **/)
              "
            />
          </el-form-item>

          <el-form-item label="订单来源" prop="orderSource">
            <el-input
              v-model="searchForm.orderSourceSet"
              :placeholder="
                $t('gfuc.please_enter_order_source' /** 请输入订单来源 **/)
              "
            />
          </el-form-item>
          <el-form-item label="异常类型" prop="unusualType">
            <el-input
              v-model="searchForm.unusualType"
              :placeholder="
                $t('gfuc.please_enter_unusual_type' /** 请输入异常类型 **/)
              "
            />
          </el-form-item>
          <el-form-item label="用户时区" prop="userTimeZone">
            <el-input
              v-model="searchForm.userTimeZone"
              :placeholder="
                $t('gfuc.please_enter_user_time_zone' /** 请输入用户时区 **/)
              "
            />
          </el-form-item>
          <el-form-item
            :label="$t('gfuc.order_time' /** 下单时间 **/)"
            prop="orderTime"
          >
            <el-date-picker
              v-model="searchForm.orderTime"
              type="daterange"
              :start-placeholder="$t('gfuc.start_date' /** 开始日期 **/)"
              :end-placeholder="$t('gfuc.end_date' /** 结束日期 **/)"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </template>

        <template #columns>
          <el-table-column
            v-for="item in exceptionOrderColumns"
            :key="item.prop"
            :prop="item.prop"
            :label="$t(item.label)"
            :width="item?.width || undefined"
            :min-width="item?.minWidth || undefined"
          />

          <el-table-column
            :label="$t('gfuc.operation' /** 操作 **/)"
            width="180"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <!-- 查看 (所有状态都有) -->
                <el-button
                  link
                  type="primary"
                  :icon="View"
                  @click="handleView(row)"
                />
              </div>
            </template>
          </el-table-column>
        </template>
      </TableLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { View } from "@element-plus/icons-vue";
import TableLayout from "@/components/TableLayout/index.vue";

defineOptions({
  name: "ExceptionOrderTable"
});

const exceptionOrderColumns = [
  { prop: "customerName", label: "客户名称", minWidth: "120" },
  { prop: "orderSource", label: "订单来源", width: "100" },
  { prop: "waybillNo", label: "运单号", minWidth: "160" },
  { prop: "cusOrderNo", label: "客户单号", minWidth: "160" },
  { prop: "consigneeCode", label: "收件邮编", width: "110" },
  { prop: "unusualTypeValue", label: "异常类型值", width: "120" },
  {
    prop: "describe",
    label: "描述",
    minWidth: "180",
    showOverflowTooltip: true
  },
  { prop: "unusualField", label: "异常字段", minWidth: "140" },
  {
    prop: "fieldValue",
    label: "异常字段值",
    minWidth: "200",
    showOverflowTooltip: true
  },
  {
    prop: "rule",
    label: "字段校验规则",
    minWidth: "200",
    showOverflowTooltip: true
  },
  { prop: "orderCreateTime", label: "下单时间", width: "160" },
  {
    prop: "requestBody",
    label: "请求参数",
    minWidth: "220",
    showOverflowTooltip: true
  },
  {
    prop: "responseBody",
    label: "响应报文",
    minWidth: "220",
    showOverflowTooltip: true
  },
  { prop: "referenceNo", label: "参考号", minWidth: "150" }
];

const loading = ref(false);

const searchForm = reactive({
  searchValue: "",
  cusOrderNumList: "",
  waybillNoList: "",
  referenceNumber: "",
  searchType: "cusOrderNumList",

  customerNameSet: "",
  orderSourceSet: "",
  unusualType: "",
  userTimeZone: "",
  orderTime: []
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 320
});

const tableData = ref([]);

const fetchData = () => {
  loading.value = true;
  // 模拟接口请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleView = (row: any) => {
  console.log("View", row);
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.el-form-item__label {
  height: 32px;

  .el-radio {
    height: 22px;
  }
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;

  .el-button {
    padding: 0;
    font-size: 18px;
  }
}

.order-content {
  flex: 1;
  overflow: hidden;
}
</style>
