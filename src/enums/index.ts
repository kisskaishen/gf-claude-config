/** 语言 */
export enum Lang {
  zh = "zh",
  en = "en",
  fr = "fr",
  it = "it",
  nl = "nl"
}

/** 站点 */
export enum Site {
  fr = "FR",
  it = "IT",
  nl = "NL"
}

/** 时区 */
export enum Timezone {
  Europe_Paris = "Europe/Paris",
  Europe_Rome = "Europe/Rome",
  Europe_Amsterdam = "Europe/Amsterdam",
  Asia_Shanghai = "Asia/Shanghai",
  Local = "Local"
}

/** 是否绑定客户信息 */
export enum UserBindStatus {
  /** 未绑定 */
  unbound = 0,
  /** 已绑定 */
  bound = 1
}
