import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import {
  postCheckAccount,
  getAccountCountry,
  postRegister,
  postSendVerificationCode,
  getVerifyCode,
  postLogin,
  getUserInfo,
  postUpdateUserInfo,
  postOpenService
} from "./user";

describe("user API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postCheckAccount", () => {
    it("应发送账号核对请求", async () => {
      await postCheckAccount({ country: "FR", email: "test@test.com" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/email/check",
        method: "post",
        data: { country: "FR", email: "test@test.com" }
      });
    });
  });

  describe("getAccountCountry", () => {
    it("应以post方法获取走货国家列表", async () => {
      mockRequest.mockResolvedValue(["FR", "IT"]);
      await getAccountCountry({ accountId: "123" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/accountCountry",
        method: "post",
        data: { accountId: "123" }
      });
    });
  });

  describe("postRegister", () => {
    it("应发送注册请求", async () => {
      const data = {
        country: "FR",
        email: "new@test.com",
        password: "encrypted",
        verificationCode: "123456",
        protocolTracing: "v1.0"
      };

      await postRegister(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/register",
        method: "post",
        data
      });
    });
  });

  describe("postSendVerificationCode", () => {
    it("应发送验证码请求", async () => {
      await postSendVerificationCode({ country: "FR", email: "test@test.com" });

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/register/email/code",
        method: "post",
        data: { country: "FR", email: "test@test.com" }
      });
    });
  });

  describe("getVerifyCode", () => {
    it("应以get方法获取验证码图片", async () => {
      await getVerifyCode();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/verifyCode",
        method: "get"
      });
    });
  });

  describe("postLogin", () => {
    it("应发送登录请求", async () => {
      const data = {
        email: "user@test.com",
        password: "encrypted",
        code: "abcd",
        uuid: "uuid-123"
      };

      await postLogin(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/user/login",
        method: "post",
        data
      });
    });
  });

  describe("getUserInfo", () => {
    it("应以get方法获取用户信息", async () => {
      await getUserInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/userinfo",
        method: "get"
      });
    });
  });

  describe("postUpdateUserInfo", () => {
    it("应发送更新用户信息请求", async () => {
      const data = { name: "New Name", defaultLanguage: "en" };
      await postUpdateUserInfo(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/userinfo/update",
        method: "post",
        data
      });
    });
  });

  describe("postOpenService", () => {
    it("应发送开通服务请求", async () => {
      const data = {
        shippingVolume: "100-500",
        shippingFrequency: "weekly",
        email: "user@test.com"
      };

      await postOpenService(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/fms/customer/lead",
        method: "post",
        data
      });
    });
  });
});
