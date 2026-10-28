<template>
  <v-container class="cart-page py-6 py-md-8 px-4" max-width="1100">
    <v-row align="start">
      <!-- LEFT: Cart -->
      <v-col cols="12" md="7">
        <div
          class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6"
        >
          <div>
            <h1 class="text-h4 font-weight-bold">Your Cart</h1>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
              Review your selected artefacts before checkout
            </p>
          </div>

          <v-btn
            variant="text"
            color="primary"
            prepend-icon="mdi-arrow-left"
            to="/museum/explore"
          >
            Continue Exploring
          </v-btn>
        </div>

        <!-- Empty cart -->
        <v-card
          v-if="!items.length"
          variant="outlined"
          class="empty-cart pa-6 pa-md-8 text-center"
        >
          <v-avatar color="primary" variant="tonal" size="76" class="mb-4">
            <v-icon size="38">mdi-cart-off</v-icon>
          </v-avatar>

          <h2 class="text-h6 font-weight-bold mb-2">Your cart is empty</h2>

          <p class="text-body-2 text-medium-emphasis mb-5">
            Explore the museum and add artefacts you love.
          </p>

          <v-btn color="primary" prepend-icon="mdi-museum" to="/museum/explore">
            Explore Museum
          </v-btn>
        </v-card>

        <!-- Cart items -->
        <v-card
          v-for="item in items"
          :key="item.id"
          variant="outlined"
          class="cart-item mb-3"
        >
          <v-card-text class="pa-3 pa-sm-4">
            <div class="d-flex align-start ga-3 ga-sm-4">
              <!-- Cover -->
              <v-avatar
                rounded="lg"
                size="88"
                color="grey-lighten-3"
                class="flex-shrink-0"
              >
                <v-img
                  v-if="item.coverUrl"
                  :src="item.coverUrl"
                  :alt="item.title"
                  cover
                />

                <v-icon v-else size="34" color="grey-darken-1">
                  mdi-cube-outline
                </v-icon>
              </v-avatar>

              <!-- Details -->
              <div class="flex-grow-1 min-width-0">
                <div
                  class="d-flex flex-column flex-sm-row align-start justify-space-between ga-2"
                >
                  <div class="min-width-0">
                    <div class="text-subtitle-1 font-weight-bold text-wrap">
                      {{ item.title }}
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      {{ item.category || "Museum artefact" }}
                    </div>
                  </div>

                  <div class="text-sm-right flex-shrink-0">
                    <div class="text-body-1 font-weight-bold text-primary">
                      {{ formatMoney(item.price * item.qty) }}
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      {{ formatMoney(item.price) }} each
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between mt-4">
                  <!-- Quantity control -->
                  <div
                    class="qty-stepper"
                    role="group"
                    :aria-label="`Quantity for ${item.title}`"
                  >
                    <v-btn
                      icon="mdi-minus"
                      size="small"
                      variant="text"
                      density="compact"
                      aria-label="Decrease quantity"
                      :disabled="item.qty <= 1"
                      @click="decrement(item)"
                    />

                    <span class="qty-value" aria-live="polite">
                      {{ item.qty }}
                    </span>

                    <v-btn
                      icon="mdi-plus"
                      size="small"
                      variant="text"
                      density="compact"
                      aria-label="Increase quantity"
                      :disabled="item.qty >= MAX_QTY"
                      @click="increment(item)"
                    />
                  </div>

                  <v-btn
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    color="error"
                    aria-label="Remove artefact from cart"
                    @click="removeItem(item)"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT: Order summary and payment -->
      <v-col cols="12" md="5">
        <v-card variant="outlined" class="sticky-summary rounded-lg">
          <v-card-text class="pa-4 pa-sm-6">
            <h2 class="text-h6 font-weight-bold mb-5">Order Summary</h2>

            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">
                Subtotal ({{ totalItems }} items)
              </span>

              <span class="text-body-2 font-weight-medium">
                {{ formatMoney(subtotal) }}
              </span>
            </div>

            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">
                Service fee (10%)
              </span>

              <span class="text-body-2 font-weight-medium">
                {{ formatMoney(serviceFee) }}
              </span>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex align-center justify-space-between mb-5">
              <span class="text-h6 font-weight-bold">Total</span>

              <span class="text-h6 font-weight-bold text-primary">
                {{ formatMoney(total) }}
              </span>
            </div>

            <v-divider class="mb-5" />

            <template v-if="items.length">
              <div class="text-subtitle-2 font-weight-bold mb-3">
                Choose payment method
              </div>

              <v-tabs
                v-model="paymentMethod"
                color="primary"
                density="compact"
                grow
                class="mb-4"
              >
                <v-tab value="MPESA" prepend-icon="mdi-cellphone">
                  M-PESA
                </v-tab>

                <v-tab value="PAYPAL" prepend-icon="mdi-paypal"> PayPal </v-tab>
              </v-tabs>

              <v-window v-model="paymentMethod">
                <v-window-item value="MPESA">
                  <MpesaPayment
                    mode="voucher"
                    :kes-preview="total"
                    :payment-data="paymentData"
                    :voucher-order="voucherOrder"
                    currency="KES"
                    success-url="/museum/checkout"
                    cancel-url="/museum/checkout"
                    @payment-success="onPaymentSuccess"
                    @payment-error="onPaymentError"
                  />
                </v-window-item>

                <v-window-item value="PAYPAL">
                  <PayPalPayment
                    mode="voucher"
                    plan-id="VOUCHERS"
                    :voucher-order="voucherOrder"
                    currency="KES"
                    success-url="/museum/checkout"
                    cancel-url="/museum/checkout"
                    @payment-success="onPaymentSuccess"
                    @payment-error="onPaymentError"
                  />
                </v-window-item>
              </v-window>

              <div class="d-flex align-start ga-2 mt-4">
                <v-icon size="18" color="success">
                  mdi-shield-check-outline
                </v-icon>

                <span class="text-caption text-medium-emphasis">
                  Complete your payment through the selected payment provider.
                </span>
              </div>
            </template>

            <v-alert v-else type="info" variant="tonal" density="compact">
              Add items to your cart to proceed to payment.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notifications -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="6000"
      location="bottom end"
      rounded="lg"
      elevation="6"
    >
      <div class="d-flex align-center ga-3">
        <v-icon size="24">{{ toast.icon }}</v-icon>

        <div>
          <div class="text-subtitle-2 font-weight-bold">
            {{ toast.title }}
          </div>

          <div class="text-caption">
            {{ toast.message }}
          </div>
        </div>
      </div>

      <template #actions>
        <v-btn variant="text" size="small" @click="toast.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

import MpesaPayment from "@/components/payments/MpesaPayment.vue";
import PayPalPayment from "@/components/payments/PaypalPayment.vue";

import type { CreatePaymentInput } from "@/stores/payments";

type PaymentMethod = "MPESA" | "PAYPAL";
type ToastColor = "success" | "error" | "warning" | "info";

interface CartItem {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  qty: number;
  mediaUrls: string[];
  coverUrl: string | null;
}

interface StoredCartItem {
  id?: unknown;
  title?: unknown;
  category?: unknown;
  price?: unknown;
  currency?: unknown;
  qty?: unknown;
  mediaUrls?: unknown;
}

interface ToastState {
  show: boolean;
  color: ToastColor;
  icon: string;
  title: string;
  message: string;
}

defineOptions({ name: "MuseumCartView" });

const CART_KEY = "tukema.cart";
const MAX_QTY = 99;
const SERVICE_FEE_RATE = 0.1;

const router = useRouter();

const items = ref<CartItem[]>([]);
const paymentMethod = ref<PaymentMethod>("MPESA");

const toast = ref<ToastState>({
  show: false,
  color: "success",
  icon: "mdi-check-circle",
  title: "",
  message: "",
});

let redirectTimer: ReturnType<typeof setTimeout> | undefined;

/* Notifications */

function showToast(
  title: string,
  message: string,
  color: ToastColor,
  icon: string,
): void {
  toast.value = {
    show: true,
    title,
    message,
    color,
    icon,
  };
}

/* Image helpers */

function isImageUrl(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    const pathname = url.pathname;

    return (
      /\.(?:jpe?g|png|webp|avif|gif)$/i.test(pathname) &&
      !/\.glb$/i.test(pathname) &&
      (url.protocol === "https:" ||
        url.protocol === "http:" ||
        url.origin === window.location.origin)
    );
  } catch {
    return false;
  }
}

function getCoverUrl(mediaUrls: string[]): string | null {
  return mediaUrls.find(isImageUrl) ?? null;
}

/* Cart validation and normalisation */

function normaliseCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as StoredCartItem;

  if (
    typeof item.id !== "string" ||
    !item.id.trim() ||
    typeof item.title !== "string" ||
    !item.title.trim()
  ) {
    return null;
  }

  const price = Number(item.price);
  const qty = Number(item.qty ?? 1);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > MAX_QTY
  ) {
    return null;
  }

  const mediaUrls = Array.isArray(item.mediaUrls)
    ? item.mediaUrls.filter((url): url is string => typeof url === "string")
    : [];

  const validMediaUrls = mediaUrls.filter(isImageUrl);

  return {
    id: item.id,
    title: item.title.trim(),
    category: typeof item.category === "string" ? item.category : "",
    price,
    currency: typeof item.currency === "string" ? item.currency : "KES",
    qty,
    mediaUrls,
    coverUrl: getCoverUrl(validMediaUrls),
  };
}

function loadCart(): void {
  try {
    const raw = sessionStorage.getItem(CART_KEY);

    if (!raw) {
      items.value = [];
      return;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      items.value = [];
      return;
    }

    items.value = parsed
      .map(normaliseCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch (error) {
    console.error("Unable to restore museum cart:", error);
    items.value = [];
  }
}

function persistCart(): void {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items.value));
  } catch (error) {
    console.error("Unable to save museum cart:", error);

    showToast(
      "Cart could not be saved",
      "Your browser storage may be unavailable or full.",
      "warning",
      "mdi-alert-outline",
    );
  }
}

/* Cart actions */

function increment(item: CartItem): void {
  if (item.qty >= MAX_QTY) return;

  item.qty += 1;
  persistCart();
}

function decrement(item: CartItem): void {
  if (item.qty <= 1) return;

  item.qty -= 1;
  persistCart();
}

function removeItem(item: CartItem): void {
  items.value = items.value.filter((current) => current.id !== item.id);

  persistCart();
}

/* Derived totals */

const totalItems = computed(() =>
  items.value.reduce((sum, item) => sum + item.qty, 0),
);

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + item.price * item.qty, 0),
);

const serviceFee = computed(() =>
  Math.round(subtotal.value * SERVICE_FEE_RATE),
);

const total = computed(() => subtotal.value + serviceFee.value);

/* Currency formatting */

const moneyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}

/* Payment data */

const paymentData = computed(() => ({
  totalAmount: total.value,
}));

/*
 * Keep the idempotency key stable throughout this component's lifetime.
 * Do not generate a new key inside a computed getter.
 */
const idempotencyKey = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const voucherOrder = computed(() => {
  if (!items.value.length) return null;

  return {
    /*
     * Preserve the existing CreatePaymentInput contract.
     * Confirm the backend's expected amount semantics before changing this
     * field, especially for carts containing different item prices.
     */
    unitPriceCents: Math.round(subtotal.value * 100),

    slots: items.value.flatMap((item, index) =>
      Array.from({ length: item.qty }, () => ({
        sheetIndex: index + 1,
        rowIndex: 0,
        placeLabel: "A",
        isImpression: false,
      })),
    ),

    /*
     * Replace these placeholders with the authenticated user's actual
     * checkout details before enabling production payments.
     */
    payer: {
      name: "Nelson Kilimo",
      email: "kipkilimo@gmail.com",
      phone: "+254700000000",
    },

    description: `Tukema museum cart - ${totalItems.value} item(s)`,
    idempotencyKey,
  } satisfies Omit<CreatePaymentInput, "currency" | "successUrl" | "cancelUrl">;
});

/* Payment event handlers */

function onPaymentSuccess(_data: unknown): void {
  /*
   * This event must be emitted only after the payment component has
   * confirmed a successful payment through the trusted backend.
   */
  sessionStorage.removeItem(CART_KEY);
  items.value = [];

  showToast(
    "Payment Successful",
    "Your receipt has been emailed. Thank you for supporting Tukema.",
    "success",
    "mdi-check-circle",
  );

  if (redirectTimer) clearTimeout(redirectTimer);

  redirectTimer = setTimeout(() => {
    void router.push("/museum/explore");
  }, 3000);
}

function onPaymentError(message: string): void {
  showToast(
    "Payment Failed",
    message || "Please try again or choose another payment method.",
    "error",
    "mdi-alert-circle",
  );
}

/* Lifecycle */

onMounted(loadCart);

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer);
});
</script>

<style scoped>
.cart-page {
  width: 100%;
}

.empty-cart {
  border-radius: 12px;
}

.cart-item {
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.cart-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
}

.min-width-0 {
  min-width: 0;
}

.sticky-summary {
  position: sticky;
  top: 24px;
  border-radius: 12px;
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid rgba(var(--v-border-color), 0.3);
  border-radius: 8px;
  padding: 2px;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 959px) {
  .sticky-summary {
    position: static;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-item {
    transition: none;
  }
}
</style>
