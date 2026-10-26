// src/main.ts

import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

import { createHead } from "@vueuse/head";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import i18n from "./plugins/i18n";
import vuetify from "./plugins/vuetify";
import VueViewer from "v-viewer";

import type { RouteRecordRaw } from "vue-router";
import generatedRoutes from "~pages";
import router from "./router";

// ============================================================
// PINIA
// ============================================================

export const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// ============================================================
// MERGE FILE-BASED ROUTES INTO THE MANUAL ROUTER
// ============================================================
// Strategy:
//   • Manual routes from ./router win on name + path collisions
//     (they carry our meta guards: requiresAuth / requiresGuest).
//   • File-based routes from ~pages are appended as an escape hatch
//     so new pages are usable without editing router/index.ts.
//   • Catch-all (/:pathMatch(.*)*) from the manual router MUST stay
//     last, otherwise it swallows every file-based route.
//
// This must run BEFORE app.use(router) so vue-router sees the
// final route table when it does its initial resolve.

const CATCH_ALL = "/:pathMatch(.*)*";

function mergeRoutes(
  manual: readonly RouteRecordRaw[],
  generated: readonly RouteRecordRaw[],
): RouteRecordRaw[] {
  // Collect manual names + paths (top level AND nested) so file-based
  // routes that clash anywhere are skipped.
  const manualNames = new Set<string>();
  const manualPaths = new Set<string>();

  const walk = (routes: readonly RouteRecordRaw[]): void => {
    for (const r of routes) {
      if (r.name) manualNames.add(String(r.name));
      if (r.path) manualPaths.add(r.path);
      if (r.children?.length) walk(r.children);
    }
  };
  walk(manual);

  const safeGenerated = generated.filter((r) => {
    const dupByName = r.name && manualNames.has(String(r.name));
    const dupByPath = r.path && manualPaths.has(r.path);
    if (dupByName || dupByPath) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Router] Skipping file-based route ${String(
            r.name ?? r.path,
          )} — overridden by manual router.`,
        );
      }
      return false;
    }
    return true;
  });

  // Split out the manual catch-all so it stays last.
  const catchAllIndex = manual.findIndex((r) => r.path === CATCH_ALL);
  if (catchAllIndex === -1) {
    return [...manual, ...safeGenerated];
  }

  const withoutCatchAll = [
    ...manual.slice(0, catchAllIndex),
    ...manual.slice(catchAllIndex + 1),
  ];

  return [...withoutCatchAll, ...safeGenerated, manual[catchAllIndex]];
}

// ============================================================
// APPLY MERGED ROUTES
// ============================================================
// IMPORTANT: `createRouter` already registered the manual routes.
// `router.addRoute()` appends a top-level route.
// We must NOT try to remove/clear manual routes (there is no
// bulk API and removing named routes also drops children).
// We only ADD the non-duplicate file-based routes that the
// merge produced, right before the catch-all.

const manualRoutes = router.options.routes;
const generatedSafe = mergeRoutes(manualRoutes, generatedRoutes as RouteRecordRaw[]);
// `generatedSafe` = manual (w/o catch-all) + file-based + catch-all.
// We only want to add the ones that aren't already registered.

for (const route of generatedSafe) {
  // Skip everything already registered by createRouter.
  const pathExists = manualRoutes.some((r) => r.path === route.path);
  const nameExists = route.name && router.hasRoute(route.name as string);
  if (pathExists || nameExists) continue;

  // Insert BEFORE the catch-all so the catch-all stays last.
  try {
    router.addRoute(route);
  } catch (err) {
    console.error(`[Router] Failed to add route ${String(route.name ?? route.path)}:`, err);
  }
}

// ============================================================
// VUE APPLICATION
// ============================================================

const app = createApp(App);

// ============================================================
// GLOBAL ERROR HANDLING
// ============================================================

app.config.errorHandler = (error, _instance, info) => {
  console.error("[Vue Error]", error);
  console.error("[Vue Info]", info);
};

app.config.warnHandler = (message, _instance, trace) => {
  console.warn("[Vue Warning]", message);
  if (trace) console.warn(trace);
};

// ============================================================
// PLUGINS
// ============================================================

app.use(pinia);
app.use(vuetify);
app.use(i18n);
app.use(createHead());
app.use(VueViewer);
app.use(router);

// ============================================================
// MOUNT
// ============================================================

router
  .isReady()
  .then(() => {
    app.mount("#app");
  })
  .catch((error: unknown) => {
    console.error("[App] Router initialisation failed:", error);
  });