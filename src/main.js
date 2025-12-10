import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import axios from "axios";
import i18n from "./i18n";
import "./assets/styles/global.css";

const app = createApp(App);
const pinia = createPinia();

const config = {
  backEndUrl: "/api",
};

app.provide("$config", config);

axios.defaults.baseURL = config.backEndUrl;
axios.defaults.headers.common["Content-Type"] = "application/json";

axios.interceptors.request.use(
  (config) => {
    const jwtToken = localStorage.getItem("jwtToken");

    if (jwtToken && !config.url.includes("/performLogin")) {
      config.headers["Authorization"] = `Bearer ${jwtToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

app.use(router);
app.use(i18n);
app.use(pinia);

app.mount("#app");
