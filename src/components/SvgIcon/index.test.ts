import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SvgIcon from "./index.vue";

describe("SvgIcon", () => {
  it("应渲染svg元素并生成正确的symbolId", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test-icon" }
    });

    const svg = wrapper.find("svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("aria-hidden")).toBe("true");

    const use = svg.find("use");
    // happy-dom 中 xlink:href 可能以 href 或 xlink:href 形式存在
    const href = use.attributes("href") || use.attributes("xlink:href");
    expect(href).toBe("#icon-test-icon");
  });

  it("自定义prefix应反映在symbolId中", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "upload", prefix: "custom" }
    });

    const use = wrapper.find("use");
    const href = use.attributes("href") || use.attributes("xlink:href");
    expect(href).toBe("#custom-upload");
  });

  it("size应同时应用于width和height（未单独指定时）", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test", size: "24px" }
    });

    const svg = wrapper.find("svg");
    expect(svg.attributes("style")).toContain("width: 24px");
    expect(svg.attributes("style")).toContain("height: 24px");
  });

  it("单独指定width/height应覆盖size", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test", size: "1em", width: "32px", height: "16px" }
    });

    const svg = wrapper.find("svg");
    expect(svg.attributes("style")).toContain("width: 32px");
    expect(svg.attributes("style")).toContain("height: 16px");
  });

  it("color应为默认值currentColor", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test" }
    });

    const use = wrapper.find("use");
    expect(use.attributes("fill")).toBe("currentColor");
  });

  it("自定义color应传递到use元素", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test", color: "#ff0000" }
    });

    const use = wrapper.find("use");
    expect(use.attributes("fill")).toBe("#ff0000");
  });

  it("width为undefined时应使用size作为fallback", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test", size: "20px", width: undefined }
    });

    const svg = wrapper.find("svg");
    expect(svg.attributes("style")).toContain("width: 20px");
  });
});
