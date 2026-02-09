import { ref, onMounted } from "vue";
import { getDictByCode } from "@/api/common";

/**
 * 字典数据项接口 (原始数据)
 */
export interface DictItem {
  itemCode: string | number;
  itemValue: string;
  sortval?: number;
  languageCode?: string;
  groupKey?: string;
}

/**
 * 统一的选项格式
 * @template T 标签类型 (itemValue)
 * @template V 值类型 (itemCode)
 */
export interface DictOption<T = any> {
  value: T;
  label: string;
}

/**
 * 获取字典数据的 Hook
 * @template T 值类型 (itemValue)，支持传入 enum 或联合类型
 * @param code 字典编码
 * @returns { options, getLabel, refresh }
 */
export function useDict<T = any>(code: string) {
  const options = ref<DictOption<T>[]>([]);

  const refresh = async () => {
    try {
      const res = (await getDictByCode(code)) as DictItem[];
      if (res && Array.isArray(res)) {
        options.value = res
          .sort((a, b) => (a.sortval || 0) - (b.sortval || 0))
          .map((item) => ({
            value: parseInt(item.itemCode as string) as unknown as T,
            label: item.itemValue
          }));
      } else {
        options.value = [];
      }
    } catch (error) {
      console.error(`Failed to fetch dict for code: ${code}`, error);
      options.value = [];
    }
  };

  /**
   * 根据值获取对应的 Label
   * @param value 字典值 (itemCode)
   * @returns 返回标签 (itemValue)，类型为泛型 T
   */
  const getLabel = (value: T): string | null => {
    return options.value.find((i) => i.value === value)?.label || null;
  };

  onMounted(() => {
    refresh();
  });

  return {
    options,
    getLabel,
    refresh
  };
}
