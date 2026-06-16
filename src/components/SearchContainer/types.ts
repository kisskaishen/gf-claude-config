export interface SearchContainerProps {
  /** 列数 */
  cols?: number;
  /** 行数 */
  rowNum?: number;
  /** 节流时间 */
  throttleTimer?: number;
  /** 加载状态 */
  loading?: boolean;
  /** 栅格间距 */
  gutter?: number;
  /** 是否自动布局 */
  isAutoLayout?: boolean;
  /** 操作按钮占几列 (默认2) */
  operationCols?: number;
}
