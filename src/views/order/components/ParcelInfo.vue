<template>
  <div class="pt-5 step-container">
    <div
      class="mr-4 step-left"
      :class="{ 'step-completed': isCompleted, 'step-active': isActive }"
    >
      <div class="step-number">{{ stepNumber }}</div>
      <div class="step-line"></div>
    </div>

    <div class="step-content">
      <div class="step-content-header">
        <h3 class="step-content-header-title">包裹信息&其他信息</h3>
        <!-- 清除数据 -->
        <svg-icon
          name="order-clear"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onClear"
          v-if="isActive"
        />
        <!-- 编辑数据 -->
        <svg-icon
          name="order-edit"
          class="step-content-header-icon"
          width="20"
          height="20"
          @click="onEdit"
          v-if="!isActive && isCompleted"

        />
   
      </div>

      <div v-if="isActive || isCompleted" class="step-content-form">
      <div v-if="isActive" class="form-container">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">  
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="总包裹重 (kg)" prop="totalWeight">
                <el-input v-model.number="formData.totalWeight" placeholder="请填写包裹总重量" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="长(cm)" prop="length">
                <el-input v-model.number="formData.length" placeholder="请填写包裹长度" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="宽(cm)" prop="width">
                <el-input v-model.number="formData.width" placeholder="请填写包裹宽度" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="高(cm)" prop="height">
                <el-input v-model.number="formData.height" placeholder="请填写包裹高度" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row>
            <el-col :span="24">
              <el-form-item  label-width="0" required>
                <el-table :data="formData.goods" border style="width: 100%" class="goods-table">
                  <el-table-column prop="nameCn" label="商品名称(CN)" min-width="200">
                    <template #default="{ row, $index }">
                      <el-form-item 
                        :prop="`goods.${$index}.nameCn`" 
                        :rules="rules.tableItem.nameCn"
                        class="table-form-item"
                        required
                      >
                        <el-input 
                          v-model="row.nameCn" 
                          placeholder="请填写商品名称(CN)" 
                        />
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column prop="nameEn" label="商品名称(EN)" min-width="200">
                    <template #default="{ row, $index }">
                      <el-form-item 
                        :prop="`goods.${$index}.nameEn`" 
                        :rules="rules.tableItem.nameEn"
                        class="table-form-item"
                        required
                      >
                        <el-input 
                          v-model="row.nameEn" 
                          placeholder="请填写商品名称(EN)" 
                        />
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column prop="quantity" label="数量" width="120">
                    <template #default="{ row, $index }">
                      <el-form-item 
                        :prop="`goods.${$index}.quantity`" 
                        :rules="rules.tableItem.quantity"
                        class="table-form-item"
                        required
                      >
                        <el-input 
                          v-model.number="row.quantity" 
                          placeholder="数量" 
                          type="number" 
                          min="1" 
                        />
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ $index }">
                      <div class="table-actions">
                        <el-button 
                          size="small" 
                          @click="addGoods" 
                          circle
                        >
                          <svg-icon name="order-goods-add" class="step-content-header-icon" width="20" height="20" />
                        </el-button>
                        <el-button 
                          size="small" 
                          @click="removeGoods($index)" 
                          circle
                        >
                          <svg-icon name="order-goods-reduce" class="step-content-header-icon" width="20" height="20" />

                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                <!-- <div class="goods-table-tips">
                  <span>最多可添加5个商品</span>
                </div> -->
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申报价值 (EUR)" prop="declaredValue">
                <el-input v-model.number="formData.declaredValue" placeholder="请填写商品总申报价值" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="客户单号" prop="customerOrderNumber">
                <el-input v-model="formData.customerOrderNumber" placeholder="客户唯一的订单号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="参考单号" prop="referenceNumber">
                <el-input v-model="formData.referenceNumber" placeholder="平台参考号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服务商跟踪号" prop="serviceProviderTrackingNumber">
                <el-input v-model="formData.serviceProviderTrackingNumber" placeholder="第三方服务商的跟踪号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="渠道编码" prop="channelCode">
                <el-input v-model="formData.channelCode" placeholder="第三方服务商的渠道编码" />
              </el-form-item>
            </el-col>
            
          </el-row>
          
        </el-form>
      </div>
      
      <div v-else class="summary-container">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>包裹信息&其他信息</span>
            </div>
          </template>
          <div class="summary-content">
            <p><strong>包裹尺寸：</strong>{{ formData.length }}cm × {{ formData.width }}cm × {{ formData.height }}cm</p>
            <p><strong>总重量：</strong>{{ formData.totalWeight }}kg</p>
            <p><strong>申报价值：</strong>{{ formData.declaredValue }} EUR</p>
            <p v-if="formData.goods.length > 0">
              <strong>商品信息：</strong>
              <ul>
                <li v-for="(item, index) in formData.goods" :key="index">
                  {{ item.nameCn }} ({{ item.nameEn }}) - {{ item.quantity }}个
                </li>
              </ul>
            </p>
            <p v-if="formData.customerOrderNumber"><strong>客户单号：</strong>{{ formData.customerOrderNumber }}</p>
            <p v-if="formData.referenceNumber"><strong>参考单号：</strong>{{ formData.referenceNumber }}</p>
            <p v-if="formData.serviceProviderTrackingNumber"><strong>服务商跟踪号：</strong>{{ formData.serviceProviderTrackingNumber }}</p>
          </div>
        </el-card>
      </div>
    </div>
    
    <div v-else class="step-placeholder">
      <p>请填写包裹信息、重量、材质、品类信息等</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  stepNumber: {
    type: Number,
    default: 4
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['edit', 'submit', 'update:formData']);

const formRef = ref(null);

const formData = ref({
  totalWeight: '',
  length: '',
  width: '',
  height: '',
  goods: [
    {
      nameCn: '',
      nameEn: '',
      quantity: ''
    }
  ],
  declaredValue: '',
  customerOrderNumber: '',
  referenceNumber: '',
  serviceProviderTrackingNumber: '',
  channelCode: '',
  ...props.initialData
});



const rules = reactive({
  totalWeight: [{ required: true, message: '请输入总包裹重', trigger: ['blur', 'change'] }],
  length: [{ required: true, message: '请输入包裹长度', trigger: ['blur', 'change'] }],
  width: [{ required: true, message: '请输入包裹宽度', trigger: ['blur', 'change'] }],
  height: [{ required: true, message: '请输入包裹高度', trigger: ['blur', 'change'] }],
  tableItem: {
    nameCn: [{ required: true, message: '请输入商品名称(中文)', trigger: ['blur', 'change'] }],
    nameEn: [{ required: true, message: '请输入商品名称(EN)', trigger: ['blur', 'change'] }],
    quantity: [{ required: true, message: '请输入商品数量', trigger: ['blur', 'change'] }]
  }

});

watch(formData, (newValue) => {
  emit('update:formData', newValue);
}, { deep: true });

const addGoods = () => {
  if (formData.value.goods.length < 5) {
    formData.value.goods.push({
      nameCn: '',
      nameEn: '',
      quantity: ''
    });
  }
};

const removeGoods = (index) => {
  if (formData.value.goods.length > 1) {
    formData.value.goods.splice(index, 1);
  }
};

const onClear = () => {
  formData.value = {
    totalWeight: '',
    length: '',
    width: '',
    height: '',
    goods: [
      {
        nameCn: '',
        nameEn: '',
        quantity: ''
      }
    ],
    declaredValue: '',
    customerOrderNumber: '',
    referenceNumber: '',
    serviceProviderTrackingNumber: '',
    ...props.initialData
  };
};



const onEdit = () => {
  emit("edit");
};

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // emit('submit');
    }
  });
};
defineExpose({
  validate: onSubmit
});
</script>

<style scoped lang="scss">
@import "@/views/order/style/base";

.table-actions {
  .el-button {
    border: none;
  }
}
</style>