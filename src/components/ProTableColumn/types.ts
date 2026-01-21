import type { TableColumnCtx } from "element-plus";

// 1. 继承 el-table-column 的 Props 类型
// TableColumnCtx 是 Element Plus 导出的列上下文类型
export interface ProColumnProps extends Partial<TableColumnCtx<any>> {}
