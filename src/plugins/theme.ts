// src/plugins/theme.ts
import { type App } from "vue";
import { useAppTheme } from "@/composables/useAppTheme";

export default {
  install(app: App) {
    const { initTheme, onToggleTheme, isDark } = useAppTheme();

    // Initialize theme globally
    initTheme();

    // Provide theme functions globally
    app.config.globalProperties.$toggleTheme = onToggleTheme;
    app.config.globalProperties.$isDark = isDark;
  },
};
