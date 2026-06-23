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

// 账单

// 客户运费账单分页查询请求参数类型
export interface BillPageQueryRequest {
  // 账单月份数组，如 ["01", "02"]
  billMonth?: string[];
  // 账单状态数组，如 [1, 2]
  billStatusList?: number[];
  // 账单年份，如 2026
  billYear?: number;
  // 客户ID列表
  customerIdList?: number[];
  // 客户负责人ID
  customerPrincipalId?: number;
  // 周期
  cycle?: number;
  // 半月标识
  halfMonth?: number;
  // 发票状态数组，如 [1, 2]
  invoiceStatusList?: number[];
  // 账单编号，如 "BILL20260527001"
  number?: string;
  // 当前页码
  pageNum: number;
  // 每页条数
  pageSize: number;
  // 运单编号，如 "YD1234567890"
  waybillNo?: string;
  // 周数数组，如 [1, 2, 3]
  weeks?: number[];
}
// 运费账单
export function getFreightBill(data: BillPageQueryRequest) {
  return request({
    url: "/fms/bill/pageQuery",
    method: "post",
    data
  });
}

// 导出运费账单
export function exportFreightBill(data: BillPageQueryRequest) {
  return request({
    url: "/fms/bill/exportList",
    method: "post",
    data
  });
}

// 下载运费账单
export function downloadFreightBill(data: {
  customerPrincipalId?: number | string;
  numbers: string[];
}) {
  return request({
    url: "/fms/bill/download",
    method: "post",
    data
  });
}

// 任务列表-下载账单
export function downloadBill(data: { id: string }) {
  return request({
    url: "/taskCenter/getDcExportDownloadUrl?taskCenterId=" + data.id,
    method: "get"
  });
}

// 理赔账单
export function getClaimBill(data: BillPageQueryRequest) {
  return request({
    url: "/fms/claimBill/pageQuery",
    method: "post",
    data
  });
}

// 导出理赔账单
export function exportClaimBill(data: BillPageQueryRequest) {
  return request({
    url: "/fms/claimBill/exportList",
    method: "post",
    data
  });
}

// 下载理赔账单
export function downloadClaimBill(data: {
  customerPrincipalId: number | string;
  numbers: string[];
}) {
  return request({
    url: "/fms/claimBill/download",
    method: "post",
    data
  });
}

/** 获取客户结算周期 */
export function getCustomerSettleCycle() {
  return request({
    url: "/fms/getCustomerSettleCycle",
    method: "post"
  });
}
