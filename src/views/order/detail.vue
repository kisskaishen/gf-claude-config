<template>
  <div class="order-detail">
    <!-- 顶部：单号信息 + 进度条 -->
    <div class="detail-top-card">
      <!-- 第一行：单号 + 状态 + 操作按钮（三栏等分） -->
      <div class="top-row">
        <div class="order-field">
          <span class="field-label">{{
            $t("web.gfuc.customer_order_no")
          }}</span>
          <span class="field-value">
            {{ orderData?.cOrderNo || "-" }}
            <svg-icon
              v-if="orderData?.cOrderNo"
              name="order-copy"
              width="16"
              height="16"
              class="copy-icon"
              @click="copyText(orderData?.cOrderNo)"
            />
          </span>
        </div>
        <div class="top-divider" />
        <div class="order-field">
          <span class="field-label">{{ $t("web.gfuc.waybill_no") }}</span>
          <span class="field-value">
            {{ orderData?.waybillNo || "-" }}
            <svg-icon
              v-if="orderData?.waybillNo"
              name="order-copy"
              width="16"
              height="16"
              class="copy-icon"
              @click="copyText(orderData?.waybillNo)"
            />
          </span>
        </div>
        <div class="top-divider" />
        <div class="order-field">
          <span class="field-label">{{ $t("web.gfuc.order_status") }}</span>
          <div class="field-value-row">
            <span
              class="status-badge"
              :style="{
                backgroundColor:
                  statusColorMap[orderData?.orderStatus]?.bgColor || '#f5f5f5',
                color:
                  statusColorMap[orderData?.orderStatus]?.textColor || '#333'
              }"
            >
              {{ orderData?.orderStatusName || orderData?.orderStatus || "-" }}
            </span>
            <!-- <template v-if="orderData?.orderStatus === 1">
              <el-button text class="action-btn" @click="handlePrint">
                <svg-icon name="order-printer" width="16" height="16" />
              </el-button>
              <el-button text class="action-btn" @click="handleDelete">
                <svg-icon name="order-delete" width="16" height="16" />
              </el-button>
            </template> -->
          </div>
        </div>
      </div>

      <!-- 第二行：5步进度条 -->
      <div class="progress-row">
        <template v-for="(step, index) in computedSteps" :key="index">
          <div
            v-if="index > 0"
            class="connector"
            :class="{ 'connector-active': step.status <= currentStepStatus }"
          />
          <div class="progress-step">
            <div
              class="step-dot"
              :class="{
                'dot-active': step.status === currentStepStatus,
                'dot-completed': step.status < currentStepStatus,
                'dot-pending': step.status > currentStepStatus,
                'dot-failed':
                  [2, 6, 7, 8].includes(step.status) &&
                  step.status === currentStepStatus
              }"
            >
              <svg-icon
                v-if="stepIcons[step.status]"
                :name="stepIcons[step.status]"
                width="24"
                height="24"
                :color="step.status <= currentStepStatus ? '#fff' : '#C8C8C8'"
              />
            </div>
            <span
              class="step-label"
              :class="{
                'label-active': step.status === currentStepStatus,
                'label-completed': step.status < currentStepStatus,
                'label-pending': step.status > currentStepStatus,
                'label-failed':
                  [2, 6, 7, 8].includes(step.status) &&
                  step.status === currentStepStatus
              }"
              >{{ step.label }}</span
            >
          </div>
        </template>
      </div>
    </div>

    <!-- 底部：两栏布局 -->
    <div class="detail-bottom">
      <!-- 左栏 -->
      <div class="left-column">
        <!-- 基本信息 -->
        <div class="info-card">
          <div class="card-title">
            <span class="title-bar" />
            <span class="title-text">{{
              $t("web.gfuc.basic_info" /** 基本信息 */)
            }}</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.reference_no" /** 参考单号 */)
              }}</span>
              <span class="info-value">
                {{ orderData?.referenceNo || "-" }}
                <svg-icon
                  v-if="orderData?.referenceNo"
                  name="order-copy"
                  width="16"
                  height="16"
                  class="copy-icon"
                  @click="copyText(orderData?.referenceNo)"
                />
              </span>
            </div>
            <div class="grid-divider" />
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.third_party_tracking" /** 第三方跟踪号 */)
              }}</span>
              <span class="info-value">
                {{ orderData?.reference3 || "-" }}
                <svg-icon
                  v-if="orderData?.reference3"
                  name="order-copy"
                  width="16"
                  height="16"
                  class="copy-icon"
                  @click="copyText(orderData?.reference3)"
                />
              </span>
            </div>
            <div class="grid-divider" />
            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.product_type" /** 产品类型 */)
              }}</span>
              <span class="info-value">{{
                orderData?.productType === "ECO"
                  ? $t("web.gfuc.express_delivery")
                  : $t("web.gfuc.standard_delivery") || "-"
              }}</span>
            </div>
            <div class="grid-divider" />

            <div class="info-item">
              <span class="info-label">{{
                $t("web.gfuc.product" /** 产品 */)
              }}</span>
              <span class="info-value">{{
                orderData?.productName || "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 发货信息 -->
        <div class="info-card">
          <div class="card-title">
            <span class="title-bar" />
            <span class="title-text">{{
              $t("web.gfuc.shipment_info" /** 发货信息 */)
            }}</span>
            <span class="delivery-tag">
              <svg-icon name="home" width="16" height="16" />
              {{ $t("web.gfuc.delivery_info" /** 送货上门 */) }}
            </span>
          </div>
          <div class="address-grid">
            <div class="address-column">
              <div class="address-title">
                <svg-icon name="sender" width="24" height="24" />
                <span>{{ $t("web.gfuc.shipper_info" /** 寄件人信息 */) }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.name" /** 姓名 */)
                }}</span>
                <span class="address-value">{{
                  orderData?.orderShipper?.shipperName || "-"
                }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.phone" /** 电话 */)
                }}</span>
                <span class="address-value">{{
                  orderData?.orderShipper?.shipperPhone || "-"
                }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.address" /** 地址 */)
                }}</span>
                <span class="address-value">{{
                  shipperAddress(orderData?.orderShipper) || "-"
                }}</span>
              </div>
            </div>
            <div class="address-divider" />
            <div class="address-column">
              <div class="address-title">
                <svg-icon name="recipient" width="24" height="24" />
                <span>{{
                  $t("web.gfuc.consignee_info_title" /** 收件人信息 */)
                }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.name" /** 姓名 */)
                }}</span>
                <span class="address-value">{{
                  orderData?.orderConsignee?.consigneeName || "-"
                }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.phone" /** 电话 */)
                }}</span>
                <span class="address-value">{{
                  orderData?.orderConsignee?.consigneePhone || "-"
                }}</span>
              </div>
              <div class="address-item">
                <span class="address-label">{{
                  $t("web.gfuc.address" /** 地址 */)
                }}</span>
                <span class="address-value">{{
                  consigneeAddress(orderData?.orderConsignee) || "-"
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 包裹信息&其他信息 -->
        <div class="info-card">
          <div class="card-title">
            <span class="title-bar" />
            <span class="title-text">{{
              $t("web.gfuc.parcel_and_other" /** 包裹信息&其他信息 */)
            }}</span>
          </div>
          <el-table
            :data="orderData?.orderItemList || []"
            border
            style="width: 100%"
            class="goods-table"
            header-cell-class-name="table-header"
          >
            <el-table-column
              prop="itemNameZh"
              :label="$t('web.gfuc.product_name_cn' /** 中文品名 */)"
              min-width="200"
            >
              <template #default="{ row }">
                {{ row.itemNameZh || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemNameEn"
              :label="$t('web.gfuc.product_name_en' /** 商品英文名称 */)"
              min-width="200"
            >
              <template #default="{ row }">
                {{ row.itemNameEn || "-" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="itemQty"
              :label="$t('web.gfuc.quantity' /** 数量 */)"
              width="120"
            >
              <template #default="{ row }">
                {{ row.itemQty || "-" }}
              </template>
            </el-table-column>
          </el-table>

          <div class="parcel-summary">
            <div class="summary-item">
              <span class="summary-label">{{
                $t("web.gfuc.total_quantity" /** 总数量 */)
              }}</span>
              <span class="summary-value">{{
                orderData?.orderItemList?.reduce(
                  (acc, cur) => acc + (cur.itemQty || 0),
                  0
                ) || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="summary-item">
              <span class="summary-label">{{
                $t("web.gfuc.declared_value" /** 申报价值 */)
              }}</span>
              <span class="summary-value">{{
                orderData?.declaredValue || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="summary-item">
              <span class="summary-label"
                >{{ $t("web.gfuc.total_weight" /** 总重量 */) }}(kg)</span
              >
              <span class="summary-value">{{
                orderData?.orderGoods?.weight || "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="summary-item">
              <span class="summary-label">{{
                $t("web.gfuc.parcel_volume" /** 体积 */)
              }}</span>
              <span class="summary-value">{{
                orderData?.orderGoods?.length &&
                orderData?.orderGoods?.width &&
                orderData?.orderGoods?.height
                  ? `${orderData.orderGoods.length}*${orderData.orderGoods.width}*${orderData.orderGoods.height}CM`
                  : "-"
              }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="summary-item">
              <span class="summary-label"
                >{{ $t("web.gfuc.charging_weight" /** 计费重量 */) }}(kg)</span
              >
              <span class="summary-value">{{
                orderData?.orderGoods?.weight || "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏 -->
      <div class="right-column">
        <!-- 轨迹信息 -->
        <div class="tracking-card">
          <div class="card-title">
            <span class="title-bar" />
            <span class="title-text">{{
              $t("web.gfuc.tracking_info" /** 轨迹信息 */)
            }}</span>
          </div>
          <div class="tracking-list">
            <template v-if="orderData.trackingInfo?.length">
              <div v-for="item in orderData.trackingInfo" :key="item.trackDate">
                <div class="tracking-date-divider">
                  <el-divider content-position="center">{{
                    item.trackDate
                  }}</el-divider>
                </div>
                <div
                  v-for="son in item.trackDetailItemList"
                  :key="son.processTime"
                  class="tracking-item"
                >
                  <div class="tracking-dot">
                    <svg-icon name="completedStep" width="24" height="24" />
                  </div>
                  <div class="tracking-content">
                    <div class="tracking-msg">
                      {{ son.externalTrackContent }}
                    </div>
                    <div class="tracking-time">{{ son.processTime }}</div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="tracking-empty">
              {{ $t("web.gfuc.no_tracking_info" /** 暂无轨迹信息 */) }}
            </div>
          </div>
        </div>

        <!-- 增值服务 -->
        <div v-if="orderData?.orderCod" class="tracking-card">
          <div class="card-title">
            <span class="title-bar" />
            <span class="title-text">{{
              $t("web.gfuc.additional_services" /** 增值服务 */)
            }}</span>
          </div>
          <div class="service-grid">
            <div class="service-item">
              <span class="service-label">{{
                $t("web.gfuc.insurance_amount" /** 保险金额 */)
              }}</span>
              <span class="service-value">{{
                orderData?.orderCod?.currency || "-"
              }}</span>
            </div>
            <div class="service-item">
              <span class="service-label">{{
                $t("web.gfuc.cod_amount" /** COD金额 */)
              }}</span>
              <span class="service-value">{{
                orderData?.orderCod?.codAmount || "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "OrderDetail" });

import { ref, computed, onMounted, watch } from "vue";
import { copyText } from "@/utils/index";
import {
  getOrderDetail,
  getExceptionOrderDetail,
  getOrderTracking
} from "@/api/order";
import { useDict } from "@/hooks/useDict";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAppStore } from "@/store/app";

const route = useRoute();
const appStore = useAppStore();
const orderStatusDict = useDict("order_status");

const orderType = ref(route.params.orderType as string);
const orderData = ref<any>({
  orderItemList: [],
  trackingInfo: []
});

// 计算当前进度状态值
const currentStepStatus = computed(() => orderData.value?.orderStatus || 0);

// 根据订单类型计算进度步骤
const statusSteps = computed(() => {
  const status = orderData.value?.orderStatus;
  let arr: number[] = [];

  // 已取消：只显示 已下单 → 已取消
  if (status === 2) {
    arr = [1, 2];
  }
  // 异常：已下单 → 准备派送 → 派送中 → 异常状态
  else if ([6, 7, 8].includes(status)) {
    arr = [1, 3, 4, status];
  }
  // 正常：已下单 → 准备派送 → 派送中 → 已送达
  else {
    arr = [1, 3, 4, 5];
  }

  return orderStatusDict.options.value
    .filter((item: any) => arr.includes(item.value))
    .map((item: any) => ({
      label: item.label,
      status: item.value
    }));
});

const computedSteps = computed(() => statusSteps.value);

// 步骤图标映射
const stepIcons: Record<number, string> = {
  1: "icon-detail-ordered",
  2: "icon-detail-failed",
  3: "icon-detail-ready-delivery",
  4: "icon-detail-out-delivery",
  5: "icon-detail-delivered",
  6: "icon-detail-failed",
  7: "icon-detail-failed",
  8: "icon-detail-failed"
};

// 状态颜色映射（与订单列表 CommonTag 保持一致）
const statusColorMap: Record<number, { bgColor: string; textColor: string }> = {
  0: { bgColor: "#FEF3EB", textColor: "#FC4C02" },
  1: { bgColor: "#DFEDFF", textColor: "#237BEB" },
  2: { bgColor: "#F0F0F0", textColor: "#999" },
  3: { bgColor: "#FFF4E1", textColor: "#F59E0B" },
  4: { bgColor: "#FFF4E1", textColor: "#F59E0B" },
  5: { bgColor: "#E7F5F0", textColor: "#02B578" },
  6: { bgColor: "#FFE1E4", textColor: "#FF0014" },
  7: { bgColor: "#FFE1E4", textColor: "#FF0014" },
  8: { bgColor: "#FFE1E4", textColor: "#FF0014" },
  888: { bgColor: "#FFE1E4", textColor: "#FF0014" },
  999: { bgColor: "#FFE1E4", textColor: "#FF0014" }
};

onMounted(() => {
  fetchOrderDetail();
});

// 切换语言时重新请求详情接口
watch(
  () => appStore.lang,
  () => {
    fetchOrderDetail();
  }
);

const fetchOrderDetail = async () => {
  try {
    const orderId = route.params.orderId;
    if (!orderId) return;
    if (orderType.value === "order") {
      const response = await getOrderDetail({ id: orderId });
      orderData.value = response || { orderItemList: [], trackingInfo: [] };
    } else {
      const response = await getExceptionOrderDetail({
        unusualOrderId: orderId
      });
      orderData.value = JSON.parse(response?.requestBody || "{}");
    }

    if (orderData.value?.waybillNo) {
      const data = await getOrderTracking({
        orderNumber: orderData.value?.waybillNo
      });
      if (orderData.value) {
        orderData.value.trackingInfo = data[0]?.trackDetailItemList || [];
      }
    }
  } catch (error) {
    console.error("Failed to fetch order detail:", error);
  }
};

const handlePrint = () => {
  // ElMessage.info(t("web.gfuc.printing" /** 打印功能开发中 */));
};

const handleDelete = () => {
  // ElMessage.info($t("web.gfuc.deleting" /** 删除功能开发中 */));
};

// 地址格式化
const shipperAddress = (obj: any) => {
  if (!obj) return "-";
  if (obj?.shipperCountry !== "ZH") {
    return [
      obj?.shipperStreet,
      obj?.shipperCode,
      obj?.shipperArea,
      obj?.shipperCity,
      obj?.shipperState,
      obj?.shipperCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else {
    return [
      obj?.shipperCountry,
      obj?.shipperState,
      obj?.shipperCity,
      obj?.shipperArea,
      obj?.shipperStreet,
      obj?.shipperCode
    ]
      .filter(Boolean)
      .join(" ");
  }
};

const consigneeAddress = (obj: any) => {
  if (!obj) return "-";
  if (obj?.consigneeCountry === "FR") {
    return [
      obj?.consigneeNumExt,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else if (obj?.consigneeCountry === "IT") {
    return [
      obj?.address1,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.address2,
      obj?.address3,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else if (obj?.consigneeCountry === "NL") {
    return [
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn,
      obj?.consigneeCode,
      obj?.consigneeArea,
      obj?.consigneeCity,
      obj?.consigneeState,
      obj?.consigneeCountry
    ]
      .filter(Boolean)
      .join(" ");
  } else {
    return [
      obj?.consigneeCountry,
      obj?.consigneeCode,
      obj?.consigneeState,
      obj?.consigneeCity,
      obj?.consigneeArea,
      obj?.address1,
      obj?.address2,
      obj?.address3,
      obj?.consigneeNumExt,
      obj?.consigneeNumIn
    ]
      .filter(Boolean)
      .join(" ");
  }
};
</script>

<style scoped lang="scss">
.order-detail {
  padding: 0;
  background-color: #f7f7f8;
}

/* 顶部卡片 */
.detail-top-card {
  padding: 24px;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;

  .top-row {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .order-field {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 8px;
      padding: 0 24px;

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        padding-right: 0;
      }

      .field-label {
        font-size: 14px;
        font-weight: 500;
        color: #7a869a;
      }

      .field-value {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 500;
        color: #525252;
      }

      .field-value-row {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 12px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 80px;
      }

      .action-btn {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 500;
        color: #525252;
        cursor: pointer;
        background: #fff;
        border: 1px solid #e5e6e8;
        border-radius: 4px;

        &:hover {
          color: var(--color-primary);
          border-color: var(--color-primary);
        }
      }
    }

    .top-divider {
      flex-shrink: 0;
      align-self: stretch;
      width: 1px;
      background: #e5e6e8;
    }
  }

  /* 进度条 — 居中对齐，圆圈在上文案在下 */
  .progress-row {
    display: flex;
    gap: 0;
    align-items: center;
    justify-content: center;
    width: 80%;
    padding-top: 8px;
    margin: 0 auto;

    .connector {
      flex: 1;
      align-self: center;
      min-width: 20px;
      height: 2px;
      margin-bottom: 24px;
      background: #e0e0e0;

      &.connector-active {
        background: #00d99d;
      }
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .step-dot {
      position: relative;
      z-index: 1;
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      cursor: default;
      border-radius: 50%;

      :deep(svg) {
        cursor: default;
      }

      &.dot-completed {
        color: #fff;
        background: #00d99d;
      }

      &.dot-active {
        color: #fff;
        background: #00d99d;
        box-shadow: 0 0 0 4px rgb(0 217 157 / 15%);
      }

      &.dot-failed {
        color: #fff;
        background: #ff0014;
        box-shadow: 0 0 0 4px rgb(255 0 20 / 15%);
      }

      &.dot-pending {
        color: #c0c0c0;
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
      }
    }

    .step-label {
      margin-top: 8px;
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;

      &.label-active,
      &.label-completed {
        color: #00d99d;
      }

      &.label-pending {
        color: #c0c0c0;
      }

      &.label-failed {
        color: #ff0014;
      }
    }
  }
}

/* 底部两栏 */
.detail-bottom {
  display: flex;
  gap: 24px;

  .left-column {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .right-column {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 16px;
    width: 340px;
  }
}

/* 信息卡片 */
.info-card {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .card-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;

    .title-bar {
      flex-shrink: 0;
      width: 4px;
      height: 22px;
      background: var(--color-primary);
      border-radius: 2px;
    }

    .title-text {
      font-size: 18px;
      font-weight: 500;
      color: #354250;
    }

    .delivery-tag {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 4px 12px;
      margin-left: auto;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-primary);
      background: #ffede4;
      border-radius: 80px;
    }
  }

  .info-grid {
    display: flex;
    align-items: stretch;

    .grid-divider {
      flex-shrink: 0;
      align-self: stretch;
      width: 1px;
      margin: 0 24px;
      background: #e5e6e8;
    }

    .info-item {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 8px;

      .info-label {
        font-size: 14px;
        font-weight: 500;
        color: #7a869a;
      }

      .info-value {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        color: #525252;
      }
    }
  }

  .copy-icon {
    flex-shrink: 0;
    color: #525252;
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
    }
  }
}

/* 地址模块 */
.address-grid {
  display: flex;
  gap: 0;

  .address-divider {
    flex-shrink: 0;
    width: 1px;
    margin: 8px 40px;
    background: #e5e6e8;
  }

  .address-column {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;

    .address-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #354250;
    }

    .address-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;

      .address-label {
        flex-shrink: 0;
        min-width: 32px;
        font-size: 14px;
        font-weight: 500;
        color: #7a869a;
        white-space: nowrap;
      }

      .address-value {
        font-size: 16px;
        font-weight: 500;
        line-height: 1.5;
        color: #525252;
        word-break: break-word;
      }
    }
  }
}

/* 表格 */
.goods-table {
  :deep(.table-header) {
    font-size: 16px;
    font-weight: 500;
    color: #525252;
    background: #f7f7f8;
  }

  :deep(.el-table__header-wrapper) {
    th {
      background: #f7f7f8;
    }
  }
}

.cell-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d2939;
}

.cell-sub {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: #667085;
}

/* 包裹摘要 */
.parcel-summary {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 10px 16px;
  margin-top: 16px;
  background: #f7f7f8;
  border-radius: 4px;

  .el-divider {
    height: 24px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .summary-label {
      font-size: 14px;
      font-weight: 500;
      color: #7a869a;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 500;
      color: #525252;
    }
  }
}

/* 右侧轨迹卡片 */
.tracking-card {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .card-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;

    .title-bar {
      flex-shrink: 0;
      width: 4px;
      height: 22px;
      background: var(--color-primary);
      border-radius: 2px;
    }

    .title-text {
      font-size: 18px;
      font-weight: 500;
      color: #354250;
    }
  }

  .tracking-list {
    display: flex;
    flex-direction: column;

    .tracking-date-divider {
      :deep(.el-divider__text) {
        font-size: 14px;
        color: #999;
      }
    }

    .tracking-item {
      position: relative;
      display: flex;
      gap: 14px;
      margin-bottom: 24px;

      &::before {
        position: absolute;
        top: 20px;
        bottom: -24px;
        left: 11px;
        width: 2px;
        content: "";
        background: #f0f0f0;
      }

      &:last-child::before {
        display: none;
      }

      .tracking-dot {
        flex-shrink: 0;
        color: #bbbdbf;
      }

      .tracking-content {
        flex: 1;

        .tracking-msg {
          font-size: 14px;
          font-weight: 500;
          color: #4e5965;
        }

        .tracking-time {
          margin-top: 4px;
          font-size: 12px;
          color: #999;
        }
      }
    }

    .tracking-empty {
      padding: 40px 0;
      font-size: 14px;
      color: #999;
      text-align: center;
    }
  }

  /* 增值服务 */
  .service-grid {
    display: flex;
    gap: 24px;

    .service-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .service-label {
        font-size: 14px;
        font-weight: 500;
        color: #7a869a;
      }

      .service-value {
        font-size: 16px;
        font-weight: 500;
        color: #525252;
      }
    }
  }
}
</style>
