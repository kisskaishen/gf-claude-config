import { ref, type Ref } from "vue";
import { cloneDeep } from "lodash-es";

/**
 * 通用 Hook：创建一个可重置的 ref
 * @param initialValue 初始值
 * @returns { state: Ref, reset: Function }
 */
export function useResetableRef<T>(initialValue: T) {
  // 深度克隆初始值，防止外部修改引用对象导致初始值改变
  const getInitialValue = () => {
    if (typeof initialValue === "object" && initialValue !== null) {
      return cloneDeep(initialValue);
    }
    return initialValue;
  };

  const _initialValue = ref(getInitialValue());

  const state = ref(getInitialValue()) as Ref<T>;

  const reset = () => {
    state.value = cloneDeep(_initialValue.value);
  };

  return {
    state,
    reset
  };
}
