import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useTagsViewStore } from "./tagsView";
import { store } from "@/store";
import { getUserInfo, postLogin, postUpdateUserInfo } from "@/api/user";
import { Site, Timezone, UserBindStatus, type Lang } from "@/enums";
import { useAppStore } from "./app";
import { getInitialLang, loadI18nMap } from "@/lang";
import { dataFinder } from "@/plugins/monitor/dataFinder";

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
  bindStatus: UserBindStatus;
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

    const appStore = useAppStore();

    // State
    const token = ref("");

    const userInfo = ref<UserInfo | null>(null);
    const isUserInfoUpdated = ref(false);

    const hasSetPreference = computed(() => {
      return (
        userInfo.value?.defaultLanguage &&
        userInfo.value?.defaultSite &&
        userInfo.value?.defaultTimeZone
      );
    });
    const fetchUserInfo = async () => {
      const res = await getUserInfo();
      if (res) {
        userInfo.value = res;
        isUserInfoUpdated.value = true;
      }
    };

    const updateUserInfo = async (data: Partial<UserInfo>) => {
      await postUpdateUserInfo({
        id: userInfo.value?.id,
        ...data
      });
      if (userInfo.value) {
        userInfo.value = {
          ...userInfo.value,
          ...data
        } as UserInfo;
      }
    };

    // Actions
    const login = async (data: {
      email: string;
      password: string;
      uuid: string;
      code: string;
    }) => {
      const res = await postLogin(data);
      if (res) {
        token.value = res.token;
        userInfo.value = res.userInfo;
        // await loadI18nMap();
        if (!appStore.site) {
          appStore.setSite(userInfo.value?.defaultSite || Site.fr);
        }
        if (!appStore.lang) {
          appStore.setLang(userInfo.value?.defaultLanguage || getInitialLang());
        }
        if (!appStore.timezone) {
          appStore.setTimezone(
            userInfo.value?.defaultTimeZone || Timezone.Local
          );
        }
      }
      dataFinder.initUser();
      isUserInfoUpdated.value = true;
    };

    const logout = () => {
      token.value = "";
      userInfo.value = null;
      tagsViewStore.delAllViews();
      location.reload();
    };

    return {
      token,
      userInfo,
      login,
      logout,
      hasSetPreference,
      fetchUserInfo,
      updateUserInfo,
      isUserInfoUpdated
    };
  },
  {
    persist: {
      key: "csd-gfuc-web-user-state",
      pick: ["token", "userInfo"]
    }
  }
);

export function useUserStoreWithOut() {
  return useUserStore(store);
}
