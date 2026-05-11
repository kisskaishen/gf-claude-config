import request from "@/utils/request";

export function getTaskList(data: {
  data: {
    taskStatusSet?: string[];
    taskTypeSet?: string[];
    customerIdList?: string[];

    /** 开始时间 */
    queryStartTime?: string;

    /** 结束时间 */
    queryEndTime?: string;
  };
  pageNum: number;
  pageSize: number;
}) {
  return request({
    url: "/taskCenter/taskCenterPageList",
    method: "post",
    data
  });
}
