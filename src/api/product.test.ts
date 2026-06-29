import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest,
  PageResult: {} as any
}));

import {
  getProductList,
  getProductByCode,
  createProduct,
  updateProduct,
  getCustomerProducts
} from "./product";

describe("product API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductList", () => {
    it("应以get方法分页查询产品列表", async () => {
      await getProductList({ pageNum: 1, pageSize: 10, keyword: "test" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/v1/dbu_oms/product/list",
        method: "get",
        params: { pageNum: 1, pageSize: 10, keyword: "test" }
      });
    });
  });

  describe("getProductByCode", () => {
    it("应以get方法根据编码查询产品详情", async () => {
      await getProductByCode("P001");

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/v1/dbu_oms/product/getByProductCode",
        method: "get",
        params: { productCode: "P001" }
      });
    });
  });

  describe("createProduct", () => {
    it("应以post方法创建产品（不含id）", async () => {
      const data = {
        productCode: "P002",
        productName: "新产品",
        price: 99,
        stock: 50
      };

      await createProduct(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/v1/dbu_oms/product/create",
        method: "post",
        data
      });
    });
  });

  describe("updateProduct", () => {
    it("应以post方法更新产品", async () => {
      const data = {
        id: 1,
        productCode: "P001",
        productName: "更新的产品",
        price: 150,
        stock: 30
      };

      await updateProduct(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/v1/dbu_oms/product/update",
        method: "post",
        data
      });
    });
  });

  describe("getCustomerProducts", () => {
    it("应以post方法获取客户产品列表", async () => {
      await getCustomerProducts({ country: "FR", customerId: "cust-1" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/customerProducts",
        method: "post",
        data: { country: "FR", customerId: "cust-1" }
      });
    });
  });
});
