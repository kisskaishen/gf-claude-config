import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CommonTag from "./index.vue";

describe("commonTag", () => {
  it("应渲染count内容", () => {
    const wrapper = mount(CommonTag, {
      props: { count: "5" }
    });

    expect(wrapper.text()).toBe("5");
  });

  it("默认背景色和文字色应正确应用", () => {
    const wrapper = mount(CommonTag, {
      props: { count: "标签" }
    });

    const div = wrapper.find(".common-tag");
    expect(div.attributes("style")).toContain("background-color: #f5f5f5");
    expect(div.attributes("style")).toContain("color: #333");
  });

  it("自定义bgColor和textColor应正确应用", () => {
    const wrapper = mount(CommonTag, {
      props: { count: "标签", bgColor: "#fc4c02", textColor: "#fff" }
    });

    const style = wrapper.find(".common-tag").attributes("style");
    expect(style).toContain("background-color: #fc4c02");
    expect(style).toContain("color: #fff");
  });

  it("active为true时应设置borderColor为textColor", () => {
    const wrapper = mount(CommonTag, {
      props: { count: "标签", active: true, textColor: "#e66c28" }
    });

    expect(wrapper.find(".common-tag").attributes("style")).toContain(
      "border-color: #e66c28"
    );
  });

  it("active为false时borderColor应为transparent", () => {
    const wrapper = mount(CommonTag, {
      props: { count: "标签", active: false }
    });

    expect(wrapper.find(".common-tag").attributes("style")).toContain(
      "transparent"
    );
  });

  it("点击时应触发click事件", async () => {
    const wrapper = mount(CommonTag, {
      props: { count: "点击" }
    });

    await wrapper.find(".common-tag").trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("count为数字时应正常渲染", () => {
    const wrapper = mount(CommonTag, {
      props: { count: 99 }
    });

    expect(wrapper.text()).toBe("99");
  });
});
