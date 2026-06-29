import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import {
  getOrderList,
  getExceptionOrderList,
  getOrderDetail,
  getExceptionOrderDetail,
  getOrderTracking,
  createOrder,
  getSenderName,
  getPostcodeByCity,
  getAddressByCode,
  getListCityBySid,
  getStateList,
  getOrderProductList,
  getProductStepInfo,
  getOrderLabelUrl,
  batchPrintOrderLabel,
  cancelOrder,
  downloadOrderTemplate,
  uploadOrder,
  getOrderImportResult,
  downloadFailedOrderData,
  queryProductChannelCode
} from "./order";

describe("order API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrderList", () => {
    it("应分页查询订单列表", async () => {
      const data = {
        data: { orderNumber: "ORD-001" },
        pageNum: 1,
        pageSize: 10
      };

      await getOrderList(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/order/pageList",
        method: "post",
        data
      });
    });
  });

  describe("getOrderDetail", () => {
    it("应以get方法查询订单详情", async () => {
      await getOrderDetail({ id: "order-123" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/order/detail",
        method: "get",
        params: { id: "order-123" }
      });
    });
  });

  describe("getExceptionOrderDetail", () => {
    it("应以get方法查询异常订单详情", async () => {
      await getExceptionOrderDetail({ unusualOrderId: "unusual-456" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/getRequestDetail",
        method: "get",
        params: { unusualOrderId: "unusual-456" }
      });
    });
  });

  describe("getOrderTracking", () => {
    it("应以post方法查询物流轨迹", async () => {
      await getOrderTracking({ orderNumber: "ORD-001" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/dlts/track/query",
        method: "post",
        data: { orderNumber: "ORD-001" }
      });
    });
  });

  describe("createOrder", () => {
    it("应以post方法创建订单", async () => {
      const data = { productCode: "P001", quantity: 1 };
      await createOrder(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/create/order",
        method: "post",
        data
      });
    });
  });

  describe("getSenderName", () => {
    it("应以get方法获取发件人姓名", async () => {
      await getSenderName({ customerId: "cust-1" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "userShipper/selectUserShipperInfoByCustomerId",
        method: "get",
        params: { customerId: "cust-1" }
      });
    });
  });

  describe("getPostcodeByCity", () => {
    it("应以post方法根据城市获取邮编", async () => {
      await getPostcodeByCity({ cityId: "city-1", stateId: "state-1" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/delivery/system/listAddressByCityOrState?cityId=city-1&stateId=state-1",
        method: "post"
      });
    });
  });

  describe("getAddressByCode", () => {
    it("应以post方法根据邮编获取地址", async () => {
      await getAddressByCode({ postcode: "75001" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/delivery/system/getByCode?postcode=75001",
        method: "post"
      });
    });
  });

  describe("getStateList", () => {
    it("应以post方法获取州/省列表", async () => {
      await getStateList();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/delivery/system/selectSysStateCode",
        method: "post"
      });
    });
  });

  describe("getOrderProductList", () => {
    it("应以post方法获取订单产品列表", async () => {
      await getOrderProductList({ countryCode: "FR" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/plm/product/query-config",
        method: "post",
        data: { countryCode: "FR" }
      });
    });
  });

  describe("getOrderLabelUrl", () => {
    it("应以get方法获取面单URL", async () => {
      await getOrderLabelUrl({ waybillNo: "YD-001", customerId: "cust-1" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/label/getOrderLabelUrl",
        method: "get",
        params: { waybillNo: "YD-001", customerId: "cust-1" }
      });
    });
  });

  describe("cancelOrder", () => {
    it("应以post方法取消订单", async () => {
      const data = {
        orderId: "order-123",
        cancelReason: "重复下单"
      };

      await cancelOrder(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/cancel",
        method: "post",
        data
      });
    });
  });

  describe("downloadOrderTemplate", () => {
    it("应以get方法下载模板，设置responseType为blob", async () => {
      await downloadOrderTemplate({ customerId: "cust-1" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/oms/order/downloadTemplate",
        method: "get",
        params: { customerId: "cust-1" },
        responseType: "blob"
      });
    });
  });

  describe("getOrderImportResult", () => {
    it("应以get方法查询导入结果，taskId拼接在URL中", async () => {
      await getOrderImportResult("task-789");

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/taskCenter/getOrderImportItem?taskId=task-789",
        method: "get"
      });
    });
  });

  describe("downloadFailedOrderData", () => {
    it("应以get方法下载失败订单数据", async () => {
      await downloadFailedOrderData("file-key-123");

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/file/download?fileKey=file-key-123",
        method: "get"
      });
    });
  });
});
