<template>
  <v-container class="py-8 px-4" max-width="1100">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8 flex-wrap ga-3">
      <div>
        <h1 class="text-h4 font-weight-bold">Welcome back, {{ userName }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Your museum vouchers and active cart, in one place.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-compass-outline"
        to="/museum/explore"
      >
        Explore Museum
      </v-btn>
    </div>

    <v-row>
      <!-- LEFT: Vouchers -->
      <v-col cols="12" md="7">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">My Vouchers</h2>
          <v-chip size="small" color="primary" variant="tonal">
            {{ vouchers.length }} total
          </v-chip>
        </div>

        <v-card
          v-if="!vouchers.length"
          variant="outlined"
          class="pa-8 text-center"
        >
          <v-icon size="56" color="grey-lighten-1" class="mb-3">
            mdi-ticket-outline
          </v-icon>
          <div class="text-h6 mb-2">No vouchers yet</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Purchase a ticket to unlock the museum explorer.
          </div>
          <v-btn color="primary" to="/museum/explore">Buy a ticket</v-btn>
        </v-card>

        <v-card
          v-for="v in vouchers"
          :key="v.code"
          variant="outlined"
          class="mb-3 rounded-lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-start ga-4">
              <v-avatar
                rounded="lg"
                size="56"
                :color="v.status === 'redeemed' ? 'success' : 'primary'"
                variant="tonal"
              >
                <v-icon size="28">mdi-ticket-confirmation</v-icon>
              </v-avatar>

              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      Voucher · {{ v.code }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Issued {{ formatDate(v.issuedAt) }}
                    </div>
                  </div>
                  <v-chip
                    size="small"
                    :color="v.status === 'redeemed' ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ v.status }}
                  </v-chip>
                </div>

                <div class="d-flex ga-2 mt-3 flex-wrap">
                  <v-chip size="x-small" variant="outlined">
                    <v-icon start size="12">mdi-clock-outline</v-icon>
                    {{ v.durationMins }} min
                  </v-chip>
                  <v-chip
                    v-if="v.expiresAt"
                    size="x-small"
                    variant="outlined"
                    :color="isExpiringSoon(v.expiresAt) ? 'error' : undefined"
                  >
                    <v-icon start size="12">mdi-calendar</v-icon>
                    Expires {{ formatDate(v.expiresAt) }}
                  </v-chip>
                </div>

                <div class="d-flex ga-2 mt-3 flex-wrap">
                  <v-btn
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-content-copy"
                    @click="copyCode(v.code)"
                  >
                    Copy code
                  </v-btn>
                  <v-btn
                    v-if="v.status !== 'redeemed'"
                    size="small"
                    variant="flat"
                    color="primary"
                    prepend-icon="mdi-login"
                    :to="`/museum/explore?tokenKey=${v.code}`"
                  >
                    Use in Explorer
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT: Cart -->
      <v-col cols="12" md="5">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Active Cart</h2>
          <v-chip size="small" color="primary" variant="tonal">
            {{ cartCount }} item{{ cartCount === 1 ? "" : "s" }}
          </v-chip>
        </div>

        <v-card variant="elevated" class="pa-5 rounded-lg">
          <div v-if="!cartItems.length" class="text-center py-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-cart-outline
            </v-icon>
            <div class="text-body-2 text-medium-emphasis mb-3">
              Your cart is empty.
            </div>
            <v-btn size="small" variant="tonal" to="/museum/explore">
              Browse artefacts
            </v-btn>
          </div>

          <template v-else>
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="d-flex align-center ga-3 mb-3"
            >
              <v-avatar rounded="lg" size="48" color="grey-lighten-3">
                <v-img v-if="coverOf(item)" :src="coverOf(item)!" cover />
                <v-icon v-else size="20">mdi-cube-outline</v-icon>
              </v-avatar>
              <div class="flex-grow-1 min-w-0">
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ item.title }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.qty }} × {{ formatMoney(item.price) }}
                </div>
              </div>
              <div class="text-body-2 font-weight-bold">
                {{ formatMoney(item.qty * item.price) }}
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between mb-4">
              <span class="text-subtitle-2 font-weight-bold">Total</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">
                {{ formatMoney(cartTotal) }}
              </span>
            </div>

            <v-btn
              color="primary"
              block
              prepend-icon="mdi-cart-check"
              to="/museum/checkout"
            >
              Go to Checkout
            </v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toast -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="4000"
      location="bottom end"
      rounded="lg"
    >
      <div class="d-flex align-center" style="gap: 10px">
        <v-icon size="20">{{ toast.icon }}</v-icon>
        <span>{{ toast.message }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/users";
import { useVoucherStore } from "@/stores/vouchers";

interface CartItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  mediaUrls: string[];
}

/**
 * In-memory cart — shared with the checkout page.
 * If your checkout page uses `sessionStorage`, swap these for
 * `useCartStore()` instead. For now this is the simplest approach
 * that matches the rest of the app: the user is a guest, so the
 * cart lives only for the duration of the visit.
 */
const cartItems = ref<CartItem[]>([]);

const userStore = useUserStore();
const voucherStore = useVoucherStore();

const userName = computed(() => userStore.user?.name ?? "Explorer");

/**
 * Vouchers come from the voucher store (which the checkout
 * writes to on `redeem`/`payment-success`). No localStorage reads.
 */
const vouchers = computed(() => {
  const v = voucherStore.voucher;
  if (!v) return [];
  return [
    {
      code: v.code ?? "",
      status: (v.status ?? "pending") as
        "redeemed" | "expired" | "cancelled" | "pending",
      durationMins: v.durationMins ?? 0,
      issuedAt: v.redeemedAt ?? new Date().toISOString(),
      expiresAt: v.expiresAt ?? null,
    },
  ];
});

const cartCount = computed(() =>
  cartItems.value.reduce((acc, i) => acc + i.qty, 0),
);
const cartTotal = computed(() =>
  cartItems.value.reduce((acc, i) => acc + i.price * i.qty, 0),
);

const toast = ref({
  show: false,
  color: "success",
  icon: "mdi-check-circle",
  message: "",
});

function coverOf(item: CartItem): string | null {
  for (const u of item.mediaUrls) {
    if (/\.(jpe?g|png|webp|avif|gif)(?:\b|$)/i.test(u) && !/\.glb/i.test(u)) {
      return u;
    }
  }
  return null;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { dateStyle: "medium" });
}

function isExpiringSoon(d: string) {
  const ms = new Date(d).getTime() - Date.now();
  return ms > 0 && ms < 1000 * 60 * 60 * 24 * 3;
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    toast.value = {
      show: true,
      color: "success",
      icon: "mdi-check-circle",
      message: `Copied ${code} to clipboard`,
    };
  } catch {
    toast.value = {
      show: true,
      color: "error",
      icon: "mdi-alert-circle",
      message: "Could not copy — please copy manually",
    };
  }
}
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}
</style>
