import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDict, clearDictCache, type DictItem } from "./useDict";

const { mockGetDictByCode, mockLang } = vi.hoisted(() => {
  const mockGetDictByCode = vi.fn();
  const mockLang = { value: "zh" };
  return { mockGetDictByCode, mockLang };
});

vi.mock("@/api/common", () => ({
  getDictByCode: mockGetDictByCode
}));

// lang 返回字符串值（模拟 ref 自动解包），使用 getter 确保读取最新值
vi.mock("@/store/app", () => ({
  useAppStore: vi.fn(() => ({
    get lang() {
      return mockLang.value;
    }
  }))
}));

const mockDictData: DictItem[] = [
  { itemCode: "1", itemValue: "选项一", sortval: 1 },
  { itemCode: "2", itemValue: "选项二", sortval: 2 },
  { itemCode: "A", itemValue: "字母A", sortval: 3 }
];

describe("useDict", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDictCache();
    mockLang.value = "zh";
  });

  it("应正确获取字典数据并转换为options", async () => {
    mockGetDictByCode.mockResolvedValue(mockDictData);

    const { options, refresh } = useDict("testCode");
    await refresh();

    expect(mockGetDictByCode).toHaveBeenCalledWith("testCode");
    expect(options.value).toHaveLength(3);
    expect(options.value[0]).toEqual({ value: 1, label: "选项一" });
    expect(options.value[1]).toEqual({ value: 2, label: "选项二" });
    expect(options.value[2]).toEqual({ value: "A", label: "字母A" });
  });

  it("数字字符串itemCode应转为Number类型", async () => {
    mockGetDictByCode.mockResolvedValue([
      { itemCode: "10", itemValue: "数字项", sortval: 1 }
    ]);

    const { options, refresh } = useDict("numCode");
    await refresh();

    expect(options.value[0].value).toBe(10);
    expect(typeof options.value[0].value).toBe("number");
  });

  it("API返回空数组时options为空", async () => {
    mockGetDictByCode.mockResolvedValue([]);

    const { options, refresh } = useDict("emptyCode");
    await refresh();

    expect(options.value).toEqual([]);
  });

  it("API返回null时options为空数组", async () => {
    mockGetDictByCode.mockResolvedValue(null);

    const { options, refresh } = useDict("nullCode");
    await refresh();

    expect(options.value).toEqual([]);
  });

  it("请求失败时options为空数组且不抛出异常", async () => {
    mockGetDictByCode.mockRejectedValue(new Error("Network Error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { options, refresh } = useDict("errorCode");
    await refresh();

    expect(options.value).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("getLabel应正确匹配value返回label", async () => {
    mockGetDictByCode.mockResolvedValue(mockDictData);

    const { getLabel, refresh } = useDict("labelCode");
    await refresh();

    expect(getLabel(1)).toBe("选项一");
    expect(getLabel("A")).toBe("字母A");
    expect(getLabel(999)).toBeNull();
  });

  it("同一语言下相同code应从缓存读取，不重复请求", async () => {
    mockGetDictByCode.mockResolvedValue(mockDictData);

    const { refresh: r1 } = useDict("cachedCode");
    await r1();

    const { refresh: r2 } = useDict("cachedCode");
    await r2();

    // 缓存命中，只请求了一次
    expect(mockGetDictByCode).toHaveBeenCalledTimes(1);
  });

  it("切换语言后缓存失效，refresh应重新请求", async () => {
    mockGetDictByCode.mockResolvedValue(mockDictData);

    const { refresh } = useDict("langCode");
    await refresh();
    expect(mockGetDictByCode).toHaveBeenCalledTimes(1);

    // 切换语言后缓存失效
    mockLang.value = "en";
    const newData = [
      { itemCode: "en1", itemValue: "English Option", sortval: 1 }
    ];
    mockGetDictByCode.mockResolvedValue(newData);
    await refresh();

    expect(mockGetDictByCode).toHaveBeenCalledTimes(2);
  });

  it("clearDictCache后refresh应重新请求", async () => {
    mockGetDictByCode.mockResolvedValue(mockDictData);

    const { options, refresh } = useDict("reloadCode");
    await refresh();
    expect(mockGetDictByCode).toHaveBeenCalledTimes(1);

    // 清空缓存后应重新请求
    clearDictCache();
    const newData = [{ itemCode: "99", itemValue: "新数据", sortval: 1 }];
    mockGetDictByCode.mockResolvedValue(newData);
    await refresh();

    expect(options.value).toEqual([{ value: 99, label: "新数据" }]);
    expect(mockGetDictByCode).toHaveBeenCalledTimes(2);
  });
});

describe("clearDictCache", () => {
  it("应清空所有字典缓存", () => {
    // 直接调用 clearDictCache 不应抛出异常
    expect(() => clearDictCache()).not.toThrow();
  });
});
