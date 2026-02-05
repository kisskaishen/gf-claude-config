import { Lang } from "@/enums";
import { createI18n } from "vue-i18n";
import zh from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import fr from "element-plus/es/locale/lang/fr";
import it from "element-plus/es/locale/lang/it";
import nl from "element-plus/es/locale/lang/nl";

export const getBrowserLang = (): Lang => {
  // 获取浏览器语言
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.includes("zh")) return Lang.zh;
  if (browserLang.includes("fr")) return Lang.fr;
  if (browserLang.includes("it")) return Lang.it;
  if (browserLang.includes("nl")) return Lang.nl;
  if (browserLang.includes("en")) return Lang.en;

  return Lang.zh;
};
export const getInitialLang = (): Lang => {
  const persistedState = JSON.parse(
    localStorage.getItem("csd-gfuc-web-app-state") || "{}"
  );
  if (
    persistedState.lang &&
    Object.values(Lang).includes(persistedState.lang)
  ) {
    return persistedState.lang as Lang;
  }

  return getBrowserLang();
};

const getMessages = () => {
  const modules = import.meta.glob("./locales/*.ts", { eager: true });
  const messages = Object.fromEntries(
    Object.entries(modules).map(([key, value]) => [
      key.split("/").pop()?.replace(".ts", ""),
      (value as any).default
    ])
  );

  return messages;
};

export const getElementLang = (lang: Lang) => {
  const map = {
    [Lang.zh]: zh,
    [Lang.en]: en,
    [Lang.fr]: fr,
    [Lang.it]: it,
    [Lang.nl]: nl
  };

  return map[lang];
};
console.log("test", getInitialLang());

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLang(),
  fallbackLang: Lang.zh,
  messages: getMessages()
});

export const setI18nLang = (lang: Lang) => {
  // 更新 i18n 实例的 locale
  const global = i18n.global as any;
  if (typeof global.locale === "object" && "value" in global.locale) {
    global.locale.value = lang;
  } else {
    global.locale = lang;
  }
};
