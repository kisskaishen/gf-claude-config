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

// 工单分类项
export interface WorkOrderCategoryItem {
  id: number;
  name: string;
  children?: WorkOrderCategoryItem[];
}

// 工单表单字段
export interface WorkOrderFormField {
  Name: string;
  IsRequired: number; // 1-必填, 0-选填
  Type: number; // 字段类型: 1-文本, 4-下拉, 7-富文本
  Value: string;
}

// 创建工单请求参数
export interface CreateWorkOrderParams {
  Title: string;
  CategoryId: number;
  Category: string;
  Attachments: string[];
  OrderPriority: string;
  FormFieldValues: WorkOrderFormField[];
  source: number;
  staffCode: string;
  staffName: string;
  IsDraft: boolean;
}

// 获取工单分类
export function getWorkOrderCategory() {
  return request<WorkOrderCategoryItem[]>({
    url: "/consult/workOrderCategory",
    method: "get"
  });
}

// 上传工单附件
export function uploadWorkOrderAttachment(data: FormData) {
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
export function addWorkOrder(data: CreateWorkOrderParams) {
  return request({
    url: "/consult/addWorkOrder",
    method: "post",
    data
  });
}
