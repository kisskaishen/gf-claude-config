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

export function getAddressByCode(postcode: string) {
  // @ts-ignore
  return request({
    url: `/system/address/getByCode/${postcode}`,
    method: "get"
  });
}
