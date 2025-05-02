import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router"; // Your router configuration
import axios from "axios"; // Import axios
import i18n from "./i18n";
import "./assets/styles/global.css";

// Create Vue app
const app = createApp(App);
const pinia = createPinia();

const config = {
  backEndUrl: "http://localhost:8080/",
};

// Provide config to all components
app.provide("$config", config);

// Axios global configuration
axios.defaults.baseURL = config.backEndUrl; // Set the base URL
axios.defaults.headers["Content-Type"] = "application/json"; // Set default content type

// Attach the JWT token to the Authorization header for all requests
axios.interceptors.request.use((config) => {
  const jwtToken = localStorage.getItem("jwtToken");
  // If the request is not the sign-in request, attach the JWT token
  if (jwtToken && !config.url.includes("/performLogin")) {
    config.headers["Authorization"] = `Bearer ${jwtToken}`;
  }
  return config;
});

// Use the router and store
app.use(router);
app.use(i18n);

app.use(pinia);

// Mount the app
app.mount("#app");
