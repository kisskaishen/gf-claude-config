import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequest } = vi.hoisted(() => {
  const mockRequest = vi.fn();
  return { mockRequest };
});
vi.mock("@/utils/request", () => ({
  default: mockRequest
}));

import { getTaskList } from "./task";

describe("task API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTaskList", () => {
    it("应分页查询任务列表", async () => {
      const data = {
        data: {
          taskStatusSet: ["1", "2"],
          taskTypeSet: ["export"]
        },
        pageNum: 1,
        pageSize: 10
      };

      await getTaskList(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/taskCenter/taskCenterPageList",
        method: "post",
        data
      });
    });

    it("可选参数为空时也能正常发送请求", async () => {
      const data = { data: {}, pageNum: 1, pageSize: 20 };

      await getTaskList(data);

      expect(mockRequest).toHaveBeenCalledWith({
        url: "/taskCenter/taskCenterPageList",
        method: "post",
        data
      });
    });
  });
});
