import request from "@/utils/request";

// 获取余额
export function getBalanceInfo() {
  return request({
    url: "/home/balance/info",
    method: "get"
  });
}

// 派送统计
export function getRecentCount() {
  return request({
    url: "/home/order/recentCount",
    method: "get"
  });
}

// ============== 工单咨询相关 ==============

// 上传工单附件
export function uploadWorkOrderAttachment(data: any) {
  return request<string>({
    url: "/consult/upload",
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    data
  });
}

// 创建工单
export function addWorkOrder(data: any) {
  return request({
    url: "/consult/addWorkOrder",
    method: "post",
    data
  });
}
