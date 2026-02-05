import { createApp } from "vue";
import "./styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";

import "virtual:svg-icons-register";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { i18n } from "./lang";
import { dataFinder } from "@/plugins/monitor/dataFinder";

const app = createApp(App);
app.use(router);
app.use(store);
dataFinder.init();
app.use(i18n);
app.component("svg-icon", SvgIcon);
app.mount("#app");
