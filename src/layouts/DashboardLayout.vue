<template>
  <v-app>
    <!-- ============================= APP BAR ============================= -->
    <v-app-bar class="app-bar px-2 px-md-4" flat height="72">
      <!-- Mobile drawer trigger -->
      <v-app-bar-nav-icon class="d-flex d-md-none" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <!-- Wordmark -->
      <router-link to="/dashboard" class="brand-link">
        <div class="brand-text">
          <v-img
            :src="logoImg"
            alt="Logo"
            contain
            style="height: 60px; width: 150px; cursor: pointer"
          />
          <span class="brand-tag d-none d-sm-inline mb-1 ml-6">{{
            t("app.tagline")
          }}</span>
        </div>
      </router-link>

      <v-spacer />

      <!-- ============ UTILITY CLUSTER (far right, icons only) ============ -->
      <div class="utility-cluster">
        <!-- Global search -->
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              size="small"
              @click="searchOpen = true"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <span>{{ t("common.search") }}</span>
        </v-tooltip>

        <!-- Language toggle -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-tooltip location="bottom">
              <template #activator="{ props: tProps }">
                <v-btn
                  v-bind="{ ...props, ...tProps }"
                  icon
                  variant="text"
                  size="small"
                >
                  <v-icon>mdi-web</v-icon>
                </v-btn>
              </template>
              <span>{{ t("account.language") }}</span>
            </v-tooltip>
          </template>
          <v-list density="compact" min-width="220">
            <v-list-item
              v-for="loc in locales"
              :key="loc.code"
              :active="activeLocale === loc.code"
              @click="setLocale(loc.code)"
            >
              <template #prepend>
                <span class="mr-2">{{ loc.flag }}</span>
              </template>
              <v-list-item-title>{{ loc.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ loc.native }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Notifications -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-tooltip location="bottom">
              <template #activator="{ props: tProps }">
                <v-badge color="error" dot :content="3">
                  <v-btn
                    v-bind="{ ...props, ...tProps }"
                    icon
                    variant="text"
                    size="small"
                  >
                    <v-icon>mdi-bell-outline</v-icon>
                  </v-btn>
                </v-badge>
              </template>
              <span>{{ t("account.notifications") }}</span>
            </v-tooltip>
          </template>
          <v-list density="compact" min-width="280">
            <v-list-subheader>{{
              t("account.notifications")
            }}</v-list-subheader>
            <v-list-item v-for="n in notifications" :key="n.id">
              <v-list-item-title>{{ t(n.titleKey) }}</v-list-item-title>
              <v-list-item-subtitle>{{ n.time }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- ============ ACCOUNT + CREATE MENU ============ -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small">
              <v-avatar size="30" color="#1B4B66">
                <span class="text-white text-caption">{{ userInitials }}</span>
              </v-avatar>
            </v-btn>
          </template>

          <v-list density="compact" min-width="240">
            <!-- Real user info -->
            <v-list-item v-if="user">
              <v-list-item-title class="text-body-2 font-weight-bold">
                {{ user.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ user.email }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-divider />

            <!-- Create artefact (ADMIN / CREATOR only) -->
            <v-list-item
              v-if="canCreateArtefact"
              @click="openDialog('artefact:create')"
            >
              <template #prepend>
                <v-icon color="#3D8361">mdi-plus-circle-outline</v-icon>
              </template>
              <v-list-item-title>{{ t("artefacts.upload") }}</v-list-item-title>
            </v-list-item>

            <!-- Account links -->
            <v-list-item to="/account/profile">
              <template #prepend><v-icon>mdi-account</v-icon></template>
              <v-list-item-title>{{ t("account.profile") }}</v-list-item-title>
            </v-list-item>
            <v-list-item to="/account/preferences">
              <template #prepend><v-icon>mdi-tune</v-icon></template>
              <v-list-item-title>{{
                t("account.preferences")
              }}</v-list-item-title>
            </v-list-item>
            <v-list-item to="/account/security">
              <template #prepend><v-icon>mdi-shield-lock</v-icon></template>
              <v-list-item-title>{{ t("account.security") }}</v-list-item-title>
            </v-list-item>
            <v-list-item to="/account/security">
              <template #prepend><v-icon>mdi-speak</v-icon></template>
              <v-list-item-title><!-- add right after the success chip -->
<v-btn
  color="#3D8361"
  variant="flat"
  prepend-icon="mdi-bullhorn-variant"
  class="text-none"
  :disabled="launchFlow.open"
  @click="openLaunchFlow"
>
  Launch Campaign
</v-btn></v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="logout">
              <template #prepend><v-icon>mdi-logout</v-icon></template>
              <v-list-item-title>{{ t("account.logout") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- ===================== MOBILE NAV DRAWER ===================== -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="start"
      width="300"
      class="d-md-none"
    >
      <v-list density="comfortable" nav>
        <v-list-subheader class="text-uppercase text-caption">
          {{ t("nav.dashboard") }}
        </v-list-subheader>

        <!-- Dashboard -->
        <v-list-item to="/dashboard" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-view-dashboard-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.dashboard") }}</v-list-item-title>
        </v-list-item>

        <!-- Collections -->
        <v-list-item to="/collections" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-folder-multiple-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.collections") }}</v-list-item-title>
        </v-list-item>

        <!-- Artefacts -->
        <v-list-item to="/artefacts" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-palette-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.artefacts") }}</v-list-item-title>
        </v-list-item>

        <!-- Galleries -->
        <v-list-item to="/galleries" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-image-multiple-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.galleries") }}</v-list-item-title>
        </v-list-item>

        <!-- Exhibits -->
        <v-list-item to="/exhibits" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-calendar-star-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.exhibits") }}</v-list-item-title>
        </v-list-item>

        <!-- Stories -->
        <v-list-item to="/stories" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-microphone-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.stories") }}</v-list-item-title>
        </v-list-item>

        <!-- Learning -->
        <v-list-item to="/learning" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-school-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.learning") }}</v-list-item-title>
        </v-list-item>

        <!-- Events -->
        <v-list-item to="/events" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-calendar-month-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.events") }}</v-list-item-title>
        </v-list-item>

        <!-- Community -->
        <v-list-item to="/community" @click="drawer = false">
          <template #prepend>
            <v-icon color="#1B4B66">mdi-account-group-outline</v-icon>
          </template>
          <v-list-item-title>{{ t("nav.community") }}</v-list-item-title>
        </v-list-item>

        <!-- Create artefact (ADMIN / CREATOR only) -->
        <template v-if="canCreateArtefact">
          <v-divider class="my-2" />
          <v-list-subheader class="text-uppercase text-caption">
            Actions
          </v-list-subheader>
          <v-list-item
            @click="
              openDialog('artefact:create');
              drawer = false;
            "
          >
            <template #prepend>
              <v-icon color="#3D8361">mdi-plus-circle-outline</v-icon>
            </template>
            <v-list-item-title>{{ t("artefacts.upload") }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <template #append>
        <v-list density="compact">
          <v-list-subheader>{{ t("account.language") }}</v-list-subheader>
          <v-list-item
            v-for="loc in locales"
            :key="loc.code"
            :active="activeLocale === loc.code"
            @click="setLocale(loc.code)"
          >
            <template #prepend>
              <span class="mr-2">{{ loc.flag }}</span>
            </template>
            <v-list-item-title>{{ loc.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- ============================= CONTENT ============================= -->
    <v-main class="main-content">
      <v-container fluid class="px-4 px-md-6 py-4">
        <router-view />
      </v-container>
    </v-main>

    <!-- ============================= FOOTER ============================= -->
    <v-footer v-show="showFooter" class="footer-gradient" height="28" app>
      <div class="footer-content">
        <span>&copy; {{ new Date().getFullYear() }} Tukema</span>
        <span class="footer-divider">•</span>
        <span>All rights reserved</span>
        <span class="footer-divider">•</span>
        <span
          >Tukema is registered in Kenya as a Public Benefit Charity (PBORA Reg
          No. 000000*)</span
        >
      </div>
    </v-footer>

    <DialogHost />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  useDialogStore,
  type DialogKey,
  type DialogPayload,
} from "@/stores/dialogs";
import { useUserStore } from "@/stores/users";

import logoImg from "@/assets/logo.png";
import DialogHost from "@/components/dialogs/DialogsHost.vue";

// ===================== FOOTER VISIBILITY =====================
const showFooter = ref(true);
onMounted(() => {
  setTimeout(() => {
    showFooter.value = false;
  }, 5000);
});

// ===================== I18N =====================
const { t, locale } = useI18n();
const router = useRouter();

// ===================== USER STORE =====================
const userStore = useUserStore();
const user = computed(() => userStore.user);

const isAdmin = computed(() => user.value?.role === "ADMIN");
const isCreator = computed(() => user.value?.role === "CREATOR");
const canCreateArtefact = computed(() => isAdmin.value || isCreator.value);

const userInitials = computed(() => {
  const name = user.value?.name ?? "";
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

// ===================== LOCALE =====================
const activeLocale = computed({
  get: () => locale.value,
  set: (value) => {
    locale.value = value;
    localStorage.setItem("locale", value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  },
});

const locales = computed(() => [
  { code: "en", name: t("locale.english"), native: "English", flag: "🇬🇧" },
  { code: "es", name: t("locale.spanish"), native: "Español", flag: "🇪🇸" },
  { code: "fr", name: t("locale.french"), native: "Français", flag: "🇫🇷" },
  { code: "ar", name: t("locale.arabic"), native: "العربية", flag: "🇸🇦" },
  { code: "am", name: t("locale.amharic"), native: "አማርኛ", flag: "🇪🇹" },
]);

function setLocale(code: string) {
  activeLocale.value = code;
}

// ===================== DRAWER / SEARCH =====================
const drawer = ref(false);
const searchOpen = ref(false);

// ===================== NOTIFICATIONS (placeholder) =====================
const notifications = ref([
  { id: 1, titleKey: "dashboard.recentAdditions", time: t("time.justNow") },
  { id: 2, titleKey: "dashboard.upcomingEvents", time: t("time.today") },
]);

// ===================== DIALOG DISPATCH =====================
const dialog = useDialogStore();

function openDialog(key: DialogKey, payload: DialogPayload = {}) {
  dialog.open(key, payload);
}

// ===================== LOGOUT =====================
function logout() {
  userStore.logout?.();
  router.push("/login");
}
</script>

<style scoped>
.app-bar {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(27, 75, 102, 0.1);
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 0.8;
}

.brand-tag {
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  color: #6b7684;
}

.utility-cluster {
  display: flex;
  align-items: center;
  gap: 2px;
}

.main-content {
  background: #f7f8fa;
  min-height: calc(100vh - 72px);
}

@media (max-width: 599px) {
  .brand-tag {
    display: none;
  }
}

/* ============================================================
   FOOTER - unchanged
   ============================================================ */
.footer-gradient {
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8bb13;
  color: rgba(255, 255, 255, 0.92);
  position: relative;
  overflow: hidden;
  border: 0 !important;
  box-shadow:
    0 -1px 0 rgba(255, 255, 255, 0.1),
    0 -3px 12px rgba(15, 43, 63, 0.08);
  animation: blockToGradient 9s ease-in-out forwards;
}

.footer-gradient::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 100%
  );
  pointer-events: none;
  opacity: 0;
  animation: shimmerFade 9.5s ease-in-out forwards;
}

.footer-gradient::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  opacity: 0;
  animation: glowFade 9.5s ease-in-out forwards;
}

@keyframes blockToGradient {
  0% {
    background: #1a4b6b;
  }
  88.8% {
    background: #1a4b6b;
  }
  100% {
    background: linear-gradient(
      105deg,
      #016fb8 0%,
      #33a5f1 30%,
      #5bb3ee 55%,
      #91cdf5 78%,
      #bddff5 100%
    );
  }
}
@keyframes shimmerFade {
  0% {
    opacity: 0;
  }
  88% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes glowFade {
  0% {
    opacity: 0;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.footer-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  font-size: 10.5px;
  line-height: 1;
  font-weight: 400;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.footer-divider {
  opacity: 0.4;
  font-size: 7px;
}

@media (max-width: 600px) {
  .footer-gradient {
    height: 24px !important;
    min-height: 24px !important;
  }
  .footer-content {
    height: 24px;
    font-size: 8.5px;
    gap: 5px;
    letter-spacing: 0.02em;
  }
  .footer-divider {
    font-size: 6px;
  }
  .footer-gradient {
    animation-duration: 8s;
  }
}
</style>
