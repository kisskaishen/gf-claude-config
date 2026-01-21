import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { Lang, Site } from "@/enums";
import { getInitialLang, setI18nLang } from "@/lang";
import { store } from "@/store";

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
    // 侧边栏状态
    const sidebar = reactive({
      opened: true,
      withoutAnimation: false
    });

    const lang = ref(getInitialLang());

    const timezone = ref(timezonesMap.Local);

    const site = ref(Site.fr);

    // 是否已设置偏好
    const hasSetPreference = ref(false);

    // 是否是登录后第一次进入 (不持久化)
    const isFirstLogin = ref(false);

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

    const setFirstLogin = (val: boolean) => {
      isFirstLogin.value = val;
    };

    const fetchPreferences = async () => {
      // 模拟从云端获取偏好设置
      return new Promise((resolve) => {
        setTimeout(() => {
          const cloudData = {
            site: Site.it,
            timezone: "Europe/Rome",
            lang: Lang.it,
            hasSetPreference: true // 云端标记已设置
          };

          // 逻辑：优先取 localstorage (即当前 store 的值)，如果本地没有设置过，才取云端
          if (!hasSetPreference.value) {
            console.log(
              "AppStore: Local preferences not found, syncing from cloud"
            );
            site.value = cloudData.site;
            timezone.value = cloudData.timezone;
            lang.value = cloudData.lang;
            hasSetPreference.value = cloudData.hasSetPreference;
            setI18nLang(cloudData.lang);
          } else {
            console.log(
              "AppStore: Local preferences found, skipping cloud sync"
            );
          }

          resolve(cloudData);
        }, 500);
      });
    };

    const setPreferences = async (data: {
      site: Site;
      timezone: string;
      lang: Lang;
    }) => {
      // 模拟接口存储
      console.log("Saving preferences to cloud...", {
        ...data,
        hasSetPreference: true
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          // 先标记已设置偏好，防止状态同步延迟
          hasSetPreference.value = true;
          site.value = data.site;
          timezone.value = data.timezone;
          lang.value = data.lang;
          setI18nLang(data.lang);
          resolve(true);
        }, 500);
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
      hasSetPreference,
      isFirstLogin,
      toggleSidebar,
      setSite,
      setLang,
      setTimezone,
      setPreferences,
      setFirstLogin,
      fetchPreferences
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
