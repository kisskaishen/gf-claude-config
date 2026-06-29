import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import {
  recharge,
  getRechargeRecord,
  getBalance,
  addBalanceAlertConfig,
  updateBalanceAlertConfig,
  getBalanceAlertConfig,
  getBalanceAlertInfo,
  getFreightBill,
  exportFreightBill,
  downloadFreightBill,
  downloadBill,
  getClaimBill,
  exportClaimBill,
  downloadClaimBill,
  getCustomerSettleCycle
} from "./finance";

describe("finance API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recharge", () => {
    it("应发送充值请求", async () => {
      const data = {
        arrivalAmount: "1000",
        currency: "EUR",
        receiptMethod: "bank",
        remark: "充值测试"
      };

      await recharge(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/recharge/balance",
        method: "post",
        data
      });
    });
  });

  describe("getRechargeRecord", () => {
    it("应分页查询充值记录", async () => {
      const data = { pageNumber: 1, pageSize: 10 };

      await getRechargeRecord(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/recharge/pageQuery",
        method: "post",
        data
      });
    });
  });

  describe("getBalance", () => {
    it("应以get方法查询余额", async () => {
      await getBalance();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/balance/info",
        method: "get"
      });
    });
  });

  describe("getBalanceAlertInfo", () => {
    it("应以get方法查询余额预警信息", async () => {
      await getBalanceAlertInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/userinfo/balance/alert/info",
        method: "get"
      });
    });
  });

  describe("getBalanceAlertConfig", () => {
    it("应以get方法查询余额预警配置，id拼接在URL参数中", async () => {
      await getBalanceAlertConfig(123);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/userConfig/balanceAlert/queryByGfucLoginId?gfucLoginId=123",
        method: "get"
      });
    });
  });

  describe("getFreightBill", () => {
    it("应分页查询运费账单", async () => {
      const data = { pageNum: 1, pageSize: 10 };

      await getFreightBill(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/bill/pageQuery",
        method: "post",
        data
      });
    });
  });

  describe("downloadBill", () => {
    it("应以get方法获取下载链接，id拼接在URL中", async () => {
      await downloadBill({ id: "task-456" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/taskCenter/getDcExportDownloadUrl?taskCenterId=task-456",
        method: "get"
      });
    });
  });

  describe("getClaimBill", () => {
    it("应分页查询理赔账单", async () => {
      const data = { pageNum: 1, pageSize: 10 };

      await getClaimBill(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/claimBill/pageQuery",
        method: "post",
        data
      });
    });
  });

  describe("downloadClaimBill", () => {
    it("应发送理赔账单下载请求", async () => {
      const data = {
        customerPrincipalId: 1,
        numbers: ["BILL-001", "BILL-002"]
      };

      await downloadClaimBill(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/claimBill/download",
        method: "post",
        data
      });
    });
  });

  describe("getCustomerSettleCycle", () => {
    it("应以post方法获取客户结算周期", async () => {
      await getCustomerSettleCycle();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/getCustomerSettleCycle",
        method: "post"
      });
    });
  });
});
