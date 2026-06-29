import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// Mock external dependencies that cause import-chain issues
vi.mock("@/lang", () => ({
  getInitialLang: vi.fn(() => "zh"),
  setI18nLang: vi.fn()
}));

vi.mock("@/store/user", () => ({
  useUserStore: vi.fn(() => ({
    userInfo: {
      defaultLanguage: "zh",
      defaultTimeZone: "Local",
      country: "FR"
    },
    updateUserInfo: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock("@/plugins/monitor/dataFinder", () => ({
  dataFinder: { initUser: vi.fn() }
}));

vi.mock("@/store", () => ({
  store: {}
}));

import { useAppStore } from "./app";
import { Site } from "@/enums";

describe("useAppStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it("sidebar初始状态为打开", () => {
    const store = useAppStore();
    expect(store.sidebar.opened).toBe(true);
    expect(store.sidebar.withoutAnimation).toBe(false);
  });

  it("toggleSidebar应切换侧边栏状态", () => {
    const store = useAppStore();

    store.toggleSidebar();
    expect(store.sidebar.opened).toBe(false);

    store.toggleSidebar();
    expect(store.sidebar.opened).toBe(true);
  });

  it("setSite应更新站点", () => {
    const store = useAppStore();
    store.setSite(Site.fr);
    expect(store.site).toBe("FR");
  });

  it("setSiteList应更新站点列表", () => {
    const store = useAppStore();
    store.setSiteList(["FR", "IT", "NL"]);
    expect(store.siteList).toEqual(["FR", "IT", "NL"]);
  });

  it("setTimezone应更新时区", () => {
    const store = useAppStore();
    store.setTimezone("Europe/Paris");
    expect(store.timezone).toBe("Europe/Paris");
  });

  it("setLoadedI18nMap应更新i18n加载状态", () => {
    const store = useAppStore();
    expect(store.loadedI18nMap).toBe(false);

    store.setLoadedI18nMap(true);
    expect(store.loadedI18nMap).toBe(true);
  });
});
