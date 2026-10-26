<template>
  <v-container class="py-8 px-4" max-width="1100">
    <v-row>
      <!-- LEFT: Cart Items -->
      <v-col cols="12" md="7">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Your Cart</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Review your selected artefacts before checkout
            </p>
          </div>
          <v-btn
            variant="text"
            color="primary"
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/museum/explore')"
          >
            Continue Exploring
          </v-btn>
        </div>

        <!-- Empty state -->
        <v-card
          v-if="!items.length"
          variant="outlined"
          class="pa-8 text-center"
        >
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-cart-off
          </v-icon>
          <div class="text-h6 mb-2">Your cart is empty</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Browse the museum and add artefacts you love.
          </div>
          <v-btn color="primary" to="/museum/explore">Explore Museum</v-btn>
        </v-card>

        <!-- Items -->
        <v-card
          v-for="item in items"
          :key="item.id"
          variant="outlined"
          class="mb-3 rounded-lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex ga-4">
              <v-avatar rounded="lg" size="80" color="grey-lighten-3">
                <v-img v-if="coverOf(item)" :src="coverOf(item)!" cover />
                <v-icon v-else size="32">mdi-cube-outline</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ item.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ item.category }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-body-2 font-weight-bold text-primary">
                      {{ formatMoney(item.price * item.qty) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatMoney(item.price) }} each
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between mt-4">
                  <!-- Qty Stepper -->
                  <div class="qty-stepper">
                    <v-btn
                      icon="mdi-minus"
                      size="x-small"
                      variant="text"
                      :disabled="item.qty <= 1"
                      @click="decrement(item)"
                    />
                    <span class="qty-value">{{ item.qty }}</span>
                    <v-btn
                      icon="mdi-plus"
                      size="x-small"
                      variant="text"
                      @click="increment(item)"
                    />
                  </div>

                  <v-btn
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeItem(item)"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT: Summary + Payments -->
      <v-col cols="12" md="5">
        <v-card variant="elevated" class="sticky-summary pa-6 rounded-lg">
          <h2 class="text-h6 font-weight-bold mb-4">Order Summary</h2>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">
              Subtotal ({{ totalItems }} items)
            </span>
            <span class="text-body-2 font-weight-medium">
              {{ formatMoney(subtotal) }}
            </span>
          </div>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">Service fee</span>
            <span class="text-body-2 font-weight-medium">
              {{ formatMoney(serviceFee) }}
            </span>
          </div>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between mb-6">
            <span class="text-h6 font-weight-bold">Total</span>
            <span class="text-h6 font-weight-bold text-primary">
              {{ formatMoney(total) }}
            </span>
          </div>

          <v-divider class="mb-4" />

          <!-- Payment Tabs -->
          <div v-if="items.length">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              Choose payment method
            </div>

            <v-tabs v-model="paymentMethod" density="compact" class="mb-4">
              <v-tab value="MPESA" prepend-icon="mdi-cellphone">M-PESA</v-tab>
              <v-tab value="PAYPAL" prepend-icon="mdi-paypal">PayPal</v-tab>
            </v-tabs>

            <v-window v-model="paymentMethod">
              <v-window-item value="MPESA">
                <MpesaPayment
                  mode="voucher"
                  :kes-preview="total"
                  :payment-data="{ totalAmount: total }"
                  :voucher-order="voucherOrder"
                  :currency="'KES'"
                  success-url="/museum/checkout"
                  cancel-url="/museum/checkout"
                  @payment-success="onPaymentSuccess"
                  @payment-error="onPaymentError"
                />
              </v-window-item>

              <v-window-item value="PAYPAL">
                <PayPalPayment
                  mode="voucher"
                  :plan-id="'VOUCHERS'"
                  :voucher-order="voucherOrder"
                  :currency="'KES'"
                  success-url="/museum/checkout"
                  cancel-url="/museum/checkout"
                  @payment-success="onPaymentSuccess"
                  @payment-error="onPaymentError"
                />
              </v-window-item>
            </v-window>
          </div>

          <v-alert v-else type="info" variant="tonal" density="compact">
            Add items to proceed to payment.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toast: Success -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="6000"
      location="bottom end"
      rounded="lg"
      elevation="6"
    >
      <div class="d-flex align-center" style="gap: 12px">
        <v-icon size="24">{{ toast.icon }}</v-icon>
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{ toast.title }}</div>
          <div class="text-caption">{{ toast.message }}</div>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import MpesaPayment from "@/components/payments/MpesaPayment.vue";
import PayPalPayment from "@/components/payments/PaypalPayment.vue";
import type { CreatePaymentInput } from "@/stores/payments";

definePageMeta({
  layout: "default",
  middleware: [],
});

interface CartItem {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  qty: number;
  mediaUrls: string[];
}

const CART_KEY = "tukema.cart";
const router = useRouter();

const items = ref<CartItem[]>([]);
const paymentMethod = ref<"MPESA" | "PAYPAL">("MPESA");

const toast = ref({
  show: false,
  color: "success",
  icon: "mdi-check-circle",
  title: "",
  message: "",
});

function showToast(
  title: string,
  message: string,
  color: "success" | "error" | "warning" | "info",
  icon: string,
) {
  toast.value = { show: true, title, message, color, icon };
}

/* Load cart from sessionStorage */
function loadCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    items.value = parsed.map((it: any) => ({
      id: it.id,
      title: it.title,
      category: it.category ?? "",
      price: Number(it.price ?? 0),
      currency: it.currency ?? "KES",
      qty: it.qty ?? 1,
      mediaUrls: it.mediaUrls ?? [],
    }));
  } catch {
    items.value = [];
  }
}

function persist() {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items.value));
}

/* Qty actions */
function increment(item: CartItem) {
  item.qty += 1;
  persist();
}
function decrement(item: CartItem) {
  if (item.qty > 1) item.qty -= 1;
  persist();
}
function removeItem(item: CartItem) {
  items.value = items.value.filter((i) => i.id !== item.id);
  persist();
}

/* Totals */
const totalItems = computed(() =>
  items.value.reduce((acc, i) => acc + i.qty, 0),
);
const subtotal = computed(() =>
  items.value.reduce((acc, i) => acc + i.price * i.qty, 0),
);
const serviceFee = computed(() => Math.round(subtotal.value * 0.1));
const total = computed(() => subtotal.value + serviceFee.value);

/* Helpers */
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

/* Payment payload */
const voucherOrder = computed(() => {
  if (!items.value.length) return null;
  return {
    unitPriceCents: Math.round(subtotal.value * 100),
    slots: items.value.flatMap((it, idx) =>
      Array.from({ length: it.qty }, () => ({
        sheetIndex: idx + 1,
        rowIndex: 0,
        placeLabel: "A",
        isImpression: false,
      })),
    ),
    payer: {
      name: "Nelson Kilimo",
      email: "kipkilimo@gmail.com",
      phone: "+254700000000",
    },
    description: `Tukema museum cart · ${totalItems.value} item(s)`,
    idempotencyKey: `cart-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
  } satisfies Omit<CreatePaymentInput, "currency" | "successUrl" | "cancelUrl">;
});

/* Handlers */
function onPaymentSuccess(data: any) {
  sessionStorage.removeItem(CART_KEY);
  items.value = [];
  showToast(
    "Payment Successful",
    "Your receipt has been emailed. Thank you for supporting Tukema.",
    "success",
    "mdi-check-circle",
  );
  // Optionally redirect after toast
  setTimeout(() => router.push("/museum/explore"), 3000);
}

function onPaymentError(message: string) {
  showToast("Payment Failed", message, "error", "mdi-alert-circle");
}

onMounted(() => {
  loadCart();
});
</script>

<style scoped>
.sticky-summary {
  position: sticky;
  top: 24px;
}
.qty-stepper {
  display: flex;
  align-items: center;
  border: 1px solid rgba(var(--v-border-color), 0.3);
  border-radius: 8px;
  padding: 2px;
}
.qty-value {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
