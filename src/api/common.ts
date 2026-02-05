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

/** 获取加密公钥 */
export const getPublicKey = () => {
  return request({
    url: "/user/publicKey",
    method: "get"
  });
};

// src/api/common.ts
export const uploadFile = (data: FormData) => {
  return request({
    url: "/common/upload", // 请根据实际后端接口地址修改
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    data
  });
};
