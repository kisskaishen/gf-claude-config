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

// // 1. 获取订单列表 (分页)
// export function getOrderList(params: {
//   pageNum: number;
//   pageSize: number;
//   keyword?: string;
// }) {
//   return request<OrderItem>({
//     url: "/v1/dbu_oms/order/list",
//     method: "post",
//     params
//   });
// }

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
export function getAddressByCode(postcode: string) {
  return request({
    url: `/delivery/system/getByCode/${postcode}`,
    method: "get"
  });
}

//  根据省份ID获取城市列表
export function getListCityBySid(stateId: string) {
  return request({
    url: `/delivery/system/listCityBySid/${stateId}`,
    method: "get"
  });
}

// 订单列表-产品
export function getOrderProductList(params: { CountryCode: string }) {
  return request({
    url: "api-v1/product-config/gfuc-query-config",
    method: "get",
    params
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
