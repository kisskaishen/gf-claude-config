import type { Component } from "vue";
import type { TableProps } from "element-plus";

export interface ActionConfig {
  title: string;
  icon?: string | Component;
  handle: (row: any) => void;
  hidden?: (row: any) => boolean;
}

// 继承 ElTable 的 Props 类型
export interface ProTableProps extends Partial<TableProps<any>> {
  // 这里可以扩展其他自定义 Props
  actions?: ActionConfig[];
  actionColumnConfig?: {
    width?: string | number;
  };
}
