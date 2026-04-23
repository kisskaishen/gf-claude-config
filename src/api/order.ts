import request from "@/utils/request";

/**
 * 接口路径规范示例: /api/{version}/{service-name}/{resource}/{operation}
 * 例如: /api/v1/dbu_oms/product/getByProductCode
 */

// // 定义数据模型
// export interface OrderItem {
//   id: number;
//   productCode: string;
//   productName: string;
//   price: number;
//   stock: number;
// }

// 1. 获取订单列表 (分页)
export function getOrderList(data: {
  data: {
    /** 单号 */
    orderNumber?: string;

    /** 客户名称集合 */
    customerNameSet?: string[];

    /** 订单状态集合 */
    orderStatusSet?: string[];

    /** 订单来源 */

    /** 收件地邮编 */
    consigneeCodeList?: string[];

    /** 产品编码 */
    productCodeList?: string[];

    /** 开始时间 */
    queryStartTime?: string;

    /** 结束时间 */
    queryEndTime?: string;
  };
  pageNum: number;
  pageSize: number;
}) {
  return request({
    url: "/oms/order/pageList",
    method: "post",
    data
  });
}

// 下单失败列表
export function getExceptionOrderList(data: any) {
  return request({
    url: "/oms/unusualOrderPageList",
    method: "post",
    data
  });
}

// // 2. 根据订单编码获取详情
// export function getOrderByCode(orderCode: string) {
//   return request<OrderItem>({
//     url: "/v1/dbu_oms/product/getByProductCode",
//     method: "get",
//     params: { productCode }
//   });
// }

// 3. 创建订单
export function createOrder(data: any) {
  return request({
    url: "/oms/create/order",
    method: "post",
    data
  });
}

// // 4. 更新订单
// export function updateOrder(data: OrderItem) {
//   return request({
//     url: "/v1/dbu_oms/product/update",
//     method: "post",
//     data
//   });
// }

//  根据邮政编码获取地址
export function getAddressByCode(data: { postcode: string }) {
  return request({
    url: `/delivery/system/getByCode?postcode=${data.postcode}`,
    method: "post"
  });
}

//  根据省份ID获取城市列表
export function getListCityBySid(data: { stateId: string }) {
  return request({
    url: `/delivery/system/listCityBySid?stateId=${data.stateId}`,
    method: "post"
  });
}

// 获取州/省的地址
export function getStateList() {
  return request({
    url: "/delivery/system/selectSysStateCode",
    method: "post"
  });
}

// 订单列表-产品
export function getOrderProductList(data: { countryCode: string }) {
  return request({
    url: "/plm/product/query-config",
    method: "post",
    data
  });
}

// 列表操作模块

// 打印
export function getOrderLabelUrl(params: {
  waybillNo: string;
  customerId: string | number;
}) {
  return request({
    url: "/oms/label/getOrderLabelUrl",
    method: "get",
    params
  });
}
// 批量打印
export function batchPrintOrderLabel(data: { waybillNos: string[] }) {
  return request({
    url: "/oms/label/batchPrintLabel",
    method: "post",
    data
  });
}
