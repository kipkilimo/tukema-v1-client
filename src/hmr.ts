// src/hmr.ts - Enhanced HMR utilities
import { hot } from "@vitejs/plugin-vue";

// Enable HMR for Pinia stores
if (import.meta.hot) {
  // Handle store HMR
  import.meta.hot.on("pinia:store", (data) => {
    console.log(`[HMR] Store updated: ${data.storeId}`);
  });

  // Handle component HMR
  import.meta.hot.on("vue:component", (data) => {
    console.log(`[HMR] Component reloaded: ${data.name || "anonymous"}`);
  });

  // Handle Apollo cache HMR
  import.meta.hot.on("apollo:cache", () => {
    console.log("[HMR] Apollo cache reset");
  });
}

// Configuration for Vite HMR
export const hmrConfig = {
  // Enable overlay for errors
  overlay: true,

  // Custom handlers
  onMessage: (event: MessageEvent) => {
    const { type, data } = JSON.parse(event.data);
    if (type === "error") {
      console.error("[HMR Error]", data);
    } else if (type === "connected") {
      console.log("[HMR] Connected to dev server");
    }
  },
};

// Helper to preserve component state during HMR
export const preserveState = <T extends object>(
  componentName: string,
  state: T,
): T => {
  if (import.meta.hot) {
    const savedState = sessionStorage.getItem(`hmr:${componentName}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return { ...state, ...parsed };
      } catch (e) {
        console.warn("[HMR] Failed to restore state", e);
      }
    }

    // Save state before update
    import.meta.hot.on("vite:beforeUpdate", () => {
      sessionStorage.setItem(`hmr:${componentName}`, JSON.stringify(state));
    });
  }
  return state;
};
