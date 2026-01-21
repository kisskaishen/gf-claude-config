import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useTagsViewStore } from "./tagsView";
import { store } from "@/store";
import { postLogin } from "@/api/user";
import type { Lang, Site } from "@/enums";

export interface UserInfo {
  /** 用户id */
  id: number;
  /** 用户名称 */
  userName: string;
  /** 注册邮箱 */
  email: string;
  /** 公司名称 */
  companyName: string;
  /** 账号业务类型: 1-客户, 2-收件人 */
  accountBusinessType: 1 | 2;
  /** 账号状态: 0-生效, 1-锁定 */
  accountStatus: 0 | 1;
  /** 是否绑定客户信息: 0-未绑定, 1-已绑定 */
  bindStatus: 0 | 1;
  /** 主子账号类型: 0-主, 1-子 */
  mainSubType: 0 | 1;
  /** 主账号id */
  mainUserId: number;
  /** 默认语言 */
  defaultLanguage: Lang;
  /** 默认站点 */
  defaultSite: Site;
  /** 默认时区 */
  defaultTimeZone: string;
  /** 注册来源: 1-pc端 */
  registerSource: number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 是否删除: 1-是, 0-否 */
  isDelete: 0 | 1;
}

export const useUserStore = defineStore(
  "user",
  () => {
    const tagsViewStore = useTagsViewStore();

    // State
    const token = ref("");

    const userInfo = ref<UserInfo | null>(null);

    const hasSetPreference = computed(() => {
      return (
        userInfo.value?.defaultLanguage &&
        userInfo.value?.defaultSite &&
        userInfo.value?.defaultTimeZone
      );
    });

    const setUserInfo = (data: Partial<UserInfo>) => {
      if (userInfo.value) {
        userInfo.value = {
          ...userInfo.value,
          ...data
        } as UserInfo;
      }
    };

    // Actions
    const login = async (data: { email: string; password: string }) => {
      const res = await postLogin(data);
      if (res) {
        token.value = res.token;

        userInfo.value = res.userInfo;
      }
    };

    const logout = () => {
      token.value = "";
      userInfo.value = null;
      tagsViewStore.delAllViews();
    };

    return { token, userInfo, login, logout, hasSetPreference, setUserInfo };
  },
  {
    persist: {
      key: "dbu-user-state",
      pick: ["token", "userInfo"]
    }
  }
);

export function useUserStoreWithOut() {
  return useUserStore(store);
}
