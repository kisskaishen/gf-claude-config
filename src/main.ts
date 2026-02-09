import { createApp } from "vue";
import "./styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";

import "virtual:svg-icons-register";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { i18n } from "./lang";
import { dataFinder } from "@/plugins/monitor/dataFinder";

import { setServiceBaseUrl } from "@/utils/request";

async function bootstrap() {
  // 1. 动态加载远程配置（可选：在 .env 中定义配置地址）
  //   const configUrl = "/api/GetConfig.json";
  //   try {
  //     const response = await fetch(`${configUrl}?t=${Date.now()}`);
  //     if (response.ok) {
  //       const config = await response.json();
  //       // 假设 JSON 格式为 { baseUrl: "..." }
  //       if (config.GatewayEntrypoint) {
  //         setServiceBaseUrl(config.GatewayEntrypoint);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("动态配置加载失败，将使用本地默认配置", error);
  //   }

  const app = createApp(App);
  app.use(router);
  app.use(store);
  dataFinder.init();
  app.use(i18n);
  app.component("svg-icon", SvgIcon);
  app.mount("#app");
}

bootstrap();
