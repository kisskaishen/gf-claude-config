import request from "@/utils/request";
import type { PageResult } from "@/utils/request";

/**
 * 接口路径规范示例: /api/{version}/{service-name}/{resource}/{operation}
 * 例如: /api/v1/dbu_oms/product/getByProductCode
 */

// 定义数据模型
export interface ProductItem {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  stock: number;
}

// 1. 获取产品列表 (分页)
export function getProductList(params: {
  pageNum: number;
  pageSize: number;
  keyword?: string;
}) {
  return request<PageResult<ProductItem>>({
    url: "/v1/dbu_oms/product/list",
    method: "get",
    params
  });
}

// 2. 根据产品编码获取详情
export function getProductByCode(productCode: string) {
  return request<ProductItem>({
    url: "/v1/dbu_oms/product/getByProductCode",
    method: "get",
    params: { productCode }
  });
}

// 3. 创建产品
export function createProduct(data: Omit<ProductItem, "id">) {
  return request({
    url: "/v1/dbu_oms/product/create",
    method: "post",
    data
  });
}

// 4. 更新产品
export function updateProduct(data: ProductItem) {
  return request({
    url: "/v1/dbu_oms/product/update",
    method: "post",
    data
  });
}
