import request from "@/utils/request";

/**
 * 根据字典编码查询字典
 */
export const getDictByCode = (code: string) => {
  return request({
    url: "/sys/dict/findByGroupKey",
    method: "get",
    params: {
      groupKey: code
    }
  });
};
