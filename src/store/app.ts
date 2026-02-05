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

    const site = ref(userStore.userInfo?.defaultSite);

    // Actions
    const toggleSidebar = () => {
      sidebar.opened = !sidebar.opened;
    };

    const setSite = (val: Site) => {
      site.value = val;
    };

    const setLang = (_lang: Lang) => {
      lang.value = _lang;
      setI18nLang(_lang);
    };

    const setTimezone = (tz: string) => {
      timezone.value = tz;
    };

    const setPreferences = async (data: {
      site: Site;
      timezone: string;
      lang: Lang;
    }) => {
      await userStore.updateUserInfo({
        defaultLanguage: data.lang,
        defaultSite: data.site,
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
      lang,
      timezone,

      toggleSidebar,
      setSite,
      setLang,
      setTimezone,
      setPreferences
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
