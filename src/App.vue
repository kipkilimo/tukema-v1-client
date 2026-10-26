<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/users";
import { useHead } from "@vueuse/head";
import { useVoucherStore } from "./stores/vouchers";

const router = useRouter();
const route = useRoute();
const authStore = useUserStore();
const snackbarStore = useVoucherStore();

const isInitializing = ref(true);
const showBootLoader = ref(true);

const requiresAuth = computed(() => route.meta?.requiresAuth === true);
const isAuthenticated = computed(() => !!authStore.user?.id);

useHead({
  title: "Tukema",
  meta: [
    {
      name: "description",
      content: "Preserving Our Heritage, Inspiring Our Future.",
    },
  ],
});

onMounted(async () => {
  document.getElementById("initial-loading")?.remove();

  try {
    await router.isReady();
    if (authStore.accessToken && !authStore.user) {
      await authStore.restoreSession();
    }
  } catch (err) {
    console.warn("[App] init warning:", err);
  } finally {
    isInitializing.value = false;
    showBootLoader.value = false;

    if (requiresAuth.value && !isAuthenticated.value) {
      void router.replace("/second-messenger");
    }
  }
});

watch(
  () => isAuthenticated.value,
  (isAuth) => {
    if (!isAuth && requiresAuth.value && !isInitializing.value) {
      void router.replace("/second-messenger");
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    if (isInitializing.value) return;
    if (requiresAuth.value && !isAuthenticated.value) {
      void router.replace("/second-messenger");
    }
  },
);
</script>

<template>
  <v-app>
    <div v-if="showBootLoader" class="app-init-loading-enhanced">
      <div class="loader-card">
        <div class="loader-logo-square">
          <div class="logo-square-inner">
            <span class="logo-nemb">NEMB</span>
            <span class="logo-io">io</span>
          </div>
        </div>

        <div class="loading-title">tukema</div>
        <div class="loading-subtitle">
          Nairobi Epidemiology &amp; Biostatistics
        </div>
        <div class="loading-subtitle-small">Methods Colloquium</div>

        <div class="loading-status">
          <span class="status-text">Loading workspace</span>
          <div class="dot-wave"><span></span><span></span><span></span></div>
        </div>

        <div class="progress-track">
          <div class="progress-bar-enhanced"></div>
        </div>

        <div class="loader-footer">
          <span class="footer-icon">📊</span>
          <span>Secure • Research-grade • Real-time insights</span>
        </div>
      </div>
    </div>

    <RouterView />

    <div class="snackbar-container">
      <v-snackbar
        v-for="(msg, index) in snackbarStore.messages"
        :key="index"
        v-model="msg.visible"
        :color="msg.type || 'info'"
        :timeout="msg.timeout || 3000"
        location="bottom"
        @update:model-value="(val) => !val && snackbarStore.remove(index)"
      >
        {{ msg.message }}
        <template v-slot:actions>
          <v-btn
            variant="text"
            icon="mdi-close"
            @click="snackbarStore.remove(index)"
          />
        </template>
      </v-snackbar>
    </div>
  </v-app>
</template>

<style scoped>
.app-init-loading-enhanced {
  position: fixed;
  inset: 0;
  background: linear-gradient(145deg, #f8faff 0%, #eef3fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  transition: opacity 0.2s ease-out;
}

.app-init-loading-enhanced.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loader-card {
  text-align: center;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 32px rgba(26, 110, 255, 0.08);
  min-width: 380px;
  border: 1px solid rgba(26, 110, 255, 0.06);
}

.loader-logo-square {
  width: 7.5rem;
  height: 7.5rem;
  margin: 0 auto 1.25rem auto;
  background: linear-gradient(135deg, #1a6eff, #4a8aff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(26, 110, 255, 0.25);
}

.logo-square-inner {
  display: flex;
  align-items: baseline;
}
.logo-nemb {
  font-size: 28px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}
.logo-io {
  font-size: 22px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Fira Code", monospace;
}

.loading-title {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #111827;
  margin-bottom: 0.15rem;
}
.loading-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-top: 2px;
}
.loading-subtitle-small {
  font-size: 12px;
  color: #6b7280;
  margin-top: 1px;
}

.loading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
.status-text {
  font-size: 14px;
  color: #6b7280;
}

.dot-wave {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}
.dot-wave span {
  width: 7px;
  height: 7px;
  background: linear-gradient(135deg, #1a6eff, #4a8aff);
  border-radius: 50%;
  display: inline-block;
  animation: wavePulse 1.3s infinite ease-in-out;
}
.dot-wave span:nth-child(2) {
  animation-delay: 0.2s;
}
.dot-wave span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wavePulse {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.progress-track {
  width: 220px;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  margin: 18px auto 0;
  overflow: hidden;
}
.progress-bar-enhanced {
  width: 45%;
  height: 100%;
  background: linear-gradient(90deg, #1a6eff, #4a8aff, #1a6eff);
  background-size: 200% auto;
  border-radius: 2px;
  animation: progressMove 1.6s infinite alternate ease-in-out;
}

@keyframes progressMove {
  0% {
    width: 15%;
    transform: translateX(-5%);
  }
  50% {
    width: 70%;
    transform: translateX(5%);
  }
  100% {
    width: 85%;
    transform: translateX(10%);
  }
}

.loader-footer {
  margin-top: 22px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.footer-icon {
  font-size: 0.85rem;
}

.snackbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}
.snackbar-container > * {
  pointer-events: auto;
}

@media (max-width: 480px) {
  .loader-card {
    min-width: unset;
    width: calc(100vw - 2rem);
    max-width: 360px;
    padding: 2rem 1.25rem;
  }
  .loader-logo-square {
    width: 6rem;
    height: 6rem;
  }
  .logo-nemb {
    font-size: 22px;
  }
  .logo-io {
    font-size: 18px;
  }
  .loading-title {
    font-size: 32px;
  }
  .loading-subtitle {
    font-size: 13px;
  }
  .loading-subtitle-small {
    font-size: 11px;
  }
  .progress-track {
    width: 180px;
  }
  .loader-footer {
    font-size: 11px;
    padding: 0 0.5rem;
    text-align: center;
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot-wave span,
  .progress-bar-enhanced {
    animation: none !important;
  }
}
</style>
