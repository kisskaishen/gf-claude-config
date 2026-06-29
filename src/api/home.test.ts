import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import {
  getBalanceInfo,
  getRecentCount,
  uploadWorkOrderAttachment,
  addWorkOrder
} from "./home";

describe("home API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBalanceInfo", () => {
    it("应以get方法获取首页余额", async () => {
      await getBalanceInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/home/balance/info",
        method: "get"
      });
    });
  });

  describe("getRecentCount", () => {
    it("应以get方法获取派送统计", async () => {
      await getRecentCount();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/home/order/recentCount",
        method: "get"
      });
    });
  });

  describe("uploadWorkOrderAttachment", () => {
    it("应以post方法上传工单附件", async () => {
      const formData = new FormData();
      mockRequest.mockResolvedValue("/uploads/file.pdf");

      await uploadWorkOrderAttachment(formData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/consult/upload",
        method: "post",
        headers: { "Content-Type": "multipart/form-data" },
        data: formData
      });
    });
  });

  describe("addWorkOrder", () => {
    it("应以post方法创建工单", async () => {
      const data = { title: "工单标题", content: "工单内容" };

      await addWorkOrder(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/consult/addWorkOrder",
        method: "post",
        data
      });
    });
  });
});
