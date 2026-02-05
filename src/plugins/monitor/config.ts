export const SDK_CONFIG = {
  app_id: (window as any).dataFinderAppId as unknown as number,
  channel_domain: "https://gator.uba.ap-southeast-1.volces.com",
  disable_sdk_monitor: true, // 用于禁用 SDK 启动后自身监控事件 onload 的上报
  log: false, // 本地调试日志打印
  enable_stay_duration: true, // 开启停留时长
  spa: true, // 开启 SPA 模式
  enable_debug: false // 开启 devTool ?open_devtool_web=true&app_id-=｛XXxxxx］
};
