import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  spliceArray,
  spacesOrLineToArr,
  commaToArr,
  formatAmount,
  copyText
} from "./index";

// vi.mock 会被 hoisted，mockLang 需要在 vi.hoisted 中定义
const { mockLang } = vi.hoisted(() => {
  const mockLang = { value: "zh" };
  return { mockLang };
});

vi.mock("element-plus", () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/lang", () => ({
  i18n: {
    global: {
      t: vi.fn((key: string) => key)
    }
  }
}));

vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(() => ({
    lang: mockLang
  }))
}));

describe("spliceArray", () => {
  it("当数组长度小于等于截取长度时返回原数组", () => {
    const arr = [1, 2, 3];
    expect(spliceArray(arr, 5)).toEqual([1, 2, 3]);
  });

  it("当数组长度大于截取长度时返回截取后的数组", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(spliceArray(arr, 3)).toEqual([1, 2, 3]);
  });

  it("长度为0时返回前0个元素（空数组）", () => {
    const arr = [1, 2, 3];
    expect(spliceArray(arr, 0)).toEqual([]);
  });

  it("空数组返回空数组", () => {
    expect(spliceArray([], 5)).toEqual([]);
  });
});

describe("spacesOrLineToArr", () => {
  it("将空格分隔的字符串转为数组", () => {
    const result = spacesOrLineToArr("a b c");
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("将换行分隔的字符串转为数组", () => {
    const result = spacesOrLineToArr("a\nb\nc");
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("支持空格和换行混合分隔", () => {
    const result = spacesOrLineToArr("a b\nc");
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("过滤空字符串", () => {
    const result = spacesOrLineToArr("a\n\nb\n \nc");
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("空字符串返回空数组", () => {
    expect(spacesOrLineToArr("")).toEqual([]);
  });
});

describe("commaToArr", () => {
  it("将逗号分隔的字符串转为数组", () => {
    expect(commaToArr("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("过滤空字符串元素", () => {
    expect(commaToArr("a,,b,")).toEqual(["a", "b"]);
  });

  it("单个元素正常返回", () => {
    expect(commaToArr("hello")).toEqual(["hello"]);
  });

  it("空字符串返回空数组", () => {
    expect(commaToArr("")).toEqual([]);
  });
});

describe("formatAmount", () => {
  it("正数格式化为带千位分隔的字符串", () => {
    const result = formatAmount(1234567.89);
    expect(result).toBe("1,234,567.89");
  });

  it("零值原样返回", () => {
    expect(formatAmount(0)).toBe(0);
  });

  it("负数原样返回（不格式化）", () => {
    expect(formatAmount(-100)).toBe(-100);
  });

  it("整数不显示小数位", () => {
    const result = formatAmount(1000);
    expect(result).toBe("1,000");
  });
});

describe("copyText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true
    });
  });

  it("空文本返回false", async () => {
    const result = await copyText("");
    expect(result).toBe(false);
  });

  it("成功复制后返回true", async () => {
    const result = await copyText("hello world");
    expect(result).toBe(true);
  });

  it("clipboard API失败时使用降级方案（execCommand）并返回true", async () => {
    // Arrange - clipboard throws
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) },
      writable: true,
      configurable: true
    });
    document.execCommand = vi.fn().mockReturnValue(true);

    // Act
    const result = await copyText("hello");

    // Assert
    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});
