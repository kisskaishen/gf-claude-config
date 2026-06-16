import type { TableProps, PaginationProps, FormProps } from "element-plus";
import type { SearchContainerProps } from "@/components/SearchContainer/types";

// 搜索容器配置接口
export interface SearchConfig extends SearchContainerProps {}

// TableLayout 完整的 Props 接口
export interface TableLayoutProps {
  data?: any[];
  searchFormModel?: any;
  loading?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  showSearch?: boolean;
  searchConfig?: SearchConfig;
  // 继承 Element Plus 的原生类型
  tableConfig?: Partial<Omit<TableProps<any>, "data">>;
  paginationConfig?: Partial<PaginationProps>;
  searchFormConfig?: Partial<FormProps>;
}
