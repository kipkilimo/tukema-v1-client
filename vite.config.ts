
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import yaml from "@rollup/plugin-yaml";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import obfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";
  const isCI = process.env.CI === "true";
  const isDocker = process.env.DOCKER === "true";

  const DEV_HOST =
    env.VITE_DEV_HOST || process.env.DEV_HOST || "0.0.0.0";

  const DEV_PORT = Number(
    env.VITE_DEV_PORT || process.env.PORT || 8002,
  );

  const PREVIEW_PORT = Number(
    env.VITE_PREVIEW_PORT || DEV_PORT,
  );

  // Polling is more reliable on mounted volumes and virtualised
  // filesystems. Set VITE_USE_POLLING=false to disable it.
  const USE_POLLING =
    (env.VITE_USE_POLLING ||
      process.env.VITE_USE_POLLING ||
      (isDocker ? "true" : "true")) === "true";

  const POLLING_INTERVAL = Number(
    env.VITE_POLLING_INTERVAL || 300,
  );

  // Only override the HMR host/port when explicitly configured.
  // Otherwise, let Vite determine the correct WebSocket endpoint.
  const HMR_HOST =
    env.VITE_HMR_HOST || process.env.HMR_HOST;

  const HMR_PORT = Number(
    env.VITE_HMR_PORT || DEV_PORT,
  );

  const corsOrigins = Array.from(
    new Set(
      [
        `http://localhost:${DEV_PORT}`,
        `http://127.0.0.1:${DEV_PORT}`,
        ...(DEV_HOST !== "0.0.0.0" && DEV_HOST !== "::"
          ? [`http://${DEV_HOST}:${DEV_PORT}`]
          : []),
        ...(env.VITE_CORS_EXTRA_ORIGINS?.split(",") ?? []),
      ]
        .map((origin) => origin.trim())
        .filter(
          (origin) =>
            origin &&
            !origin.includes("0.0.0.0") &&
            !origin.includes("[::]"),
        ),
    ),
  );

  const plugins: PluginOption[] = [
    vue({
      template: {
        compilerOptions: {
          whitespace: "condense",
        },
      },
    }),

    vueJsx(),
    yaml(),

    // File-based pages.
    Pages({
      dirs: ["src/pages"],
      extensions: ["vue", "md"],
      exclude: [
        "**/components/**",
        "**/auth/**",
      ],
      routeStyle: "file",
    }),

    // Layout auto-import and generated layout routes.
    Layouts({
      layoutsDirs: "src/layouts",
      defaultLayout: "default",
      exclude: ["**/components/**"],
    }),

    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vue-i18n",
        "@vueuse/core",
        "@vueuse/head",
        {
          vuetify: ["useTheme"],
        },
      ],
      dirs: [
        "src/composables",
        "src/store",
      ],
      dts: "src/auto-imports.d.ts",
      vueTemplate: true,
    }),

    Components({
      dirs: [
        "src/components",
        "src/**/components",
      ],
      extensions: ["vue"],
      deep: true,
      dts: "src/components.d.ts",
      directoryAsNamespace: false,
      include: [/\.vue$/, /\.vue\?vue/],
    }),
  ];

  if (isProd && process.env.OBFUSCATE === "true") {
    plugins.push(
      obfuscator({
        apply: "build",
        options: {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: false,
          selfDefending: false,
          disableConsoleOutput: false,
          stringArray: true,
          stringArrayEncoding: [],
          stringArrayThreshold: 0.5,
        },
      }),
    );
  }

  return {
    plugins,

    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },

    resolve: {
      alias: {
        "@": fileURLToPath(
          new URL("./src", import.meta.url),
        ),
        "~layouts": fileURLToPath(
          new URL("./src/layouts", import.meta.url),
        ),
      },
      dedupe: ["vue", "vue-router", "vuetify"],
    },

    server: {
      host: DEV_HOST,
      port: DEV_PORT,
      strictPort: true,

      // Leave HMR endpoint discovery to Vite unless overridden.
      hmr: {
        overlay: true,
        ...(HMR_HOST ? { host: HMR_HOST } : {}),
        ...(env.VITE_HMR_PORT || process.env.HMR_PORT
          ? {
              port: HMR_PORT,
              clientPort: Number(
                env.VITE_HMR_CLIENT_PORT || HMR_PORT,
              ),
            }
          : {}),
        ...(env.VITE_HMR_PROTOCOL
          ? { protocol: env.VITE_HMR_PROTOCOL as "ws" | "wss" }
          : {}),
      },

      cors: {
        origin: corsOrigins,
        credentials: true,
      },

      watch: {
        usePolling: USE_POLLING,
        interval: POLLING_INTERVAL,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/.env*",
        ],
      },

      proxy: {
        "/api": {
          target:
            env.VITE_API_TARGET ||
            "http://127.0.0.1:4002",
          changeOrigin: false,
        },
      },
    },

    optimizeDeps: {
      force: isCI,
      include: [
        "vue",
        "vue-router",
        "pinia",
        "vuetify",
        "graphql",
        "@apollo/client/core",
        "@vue/apollo-composable",
      ],
    },

    build: {
      target: "es2020",
      sourcemap: false,
      minify: "esbuild",
      reportCompressedSize: false,
      cssCodeSplit: true,
    },

    esbuild: {
      target: "es2020",
      legalComments: "none",
      drop: isProd ? ["console", "debugger"] : [],
    },

    css: {
      devSourcemap: !isProd,
      preprocessorOptions: {
        scss: {
          additionalData:
            '@import "@/styles/variables.scss";',
        },
      },
    },

    ssr: {
      noExternal: ["vuetify"],
    },

    preview: {
      host: DEV_HOST,
      port: PREVIEW_PORT,
      strictPort: true,
    },
  };
});
