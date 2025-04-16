import { createI18n } from "vue-i18n";

import en from "./locales/en.json";
import el from "./locales/el.json";

const messages = {
  en,
  el,
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("lang") || "en",
  fallbackLocale: "en",
  messages,
});

export default i18n;
