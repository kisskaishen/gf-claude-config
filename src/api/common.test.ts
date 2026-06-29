import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock request module
const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import { getDictByCode, getPublicKey, uploadFile, getI18nMap } from "./common";

describe("common API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDictByCode", () => {
    it("应以get方法请求指定字典编码", async () => {
      mockRequest.mockResolvedValue([]);
      await getDictByCode("test_code");

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/sys/dict/findByGroupKey",
        method: "get",
        params: { groupKey: "test_code" }
      });
    });
  });

  describe("getPublicKey", () => {
    it("应以get方法请求公钥", async () => {
      mockRequest.mockResolvedValue("mockPublicKey");
      await getPublicKey();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/publicKey",
        method: "get"
      });
    });
  });

  describe("uploadFile", () => {
    it("应以post方法上传文件，设置multipart/form-data头", async () => {
      const formData = new FormData();
      formData.append("file", new Blob(["test"]));
      mockRequest.mockResolvedValue({ url: "/file/1" });

      await uploadFile(formData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/file/upload",
        method: "post",
        headers: { "Content-Type": "multipart/form-data" },
        data: formData
      });
    });
  });

  describe("getI18nMap", () => {
    it("应以get方法请求i18n词条", async () => {
      mockRequest.mockResolvedValue({ key: "value" });
      await getI18nMap();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/sys/i18n/getWebI18nAll",
        method: "get"
      });
    });
  });
});
