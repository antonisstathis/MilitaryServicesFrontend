import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/global.css";
import { config } from "./config/config.js";

const app = createApp(App);
app.use(router);
// Make the config object globally accessible
app.config.globalProperties.$config = config;
app.mount("#app");
