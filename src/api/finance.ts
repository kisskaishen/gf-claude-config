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

/*********余额预警模块*********/

// 新增用户余额预警配置
export interface AddBalanceAlertConfigRequest {
  account: string;
  alertAmount: number;
  alertEmails: string[];
  alertHourMinute: string;
  alertUtcHour: string;
  country: string;
  createTime: number;
  emailLanguage: string;
  gfucLoginId: number;
  laetSendTime: number;
  popupSwitch: number;
  state: number;
  timeZone: string;
  updateTime: number;
}
export function addBalanceAlertConfig(data: AddBalanceAlertConfigRequest) {
  return request({
    url: "/userConfig/balanceAlert",
    method: "post",
    data
  });
}

// 更新用户余额预警配置
export interface UpdateBalanceAlertConfigRequest extends AddBalanceAlertConfigRequest {
  id: number;
}
export function updateBalanceAlertConfig(
  data: UpdateBalanceAlertConfigRequest
) {
  return request({
    url: "/userConfig/balanceAlert",
    method: "put",
    data
  });
}

// 查询用户余额预警配置
export function getBalanceAlertConfig(gfucLoginId: number) {
  return request({
    url:
      "/userConfig/balanceAlert/queryByGfucLoginId?gfucLoginId=" + gfucLoginId,
    method: "get"
  });
}

// 余额预警信息
export function getBalanceAlertInfo() {
  return request({
    url: "/userinfo/balance/alert/info",
    method: "get"
  });
}
