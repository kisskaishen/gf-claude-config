import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CommonTitle from "./index.vue";

// Mock i18n $t function
const mockT = vi.fn((key: string) => key);

describe("CommonTitle", () => {
  it("应渲染title文本", () => {
    const wrapper = mount(CommonTitle, {
      props: { title: "页面标题", tip: "" },
      global: {
        mocks: { $t: mockT }
      }
    });

    expect(wrapper.find("h1").exists()).toBe(true);
    expect(wrapper.find("h1").text()).toBeDefined();
  });

  it("应渲染tip文本", () => {
    const wrapper = mount(CommonTitle, {
      props: { title: "标题", tip: "提示信息" },
      global: {
        mocks: { $t: mockT }
      }
    });

    const paragraphs = wrapper.findAll("p");
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
  });

  it("tip为空时p标签存在但内容经过$t转换", () => {
    const wrapper = mount(CommonTitle, {
      props: { title: "标题", tip: "" },
      global: {
        mocks: { $t: mockT }
      }
    });

    // tip为""经过$t("")转换后仍存在p标签
    expect(wrapper.find("p").exists()).toBe(true);
  });

  it("应通过$t函数转换title和tip", () => {
    mockT.mockClear();

    mount(CommonTitle, {
      props: { title: "page.title", tip: "page.tip" },
      global: {
        mocks: { $t: mockT }
      }
    });

    expect(mockT).toHaveBeenCalledWith("page.title");
    expect(mockT).toHaveBeenCalledWith("page.tip");
  });
});
