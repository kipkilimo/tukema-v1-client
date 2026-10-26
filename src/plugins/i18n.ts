import { createI18n } from "vue-i18n";

const messages = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: any }>("../locales/*.y(a)?ml", {
      eager: true,
    }),
  ).map(([key, value]) => {
    const fileName = key.split("/").pop() || "";
    const locale = fileName.replace(/\.ya?ml$/, "");
    return [locale, value.default];
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("locale") || "en",
  fallbackLocale: "en",
  messages,
});

export default i18n;
