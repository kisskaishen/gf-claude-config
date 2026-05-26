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
