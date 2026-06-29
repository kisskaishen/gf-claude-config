import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadFile } from "./download";

vi.mock("file-saver", () => ({
  default: { saveAs: vi.fn() }
}));

vi.mock("jszip", () => ({
  default: vi.fn()
}));

describe("downloadFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
    // Mock anchor click via prototype
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(vi.fn());
  });

  it("通过URL字符串下载文件", async () => {
    // Arrange
    const mockBlob = new Blob(["test"]);
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(mockBlob)
    });
    const appendSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(vi.fn());
    const removeSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation(vi.fn());

    // Act
    await downloadFile("https://example.com/file.pdf", "test.pdf");

    // Assert
    expect(fetch).toHaveBeenCalledWith("https://example.com/file.pdf");
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("通过Blob对象下载文件", async () => {
    // Arrange
    const blob = new Blob(["content"]);
    vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn());
    vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn());

    // Act
    await downloadFile(blob, "file.txt");

    // Assert
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("未提供文件名时从URL中提取文件名", async () => {
    // Arrange
    const mockBlob = new Blob(["test"]);
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(mockBlob)
    });
    vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn());
    vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn());

    // Act
    await downloadFile("https://example.com/download/myfile.pdf");

    // Assert - no error thrown
    expect(fetch).toHaveBeenCalled();
  });

  it("下载失败时降级为新窗口打开", async () => {
    // Arrange
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));
    window.open = vi.fn();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Act
    await downloadFile("https://example.com/file.pdf");

    // Assert
    expect(window.open).toHaveBeenCalledWith(
      "https://example.com/file.pdf",
      "_blank"
    );
    consoleSpy.mockRestore();
  });
});
