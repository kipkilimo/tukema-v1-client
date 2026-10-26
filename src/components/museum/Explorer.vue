<!-- views/MuseumExplorer.vue -->
<template>
  <v-container fluid class="explorer pa-0">
    <!-- ============ VOUCHER: validating dialog ============ -->
    <v-dialog
      :model-value="validating"
      persistent
      width="auto"
      scrim="black"
      class="voucher-status-dialog"
      z-index="3000"
    >
      <v-card class="pa-6 d-flex flex-column align-center" min-width="240">
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
          class="mb-3"
        />
        <div class="text-body-1">Validating your ticket…</div>
      </v-card>
    </v-dialog>

    <!-- ============ VOUCHER: purchase dialog (hard gate) ============ -->
    <VoucherPurchaseDialog
      :model-value="locked"
      persistent
      :token="voucherStore.code ?? undefined"
      :message="voucherStore.error ?? undefined"
      :reason="voucherStore.error ?? undefined"
      @payment-success="onPurchaseSuccess"
    />

    <!-- ============ TOP TOOLBAR ============ -->
    <v-toolbar density="comfortable" class="explorer__toolbar">
      <router-link to="/dashboard" class="brand-link d-none d-sm-flex">
        <v-icon start class="mr-2">mdi-bank-outline</v-icon>
        <span class="text-h6 font-weight-bold">Museum</span>
      </router-link>

      <v-tabs
        :model-value="activeCategory"
        show-arrows
        color="primary"
        class="ml-2 ml-md-4 explorer__tabs"
        @update:model-value="setCategory"
      >
        <v-tab :value="ALL">All</v-tab>
        <v-tab v-for="c in store.categories" :key="c.slug" :value="c.slug">
          {{ c.label }}
        </v-tab>
      </v-tabs>

      <v-spacer />

      <v-text-field
        v-model="searchText"
        density="compact"
        variant="solo"
        flat
        hide-details
        clearable
        prepend-inner-icon="mdi-magnify"
        placeholder="Search artefacts"
        class="explorer__search mr-2 d-none d-md-flex"
        @update:model-value="onSearchChanged"
        @click:clear="onSearchChanged('')"
      />

      <!-- Access + countdown chip -->
      <v-chip
        v-if="accessGranted"
        size="small"
        color="success"
        variant="tonal"
        prepend-icon="mdi-ticket-confirmation-outline"
        class="mr-2 d-none d-sm-flex"
        :title="`Redeemed token ${voucherStore.code ?? ''}`"
      >
        {{ voucherStore.code ?? "Access granted" }}
        <template v-if="remainingLabel"> · {{ remainingLabel }} </template>
      </v-chip>

      <!-- Mobile-only timer badge -->
      <v-chip
        v-if="accessGranted && remainingLabel"
        size="x-small"
        color="warning"
        variant="tonal"
        prepend-icon="mdi-timer-outline"
        class="mr-1 d-sm-none"
      >
        {{ remainingLabel }}
      </v-chip>

      <div class="utility-cluster">
        <v-btn
          icon
          variant="text"
          size="small"
          @click="onSearchChanged(searchText)"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" class="d-none d-sm-inline-flex">
          <v-icon>mdi-web</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small">
          <v-badge color="error" dot :content="3">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        <v-btn icon variant="text" size="small">
          <v-avatar size="30" color="#1B4B66">
            <span class="text-white text-caption">TU</span>
          </v-avatar>
        </v-btn>
      </div>

      <template v-if="subcategories.length" #extension>
        <v-chip-group
          :model-value="activeSub"
          selected-class="text-primary"
          class="px-2"
          @update:model-value="setSub"
        >
          <v-chip
            v-for="s in subcategories"
            :key="s.slug"
            :value="s.slug"
            size="small"
            variant="outlined"
            filter
          >
            {{ s.label }}
          </v-chip>
        </v-chip-group>
      </template>
    </v-toolbar>

    <!-- ============================================================== -->
    <!-- DESKTOP: stage + details side-by-side (unchanged)              -->
    <!-- ============================================================== -->
    <v-row v-if="!isMobile" no-gutters class="explorer__top">
      <!-- Stage -->
      <v-col cols="12" md="8" class="explorer__stage-col">
        <div ref="stageEl" class="stage">
          <model-viewer
            v-if="glbUrl"
            :key="`${glbUrl}::${modelKey}`"
            ref="mv"
            class="stage__viewer"
            :src="glbUrl"
            :alt="title || 'Museum artefact'"
            :auto-rotate="autoRotate ? '' : null"
            :camera-controls="true"
            touch-action="pan-y"
            interaction-prompt="none"
            environment-image="neutral"
            shadow-intensity="1"
            :shadow-softness="0.9"
            :exposure="1.05"
            loading="eager"
            reveal="auto"
            min-field-of-view="12deg"
            max-field-of-view="45deg"
            @progress="onProgress"
            @load="onLoad"
            @error="onModelError"
          />

          <div v-else-if="!selectedId" class="stage__empty">
            <v-icon size="48" class="mb-2">mdi-cube-off-outline</v-icon>
            <div>Pick an artefact below to view it in 3D.</div>
          </div>

          <div v-else-if="glbError" class="stage__empty">
            <v-icon size="48" class="mb-2">mdi-alert-circle-outline</v-icon>
            <div>This artefact's 3D model could not be loaded.</div>
            <v-btn
              class="mt-3"
              size="small"
              variant="tonal"
              prepend-icon="mdi-refresh"
              @click="retryModel"
            >
              Retry
            </v-btn>
          </div>

          <div v-else class="stage__empty">
            <v-icon size="48" class="mb-2">mdi-cube-off-outline</v-icon>
            <div>This artefact has no 3D model yet.</div>
          </div>

          <v-progress-linear
            v-if="glbUrl && modelLoading && progress > 0"
            :model-value="progress"
            color="primary"
            height="3"
            rounded
            class="stage__progress"
          />

          <v-alert
            v-if="glbError"
            type="error"
            density="compact"
            variant="tonal"
            class="stage__alert"
          >
            {{ glbErrorMessage }}
            <template #append>
              <v-btn
                size="small"
                variant="text"
                :loading="modelLoading"
                @click="retryModel"
              >
                Retry
              </v-btn>
            </template>
          </v-alert>

          <div v-if="title" class="stage__caption">
            <div class="text-subtitle-1 font-weight-medium">{{ title }}</div>
            <div class="text-caption">{{ categoryText }}</div>
          </div>

          <v-btn
            icon="mdi-chevron-left"
            variant="tonal"
            class="stage__nav stage__nav--prev"
            aria-label="Previous artefact ([)"
            :disabled="!canStep(-1)"
            @click="stepArtefact(-1)"
          />
          <v-btn
            icon="mdi-chevron-right"
            variant="tonal"
            class="stage__nav stage__nav--next"
            aria-label="Next artefact (])"
            :disabled="!canStep(1)"
            @click="stepArtefact(1)"
          />

          <div
            class="stage__controls"
            role="toolbar"
            aria-label="3D viewer controls"
          >
            <v-btn
              v-for="b in controls"
              :key="b.icon"
              :icon="b.icon"
              size="small"
              :variant="b.active ? 'flat' : 'text'"
              :color="b.active ? 'primary' : undefined"
              :aria-label="b.label"
              :aria-pressed="b.active === undefined ? undefined : b.active"
              :title="b.label"
              :disabled="!glbUrl"
              @click="b.run"
            />
            <v-menu location="top" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-keyboard-outline"
                  size="small"
                  variant="text"
                  aria-label="Keyboard and controller shortcuts"
                  title="Shortcuts"
                />
              </template>
              <v-card min-width="300">
                <v-card-title class="text-subtitle-1">Controls</v-card-title>
                <v-list density="compact">
                  <v-list-item
                    title="Mouse / touch"
                    subtitle="Drag to orbit, wheel or pinch to zoom, right-drag to pan"
                  />
                  <v-list-item
                    v-for="k in shortcuts"
                    :key="k.keys"
                    :title="k.label"
                  >
                    <template #append>
                      <kbd class="stage__kbd">{{ k.keys }}</kbd>
                    </template>
                  </v-list-item>
                  <v-list-item
                    title="Gamepad"
                    subtitle="Left stick orbit, right stick zoom, A auto-rotate, B reset, LB/RB browse"
                  />
                </v-list>
              </v-card>
            </v-menu>
          </div>
        </div>
      </v-col>

      <!-- Details -->
      <v-col cols="12" md="4" class="explorer__detail-col">
        <div v-if="selectedId" class="pa-4 pa-md-6">
          <div class="text-body-2 text-medium-emphasis">{{ categoryText }}</div>
          <h1 class="text-h5 my-1">{{ title }}</h1>
          <div v-if="artefact" class="text-h6 text-primary mb-4">
            {{ priceText }}
          </div>

          <template v-if="artefact">
            <p class="explorer__description mb-5">{{ artefact.description }}</p>

            <dl class="explorer__meta">
              <template v-if="artefact.region">
                <dt>Region</dt>
                <dd>{{ artefact.region }}</dd>
              </template>
              <template v-if="artefact.communities.length">
                <dt>Communities</dt>
                <dd>
                  <v-chip
                    v-for="c in artefact.communities"
                    :key="c"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ c }}
                  </v-chip>
                </dd>
              </template>
              <template v-if="artefact.tags.length">
                <dt>Tags</dt>
                <dd>
                  <v-chip
                    v-for="t in artefact.tags"
                    :key="t"
                    size="small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ t }}
                  </v-chip>
                </dd>
              </template>
              <dt>Updated</dt>
              <dd>{{ updatedText }}</dd>
            </dl>
            <v-divider class="mt-4" />

            <div class="d-flex flex-wrap ga-3 mt-4">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-cart-plus"
                :disabled="cartHasItem"
                @click="addToCart"
              >
                {{ cartHasItem ? "Added to cart" : "Add to cart" }}
              </v-btn>

              <v-btn
                v-if="cartHasItem"
                variant="flat"
                color="primary"
                prepend-icon="mdi-cart-check"
                to="/museum/checkout"
              >
                Check out
              </v-btn>
            </div>
          </template>
          <v-skeleton-loader v-else type="paragraph, chip, paragraph" />
        </div>

        <div v-else class="pa-6 text-medium-emphasis">
          Select an artefact to see its story, origin and price.
        </div>
      </v-col>
    </v-row>

    <!-- ============================================================== -->
    <!-- MOBILE: vertical snap-scroll feed (TikTok / Reels / Shorts)    -->
    <!-- ============================================================== -->
    <div
      v-else
      ref="feedEl"
      class="feed"
      role="feed"
      aria-label="Artefact gallery"
    >
      <template v-if="thumbsLoading && !thumbs.length">
        <section
          v-for="n in 3"
          :key="n"
          class="feed__card feed__card--skeleton"
        >
          <v-skeleton-loader type="image" height="100%" />
        </section>
      </template>

      <v-alert
        v-else-if="thumbsError"
        type="error"
        variant="tonal"
        class="ma-4"
      >
        {{ thumbsError }}
        <template #append>
          <v-btn size="small" variant="text" @click="loadThumbs()">
            Retry
          </v-btn>
        </template>
      </v-alert>

      <div v-else-if="!thumbs.length" class="feed__empty text-medium-emphasis">
        No published artefacts in this filter yet.
      </div>

      <section
        v-for="(t, i) in thumbs"
        v-else
        :key="t.id"
        class="feed__card"
        :class="{ 'feed__card--active': t.id === selectedId }"
        :data-id="t.id"
        :aria-current="t.id === selectedId ? 'true' : undefined"
      >
        <!-- Viewer -->
        <div class="feed__stage" @click="handleStageTap">
          <model-viewer
            v-if="t.id === selectedId && mediaOf(t.mediaUrls).glb"
            :key="`${mediaOf(t.mediaUrls).glb}::${modelKey}`"
            class="feed__viewer"
            :src="mediaOf(t.mediaUrls).glb!"
            :alt="t.title"
            :auto-rotate="autoRotate ? '' : null"
            :camera-controls="true"
            touch-action="pan-y"
            interaction-prompt="none"
            environment-image="neutral"
            shadow-intensity="1"
            :shadow-softness="0.9"
            :exposure="1.05"
            loading="eager"
            reveal="auto"
            min-field-of-view="12deg"
            max-field-of-view="45deg"
            @progress="onProgress"
            @load="onLoad"
            @error="onModelError"
          />
          <div v-else-if="!mediaOf(t.mediaUrls).glb" class="feed__empty-stage">
            <v-icon size="48" class="mb-2">mdi-cube-off-outline</v-icon>
            <div class="text-body-2">No 3D model yet</div>
          </div>
          <div v-else class="feed__loading-stage">
            <v-progress-circular indeterminate color="primary" size="32" />
            <div class="text-caption mt-2">Loading 3D model…</div>
          </div>

          <!-- Floating title -->
          <div class="feed__caption">
            <div class="text-subtitle-1 font-weight-bold">{{ t.title }}</div>
            <div class="text-caption opacity-80">
              {{ categoryLabelFor(t) }}
            </div>
          </div>

          <!-- Vertical side rail (like TikTok's like/share/comments) -->
          <div class="feed__rail">
            <v-btn
              icon
              variant="text"
              class="feed__rail-btn"
              :title="cartHasItemFor(t) ? 'In cart' : 'Add to cart'"
              :aria-label="cartHasItemFor(t) ? 'In cart' : 'Add to cart'"
              @click.stop="addToCartFor(t)"
            >
              <v-icon size="28">
                {{ cartHasItemFor(t) ? "mdi-cart-check" : "mdi-cart-plus" }}
              </v-icon>
              <span class="feed__rail-label">
                {{ cartHasItemFor(t) ? "In cart" : "Add" }}
              </span>
            </v-btn>

            <v-btn
              icon
              variant="text"
              class="feed__rail-btn"
              title="Retry 3D"
              aria-label="Retry 3D"
              @click.stop="retryModel"
            >
              <v-icon size="28">mdi-refresh</v-icon>
              <span class="feed__rail-label">Retry</span>
            </v-btn>

            <v-btn
              icon
              variant="text"
              class="feed__rail-btn"
              :title="autoRotate ? 'Pause rotation' : 'Auto-rotate'"
              :aria-label="autoRotate ? 'Pause rotation' : 'Auto-rotate'"
              @click.stop="toggleRotate"
            >
              <v-icon size="28">
                {{ autoRotate ? "mdi-rotate-3d-variant" : "mdi-rotate-3d" }}
              </v-icon>
              <span class="feed__rail-label">Spin</span>
            </v-btn>
          </div>

          <!-- Details drawer -->
          <div
            class="feed__details"
            :class="{ 'is-open': detailsOpenId === t.id }"
          >
            <button
              class="feed__handle"
              type="button"
              :aria-expanded="detailsOpenId === t.id ? 'true' : 'false'"
              @click.stop="toggleDetails(t.id)"
            >
              <span class="feed__handle-bar" />
              <span class="feed__handle-hint">
                {{ detailsOpenId === t.id ? "Close" : "Details" }}
              </span>
            </button>
            <div class="feed__details-body">
              <div v-if="store.byId[t.id]" class="feed__details-inner">
                <div class="text-h6 text-primary mb-2">
                  {{ priceTextFor(t) }}
                </div>
                <p class="feed__description">
                  {{ store.byId[t.id].description }}
                </p>

                <dl class="feed__meta">
                  <template v-if="store.byId[t.id].region">
                    <dt>Region</dt>
                    <dd>{{ store.byId[t.id].region }}</dd>
                  </template>
                  <template v-if="store.byId[t.id].communities.length">
                    <dt>Communities</dt>
                    <dd>
                      <v-chip
                        v-for="c in store.byId[t.id].communities"
                        :key="c"
                        size="x-small"
                        class="mr-1 mb-1"
                      >
                        {{ c }}
                      </v-chip>
                    </dd>
                  </template>
                </dl>

                <div class="d-flex flex-wrap ga-2 mt-3">
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-cart-plus"
                    :disabled="cartHasItemFor(t)"
                    @click="addToCartFor(t)"
                  >
                    {{ cartHasItemFor(t) ? "Added" : "Add to cart" }}
                  </v-btn>
                  <v-btn
                    v-if="cartHasItem"
                    size="small"
                    variant="flat"
                    color="primary"
                    prepend-icon="mdi-cart-check"
                    to="/museum/checkout"
                  >
                    Check out
                  </v-btn>
                </div>
              </div>
              <v-skeleton-loader v-else type="paragraph" />
            </div>
          </div>

          <!-- Inline filmstrip -->
          <div class="feed__strip">
            <button
              v-for="t2 in thumbs"
              :key="`strip-${t2.id}`"
              type="button"
              class="feed__strip-thumb"
              :class="{ 'is-active': t2.id === selectedId }"
              :aria-label="t2.title"
              @click.stop="jumpTo(t2)"
            >
              <v-img
                v-if="coverOf(t2)"
                :src="coverOf(t2)!"
                aspect-ratio="4/3"
                cover
                class="feed__strip-img"
              />
              <div v-else class="feed__strip-img feed__strip-img--none">
                <v-icon size="16">mdi-cube-outline</v-icon>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Load-more sentinel (fires when scrolled past last card) -->
      <div
        v-if="hasNext && !thumbsLoading"
        class="feed__sentinel"
        aria-hidden="true"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useArtefactsStore,
  type Artefact,
  type ThumbItem,
  type ArtefactFilterInput,
} from "@/stores/artefacts";
import { useVoucherStore, TOKEN_RE } from "@/stores/vouchers";
import VoucherPurchaseDialog from "@/components/dialogs/VoucherPurchase.vue";

interface ModelViewerEl extends HTMLElement {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  getCameraOrbit(): { theta: number; phi: number; radius: number };
  getFieldOfView(): number;
  jumpCameraToGoal(): void;
}

const ALL = "__all__";
const PAGE_SIZE = 10;
const PREFETCH_RADIUS = 5;
const CART_STORAGE_KEY = "tukema.cart";
const MOBILE_BREAKPOINT = 960;

/* ------------------------------------------------------------------ */
/* Stores / state                                                      */
/* ------------------------------------------------------------------ */

const store = useArtefactsStore();
const voucherStore = useVoucherStore();
const route = useRoute();
const router = useRouter();

const accessGranted = computed(() => voucherStore.isRedeemed);
const validating = computed(
  () =>
    voucherStore.status === "checking" || voucherStore.status === "redeeming",
);
const remainingLabel = computed(() => voucherStore.remainingLabel ?? "");

/* ------------------------------------------------------------------ */
/* Hard gate                                                           */
/* ------------------------------------------------------------------ */

const locked = computed(() => !accessGranted.value && !validating.value);

const stageEl = ref<HTMLElement | null>(null);
const feedEl = ref<HTMLElement | null>(null);
const stripEl = ref<HTMLElement | null>(null);
const mv = ref<ModelViewerEl | null>(null);

const activeCategory = ref<string>(ALL);
const activeSub = ref<string | null>(null);
const searchText = ref("");

const thumbs = ref<ThumbItem[]>([]);
const totalCount = ref(0);
const hasNext = ref(false);
const page = ref(0);
const thumbsLoading = ref(false);
const thumbsError = ref<string | null>(null);
let thumbsReq = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const selectedId = ref<string | null>(null);

const autoRotate = ref(true);
const modelLoading = ref(false);
const progress = ref(0);
const glbError = ref(false);
const glbErrorMessage = ref("The 3D model could not be loaded.");
const isFullscreen = ref(false);
const modelKey = ref(0);
const prefetching = new Set<string>();

/* Mobile layout */
const isMobile = ref(false);
const detailsOpenId = ref<string | null>(null);

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

const cartHasItem = ref(false);
const cartIds = ref<Set<string>>(new Set());

function refreshCartIds() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const set = new Set<string>(
      Array.isArray(parsed) ? parsed.map((p: any) => String(p.id)) : [],
    );
    cartIds.value = set;
    cartHasItem.value = set.size > 0;
  } catch {
    cartIds.value = new Set();
    cartHasItem.value = false;
  }
}

const checkCart = refreshCartIds;

function cartHasItemFor(t: { id: string }) {
  return cartIds.value.has(String(t.id));
}

function addToCartFor(t: ThumbItem) {
  const a = store.byId[t.id];
  if (!a) return;
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    let cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
    if (!cart.some((item: any) => item.id === a.id)) {
      cart.push({ ...a, qty: 1 });
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
    refreshCartIds();
  } catch {
    /* ignore */
  }
}

function addToCart() {
  const a = artefact.value;
  if (a) addToCartFor(a as unknown as ThumbItem);
}

/* ------------------------------------------------------------------ */
/* Gate                                                                */
/* ------------------------------------------------------------------ */

const tokenParam = () => {
  const q = route.query.tokenKey;
  return (Array.isArray(q) ? q[0] : q)?.toString() ?? "";
};

function stripTokenFromUrl() {
  const { tokenKey: _drop, ...rest } = route.query;
  void router.replace({ query: rest });
}

async function enterGate() {
  const hadToken = !!tokenParam();
  const res = await voucherStore.enter(tokenParam());
  if (res.success && hadToken) stripTokenFromUrl();
}

watch(
  () => route.query.tokenKey,
  (k) => {
    if (k) void enterGate();
  },
);

async function onPurchaseSuccess(payload: any) {
  await voucherStore.redeemPayload(payload);
  // After success, jump to first card to seed selection
  if (thumbs.value[0]) void select(thumbs.value[0]);
}

/* ------------------------------------------------------------------ */
/* Media extraction                                                    */
/* ------------------------------------------------------------------ */

const GLB_PATH_RE = /(?:\.glb\b|\/glb\/)/i;
const IMG_PATH_RE = /\.(?:jpe?g|png|webp|avif|gif)(?:\b|$)/i;
const TIMESTAMP_RE = /^(\d{8}T\d{6}Z?)/i;

const pathOf = (u: string) => {
  const q = u.indexOf("?");
  return q === -1 ? u : u.slice(0, q);
};
const baseName = (u: string) => {
  const p = pathOf(u);
  const slash = p.lastIndexOf("/");
  return slash === -1 ? p : p.slice(slash + 1);
};
function glbTimestamp(u: string) {
  const m = baseName(u).match(TIMESTAMP_RE);
  return m ? m[1] : "";
}
function pickGlb(urls: readonly string[] | null | undefined): string | null {
  if (!urls?.length) return null;
  let best: string | null = null;
  let bestTs = "";
  let bestName = "";
  for (const u of urls) {
    const path = pathOf(u);
    if (!GLB_PATH_RE.test(path)) continue;
    const ts = glbTimestamp(u);
    const name = baseName(u);
    if (best === null || ts > bestTs || (ts === bestTs && name < bestName)) {
      best = u;
      bestTs = ts;
      bestName = name;
    }
  }
  return best;
}
function pickCover(urls: readonly string[] | null | undefined): string | null {
  if (!urls?.length) return null;
  let fallback: string | null = null;
  for (const u of urls) {
    const path = pathOf(u);
    if (!IMG_PATH_RE.test(path) || GLB_PATH_RE.test(path)) continue;
    if (/cover/i.test(path)) return u;
    fallback ??= u;
  }
  return fallback;
}
const mediaCache = new WeakMap<
  readonly string[],
  { glb: string | null; cover: string | null }
>();
function mediaOf(urls: readonly string[] | null | undefined) {
  if (!urls?.length)
    return { glb: null as string | null, cover: null as string | null };
  const hit = mediaCache.get(urls);
  if (hit) return hit;
  const value = { glb: pickGlb(urls), cover: pickCover(urls) };
  mediaCache.set(urls, value);
  return value;
}
const coverOf = (a: { mediaUrls: string[] }) => mediaOf(a.mediaUrls).cover;

/* ------------------------------------------------------------------ */
/* Derived data                                                        */
/* ------------------------------------------------------------------ */

const light = computed(
  () => thumbs.value.find((t) => t.id === selectedId.value) ?? null,
);
const artefact = computed<Artefact | null>(() =>
  selectedId.value ? (store.byId[selectedId.value] ?? null) : null,
);
const media = computed(() => {
  if (artefact.value) return mediaOf(artefact.value.mediaUrls);
  if (light.value) return mediaOf(light.value.mediaUrls);
  return { glb: null as string | null, cover: null as string | null };
});
const glbUrl = computed(() => media.value.glb);
const title = computed(() => artefact.value?.title ?? light.value?.title ?? "");
const categoryText = computed(() => {
  const a = artefact.value ?? light.value;
  if (!a) return "";
  const parts = [store.categoryLabel(a.category)];
  if (a.subcategory)
    parts.push(store.subcategoryLabel(a.category, a.subcategory));
  return parts.join(" · ");
});
const priceText = computed(() =>
  artefact.value ? priceTextFor(artefact.value) : "",
);
function priceTextFor(t: { currency?: string; price?: number }) {
  if (!t.currency || typeof t.price !== "number") return "";
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: t.currency,
      maximumFractionDigits: 0,
    }).format(t.price);
  } catch {
    return `${t.currency} ${t.price}`;
  }
}
const updatedText = computed(() =>
  artefact.value
    ? new Date(artefact.value.updatedAt).toLocaleDateString("en-KE", {
        dateStyle: "medium",
      })
    : "",
);
function categoryLabelFor(t: {
  category: string;
  subcategory?: string | null;
}) {
  const parts = [store.categoryLabel(t.category)];
  if (t.subcategory)
    parts.push(store.subcategoryLabel(t.category, t.subcategory));
  return parts.filter(Boolean).join(" · ");
}
const subcategories = computed(() =>
  activeCategory.value === ALL
    ? []
    : store.subcategoriesOf(activeCategory.value),
);
const pageCount = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)),
);
const selIndex = computed(() =>
  thumbs.value.findIndex((t) => t.id === selectedId.value),
);

/* ------------------------------------------------------------------ */
/* Preflight                                                           */
/* ------------------------------------------------------------------ */

const probeCache = new Map<string, Promise<boolean>>();
function probeGlb(url: string): Promise<boolean> {
  const hit = probeCache.get(url);
  if (hit) return hit;
  const p = (async () => {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        credentials: "omit",
        cache: "no-store",
      });
      return res.ok || res.status === 206;
    } catch {
      return false;
    }
  })();
  probeCache.set(url, p);
  return p;
}

/* ------------------------------------------------------------------ */
/* Filmstrip loading                                                   */
/* ------------------------------------------------------------------ */

async function loadThumbs(pick: "first" | "last" = "first") {
  const req = ++thumbsReq;
  thumbsLoading.value = true;
  thumbsError.value = null;
  try {
    const filter: ArtefactFilterInput = {};
    if (activeCategory.value !== ALL) {
      filter.category = activeCategory.value;
      if (activeSub.value) filter.subcategory = activeSub.value;
    }
    if (searchText.value.trim()) filter.search = searchText.value.trim();

    const conn = await store.fetchThumbs({
      filter,
      limit: PAGE_SIZE,
      offset: page.value * PAGE_SIZE,
    });
    if (req !== thumbsReq) return;

    thumbs.value = conn.edges;
    totalCount.value = conn.totalCount;
    hasNext.value = conn.hasNextPage;

    if (!thumbs.value.some((t) => t.id === selectedId.value)) {
      const next =
        pick === "last"
          ? thumbs.value[thumbs.value.length - 1]
          : thumbs.value[0];
      if (next) void select(next);
      else clearSelection();
    } else {
      prefetchAround();
    }
  } catch (e) {
    if (req === thumbsReq)
      thumbsError.value =
        e instanceof Error ? e.message : "Could not load artefacts.";
  } finally {
    if (req === thumbsReq) thumbsLoading.value = false;
  }
}

function clearSelection() {
  selectedId.value = null;
  glbError.value = false;
  store.clearCurrent();
}

async function select(item: ThumbItem) {
  const id = item.id;
  selectedId.value = id;
  detailsOpenId.value = null;
  void scrollThumbIntoView(id);
  checkCart();

  glbError.value = false;
  glbErrorMessage.value = "The 3D model could not be loaded.";
  progress.value = 0;
  modelLoading.value = !!pickGlb(item.mediaUrls);

  try {
    await store.fetchArtefact(id);
  } catch {
    /* ignore */
  }

  const url = glbUrl.value;
  if (url && selectedId.value === id) {
    const ok = await probeGlb(url);
    if (!ok && glbUrl.value === url) {
      glbError.value = true;
      glbErrorMessage.value =
        "The 3D model could not be fetched (network or CORS).";
      modelLoading.value = false;
    }
  }

  if (selectedId.value === id) prefetchAround();
}

function jumpTo(item: ThumbItem) {
  const i = thumbs.value.findIndex((t) => t.id === item.id);
  if (i < 0) return;
  scrollToCard(i);
}

function prefetchAround() {
  const i = selIndex.value;
  if (i < 0) return;
  const from = Math.max(0, i - PREFETCH_RADIUS);
  const to = Math.min(thumbs.value.length, i + PREFETCH_RADIUS + 1);
  const ids: string[] = [];
  for (let k = from; k < to; k++) {
    const id = thumbs.value[k].id;
    if (id === selectedId.value) continue;
    if (store.byId[id]) {
      const u = mediaOf(store.byId[id].mediaUrls).glb;
      if (u) void probeGlb(u);
      continue;
    }
    if (prefetching.has(id)) continue;
    ids.push(id);
  }
  if (!ids.length) return;
  void Promise.allSettled(
    ids.map(async (id) => {
      prefetching.add(id);
      try {
        const a = await store.fetchArtefact(id, false, false);
        if (a) {
          const u = mediaOf(a.mediaUrls).glb;
          if (u) void probeGlb(u);
        }
      } finally {
        prefetching.delete(id);
      }
    }),
  );
}

async function scrollThumbIntoView(id: string) {
  await nextTick();
  stripEl.value
    ?.querySelector<HTMLElement>(`[data-id="${id}"]`)
    ?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
}

function canStep(dir: 1 | -1) {
  const i = selIndex.value + dir;
  if (i >= 0 && i < thumbs.value.length) return true;
  return dir === 1 ? hasNext.value : page.value > 0;
}

async function stepArtefact(dir: 1 | -1) {
  const i = selIndex.value + dir;
  if (i >= 0 && i < thumbs.value.length) {
    if (isMobile.value) {
      scrollToCard(i);
      return;
    }
    return select(thumbs.value[i]);
  }
  if (dir === 1 && hasNext.value) return changePage(1, "first");
  if (dir === -1 && page.value > 0) return changePage(-1, "last");
}

async function changePage(delta: number, pick: "first" | "last" = "first") {
  page.value = Math.max(0, page.value + delta);
  await loadThumbs(pick);
}

function setCategory(slug: unknown) {
  activeCategory.value = (slug as string) || ALL;
  activeSub.value = null;
  page.value = 0;
  clearSelection();
  void loadThumbs();
}

function setSub(slug: unknown) {
  activeSub.value = (slug as string) || null;
  page.value = 0;
  clearSelection();
  void loadThumbs();
}

function onSearchChanged(value: string | null) {
  searchText.value = value ?? "";
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 0;
    clearSelection();
    void loadThumbs();
  }, 300);
}

/* ------------------------------------------------------------------ */
/* Mobile: snap-scroll feed                                            */
/* ------------------------------------------------------------------ */

function scrollToCard(index: number, behavior: ScrollBehavior = "smooth") {
  const root = feedEl.value;
  if (!root) return;
  const cards = root.querySelectorAll<HTMLElement>(".feed__card");
  const card = cards[index];
  if (!card) return;
  root.scrollTo({ top: card.offsetTop, behavior });
}

function toggleDetails(id: string) {
  detailsOpenId.value = detailsOpenId.value === id ? null : id;
}

function handleStageTap() {
  // Tap on the 3D stage → close the details drawer if open.
  if (detailsOpenId.value) detailsOpenId.value = null;
}

/* ------------------------------------------------------------------ */
/* Viewer controls                                                     */
/* ------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function orbitBy(dTheta: number, dPhi: number, instant = false) {
  const el = mv.value;
  if (!el?.getCameraOrbit) return;
  const o = el.getCameraOrbit();
  const phi = clamp(o.phi + dPhi, 0.05, Math.PI - 0.05);
  el.cameraOrbit = `${o.theta + dTheta}rad ${phi}rad ${o.radius}m`;
  if (instant) el.jumpCameraToGoal();
}

function zoomBy(factor: number) {
  const el = mv.value;
  if (!el?.getFieldOfView) return;
  el.fieldOfView = `${clamp(el.getFieldOfView() * factor, 12, 45)}deg`;
}

function resetView() {
  const el = mv.value;
  if (!el) return;
  el.cameraOrbit = "auto auto auto";
  el.cameraTarget = "auto auto auto";
  el.fieldOfView = "auto";
  el.jumpCameraToGoal();
}

const toggleRotate = () => (autoRotate.value = !autoRotate.value);

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void stageEl.value?.requestFullscreen?.();
}

const onFsChange = () => (isFullscreen.value = !!document.fullscreenElement);

const controls = computed(() => [
  {
    icon: "mdi-rotate-3d-variant",
    label: "Auto-rotate (Space)",
    active: autoRotate.value,
    run: toggleRotate,
  },
  {
    icon: "mdi-magnify-minus-outline",
    label: "Zoom out (−)",
    run: () => zoomBy(1 / 0.85),
  },
  {
    icon: "mdi-magnify-plus-outline",
    label: "Zoom in (+)",
    run: () => zoomBy(0.85),
  },
  { icon: "mdi-restore", label: "Reset view (R)", run: resetView },
  {
    icon: isFullscreen.value ? "mdi-fullscreen-exit" : "mdi-fullscreen",
    label: "Fullscreen (F)",
    run: toggleFullscreen,
  },
]);

const shortcuts = [
  { keys: "← → ↑ ↓", label: "Orbit (Shift = faster)" },
  { keys: "+ / −", label: "Zoom in / out" },
  { keys: "Space", label: "Auto-rotate on/off" },
  { keys: "R", label: "Reset view" },
  { keys: "F", label: "Fullscreen" },
  { keys: "[ / ]", label: "Previous / next artefact" },
];

function onProgress(e: Event) {
  const d = (e as CustomEvent).detail as
    { totalProgress?: number; loaded?: number; total?: number } | undefined;
  if (!d) return;
  let p = 0;
  if (typeof d.totalProgress === "number") p = d.totalProgress;
  else if (typeof d.loaded === "number" && typeof d.total === "number")
    p = d.total ? d.loaded / d.total : 0;
  progress.value = Math.max(0, Math.min(100, p * 100));
}

function onLoad() {
  modelLoading.value = false;
  progress.value = 100;
  glbError.value = false;
}

function onModelError() {
  modelLoading.value = false;
  progress.value = 0;
  glbError.value = true;
  glbErrorMessage.value = "The 3D model could not be loaded.";
}

function retryModel() {
  if (!glbUrl.value) return;
  glbError.value = false;
  probeCache.delete(glbUrl.value);
  modelLoading.value = true;
  progress.value = 0;
  modelKey.value++;
}

watch(glbUrl, (u) => {
  glbError.value = false;
  progress.value = 0;
  modelLoading.value = !!u;
  if (u) modelKey.value++;
});

/* ------------------------------------------------------------------ */
/* Mobile: intersection + breakpoint observers                         */
/* ------------------------------------------------------------------ */

let io: IntersectionObserver | null = null;
let mq: MediaQueryList | null = null;

function onBreakpointChange(e: MediaQueryListEvent | MediaQueryList) {
  isMobile.value = e.matches;
  // Defer so the DOM updates from v-if before we try to attach IO.
  void nextTick(() => setupFeedIO());
}

function setupFeedIO() {
  io?.disconnect();
  io = null;
  if (!isMobile.value) return;
  const root = feedEl.value;
  if (!root) return;

  io = new IntersectionObserver(
    (entries) => {
      // Pick the most-visible card.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const best = visible[0];
      if (!best) return;
      const id = (best.target as HTMLElement).dataset.id;
      if (id && id !== selectedId.value) {
        const t = thumbs.value.find((x) => x.id === id);
        if (t) void select(t);
      }
    },
    {
      root,
      threshold: [0.55, 0.75, 0.95],
    },
  );

  root
    .querySelectorAll<HTMLElement>(".feed__card[data-id]")
    .forEach((el) => io!.observe(el));
}

/* Sentinel → load more when scrolled past */
let sentinelIO: IntersectionObserver | null = null;
function setupSentinel() {
  sentinelIO?.disconnect();
  sentinelIO = null;
  const root = feedEl.value;
  if (!root) return;
  const sentinel = root.querySelector<HTMLElement>(".feed__sentinel");
  if (!sentinel) return;
  sentinelIO = new IntersectionObserver(
    (entries) => {
      if (
        entries.some((e) => e.isIntersecting) &&
        hasNext.value &&
        !thumbsLoading.value
      ) {
        void changePage(1, "first");
      }
    },
    { root, threshold: 0.2 },
  );
  sentinelIO.observe(sentinel);
}

watch(thumbs, () => {
  if (!isMobile.value) return;
  void nextTick(() => {
    setupFeedIO();
    setupSentinel();
    // Align current selection into view (no scroll if same card).
    const i = selIndex.value;
    if (i >= 0) {
      const root = feedEl.value;
      const card = root?.querySelectorAll<HTMLElement>(".feed__card")[i];
      if (card && root) {
        const rect = card.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const notVisible =
          rect.top < rootRect.top - 10 || rect.bottom > rootRect.bottom + 10;
        if (notVisible) scrollToCard(i, "auto");
      }
    }
  });
});

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */

function onKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!accessGranted.value) return;

  const t = e.target as HTMLElement | null;
  if (
    t?.closest(
      'input,textarea,select,[contenteditable="true"],[role="tablist"],[role="menu"],[role="dialog"]',
    )
  )
    return;

  const onButton = !!t?.closest('button,[role="button"],a');
  const nudge = e.shiftKey ? 0.36 : 0.12;
  let handled = true;

  switch (e.key) {
    case "ArrowLeft":
      orbitBy(-nudge, 0);
      break;
    case "ArrowRight":
      orbitBy(nudge, 0);
      break;
    case "ArrowUp":
      // On mobile the vertical feed owns ArrowUp/Down.
      if (isMobile.value) {
        handled = false;
        break;
      }
      orbitBy(0, -nudge);
      break;
    case "ArrowDown":
      if (isMobile.value) {
        handled = false;
        break;
      }
      orbitBy(0, nudge);
      break;
    case "+":
    case "=":
    case "PageUp":
      zoomBy(0.85);
      break;
    case "-":
    case "_":
    case "PageDown":
      zoomBy(1 / 0.85);
      break;
    case " ":
      if (onButton) {
        handled = false;
        break;
      }
      toggleRotate();
      break;
    case "r":
    case "R":
    case "0":
      resetView();
      break;
    case "f":
    case "F":
      toggleFullscreen();
      break;
    case "[":
      void stepArtefact(-1);
      break;
    case "]":
      void stepArtefact(1);
      break;
    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
}

/* ------------------------------------------------------------------ */
/* Gamepad                                                             */
/* ------------------------------------------------------------------ */

let raf = 0;
const padDown: Record<number, boolean> = {};
function pollPad() {
  if (accessGranted.value) {
    const pad = Array.from(navigator.getGamepads?.() ?? []).find(Boolean);
    if (pad) {
      const dz = (v = 0) => (Math.abs(v) > 0.18 ? v : 0);
      const x = dz(pad.axes[0]);
      const y = dz(pad.axes[1]);
      const z = dz(pad.axes[3]);
      if (x || y) orbitBy(x * 0.05, y * 0.05, true);
      if (z) zoomBy(1 + z * 0.02);

      const edge = (i: number, fn: () => void) => {
        const down = !!pad.buttons[i]?.pressed;
        if (down && !padDown[i]) fn();
        padDown[i] = down;
      };
      edge(0, toggleRotate);
      edge(1, resetView);
      edge(4, () => void stepArtefact(-1));
      edge(5, () => void stepArtefact(1));
    }
  }
  raf = requestAnimationFrame(pollPad);
}
const startPad = () => {
  if (!raf) raf = requestAnimationFrame(pollPad);
};
const stopPad = () => {
  if (Array.from(navigator.getGamepads?.() ?? []).some(Boolean)) return;
  cancelAnimationFrame(raf);
  raf = 0;
};

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

onMounted(() => {
  window.addEventListener("keydown", onKey, true);
  document.addEventListener("fullscreenchange", onFsChange);
  window.addEventListener("gamepadconnected", startPad);
  window.addEventListener("gamepaddisconnected", stopPad);

  if (typeof window !== "undefined" && "matchMedia" in window) {
    mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    onBreakpointChange(mq);
    mq.addEventListener("change", onBreakpointChange);
  }

  checkCart();
  store.clearCurrent();
});

onBeforeUnmount(() => {
  thumbsReq++;
  if (searchTimer) clearTimeout(searchTimer);
  window.removeEventListener("keydown", onKey, true);
  document.removeEventListener("fullscreenchange", onFsChange);
  window.removeEventListener("gamepadconnected", startPad);
  window.removeEventListener("gamepaddisconnected", stopPad);

  mq?.removeEventListener("change", onBreakpointChange);
  io?.disconnect();
  sentinelIO?.disconnect();
  cancelAnimationFrame(raf);
});

/* ------------------------------------------------------------------ */
/* Kick-off                                                            */
/* ------------------------------------------------------------------ */

void enterGate();
void import("@google/model-viewer");
void store.fetchTaxonomy().catch(() => {});
void loadThumbs();
</script>

<style scoped>
/* ================================================================ */
/* Shared                                                            */
/* ================================================================ */
.explorer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}
.explorer__toolbar {
  flex: 0 0 auto;
}
.explorer__tabs {
  max-width: 55vw;
}
.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}
.explorer__search {
  flex: 0 0 260px;
  max-width: 260px;
}
.utility-cluster {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ================================================================ */
/* Desktop                                                           */
/* ================================================================ */
.explorer__stage-col {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0f12;
  container-type: size;
}
.explorer__detail-col {
  background: rgb(var(--v-theme-surface));
  border-inline-start: thin solid
    rgba(var(--v-border-color), var(--v-border-opacity));
}
.explorer__description {
  white-space: pre-line;
  max-width: 62ch;
  line-height: 1.6;
}
.explorer__meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 10px 16px;
  align-items: baseline;
}
.explorer__meta dt {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.8125rem;
}
.explorer__meta dd {
  margin: 0;
}
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 40%, #232830 0%, #0d0f12 75%);
  color: #fff;
}
.stage:fullscreen {
  aspect-ratio: auto;
  width: 100vw;
  height: 100vh;
}
.stage__viewer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  --poster-color: transparent;
}
.stage__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  text-align: center;
  padding: 24px;
}
.stage__progress {
  position: absolute !important;
  inset: auto 0 0 0;
}
.stage__alert {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
}
.stage__caption {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 14px 16px 36px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent);
}
.stage__nav {
  position: absolute !important;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.35) !important;
  color: #fff !important;
}
.stage__nav--prev {
  left: 10px;
}
.stage__nav--next {
  right: 10px;
}
.stage__controls {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(13, 15, 18, 0.72);
  backdrop-filter: blur(6px);
}
.stage__controls :deep(.v-btn) {
  color: #fff;
}
.stage__kbd {
  font: inherit;
  font-size: 0.75rem;
  padding: 1px 6px;
  border: thin solid rgba(var(--v-border-color), 0.4);
  border-radius: 4px;
}

@media (min-width: 960px) {
  .explorer {
    height: 97vh;
  }
  .explorer__top {
    flex: 1 1 0;
    min-height: 0;
    flex-wrap: nowrap;
  }
  .explorer__stage-col,
  .explorer__detail-col {
    height: 100%;
    min-height: 0;
  }
  .explorer__detail-col {
    overflow-y: auto;
  }
  .stage {
    width: min(100cqw, calc(100cqh * 16 / 9));
  }
}

/* ================================================================ */
/* Mobile: vertical snap feed (TikTok / Reels / Shorts style)        */
/* ================================================================ */
.feed {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  height: calc(100dvh - 56px); /* toolbar height */
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  background: #000;
  color: #fff;
  position: relative;
  scrollbar-width: none;
}
.feed::-webkit-scrollbar {
  display: none;
}

.feed__card {
  position: relative;
  width: 100%;
  height: calc(100dvh - 56px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  contain: layout paint;
  background: #000;
}

.feed__card--active .feed__caption {
  opacity: 1;
}

.feed__card--skeleton {
  display: flex;
  align-items: stretch;
  background: #111;
}

.feed__empty {
  padding: 32px 16px;
  text-align: center;
}

.feed__stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 50% 40%, #232830 0%, #0d0f12 75%);
  touch-action: pan-y;
}

.feed__viewer {
  width: 100%;
  height: 100%;
  background: transparent;
  --poster-color: transparent;
}

.feed__empty-stage,
.feed__loading-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  text-align: center;
  padding: 24px;
}

/* Caption overlay (top) */
.feed__caption {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 16px 40px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent);
  pointer-events: none;
  opacity: 0.95;
  transition: opacity 0.2s ease;
}
.feed__caption .opacity-80 {
  opacity: 0.8;
}

/* Right-side action rail (TikTok style) */
.feed__rail {
  position: absolute;
  right: 8px;
  bottom: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 3;
}
.feed__rail-btn {
  color: #fff !important;
  background: rgba(0, 0, 0, 0.35) !important;
  backdrop-filter: blur(6px);
  border-radius: 999px !important;
  height: 52px !important;
  width: 52px !important;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.feed__rail-label {
  font-size: 10px;
  margin-top: 2px;
  line-height: 1;
}

/* Bottom drawer for details */
.feed__details {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 96px; /* above filmstrip */
  max-height: 55dvh;
  display: flex;
  flex-direction: column;
  background: rgba(10, 12, 14, 0.92);
  backdrop-filter: blur(10px);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transform: translateY(calc(100% - 40px));
  transition: transform 0.25s ease;
  z-index: 4;
  will-change: transform;
}
.feed__details.is-open {
  transform: translateY(0);
}
.feed__handle {
  appearance: none;
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0 4px;
  cursor: pointer;
}
.feed__handle-bar {
  display: block;
  width: 42px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.35);
}
.feed__handle-hint {
  font-size: 11px;
  opacity: 0.75;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.feed__details-body {
  overflow-y: auto;
  padding: 4px 16px 20px;
  color: #eee;
  overscroll-behavior: contain;
}
.feed__details-inner .text-primary {
  color: #8fe3b4 !important;
}
.feed__description {
  line-height: 1.55;
  font-size: 0.9rem;
  white-space: pre-line;
  margin: 8px 0 12px;
}
.feed__meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 12px;
  font-size: 0.8rem;
  margin: 0;
}
.feed__meta dt {
  opacity: 0.65;
}
.feed__meta dd {
  margin: 0;
}

/* Inline filmstrip */
.feed__strip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 10px 12px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  z-index: 2;
  scrollbar-width: none;
}
.feed__strip::-webkit-scrollbar {
  display: none;
}
.feed__strip-thumb {
  flex: 0 0 auto;
  width: 56px;
  height: 42px;
  padding: 0;
  background: none;
  border: 0;
  border-radius: 6px;
  overflow: hidden;
  outline: 2px solid transparent;
  outline-offset: 1px;
  cursor: pointer;
  transition: outline-color 0.15s;
}
.feed__strip-thumb.is-active,
.feed__strip-thumb:focus-visible {
  outline-color: #8fe3b4;
}
.feed__strip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.feed__strip-img--none {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: #aaa;
}

/* Sentinel (triggers pagination when it enters the viewport) */
.feed__sentinel {
  height: 1px;
  width: 100%;
}

/* -------- Older styles preserved for other pages / fallbacks ------ */
.explorer__strip {
  flex: 0 0 auto;
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
}
.thumbs {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px;
  scroll-snap-type: x proximity;
}
.thumb {
  flex: 0 0 auto;
  width: 128px;
  padding: 0;
  text-align: left;
  background: none;
  border: 0;
  cursor: pointer;
  scroll-snap-align: center;
  color: inherit;
}
.thumb__img {
  width: 128px;
  height: 96px;
  border-radius: 6px;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.15s;
}
.thumb__img--none {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.thumb:hover .thumb__img {
  outline-color: rgba(var(--v-theme-primary), 0.5);
}
.thumb:focus-visible .thumb__img,
.thumb--active .thumb__img {
  outline-color: rgb(var(--v-theme-primary));
}
.thumb__label {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.thumb--active .thumb__label {
  font-weight: 600;
}

@media (max-width: 959px) {
  .stage {
    aspect-ratio: 4 / 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thumb__img,
  .feed__details,
  .feed__caption {
    transition: none !important;
  }
  .feed {
    scroll-behavior: auto;
  }
}
</style>
