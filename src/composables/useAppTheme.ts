// src/composables/useAppTheme.ts
import { useTheme } from "vuetify";
import { useStorage } from "@vueuse/core";
import { computed } from "vue";
import { toggleTheme } from "@/minorUtils/toggleTheme";

export function useAppTheme() {
  const theme = useTheme();
  const userTheme = useStorage("userTheme", "light");

  function onToggleTheme() {
    const nextTheme = theme.global.current.value.dark ? "light" : "dark";
    theme.change(nextTheme); // ✅ new API
    userTheme.value = nextTheme;
    toggleTheme(theme);
  }

  function initTheme() {
    theme.change(userTheme.value); // ✅ new API
    toggleTheme(theme);
  }

  const isDark = computed(() => theme.global.current.value.dark);

  return { onToggleTheme, isDark, initTheme };
}
