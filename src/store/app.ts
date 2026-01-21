import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { Lang, Site } from "@/enums";
import { getInitialLang, setI18nLang } from "@/lang";
import { store } from "@/store";
import { useUserStore } from "./user";
import { postSavePreferences } from "@/api/user";

// 语言

const langsMap = {
  [Lang.zh]: "简体中文",
  [Lang.en]: "English",
  [Lang.fr]: "Français",
  [Lang.it]: "Italiano",
  [Lang.nl]: "Nederlands"
};

// 站点
const sitesMap = {
  [Site.fr]: "法国站",
  [Site.it]: "意大利站",
  [Site.nl]: "荷兰站"
};

// 时区
const timezonesMap = {
  "Asia/Shanghai": "Beijing UTC+8",
  "Europe/Paris": "Paris UTC+1",
  "Europe/Amsterdam": "Amsterdam UTC+2",
  "Europe/Rome": "Rome UTC+1",
  "Europe/Chisinau": "Chisinau UTC+2",
  Local: "Local"
};

export const useAppStore = defineStore(
  "app",
  () => {
    const userStore = useUserStore();
    // 侧边栏状态
    const sidebar = reactive({
      opened: true,
      withoutAnimation: false
    });

    const lang = ref(getInitialLang());

    const timezone = ref(timezonesMap.Local);

    const site = ref(Site.fr);

    // Actions
    const toggleSidebar = () => {
      sidebar.opened = !sidebar.opened;
    };

    const setSite = (val: Site) => {
      site.value = val;
      // 存储到云端 (模拟)
      console.log("Save site to cloud:", val);
    };

    const setLang = (_lang: Lang) => {
      lang.value = _lang;
      setI18nLang(_lang);
      // 存储到云端 (模拟)
      console.log("Save lang to cloud:", _lang);
    };

    const setTimezone = (tz: string) => {
      timezone.value = tz;
      // 存储到云端 (模拟)
      console.log("Save timezone to cloud:", tz);
    };

    const setPreferences = async (data: {
      site: Site;
      timezone: string;
      lang: Lang;
    }) => {
      await postSavePreferences({
        ...data
      });
      site.value = data.site;
      timezone.value = data.timezone;
      lang.value = data.lang;
      setI18nLang(data.lang);
      userStore.setUserInfo({
        defaultSite: data.site,
        defaultLanguage: data.lang,
        defaultTimeZone: data.timezone
      });
    };

    return {
      sidebar,
      sitesMap,
      site,
      lang,
      langsMap,
      timezone,
      timezonesMap,

      toggleSidebar,
      setSite,
      setLang,
      setTimezone,
      setPreferences
    };
  },
  {
    persist: {
      key: "dbu-app-state",
      pick: ["lang", "timezone", "site", "hasSetPreference"]
    }
  }
);

export function useAppStoreWithOut() {
  return useAppStore(store);
}
