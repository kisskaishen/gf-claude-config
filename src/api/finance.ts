import request from "@/utils/request";

/** 充值 */
export function recharge(data: {
  arrivalAmount: string;
  currency: string;
  receiptMethod: any;
  receiptDate?: string;
  remark: string;
  attachmentKeys?: string[];
}) {
  return request({
    url: "/fms/recharge/balance",
    method: "post",
    data
  });
}

/** 查询充值记录 */
export function getRechargeRecord(data: {
  pageNumber: number;
  pageSize: number;
  /** 充值开始日期 */ receiptDateStart?: string;
  /** 充值结束日期 */ receiptDateTimeEnd?: string;
  /** 付款方式(字典) */ receiptMethod?: any[];
  /** 充值状态(字典) */ status?: any[];
  /** 提交结束日期 */ submitEnd?: string;
  /** 提交开始日期 */ submitStart?: string;
}) {
  return request({
    url: "/fms/recharge/pageQuery",
    method: "post",
    data
  });
}

/** 查询余额 */
export function getBalance() {
  return request({
    url: "/fms/balance/info",
    method: "get"
  });
}
