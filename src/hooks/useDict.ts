import { ref, onMounted, watch } from "vue";
import { getDictByCode } from "@/api/common";
import { useAppStore } from "@/store/app";

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

/** 全局字典缓存：code → { data: DictOption[], lang: string } */
const dictCache = new Map<string, { options: DictOption[]; lang: string }>();

/**
 * 获取字典数据的 Hook（带全局缓存）
 * @template T 值类型 (itemValue)，支持传入 enum 或联合类型
 * @param code 字典编码
 * @returns { options, getLabel, refresh }
 */
export function useDict<T = any>(code: string) {
  const options = ref<DictOption<T>[]>([]);
  const appStore = useAppStore();

  const transformDictData = (rawData: DictItem[]): DictOption[] => {
    return rawData
      .sort((a, b) => (a.sortval || 0) - (b.sortval || 0))
      .map((item) => ({
        value:
          typeof item.itemCode === "string" &&
          item.itemCode.trim() !== "" &&
          !isNaN(Number(item.itemCode))
            ? Number(item.itemCode)
            : item.itemCode,
        label: item.itemValue
      }));
  };

  const refresh = async () => {
    try {
      // 先检查缓存：同一语言下同一 code 不重复请求
      const cached = dictCache.get(code);
      if (cached && cached.lang === appStore.lang) {
        options.value = cached.options as DictOption<T>[];
        return;
      }

      const res = (await getDictByCode(code)) as DictItem[];
      if (res && Array.isArray(res)) {
        const transformed = transformDictData(res);
        dictCache.set(code, { options: transformed, lang: appStore.lang });
        options.value = transformed as DictOption<T>[];
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

  // 监听语言变化，重新获取字典数据
  watch(
    () => appStore.lang,
    () => {
      refresh();
    }
  );

  return {
    options,
    getLabel,
    refresh
  };
}

/** 清空所有字典缓存（语言切换时上层也可直接调用） */
export function clearDictCache() {
  dictCache.clear();
}
