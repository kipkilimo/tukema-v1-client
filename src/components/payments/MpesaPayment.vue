<!-- components/payments/MpesaPayment.vue -->
<template>
  <v-container
    class="pa-2"
    style="overflow: hidden !important; max-height: 100vh"
  >
    <v-card
      class="mx-auto"
      elevation="2"
      variant="flat"
      rounded="sm"
      style="overflow: hidden !important"
    >
      <!-- Header -->
      <v-card-title
        class="text-subtitle-1 font-weight-bold py-3 px-4 d-flex align-center"
        style="
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: white;
        "
      >
        <v-icon left class="mr-2">mdi-cellphone-check</v-icon>
        {{ isVoucher ? "Pay with M-PESA" : "M-Pesa Payment" }}
        <v-spacer />
        <v-chip
          color="white"
          variant="tonal"
          size="small"
          text-color="green-darken-4"
        >
          <v-icon start size="14">mdi-shield-check</v-icon> Secured
        </v-chip>
      </v-card-title>

      <v-card-text
        class="pa-4"
        style="overflow: hidden !important; max-height: calc(100vh - 180px)"
      >
        <v-divider class="mb-4" />

        <!-- Phone Input -->
        <v-card
          variant="tonal"
          color="grey-lighten-4"
          class="rounded-xl pa-4 mb-4"
        >
          <v-text-field
            v-model="phoneNumber"
            label="M-Pesa Number"
            placeholder="0712 345 678"
            variant="outlined"
            density="comfortable"
            color="success"
            :disabled="busy"
            :error="phoneNumber.length > 0 && !isValidPhone"
            :error-messages="
              phoneNumber.length > 0 && !isValidPhone
                ? 'Invalid phone number format'
                : ''
            "
            @input="formatPhoneInput"
            class="phone-input"
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-chip color="success" variant="flat" size="small" class="mr-1"
                >🇰🇪 +254</v-chip
              >
            </template>
            <template #append-inner>
              <v-progress-circular
                v-if="busy"
                indeterminate
                size="20"
                color="success"
              />
              <v-icon v-else-if="isValidPhone" color="success" size="20"
                >mdi-check-circle</v-icon
              >
            </template>
          </v-text-field>

          <div class="mt-2 d-flex flex-wrap ga-2 align-center">
            <v-chip
              v-if="detectedNetwork"
              :color="detectedNetwork === 'Safaricom' ? 'success' : 'warning'"
              variant="tonal"
              size="x-small"
            >
              <v-icon start size="12">
                {{
                  detectedNetwork === "Safaricom"
                    ? "mdi-signal-cellular-3"
                    : "mdi-signal-cellular-2"
                }}
              </v-icon>
              {{ detectedNetwork }}
            </v-chip>
            <v-chip
              v-if="isValidPhone"
              color="success"
              variant="tonal"
              size="x-small"
            >
              <v-icon start size="12">mdi-check-circle</v-icon> Valid
            </v-chip>
            <v-chip
              v-else-if="phoneNumber.length > 0"
              color="error"
              variant="tonal"
              size="x-small"
            >
              <v-icon start size="12">mdi-alert-circle</v-icon> Invalid
            </v-chip>
          </div>
        </v-card>

        <v-divider class="my-4" />

        <!-- Summary -->
        <v-card variant="tonal" color="green-lighten-5" class="rounded-xl pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="success" class="mr-2">mdi-receipt-text</v-icon>
            <h3
              class="text-body-2 font-weight-bold"
              style="color: #1a1a1a !important"
            >
              Payment Summary
            </h3>
          </div>
          <div class="d-flex justify-space-between py-1">
            <span
              class="text-caption text-medium-emphasis"
              style="color: #616161 !important"
            >
              {{ isVoucher ? "Vouchers" : "Selected Plan" }}
            </span>
            <strong
              class="text-caption"
              style="color: #1a1a1a !important; font-weight: 600"
            >
              {{ isVoucher ? voucherSummary : "Starter" }}
            </strong>
          </div>
          <v-divider class="my-2" />
          <div
            class="d-flex justify-space-between font-weight-bold text-body-1"
          >
            <span style="color: #1a1a1a !important">Total Payable</span>
            <span style="color: #2e7d32 !important; font-weight: 700">
              KES {{ formatCurrency(totalKES) }}
            </span>
          </div>
          <div
            class="mt-2 text-caption text-medium-emphasis"
            style="color: #757575 !important"
          >
            <v-icon size="14" class="mr-1" color="grey"
              >mdi-clock-outline</v-icon
            >
            Funds will be deducted from your M-Pesa account
          </div>
        </v-card>

        <!-- Live progress panel -->
        <v-slide-y-transition>
          <div v-if="progressPhase !== 'idle'" class="mt-4">
            <v-card
              variant="tonal"
              :color="phaseColor + '-lighten-5'"
              class="rounded-xl pa-4"
              border="start"
              :style="{ borderLeftColor: phaseAccent + ' !important' }"
            >
              <div class="d-flex align-center mb-2">
                <v-progress-circular
                  v-if="!paymentSuccess"
                  indeterminate
                  size="22"
                  :color="phaseAccent.replace('#', '')"
                  class="mr-2"
                />
                <v-icon v-else :color="phaseAccent" size="22" class="mr-2"
                  >mdi-check-circle</v-icon
                >
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ phaseTitle }}
                  </div>
                  <div class="text-caption" style="color: #616161">
                    {{ phaseSubtitle }}
                  </div>
                </div>
                <v-chip
                  :color="phaseColor"
                  variant="flat"
                  size="x-small"
                  class="text-white"
                >
                  {{ progressPercent }}%
                </v-chip>
              </div>

              <!-- Step tracker -->
              <div class="mt-3">
                <div
                  v-for="(step, i) in progressSteps"
                  :key="step.key"
                  class="d-flex align-center mb-1"
                  style="gap: 8px"
                >
                  <v-icon
                    :color="
                      step.state === 'done'
                        ? 'success'
                        : step.state === 'active'
                          ? 'info'
                          : 'grey-lighten-1'
                    "
                    size="16"
                  >
                    {{
                      step.state === "done"
                        ? "mdi-check-circle"
                        : step.state === "active"
                          ? "mdi-circle-slice-6"
                          : "mdi-circle-outline"
                    }}
                  </v-icon>
                  <span
                    class="text-caption"
                    :style="{
                      color: step.state === 'pending' ? '#9e9e9e' : '#212121',
                      fontWeight: step.state === 'active' ? 600 : 400,
                    }"
                  >
                    {{ step.label }}
                  </span>
                  <v-spacer />
                  <span
                    v-if="step.state === 'done'"
                    class="text-caption"
                    style="color: #2e7d32; font-size: 11px"
                    >done</span
                  >
                </div>
              </div>

              <!-- Progress bar -->
              <v-progress-linear
                :model-value="progressPercent"
                :color="phaseColor"
                height="6"
                striped
                class="mt-3"
              />

              <div
                class="d-flex justify-space-between mt-2 text-caption"
                style="color: #757575"
              >
                <span>{{ phaseElapsedLabel }}</span>
                <span v-if="retryAfterMs !== null && retryAfterMs > 0"
                  >Next check in {{ Math.ceil(retryAfterMs / 1000) }}s</span
                >
              </div>

              <!-- Cancel / help while waiting -->
              <div
                v-if="!paymentSuccess && progressPhase === 'awaiting_pin'"
                class="d-flex justify-center mt-3"
              >
                <v-btn
                  size="small"
                  variant="text"
                  color="grey-darken-1"
                  prepend-icon="mdi-close-circle-outline"
                  @click="cancelPayment"
                  :loading="cancelling"
                >
                  Cancel payment
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-slide-y-transition>

        <!-- Helpline -->
        <v-slide-y-transition>
          <v-card
            v-if="showHelpline"
            variant="tonal"
            color="grey-lighten-4"
            class="mt-4 rounded-xl pa-4"
          >
            <div class="text-center">
              <v-icon color="warning" size="32" class="mb-2"
                >mdi-headset</v-icon
              >
              <h5 class="text-subtitle-2 font-weight-bold mb-1">Need Help?</h5>
              <p class="text-caption" style="color: #616161">
                {{ helplineReason }}
              </p>
              <div class="d-flex flex-wrap justify-center ga-2 mt-2">
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  href="tel:+254700378241"
                  prepend-icon="mdi-phone"
                  >Call Support</v-btn
                >
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  href="mailto:info@tukema.culture"
                  prepend-icon="mdi-email"
                  >Email Us</v-btn
                >
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  href="https://tukema.culture/support"
                  prepend-icon="mdi-help-circle"
                  target="_blank"
                  >Help Center</v-btn
                >
              </div>
              <div class="mt-2 text-caption" style="color: #757575">
                <v-icon size="14" color="grey">mdi-clock-outline</v-icon>
                Available Mon-Fri, 8AM - 6PM EAT
              </div>
            </div>
          </v-card>
        </v-slide-y-transition>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn
          block
          rounded="sm"
          color="success"
          variant="flat"
          :disabled="!isValidPhone || busy || paymentSuccess"
          :loading="busy"
          @click="initiatePayment"
        >
          <v-icon v-if="!busy && !paymentSuccess" left>mdi-cash-check</v-icon>
          <span class="payment-btn-text">
            {{
              paymentSuccess
                ? "✅ Payment Completed"
                : busy
                  ? busyLabel
                  : "📴 Initiate M-Pesa Prompt"
            }}
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- ================= Informative toast ================= -->
    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      :timeout="toast.timeout"
      location="bottom end"
      variant="tonal"
      rounded="lg"
      elevation="4"
      style="max-width: 420px; z-index: 9999"
    >
      <template #default>
        <div class="d-flex align-start" style="gap: 12px">
          <v-progress-circular
            v-if="toast.spinner"
            indeterminate
            size="28"
            :color="toast.color"
          />
          <v-icon v-else :color="toast.color" size="28">{{
            toast.icon
          }}</v-icon>
          <div class="flex-grow-1">
            <div
              class="text-subtitle-2 font-weight-bold"
              style="color: #1a1a1a"
            >
              {{ toast.title }}
            </div>
            <div class="text-caption" style="color: #424242">
              {{ toast.message }}
            </div>
            <div
              v-if="toast.detail"
              class="text-caption mt-1"
              :style="{ color: toast.detailColor || '#757575' }"
            >
              {{ toast.detail }}
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <v-btn
          variant="text"
          size="small"
          @click="toast.show = false"
          color="grey"
        >
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, reactive } from "vue";
import {
  usePaymentStore,
  type CreatePaymentInput,
  type PaymentRecord,
  type PollTickMeta,
} from "@/stores/payments";

/* ---------------- Props ---------------- */
interface PaymentData {
  invoiceVouchers?: string[];
  totalAmount: number;
  orgId?: string;
  timestamp?: number;
  isExternalOrg?: boolean;
  surveyId?: string;
  deploymentId?: string;
}

const props = withDefaults(
  defineProps<{
    paymentData: PaymentData;
    mode?: "plan" | "voucher";
    voucherOrder?: Omit<
      CreatePaymentInput,
      "currency" | "payer" | "successUrl" | "cancelUrl"
    > | null;
    currency?: "KES" | "USD" | "EUR";
    successUrl?: string;
    cancelUrl?: string;
    kesPreview?: number;
    payer?: { name: string; email: string; phone?: string };
  }>(),
  {
    mode: "plan",
    voucherOrder: null,
    currency: "KES",
    successUrl: "/museum/vouchers/success",
    cancelUrl: "/museum/vouchers/cancel",
    kesPreview: 0,
    payer: undefined,
  },
);

const emit = defineEmits<{
  (e: "payment-success", data: any): void;
  (e: "payment-error", error: string): void;
}>();

const payments = usePaymentStore();
const isVoucher = computed(() => props.mode === "voucher");

/* ---------------- Env ---------------- */
const dollarRate = computed(() => {
  const r =
    import.meta.env.VITE_EXCHANGE_RATE ||
    import.meta.env.VITE_DOLLAR_RATE ||
    131;
  return Number(r);
});

/** Aligned with store defaults (30 × 4s ≈ 120s). */
const POLL_INTERVAL = 4000;
const MAX_POLL_ATTEMPTS = 30;

type Phase =
  | "idle"
  | "creating"
  | "awaiting_pin"
  | "confirming"
  | "vouchers"
  | "done"
  | "error";

/* ---------------- State ---------------- */
const phoneNumber = ref("0");
const rawPhoneNumber = ref("");
const processing = ref(false);
const paymentSuccess = ref(false);
const mpesaReceipt = ref("");
const showHelpline = ref(false);
const helplineReason = ref(
  "Our support team is ready to assist you with your payment.",
);
const formattedDisplayPhone = ref("");
const cancelling = ref(false);

/* progress */
const progressPhase = ref<Phase>("idle");
const progressPercent = ref(0);
const pollingAttempts = ref(0);
const retryAfterMs = ref<number | null>(null);
const paymentStatus = ref<string>("idle");
const fulfillmentState = ref<string | null>(null);
const elapsedSeconds = ref(0);
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

/* toast */
const toast = reactive({
  show: false,
  color: "info",
  icon: "mdi-information",
  title: "",
  message: "",
  detail: "" as string,
  detailColor: "#757575",
  timeout: 6000,
  spinner: false,
});

/**
 * Stage de-duplication so we don't re-fire the same toast on every 4s tick.
 * When the user manually dismisses a toast, `userDismissedStage` records which
 * stage they dismissed so we don't force it back open mid-stage.
 */
let currentToastStage = "";
let userDismissedStage = "";

/* ---------------- Phone helpers ---------------- */
const normalizedPhone = computed(() => {
  let p = phoneNumber.value.replace(/\s/g, "");
  if (p.startsWith("0")) return `254${p.slice(1)}`;
  if (p.startsWith("+254")) return p.replace("+", "");
  if (p.startsWith("254")) return p;
  return p;
});

const isValidPhone = computed(() => {
  const p = phoneNumber.value.replace(/\s/g, "");
  if (!p) return false;
  return /^(?:\+254|0|254)?(7\d{8}|1\d{8})$/.test(p);
});

const detectedNetwork = computed(() => {
  const phone = normalizedPhone.value;
  if (!phone || phone.length < 9) return null;
  const safaricom = [
    "25470",
    "25471",
    "25472",
    "25474",
    "25475",
    "25476",
    "25479",
    "25410",
    "25411",
  ];
  const airtel = [
    "25473",
    "25478",
    "25490",
    "25491",
    "25492",
    "25493",
    "25494",
    "25495",
    "25496",
    "25497",
  ];
  const telkom = [
    "25477",
    "25450",
    "25451",
    "25452",
    "25453",
    "25454",
    "25455",
    "25456",
    "25457",
    "25458",
    "25459",
  ];
  const check = (prefixes: string[]) =>
    prefixes.some((p) => phone.startsWith(p));
  if (check(safaricom)) return "Safaricom";
  if (check(airtel)) return "Airtel";
  if (check(telkom)) return "Telkom";
  return null;
});

const formatPhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let v = input.value.replace(/\D/g, "");
  if (v.length > 12) v = v.slice(0, 12);
  rawPhoneNumber.value = v;
  let f = v;
  if (v.startsWith("254") && v.length >= 3) {
    const r = v.slice(3);
    f =
      r.length <= 3
        ? `+254 ${r}`
        : r.length <= 6
          ? `+254 ${r.slice(0, 3)} ${r.slice(3)}`
          : `+254 ${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6, 9)}`;
  } else if (v.startsWith("0")) {
    const r = v.slice(1);
    f =
      r.length <= 3
        ? `0${r}`
        : r.length <= 6
          ? `0${r.slice(0, 3)} ${r.slice(3)}`
          : `0${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6, 9)}`;
  }
  phoneNumber.value = f.trim();
};

/* ---------------- Amounts ---------------- */
const totalKES = computed(() => {
  if (isVoucher.value) return Math.round(props.kesPreview ?? 0);
  return Math.round((props.paymentData.totalAmount || 0) * dollarRate.value);
});

const voucherSummary = computed(() => {
  if (!isVoucher.value) return "";
  const n = props.voucherOrder?.slots?.length ?? 0;
  return `${n} voucher${n === 1 ? "" : "s"}`;
});

const busy = computed(
  () => processing.value || payments.polling || payments.creating,
);

const formatCurrency = (n: number) =>
  n.toLocaleString("en-KE", { maximumFractionDigits: 0 });

/* ---------------- Derived phase UI ---------------- */
const phaseColor = computed(() => {
  switch (progressPhase.value) {
    case "creating":
      return "blue";
    case "awaiting_pin":
      return "amber";
    case "confirming":
      return "cyan";
    case "vouchers":
      return "deep-purple";
    case "done":
      return "green";
    case "error":
      return "red";
    default:
      return "grey";
  }
});

const phaseAccent = computed(() => {
  switch (progressPhase.value) {
    case "creating":
      return "#1976d2";
    case "awaiting_pin":
      return "#f57c00";
    case "confirming":
      return "#00838f";
    case "vouchers":
      return "#6a1b9a";
    case "done":
      return "#2e7d32";
    case "error":
      return "#c62828";
    default:
      return "#757575";
  }
});

const phaseTitle = computed(() => {
  switch (progressPhase.value) {
    case "creating":
      return "Creating your payment…";
    case "awaiting_pin":
      return "📱 Check your phone!";
    case "confirming":
      return "Confirming payment with M-PESA…";
    case "vouchers":
      return "Generating your vouchers…";
    case "done":
      return "✅ Payment complete!";
    case "error":
      return "❌ Payment not completed";
    default:
      return "";
  }
});

const phaseSubtitle = computed(() => {
  switch (progressPhase.value) {
    case "creating":
      return "Sending STK push request to M-PESA";
    case "awaiting_pin":
      return `Enter your M-Pesa PIN on ${formattedDisplayPhone.value}`;
    case "confirming":
      return paymentStatus.value === "paid"
        ? "Payment received — linking vouchers"
        : "Waiting for M-PESA to settle the transaction";
    case "vouchers":
      return "Creating PDF vouchers and sending email";
    case "done":
      return mpesaReceipt.value
        ? `Receipt: ${mpesaReceipt.value}`
        : "Vouchers will arrive in your inbox shortly";
    case "error":
      return "See the notification for details";
    default:
      return "";
  }
});

const busyLabel = computed(() => {
  switch (progressPhase.value) {
    case "creating":
      return "⏳ Creating payment…";
    case "awaiting_pin":
      return "📱 Waiting for PIN entry…";
    case "confirming":
      return "⏳ Confirming payment…";
    case "vouchers":
      return "⏳ Generating vouchers…";
    default:
      return "⏳ Processing Payment…";
  }
});

const phaseElapsedLabel = computed(() => {
  const s = elapsedSeconds.value;
  if (s < 60) return `Elapsed: ${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `Elapsed: ${m}m ${r}s`;
});

interface Step {
  key: string;
  label: string;
  state: "pending" | "active" | "done";
}
const progressSteps = computed<Step[]>(() => {
  const p = progressPhase.value;
  const order: Phase[] = [
    "creating",
    "awaiting_pin",
    "confirming",
    "vouchers",
    "done",
  ];
  const idx = order.indexOf(p);
  const labels: Record<string, string> = {
    creating: "Payment request sent",
    awaiting_pin: "PIN entered on phone",
    confirming: "M-PESA confirmed",
    vouchers: "Vouchers generated",
    done: "Email sent",
  };
  return order.map((k, i) => ({
    key: k,
    label: labels[k],
    state:
      idx === -1
        ? "pending"
        : i < idx
          ? "done"
          : i === idx
            ? "active"
            : "pending",
  }));
});

/* ---------------- Toast helpers ---------------- */
function setToast(opts: Partial<typeof toast>) {
  Object.assign(toast, {
    show: true,
    spinner: false,
    timeout: 6000,
    detail: "",
    detailColor: "#757575",
    ...opts,
  });
}

/**
 * Stage-aware toast — only re-renders when the stage actually changes, and
 * respects a user's manual dismissal of that stage.
 */
function setToastForStage(stage: string, opts: Partial<typeof toast>) {
  if (currentToastStage === stage) {
    // Same stage — update content only if it changed, don't reopen.
    if (!toast.show) return;
    Object.assign(toast, opts);
    return;
  }
  // Stage changed
  currentToastStage = stage;
  if (userDismissedStage === stage) {
    // User already closed this exact stage's toast — don't reopen.
    return;
  }
  setToast(opts);
}

function onToastClosed() {
  // Record that the user dismissed the current stage so we don't re-open it.
  userDismissedStage = currentToastStage;
}

/* ---------------- Phase setters ---------------- */
function enterPhase(phase: Phase, percent?: number) {
  progressPhase.value = phase;
  if (percent !== undefined) progressPercent.value = percent;
}

function startElapsedTimer() {
  stopElapsedTimer();
  elapsedSeconds.value = 0;
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value++;
    if (elapsedSeconds.value >= 90 && !showHelpline.value) {
      helplineReason.value =
        "This is taking longer than usual. M-PESA may be slow — you can wait or contact us.";
      showHelpline.value = true;
    }
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

/* ---------------- Read fulfillment state safely ---------------- */
/**
 * `fulfillmentState` may not be in PaymentRecord's TS interface yet (it's in
 * the SDL). Read defensively so this works regardless.
 */
function readFulfillmentState(
  p: PaymentRecord | null | undefined,
): string | null {
  if (!p) return null;
  const anyP = p as any;
  return typeof anyP.fulfillmentState === "string"
    ? anyP.fulfillmentState
    : null;
}

/* ---------------- Initiate ---------------- */
const initiatePayment = async () => {
  if (!isValidPhone.value || paymentSuccess.value || busy.value) return;

  processing.value = true;
  paymentSuccess.value = false;
  mpesaReceipt.value = "";
  showHelpline.value = false;
  retryAfterMs.value = null;
  pollingAttempts.value = 0;
  paymentStatus.value = "pending";
  fulfillmentState.value = null;
  enterPhase("creating", 5);
  startElapsedTimer();

  // New attempt — clear any previous dismissals.
  currentToastStage = "";
  userDismissedStage = "";

  const phone = normalizedPhone.value;
  formattedDisplayPhone.value = `+254 ${phone.slice(3)}`;

  setToastForStage("sending", {
    color: "info",
    spinner: true,
    icon: "mdi-send",
    title: "Sending M-PESA request",
    message: `We're sending an STK push to +254 ${phone.slice(3)}.`,
    detail: "Keep your phone nearby — you'll be asked for your PIN.",
    timeout: -1,
  });

  try {
    if (!isVoucher.value) {
      throw new Error("Plan mode M-Pesa is not currently supported.");
    }
    if (!props.voucherOrder) throw new Error("voucherOrder is required");

    const created = await payments.createMpesa({
      ...props.voucherOrder,
      currency: props.currency,
      successUrl: props.successUrl,
      cancelUrl: props.cancelUrl,
      payer: {
        name: props.payer?.name?.trim() || "Customer",
        email: props.payer?.email?.trim() || "customer@example.com",
        phone,
      },
    });

    // ---------- Server already finished (fast path) ----------
    if (created.status === "paid") {
      if (created.batchId) {
        enterPhase("done", 100);
        finalizeSuccess(created);
        return;
      }
      // Paid but no batchId → PIN already entered. Server is compiling.
      enterPhase("confirming", 60);
      paymentStatus.value = "paid";
      setToastForStage("compiling", {
        color: "cyan",
        spinner: true,
        icon: "mdi-sync",
        title: "💳 Payment received",
        message: "M-PESA confirmed your payment. Compiling vouchers…",
        detail: "This usually takes 10–30 seconds — we'll email them to you.",
        timeout: -1,
      });
    } else {
      // ---------- Still pending — STK fired, waiting for PIN ----------
      enterPhase("awaiting_pin", 15);
      setToastForStage("awaiting_pin", {
        color: "amber",
        spinner: true,
        icon: "mdi-cellphone-message",
        title: "📱 Check your phone",
        message: `Enter your M-Pesa PIN on the pop-up for +254 ${phone.slice(3)}.`,
        detail: "We'll update you here automatically when it's confirmed.",
        timeout: -1,
      });
    }

    // ---------- Poll ----------
    const settled = await payments.pollMpesaUntilSettled({
      paymentId: created.id,
      intervalMs: POLL_INTERVAL,
      maxAttempts: MAX_POLL_ATTEMPTS,
      onTick: (p: PaymentRecord, attempt: number, meta: PollTickMeta) => {
        pollingAttempts.value = attempt;
        paymentStatus.value = p.status;
        retryAfterMs.value = meta.retryAfterMs;
        fulfillmentState.value = readFulfillmentState(p);

        // ---------- PAID ----------
        if (p.status === "paid") {
          if (p.batchId) {
            // Batch is linked — finishing up.
            enterPhase(
              "vouchers",
              Math.max(85, Math.round((attempt / MAX_POLL_ATTEMPTS) * 100)),
            );
            setToastForStage("vouchers", {
              color: "deep-purple",
              spinner: true,
              icon: "mdi-file-document-outline",
              title: "✨ Vouchers almost ready",
              message: "Payment confirmed — finalizing your PDFs.",
              detail: "Hang tight, this is the last step.",
              timeout: -1,
            });
            return;
          }

          if (meta.batchWait) {
            // Paid but batch not linked yet — check for manual/failed states.
            const state = fulfillmentState.value ?? "running";

            if (state === "manual") {
              enterPhase("confirming", 80);
              showHelpline.value = true;
              helplineReason.value =
                "Vouchers need manual review. Please call us with your payment ID.";
              setToastForStage("manual", {
                color: "warning",
                icon: "mdi-account-alert",
                title: "⚠️ Payment received — action needed",
                message:
                  "Your payment went through, but vouchers need manual review.",
                detail:
                  "Call +254 700 378 241 with your payment ID. We'll fix it right away.",
                detailColor: "#c62828",
                timeout: 15000,
              });
              return;
            }

            if (state === "failed") {
              enterPhase("confirming", 80);
              setToastForStage("retrying", {
                color: "cyan",
                spinner: true,
                icon: "mdi-sync",
                title: "💳 Payment received — retrying",
                message:
                  "M-PESA confirmed your payment. Retrying voucher generation…",
                detail: meta.retryAfterMs
                  ? `Next attempt in ${Math.ceil(meta.retryAfterMs / 1000)}s`
                  : "This usually takes 10–30 seconds.",
                timeout: -1,
              });
              return;
            }

            // queued / running
            enterPhase("confirming", 80);
            setToastForStage("compiling", {
              color: "cyan",
              spinner: true,
              icon: "mdi-sync",
              title: "💳 Payment received",
              message: "M-PESA confirmed your payment. Compiling vouchers…",
              detail: meta.retryAfterMs
                ? `Next check in ${Math.ceil(meta.retryAfterMs / 1000)}s`
                : "This usually takes 10–30 seconds.",
              timeout: -1,
            });
            return;
          }
          return;
        }

        // ---------- FAILED / CANCELLED ----------
        if (p.status === "failed" || p.status === "cancelled") {
          enterPhase("error", 100);
          return;
        }

        // ---------- PENDING ----------
        progressPercent.value = Math.min(
          85,
          10 + Math.round((attempt / MAX_POLL_ATTEMPTS) * 70),
        );
        setToastForStage("pending", {
          color: "amber",
          spinner: true,
          icon: "mdi-cellphone-message",
          title: "📱 Waiting for PIN entry",
          message: `Still waiting for confirmation on +254 ${phone.slice(3)}.`,
          detail: `Attempt ${attempt} of ${MAX_POLL_ATTEMPTS}. You can keep this open or wait for the email.`,
          timeout: -1,
        });
      },
    });

    if (settled.status !== "paid") {
      enterPhase("error", 100);
      throw new Error(
        settled.status === "failed"
          ? "M-PESA payment failed. Please try again or use a different number."
          : settled.status === "cancelled"
            ? "M-PESA payment was cancelled. You can retry anytime."
            : "M-PESA payment did not complete in time.",
      );
    }
    if (!settled.batchId) {
      enterPhase("vouchers", 90);
      throw new Error(
        "Payment confirmed but vouchers are still being generated. They'll arrive in your email within a minute.",
      );
    }

    // Batch is linked but we haven't called confirm — finalize.
    enterPhase("vouchers", 95);
    setToastForStage("vouchers", {
      color: "deep-purple",
      spinner: true,
      icon: "mdi-file-document-outline",
      title: "✨ Vouchers almost ready",
      message: "Payment confirmed — finalizing your PDFs.",
      detail: "Hang tight, this is the last step.",
      timeout: -1,
    });

    finalizeSuccess(settled);
  } catch (err: any) {
    const msg = err?.message ?? "Payment failed";
    enterPhase("error", 100);
    stopElapsedTimer();
    processing.value = false;
    showHelpline.value = true;
    helplineReason.value =
      "Something went wrong with your payment. Our team can help.";

    setToastForStage("error", {
      color: "error",
      icon: "mdi-alert-circle",
      title: "Payment not completed",
      message: msg,
      detail: "Need help? Call +254 700 378 241 (Mon–Fri, 8AM–6PM EAT).",
      detailColor: "#c62828",
      timeout: 10000,
    });

    emit("payment-error", msg);
  }
};

function finalizeSuccess(payment: any) {
  paymentSuccess.value = true;
  mpesaReceipt.value = payment.checkoutReference ?? "";
  enterPhase("done", 100);
  stopElapsedTimer();
  processing.value = false;
  showHelpline.value = false;

  const emailSent = payments.lastIssued?.emailSent;
  const voucherCount = payments.lastIssued?.totalVouchers;
  const batchId = payment.batchId ?? payments.lastIssued?.batchId;

  setToastForStage("success", {
    color: "success",
    icon: "mdi-check-circle",
    title: "✅ Payment successful!",
    message: emailSent
      ? `${voucherCount ?? "Your"} voucher${voucherCount === 1 ? "" : "s"} emailed to ${props.payer?.email ?? "your inbox"}.`
      : "Payment captured — your vouchers will be emailed shortly.",
    detail: [
      mpesaReceipt.value ? `Receipt: ${mpesaReceipt.value}` : null,
      batchId ? `Batch: ${String(batchId).slice(0, 8)}…` : null,
    ]
      .filter(Boolean)
      .join(" • "),
    detailColor: "#2e7d32",
    // Extra time when there's a receipt to copy.
    timeout: mpesaReceipt.value ? 12000 : 8000,
  });

  emit("payment-success", {
    provider: "MPESA",
    paymentId: payment.id,
    batchId,
    amountKES: totalKES.value,
    phone: normalizedPhone.value,
    mpesaReceipt: payment.checkoutReference,
    issued: payments.lastIssued,
  });
}

/* ---------------- Cancel ---------------- */
async function cancelPayment() {
  const id = payments.current?.id;
  if (!id) return;
  cancelling.value = true;
  try {
    await payments.cancel(id);
    enterPhase("error", 100);
    stopElapsedTimer();
    processing.value = false;
    setToastForStage("cancelled", {
      color: "grey-darken-2",
      icon: "mdi-cancel",
      title: "Payment cancelled",
      message: "You can retry with the same or a different number.",
      timeout: 6000,
    });
  } catch (e: any) {
    setToastForStage("cancel_failed", {
      color: "warning",
      icon: "mdi-alert",
      title: "Could not cancel",
      message: e?.message ?? "Please try again.",
      timeout: 6000,
    });
  } finally {
    cancelling.value = false;
  }
}

/* ---------------- Lifecycle ---------------- */
onUnmounted(() => {
  stopElapsedTimer();
});

watch(
  () => props.paymentData,
  () => {
    phoneNumber.value = "0";
    processing.value = false;
    paymentSuccess.value = false;
    showHelpline.value = false;
    pollingAttempts.value = 0;
    progressPercent.value = 0;
    progressPhase.value = "idle";
    paymentStatus.value = "idle";
    fulfillmentState.value = null;
    retryAfterMs.value = null;
    currentToastStage = "";
    userDismissedStage = "";
    stopElapsedTimer();
  },
  { deep: true },
);

// Track user dismissal so we don't re-open a stage they closed.
watch(
  () => toast.show,
  (isOpen) => {
    if (!isOpen) onToastClosed();
  },
);
</script>

<style scoped>
.v-container,
.v-card,
.v-card-text {
  overflow: hidden !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
.v-container::-webkit-scrollbar,
.v-card::-webkit-scrollbar,
.v-card-text::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
.v-card {
  max-width: 100%;
  width: 100%;
  overflow: hidden !important;
}
.phone-input {
  border-radius: 12px;
}
.phone-input :deep(.v-field) {
  border-radius: 12px;
  background-color: #fff !important;
}
.phone-input :deep(.v-field__input),
.phone-input :deep(input) {
  color: #212121 !important;
  font-weight: 500;
  opacity: 1 !important;
}
.phone-input :deep(.v-field__outline) {
  border-color: #bdbdbd;
}
.phone-input :deep(.v-field--focused .v-field__outline) {
  border-color: #4caf50;
  border-width: 2px;
}
.phone-input :deep(.v-field--error .v-field__outline) {
  border-color: #ef5350;
}
.phone-input :deep(.v-label) {
  color: #616161 !important;
}
.phone-input :deep(.v-field--focused .v-label) {
  color: #4caf50 !important;
}
.phone-input :deep(.v-field--error .v-label) {
  color: #ef5350 !important;
}

.payment-btn-text {
  color: #fff !important;
  font-weight: 700;
}
.ga-2 {
  gap: 8px;
}

:deep(.v-snackbar) {
  max-width: 420px !important;
  z-index: 9999 !important;
}
:deep(.v-snackbar__wrapper) {
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}
:deep(.v-snackbar--color-success .v-snackbar__wrapper) {
  border-left: 4px solid #2e7d32 !important;
}
:deep(.v-snackbar--color-error .v-snackbar__wrapper) {
  border-left: 4px solid #c62828 !important;
}
:deep(.v-snackbar--color-amber .v-snackbar__wrapper) {
  border-left: 4px solid #f57c00 !important;
}
:deep(.v-snackbar--color-info .v-snackbar__wrapper) {
  border-left: 4px solid #1976d2 !important;
}
:deep(.v-snackbar--color-cyan .v-snackbar__wrapper) {
  border-left: 4px solid #00838f !important;
}
:deep(.v-snackbar--color-warning .v-snackbar__wrapper) {
  border-left: 4px solid #f9a825 !important;
}
:deep(.v-snackbar--color-deep-purple .v-snackbar__wrapper) {
  border-left: 4px solid #6a1b9a !important;
}

@media (max-width: 600px) {
  .v-card-title {
    font-size: 0.9rem !important;
    padding: 12px 16px !important;
  }
  .phone-input :deep(.v-field__input),
  .phone-input :deep(input) {
    font-size: 1rem;
  }
  :deep(.v-snackbar) {
    max-width: 100% !important;
    margin: 0 8px 8px 8px !important;
  }
}
</style>
