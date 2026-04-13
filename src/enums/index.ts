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

export enum TimezoneArea {
  Europe_Paris = "UTC +1",
  Europe_Rome = "UTC +1 ",
  Europe_Amsterdam = "UTC +1  ",
  Asia_Shanghai = "UTC+8",
  Local = ""
}

/**走国家选项 */
export enum Country {
  FR = "FR",
  IT = "IT",
  NL = "NL"
}

/** 是否绑定客户信息,废弃 */
export enum UserBindStatus {
  /** 未绑定 */
  unbound = 0,
  /** 已绑定 */
  bound = 1
}
