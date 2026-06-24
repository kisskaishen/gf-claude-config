import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { Lang, Site } from "@/enums";
import { getInitialLang, setI18nLang } from "@/lang";
import { store } from "@/store";
import { useUserStore } from "./user";

export const useAppStore = defineStore(
  "app",
  () => {
    const userStore = useUserStore();
    // 侧边栏状态
    const sidebar = reactive({
      opened: true,
      withoutAnimation: false
    });

    const lang = ref(userStore.userInfo?.defaultLanguage || getInitialLang());

    const timezone = ref(userStore.userInfo?.defaultTimeZone);

    const site = ref(userStore.userInfo?.country);

    const siteList = ref<string[]>([]);

    const loadedI18nMap = ref(false);

    // Actions
    const toggleSidebar = () => {
      sidebar.opened = !sidebar.opened;
    };

    const setSite = (val: Site) => {
      site.value = val;
    };

    const setSiteList = (list: string[]) => {
      siteList.value = list;
    };

    const setLang = (_lang: Lang) => {
      lang.value = _lang;
      setI18nLang(_lang);
    };

    const setTimezone = (tz: string) => {
      timezone.value = tz;
    };

    const setLoadedI18nMap = (val: boolean) => {
      loadedI18nMap.value = val;
    };

    const setPreferences = async (data: {
      country: string;
      account: string;
      site: Site;
      timezone: string;
      lang: Lang;
    }) => {
      await userStore.updateUserInfo({
        account: data.account,
        country: data.country,
        defaultLanguage: data.lang,
        defaultTimeZone: data.timezone
      });
      site.value = data.site;
      timezone.value = data.timezone;
      lang.value = data.lang;
      setI18nLang(data.lang);
    };

    return {
      sidebar,
      site,
      siteList,
      lang,
      timezone,
      loadedI18nMap,

      toggleSidebar,
      setSite,
      setSiteList,
      setLang,
      setTimezone,
      setPreferences,
      setLoadedI18nMap
    };
  },
  {
    persist: {
      key: "csd-gfuc-web-app-state",
      pick: ["lang", "timezone", "site", "hasSetPreference"]
    }
  }
);

export function useAppStoreWithOut() {
  return useAppStore(store);
}
