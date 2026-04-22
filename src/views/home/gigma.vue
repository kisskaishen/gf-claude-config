<template>
  <div class="container p-6">
    <!-- 欢迎信息 -->
    <h1 class="mb-6 text-xl font-medium">你好，xxx</h1>

    <!-- 总金额和状态卡片 -->
    <div class="flex justify-between gap-6 mb-6">
      <!-- 总下单金额 -->
      <div
        class="flex-1 p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50"
      >
        <p class="mb-2 text-sm text-gray-600">总下单金额</p>
        <p class="text-2xl font-bold text-primary">€ 5,415,654.51</p>
        <div class="pt-4 mt-4 border-t border-orange-200">
          <a href="#" class="text-sm text-primary hover:underline">查看明细</a>
        </div>
      </div>

      <!-- 派送中 -->
      <div
        class="flex flex-col items-center justify-center p-4 bg-white border rounded-lg border-card min-w-[286px]"
      >
        <p class="mb-2 text-3xl font-bold text-center text-primary">0</p>
        <p class="text-center text-gray-600">派送中</p>
      </div>

      <!-- 已签收 -->
      <div
        class="flex flex-col items-center justify-center p-4 bg-white border rounded-lg border-card min-w-[286px]"
      >
        <p class="mb-2 text-3xl font-bold text-center text-primary">0</p>
        <p class="text-center text-gray-600">已签收</p>
      </div>
    </div>

    <!-- 运单号查询 -->
    <div class="flex mb-8">
      <!-- <input
        type="text"
        placeholder="请输入你的运单号"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        class="px-6 py-2 text-white transition-colors rounded-r-md bg-primary hover:bg-primary-hover"
      >
        查询
      </button> -->
      <el-input
        v-model="trackingNo"
        placeholder="请输入你的运单号"
        class="flex-1 custom-input"
      >
        <template #append>
          <!-- 追加按钮 -->
          <el-button type="primary" class="custom-append-btn"> 查询 </el-button>
        </template>
      </el-input>
    </div>

    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
      <!-- 预报订单 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg border-card hover:shadow-md"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          预报订单
        </h3>
        <p class="text-sm text-center text-gray-600">
          只需要简单填写信息，即可快速预报订单
        </p>
      </div>

      <!-- 问题件管理 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg border-card hover:shadow-md"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.77-1.732-.77-2.502 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          问题件管理
        </h3>
        <p class="text-sm text-center text-gray-600">
          快速查看有问题的包裹信息
        </p>
      </div>

      <!-- 查看账单 -->
      <div
        class="p-6 transition-shadow bg-white border rounded-lg border-card hover:shadow-md"
      >
        <div class="flex justify-center mb-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <h3 class="mb-2 text-lg font-medium text-center text-primary">
          查看账单
        </h3>
        <p class="text-sm text-center text-gray-600">进行账单查看，下载</p>
      </div>
    </div>

    <!-- 流程步骤 -->
    <div class="flex flex-wrap items-center justify-between mb-8">
      <!-- 开通服务 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-10 h-10 mb-2 text-white rounded-full bg-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600">开通服务</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 预报订单 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-10 h-10 mb-2 rounded-full text-primary bg-primary-light"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600">预报订单</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 打印面单 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-10 h-10 mb-2 rounded-full text-primary bg-primary-light"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600">打印面单</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 发货运输 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-10 h-10 mb-2 rounded-full text-primary bg-primary-light"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600">发货运输</p>
      </div>

      <!-- 箭头 -->
      <div class="my-2">
        <svg-icon name="homeStep" width="32px" height="32px" />
      </div>

      <!-- 派送签收 -->
      <div class="flex flex-col items-center">
        <div
          class="flex items-center justify-center w-10 h-10 mb-2 rounded-full text-primary bg-primary-light"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600">派送签收</p>
      </div>
    </div>

    <!-- 右侧帮助和反馈 -->
    <div
      class="fixed right-0 flex flex-col gap-2 -translate-y-1/2 bg-white shadow-md top-1/2 px-1.5 py-3"
    >
      <!-- 帮助 -->
      <div
        class="flex flex-col items-center justify-center w-12 transition-shadow bg-white cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm text-info">帮助</span>
      </div>
      <el-divider style="margin: 0" />
      <!-- 反馈 -->
      <div
        class="flex flex-col items-center justify-center w-12 transition-shadow bg-white cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span class="text-sm text-info">反馈</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加组件逻辑
import { ref } from "vue";

const trackingNo = ref("");
</script>

<style scoped lang="scss">
/* 额外的样式可以在这里添加 */
// .custom-input {
//   --el-input-border-color: #ff7d00;
//   --el-input-hover-border-color: #ff7d00;
//   --el-input-focus-border-color: #ff7d00;
// }

.custom-input {
  :deep(.el-input__wrapper) {
    height: 48px;
    padding: 0 18px;
    text-align: center;
    background-color: #fff;
    border: 2px solid var(--color-primary);
    border-radius: 24px 0 0 2px; /* 超大圆角 */
    box-shadow: none;

    .el-input__inner {
      font-size: 16px;
      color: #333;
      text-align: center;
    }
  }

  :deep(.el-input-group__append) {
    background-color: transparent !important;
    box-shadow: none !important;
  }
}

.custom-append-btn {
  width: 94px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  color: #fff !important;
  cursor: pointer !important;
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  border-radius: 0 2px 24px 0; /* 右侧圆角匹配 */
}
</style>
