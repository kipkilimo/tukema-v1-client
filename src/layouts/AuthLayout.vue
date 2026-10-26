<template>
  <v-app>
    <v-main class="auth-main">
      <v-row no-gutters class="auth-row">
        <!-- LEFT: AUTHENTICATION PANEL -->
        <v-col cols="12" md="5" class="auth-left">
          <div class="auth-left-inner">
            <router-view />
          </div>
        </v-col>

        <!-- RIGHT: FULL-HEIGHT POSTER — tablet-horizontal (≥840px) and above -->
        <v-col cols="12" md="7" class="poster-col">
          <div class="poster-wrapper">
            <v-img
              :src="currentCampaign?.bannerImageUrl || defaultPoster"
              :alt="currentCampaign?.title || 'Tukema Cultural Museum'"
              aspect-ratio="12/7"
              height="99.9%"
              width="100%"
              class="poster-image"
              eager
            >
           
            </v-img> 
            </div>
        </v-col>
      </v-row>
    </v-main>

    <!-- WELCOME DIALOG -->
    <v-dialog
      v-model="welcomeDialog"
      max-width="680"
      scrollable
      content-class="capped-dialog"
      transition="dialog-bottom-transition"
    >
      <div class="dialog-close-wrap">
        <v-btn
          icon="mdi-close"
          color="#1a5276"
          variant="elevated"
          size="small"
          elevation="4"
          class="dialog-close-btn"
          aria-label="Close welcome dialog"
          @click="welcomeDialog = false"
        />
        <v-card class="content-card pa-5 pa-sm-8 rounded-xl" elevation="0">
          <v-chip color="#1a5276" class="mb-4" variant="flat">
            <v-icon start>mdi-bank</v-icon>
            Preserving Cultural Heritage
          </v-chip>
          <h1 class="text-h4 text-sm-h3 font-weight-bold mb-4 gradient-text">
            tukema Cultural Museum
          </h1>
          <p class="text-body-1 font-weight-medium mb-5 welcome-copy">
            A living digital museum dedicated to preserving, showcasing and
            celebrating cultural heritage. Explore collections, stories and
            traditions passed down through generations.
          </p>
          <div class="d-flex ga-3 flex-wrap">
            <v-btn color="#1a5276" variant="flat" @click="goToLibrary">
              Explore Collections
              <v-icon end>mdi-compass</v-icon>
            </v-btn>
            <v-btn color="#1a5276" variant="outlined" @click="goToHome">
              Learn More
            </v-btn>
          </div>
          <div class="d-flex ga-2 mt-6 flex-wrap">
            <v-chip
              v-for="tag in heritageTags"
              :key="tag"
              color="#1a5276"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon start size="14">mdi-check-circle</v-icon>
              {{ tag }}
            </v-chip>
          </div>
        </v-card>
      </div>
    </v-dialog>

    <!-- CREATE CAMPAIGN DIALOG (lazy form) -->
    <v-dialog
      v-model="createDialog"
      max-width="960"
      content-class="capped-dialog capped-dialog--form"
      transition="dialog-bottom-transition"
      persistent
    >
      <div class="dialog-close-wrap">
        <v-btn
          icon="mdi-close"
          color="#1a5276"
          variant="elevated"
          size="small"
          elevation="4"
          class="dialog-close-btn"
          aria-label="Close campaign form"
          @click="closeCreateDialog"
        />
        <CreateCampaignForm
          @created="onCampaignCreated"
          @cancel="closeCreateDialog"
        />
      </div>
    </v-dialog>

    <!-- CAMPAIGN DETAIL DIALOG -->
    <v-dialog
      v-model="detailDialog"
      max-width="720"
      scrollable
      content-class="capped-dialog"
    >
      <v-card v-if="selectedCampaign" rounded="xl" class="detail-card">
        <v-img
          :src="selectedCampaign.bannerImageUrl || defaultPoster"
          :alt="selectedCampaign.title"
          height="280"
          cover
          class="flex-shrink-0"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="#1a5276" />
            </div>
          </template>
        </v-img>

        <v-card-title class="campaign-title">
          {{ selectedCampaign.title }}
        </v-card-title>

        <v-card-subtitle class="pb-2 flex-shrink-0">
          <v-icon size="14" class="mr-1">mdi-domain</v-icon>
          {{ selectedCampaign.organizationName }}
        </v-card-subtitle>

        <v-card-text class="detail-scroll-area">
          <p class="campaign-description">{{ selectedCampaign.description }}</p>
          <v-divider class="my-4" />
          <v-row density="compact">
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Start Date</div>
              <div class="text-body-2 font-weight-medium">
                {{ formatDate(selectedCampaign.campaignStartDate) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">End Date</div>
              <div class="text-body-2 font-weight-medium">
                {{ formatDate(selectedCampaign.campaignEndDate) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="flex-shrink-0" />

        <v-card-actions class="pa-4 flex-shrink-0">
          <v-btn variant="text" @click="detailDialog = false">Close</v-btn>
          <v-spacer />
          <v-btn
            v-if="selectedCampaign.externalLink"
            :href="selectedCampaign.externalLink"
            target="_blank"
            rel="noopener noreferrer"
            color="#1a5276"
            variant="flat"
            prepend-icon="mdi-open-in-new"
          >
            Visit Campaign
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Lazy-load the heavy form component only when the dialog opens.
import { defineAsyncComponent } from "vue";
const CreateCampaignForm = defineAsyncComponent(
  () => import("@/pages/auth/campaign-creator.vue")
);
import defaultPoster from "@/assets/bg2.jpg";

// ============================================================
// TYPES
// ============================================================
interface Campaign {
  _id: string;
  title: string;
  description: string;
  organizationName: string;
  externalLink?: string;
  bannerImageUrl: string;
  campaignStartDate: string;
  campaignEndDate: string;
  status: "active" | "queued";
  queuePosition: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsApiResponse {
  success: boolean;
  data: Campaign[];
  error?: string;
}

// ============================================================
// CONFIGURATION
// ============================================================
const router = useRouter();

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const REFRESH_INTERVAL_MS = 60_000;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_CONSECUTIVE_FAILURES = 3;

const heritageTags = ["Culture", "Heritage", "Posterity", "Digital Archive"] as const;

// ============================================================
// DIALOG STATE
// ============================================================
const welcomeDialog = ref(Math.random() < 0.2);
const createDialog = ref(false);
const detailDialog = ref(false);

// ============================================================
// CAMPAIGN STATE
// ============================================================
// shallowRef: campaigns are replaced wholesale, never mutated in place.
const campaigns = shallowRef<Campaign[]>([]);
const isLoadingCampaigns = ref(false);
const selectedCampaign = ref<Campaign | null>(null);

const currentCampaign = computed<Campaign | null>(() => {
  const list = campaigns.value;
  if (!list.length) return null;

  const now = Date.now();
  for (const c of list) {
    if (c.status !== "active") continue;
    const start = Date.parse(c.campaignStartDate);
    const end = Date.parse(c.campaignEndDate);
    if (Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end) {
      return c;
    }
  }
  return list[0];
});

// ============================================================
// CAMPAIGN FETCHING
// ============================================================
let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isFetching = false;
let isMounted = false;
let consecutiveFailures = 0;
let abortController: AbortController | null = null;

const fetchActiveCampaigns = async (): Promise<void> => {
  if (isFetching) return;
  isFetching = true;
  isLoadingCampaigns.value = true;

  abortController?.abort();
  abortController = new AbortController();

  try {
    const { data } = await axios.get<CampaignsApiResponse>(
      `${API_BASE_URL}/api/campaigns/active`,
      {
        timeout: FETCH_TIMEOUT_MS,
        signal: abortController.signal,
      }
    );

    if (data.success && Array.isArray(data.data)) {
      campaigns.value = data.data;
      consecutiveFailures = 0;
    } else {
      console.error("Failed to fetch campaigns:", data.error ?? "Unexpected API response");
      consecutiveFailures++;
    }
  } catch (err) {
    if (axios.isCancel(err) || (err as Error)?.name === "CanceledError") {
      // Aborted intentionally (unmount / dedupe). Do not count as failure.
    } else {
      consecutiveFailures++;
      console.error("Failed to load campaigns:", err);
    }
  } finally {
    isFetching = false;
    isLoadingCampaigns.value = false;
  }
};

const startRefreshLoop = (): void => {
  if (refreshInterval !== null) return;
  refreshInterval = setInterval(() => {
    // Back off if the API keeps failing.
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) return;
    void fetchActiveCampaigns();
  }, REFRESH_INTERVAL_MS);
};

const stopRefreshLoop = (): void => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// ============================================================
// DIALOG ACTIONS
// ============================================================
const openCreateDialog = (): void => {
  createDialog.value = true;
};
const closeCreateDialog = (): void => {
  createDialog.value = false;
};
const onCampaignCreated = async (): Promise<void> => {
  closeCreateDialog();
  consecutiveFailures = 0;
  await fetchActiveCampaigns();
};
const openCampaignDetail = (campaign: Campaign): void => {
  selectedCampaign.value = campaign;
  detailDialog.value = true;
};

// ============================================================
// HELPERS
// ============================================================
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const formatDate = (iso: string): string => {
  if (!iso) return "Not available";
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "Not available";
  return dateFormatter.format(new Date(ts));
};

// ============================================================
// NAVIGATION
// ============================================================
const goToLibrary = (): void => {
  welcomeDialog.value = false;
  void router.push("/dashboard");
};
const goToHome = (): void => {
  welcomeDialog.value = false;
  void router.push("/welcome");
};

// ============================================================
// VISIBILITY
// ============================================================
const handleVisibilityChange = (): void => {
  if (document.hidden) {
    stopRefreshLoop();
    return;
  }
  if (!isMounted) return;
  consecutiveFailures = 0;
  void fetchActiveCampaigns();
  startRefreshLoop();
};

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(async () => {
  isMounted = true;
  document.addEventListener("visibilitychange", handleVisibilityChange);

  await fetchActiveCampaigns();

  if (!document.hidden) startRefreshLoop();
});

onUnmounted(() => {
  isMounted = false;
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  stopRefreshLoop();
  abortController?.abort();
  abortController = null;
});
</script>

<style scoped>
/* ============================================================
   SHELL
   ============================================================ */
.auth-main {
  width: 100%;
  height: 100vh;
  min-height: 0;
  padding: 0 !important;
  overflow: hidden;
}
.auth-row {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
}

/* ============================================================
   LEFT PANEL
   ============================================================ */
.auth-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  padding: 1.5rem !important;
  overflow-x: hidden;
  overflow-y: auto;
  background: #ffffff;
}
.auth-left-inner {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 460px;
  min-height: 100%;
  margin: 0 auto;
  padding: 1rem 0;
}

/* ============================================================
   RIGHT POSTER
   ------------------------------------------------------------
   Default: hidden. Shown from 840px (tablet-horizontal) up.
   This is decoupled from Vuetify's `md` breakpoint (960px)
   so smaller landscape tablets also get the advert.
   ============================================================ */
.poster-col {
  display: none;
  height: 100%;
  min-width: 0;
  padding: 0 !important;
  overflow: hidden;
  background: #dceaf2;
  contain: strict;
}
@media (min-width: 840px) {
  .poster-col {
    display: flex;
  }
}

.poster-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #F5EFE6 0%, #8B4513 60%, #2B2B2B 100%);
}

.poster-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.advertiser-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(6, 22, 33, 0.68) 0%,
    rgba(13, 43, 62, 0.38) 48%,
    rgba(26, 82, 118, 0.22) 100%
  );
}

.loading-overlay,
.poster-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
  text-align: center;
}
.poster-fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d2b3e, #1a5276, #2e86c1);
}

.poster-overlay-top {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  max-width: 760px;
  padding: clamp(1.5rem, 4vw, 3.5rem);
  pointer-events: none;
}
.poster-overlay-top :deep(.v-btn),
.poster-overlay-top :deep(.v-chip) {
  pointer-events: auto;
}

.advertiser-chip {
  color: #ffffff !important;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.14) !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}

.advertiser-headline {
  max-width: 650px;
  margin-bottom: 1rem;
  color: #ffffff;
  font-size: clamp(2rem, 3.4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
}

.advertiser-subline {
  max-width: 34rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  line-height: 1.65;
  overflow-wrap: anywhere;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.35);
}

.advertiser-cta {
  color: #1a5276 !important;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.01em;
  background: #ffffff !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.advertiser-cta:hover {
  background: #f0f6fa !important;
}

.poster-overlay-bottom {
  position: absolute;
  right: clamp(1.5rem, 4vw, 3.5rem);
  bottom: 2.25rem;
  left: clamp(1.5rem, 4vw, 3.5rem);
  z-index: 2;
  pointer-events: none;
}
.poster-overlay-bottom :deep(.v-chip) {
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.65);
}

.advertiser-footnote {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ============================================================
   DIALOG SHELLS
   ============================================================ */
:global(.capped-dialog) {
  max-height: 94vh;
  margin: 16px;
}
:global(.capped-dialog--form) {
  max-height: 94vh;
}

.dialog-close-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 94vh;
  padding-top: 18px;
  padding-right: 18px;
}
.dialog-close-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  border: 2px solid #ffffff;
}

/* ============================================================
   WELCOME DIALOG
   ============================================================ */
.content-card {
  width: 100%;
  max-width: 680px;
  max-height: calc(94vh - 18px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 12px 40px rgba(26, 82, 118, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.welcome-copy {
  color: #2c3e50;
  line-height: 1.7;
}

.gradient-text {
  display: inline-block;
  color: #1a5276;
  background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:deep(.v-chip--variant-tonal) {
  background: rgba(26, 82, 118, 0.08) !important;
}

/* ============================================================
   CAMPAIGN DETAILS
   ============================================================ */
.detail-card {
  display: flex;
  flex-direction: column;
  max-height: 94vh;
  overflow: hidden;
}
.campaign-title {
  flex-shrink: 0;
  padding-top: 1rem;
  color: #1a5276;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: normal;
  overflow-wrap: anywhere;
}
.campaign-description {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.detail-scroll-area {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

/* ============================================================
   RESPONSIVE — full-width left panel below 840px
   ============================================================ */
@media (max-width: 839.98px) {
  .auth-main {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
  .auth-row {
    height: auto;
    min-height: 100vh;
  }
  .auth-left {
    height: auto;
    min-height: 100vh;
    padding: 1.25rem !important;
  }
  .auth-left-inner {
    min-height: calc(100vh - 2.5rem);
  }
}

@media (max-width: 600px) {
  .auth-left {
    padding: 1rem !important;
  }
  .auth-left-inner {
    min-height: calc(100vh - 2rem);
    padding: 0.75rem 0;
  }
  :global(.capped-dialog),
  :global(.capped-dialog--form) {
    max-height: 100vh;
    margin: 0;
  }
  .dialog-close-wrap {
    max-height: 100vh;
    padding-top: 12px;
    padding-right: 12px;
  }
  .content-card {
    max-height: calc(100vh - 12px);
    border-radius: 0 !important;
  }
  .detail-card {
    max-height: 100vh;
    border-radius: 0 !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-card {
    scroll-behavior: auto;
  }
}
</style>