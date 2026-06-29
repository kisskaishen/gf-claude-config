import { describe, it, expect, vi, beforeEach } from "vitest";
import { rsaEncryptPwd } from "./crypto";

// vi.mock 会被 hoisted，所以在 vi.hoisted 中定义变量
const { mockEncrypt, MockJSEncrypt } = vi.hoisted(() => {
  const mockEncrypt = vi.fn();
  class MockJSEncrypt {
    setPublicKey = vi.fn();
    encrypt = mockEncrypt;
  }
  return { mockEncrypt, MockJSEncrypt };
});

vi.mock("jsencrypt", () => ({
  default: MockJSEncrypt
}));

vi.mock("@/api/common", () => ({
  getPublicKey: vi.fn()
}));

import { getPublicKey } from "@/api/common";

describe("rsaEncryptPwd", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该成功加密密码并返回Base64密文", async () => {
    // Arrange
    const rawPassword = "testPassword123";
    const mockPublicKey = "MOCK_PUBLIC_KEY_BASE64";
    const mockEncryptedResult = "encryptedBase64String";
    vi.mocked(getPublicKey).mockResolvedValue(mockPublicKey);
    mockEncrypt.mockReturnValue(mockEncryptedResult);

    // Act
    const result = await rsaEncryptPwd(rawPassword);

    // Assert
    expect(getPublicKey).toHaveBeenCalledOnce();
    expect(result).toBe(mockEncryptedResult);
  });

  it("应该在加密失败（encrypt返回false）时抛出错误", async () => {
    // Arrange
    const rawPassword = "tooLongPassword";
    const mockPublicKey = "MOCK_PUBLIC_KEY_BASE64";
    vi.mocked(getPublicKey).mockResolvedValue(mockPublicKey);
    mockEncrypt.mockReturnValue(false);

    // Act & Assert
    await expect(rsaEncryptPwd(rawPassword)).rejects.toThrow(
      "密码加密失败，请检查密码长度或公钥有效性"
    );
  });

  it("应该在公钥为空字符串时也正常调用加密", async () => {
    // Arrange
    const rawPassword = "testPassword";
    vi.mocked(getPublicKey).mockResolvedValue("");
    mockEncrypt.mockReturnValue("encryptedResult");

    // Act
    const result = await rsaEncryptPwd(rawPassword);

    // Assert
    expect(result).toBe("encryptedResult");
  });

  it("应该在getPublicKey请求失败时向上抛出异常", async () => {
    // Arrange
    vi.mocked(getPublicKey).mockRejectedValue(new Error("Network Error"));

    // Act & Assert
    await expect(rsaEncryptPwd("password")).rejects.toThrow("Network Error");
  });
});
