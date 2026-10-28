<!-- components/payments/VoucherIntent.vue -->
<template>
  <div class="vi-root">
    <!-- =============== MAIN DIALOG =============== -->
    <v-dialog
      :model-value="modelValue"
      :fullscreen="mobile"
      :max-width="mobile ? undefined : '80vw'"
      persistent
      scrollable
      scrim="black"
      :scrim-opacity="persistent ? 0.85 : undefined"
      z-index="2600"
      @update:model-value="onDialogModel"
    >
      <v-card variant="flat" class="vi pa-3 pa-sm-6">
        <!-- Header -->
        <div class="vi__head">
          <div class="vi__head-text">
            <h2 class="vi__title">{{ headerTitle }}</h2>
            <p class="vi__sub">{{ headerSubtitle }}</p>
          </div>
          <v-btn
            v-if="!persistent"
            icon="mdi-close"
            variant="outlined"
            size="small"
            class="vi__close"
            aria-label="Close"
            @click="closeDialog"
          />
        </div>

        <v-container>
          <!-- Alerts -->
          <v-alert
            v-if="message || token"
            :type="reasonKind === 'already-redeemed' ? 'warning' : 'info'"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-3"
          >
            <strong>{{ reasonTitle }}</strong>
            <span v-if="message"> · {{ message }}</span>
            <code v-if="token" class="ml-2">{{ token }}</code>
          </v-alert>
          <v-alert
            v-else-if="step === 'configure' && persistent"
            type="info"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-5"
          >
            <strong>A ticket is required.</strong>
            Scan the QR code on your voucher, buy access below, or
            <a
              href="#ticket-entry"
              class="text-decoration-underline"
              @click.prevent="focusTicketEntry"
              >enter your ticket code</a
            >.
          </v-alert>
        </v-container>

        <!-- =============== MAIN LAYOUT =============== -->
        <div class="vi__grid">
          <!-- ---------- LEFT: configure ---------- -->
          <div class="vi__left">
            <template v-if="step === 'configure'">
              <!-- Sheet tabs -->
              <div class="d-flex align-center ga-2 mb-1">
                <v-tabs
                  v-model="currentTab"
                  color="primary"
                  density="compact"
                  show-arrows
                  class="flex-grow-1"
                >
                  <v-tab
                    v-for="(sheet, index) in sheets"
                    :key="sheet.id"
                    :value="sheet.id"
                    :disabled="!canOpenSheet(index)"
                    class="text-none px-3"
                  >
                    <v-icon
                      v-if="isSheetComplete(sheet)"
                      icon="mdi-check-circle"
                      color="success"
                      size="14"
                      class="mr-1"
                    />
                    Sheet {{ index + 1 }}
                  </v-tab>
                </v-tabs>
                <v-btn
                  v-if="sheets.length > 1 && isLastSheet"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  aria-label="Remove last sheet"
                  @click="removeLastSheet"
                />
                <v-btn
                  v-if="sheets.length < MAX_SHEETS"
                  size="small"
                  variant="flat"
                  color="#8B4513"
                  rounded="lg"
                  prepend-icon="mdi-plus"
                  class="text-none"
                  :disabled="!canAddSheet"
                  @click="addSheet"
                >
                  New Tickets Sheet
                </v-btn>
              </div>

              <!-- Quick fill -->
              <div class="vfill mb-2 ga-2">
                <span class="vfill__label">
                  <v-icon icon="mdi-flash-outline" size="14" />
                  Fill all
                </span>
                <v-chip
                  v-for="t in TIERS"
                  :key="t.value"
                  size="small"
                  variant="tonal"
                  class="vfill__chip"
                  :title="`Fill every row with ${t.title}`"
                  @click="fillSheet(t.value)"
                >
                  <span class="vchip__pos">{{ t.place }}</span>
                  {{ shortTitle(t) }}
                </v-chip>
                <v-chip
                  size="small"
                  variant="text"
                  prepend-icon="mdi-eraser"
                  class="vfill__chip"
                  :disabled="activeFilled === 0"
                  @click="fillSheet(null)"
                >
                  Clear
                </v-chip>
                <span class="vfill__count text-caption text-medium-emphasis">
                  {{ activeFilled }}/{{ ROWS_PER_SHEET }} rows
                </span>
              </div>

              <!-- Rows -->
              <div v-if="activeSheet" class="vrows">
                <div
                  v-for="(slot, i) in activeSheet.slots"
                  :key="slot.id"
                  class="vrow"
                  :class="{
                    'vrow--done': !!slot.choice,
                    'vrow--disabled': !isRowUnlocked(i),
                  }"
                >
                  <div class="vrow__head">
                    <span class="vrow__idx" aria-hidden="true">
                      <v-icon v-if="slot.choice" icon="mdi-check" size="13" />
                      <v-icon
                        v-else-if="!isRowUnlocked(i)"
                        icon="mdi-lock-outline"
                        size="12"
                      />
                      <template v-else>{{ i + 1 }}</template>
                    </span>
                    <span class="vrow__label">Voucher {{ i + 1 }}</span>

                    <span class="vrow__cost">
                      <template v-if="slot.choice">
                        <span class="vrow__main-cost">
                          {{ fmt(BASE[currency] * multOf(slot.choice)) }}
                        </span>
                        <span class="vrow__alt-cost">
                          {{ altPrice(multOf(slot.choice)) }}
                        </span>
                      </template>
                      <span v-else class="text-medium-emphasis">—</span>
                    </span>

                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      density="comfortable"
                      class="vrow__clear"
                      :class="{ 'vrow__clear--hidden': !slot.choice }"
                      :disabled="!slot.choice"
                      :aria-label="`Clear voucher ${i + 1}`"
                      @click="setChoice(i, null)"
                    />
                  </div>

                  <div
                    class="vtiers"
                    role="radiogroup"
                    :aria-label="`Voucher ${i + 1} duration`"
                  >
                    <button
                      v-for="t in TIERS"
                      :key="t.value"
                      type="button"
                      role="radio"
                      class="vtier"
                      :class="{ 'vtier--on': slot.choice === t.value }"
                      :aria-checked="slot.choice === t.value"
                      :disabled="!isRowUnlocked(i)"
                      :title="`Position ${t.place} · ${t.title} · ${fmt(BASE[currency] * t.mult)}`"
                      @click="
                        setChoice(i, slot.choice === t.value ? null : t.value)
                      "
                    >
                      <span class="vtier__title">{{ shortTitle(t) }}</span>
                      <span class="vtier__price">
                        {{ fmt(BASE[currency] * t.mult) }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="vhelp mt-2">
                <v-icon icon="mdi-information-outline" size="14" />
                <span>
                  Pick durations top-down; the letter is the voucher's position.
                  Leave rows empty on the last sheet for fewer vouchers. Earlier
                  sheets must be full.
                </span>
              </div>
            </template>

            <!-- ---------- PAID ---------- -->
            <v-alert
              v-else
              type="success"
              variant="tonal"
              density="comfortable"
              rounded="lg"
            >
              <div class="font-weight-bold">Payment received</div>
              <div class="mt-1">
                Your voucher PDFs are on their way to
                <strong>{{ payerForm.email }}</strong
                >. Enter a token below, or open the QR link on a voucher, to
                start exploring.
              </div>
            </v-alert>
          </div>

          <!-- ---------- RIGHT: summary + checkout ---------- -->
          <div class="vi__right">
            <!-- Order summary card -->
            <div class="vplan">
              <div class="vplan__top">
                <div class="vplan__name">Order summary</div>
                <div class="vplan__price">
                  <span class="vplan__amount">{{ fmt(totalCost) }}</span>
                  <span class="vplan__per">total</span>
                </div>
              </div>

              <span class="vplan__pill">
                <v-icon icon="mdi-ticket-confirmation-outline" size="12" />
                {{ usedSheetCount }} sheet{{
                  usedSheetCount === 1 ? "" : "s"
                }}
                · {{ paidCount }} voucher{{ paidCount === 1 ? "" : "s" }}
                <template v-if="paidCount">
                  · {{ altPrice(totalUnits) }}
                </template>
              </span>

              <div v-if="summaryLines.length" class="vlines">
                <div v-for="l in summaryLines" :key="l.value" class="vline">
                  <span class="vline__pos">{{ l.place }}</span>
                  <span class="text-truncate">{{ l.title }}</span>
                  <span class="text-medium-emphasis">× {{ l.count }}</span>
                  <span class="ml-auto font-weight-medium text-right">
                    {{ fmt(BASE[currency] * l.mult * l.count) }}
                  </span>
                </div>
              </div>
              <div v-else class="vplan__feature">
                <v-icon icon="mdi-ticket-outline" size="14" />
                <span>Select at least one slot to continue.</span>
              </div>

              <v-divider class="my-2" />
              <div class="vplan__feature">
                <v-icon icon="mdi-check-circle" size="14" color="success" />
                <span
                  >Valid 120 days from issue · price re-verified by server</span
                >
              </div>
            </div>

            <!-- Your details + Pay -->
            <template v-if="step === 'configure'">
              <div class="vsec-label mt-1 mb-1">Your details</div>
              <v-text-field
                v-model="payerForm.name"
                placeholder="Full name"
                aria-label="Full name"
                prepend-inner-icon="mdi-account-outline"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                autocomplete="name"
                class="vinput mb-2"
              />
              <v-text-field
                v-model="payerForm.email"
                placeholder="Email for voucher PDFs"
                aria-label="Email for voucher PDFs"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                density="compact"
                variant="outlined"
                rounded="lg"
                autocomplete="email"
                :error="emailTouched && !emailValid"
                :hide-details="!(emailTouched && !emailValid)"
                :error-messages="
                  emailTouched && !emailValid ? 'Enter a valid email' : ''
                "
                class="vinput mb-2"
                @blur="emailTouched = true"
              />

              <!-- FIXED PAYMENT PROCESSORS -->
              <div
                class="vpay__logos"
                role="group"
                aria-label="Choose a payment method"
              >
                <button
                  type="button"
                  class="vpay__brand"
                  aria-label="Pay with PayPal or Card"
                  :aria-disabled="!!checkoutHint"
                  @click="openPaypal"
                >
                  <img
                    :src="paypalIcon"
                    alt="PayPal"
                    class="vpay__logo"
                    draggable="false"
                  />
                </button>

                <button
                  type="button"
                  class="vpay__brand"
                  aria-label="Pay with M-PESA"
                  :aria-disabled="!!checkoutHint"
                  @click="openMpesa"
                >
                  <img
                    :src="mpesaIcon"
                    alt="M-PESA"
                    class="vpay__logo"
                    draggable="false"
                  />
                </button>
              </div>

              <div
                v-if="checkoutHint"
                class="vpay__note text-warning"
                role="status"
                aria-live="polite"
              >
                {{ checkoutHint }}
              </div>
              <div v-else class="vpay__note text-medium-emphasis">
                PayPal is charged in USD ({{ fmtIn("USD", usdTotal) }}); M-PESA
                in KES ({{ fmtIn("KES", kesTotal) }}).
              </div>
              <div class="vpay__note vpay__note--trust text-medium-emphasis">
                <v-icon icon="mdi-lock-check-outline" size="13" />
                Encrypted checkout · we never see your card or PIN
              </div>

              <div v-if="!persistent" class="text-center mt-1">
                <v-btn
                  variant="text"
                  size="small"
                  class="text-none"
                  @click="closeDialog"
                >
                  Cancel
                </v-btn>
              </div>
            </template>
          </div>
        </div>

        <!-- ---------- TICKET ENTRY (both steps) ---------- -->
        <div id="ticket-entry" ref="ticketEntryEl" class="vticket mt-3">
          <div class="vticket__title">
            <v-icon icon="mdi-qrcode-scan" size="16" />
            Already have a ticket?
          </div>
          <div class="vticket__caption">
            Enter the {{ ticketLength }}-digit code from your voucher.
          </div>

          <div
            class="vticket__otp"
            role="group"
            :aria-label="`${ticketLength}-digit ticket code`"
          >
            <input
              v-for="(_, idx) in ticketDigits"
              :key="idx"
              :ref="(el) => setTicketInputRef(el, idx)"
              :value="ticketDigits[idx]"
              class="vticket__box"
              :class="{
                'vticket__box--filled': !!ticketDigits[idx],
                'vticket__box--error': !!ticketError,
              }"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="1"
              :autocomplete="idx === 0 ? 'one-time-code' : 'off'"
              spellcheck="false"
              :disabled="ticketBusy"
              :aria-label="`Digit ${idx + 1}`"
              @input="onTicketInput(idx, $event)"
              @keydown="onTicketKeydown(idx, $event)"
              @paste="onTicketPaste($event)"
              @focus="onTicketFocus($event)"
            />
          </div>
          <v-btn
            v-if="normalizedTicket"
            variant="text"
            size="small"
            rounded="lg"
            class="text-none"
            :disabled="ticketBusy"
            @click="clearTicket"
          >
            Clear
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- =============== PAYPAL SUB-DIALOG =============== -->
    <v-dialog
      v-model="paypalDialog"
      :fullscreen="mobile"
      :max-width="mobile ? undefined : 560"
      persistent
      scrim="black"
      :scrim-opacity="0.7"
      z-index="2700"
    >
      <PayPalPayment
        v-if="paypalDialog && order"
        :key="`pp-${payKey}`"
        mode="voucher"
        currency="USD"
        plan-id="VOUCHERS"
        :voucher-order="order"
        :success-url="successUrl"
        :cancel-url="cancelUrl"
        :payer="payerForm"
        @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError"
      />
    </v-dialog>

    <!-- =============== M-PESA SUB-DIALOG =============== -->
    <v-dialog
      v-model="mpesaDialog"
      :fullscreen="mobile"
      :max-width="mobile ? undefined : 560"
      persistent
      scrim="black"
      :scrim-opacity="0.7"
      z-index="2700"
    >
      <MpesaPayment
        v-if="mpesaDialog && order"
        :key="`mp-${payKey}`"
        mode="voucher"
        :payment-data="mpesaPaymentData"
        :kes-preview="kesTotal"
        currency="KES"
        :voucher-order="order"
        :success-url="successUrl"
        :cancel-url="cancelUrl"
        :payer="payerForm"
        @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import PayPalPayment from "@/components/payments/PaypalPayment.vue";
import MpesaPayment from "@/components/payments/MpesaPayment.vue";
import type { CreatePaymentInput, VoucherSlotInput } from "@/stores/payments";
import { useVoucherStore } from "@/stores/vouchers";
import paypalIconUrl from "@/assets/icons/paypal.png";
import mpesaIconUrl from "@/assets/icons/mpesa.png";

const paypalIcon = paypalIconUrl as unknown as string;
const mpesaIcon = mpesaIconUrl as unknown as string;
const voucherStore = useVoucherStore();

/* ---------- types ---------- */
type Currency = "KES" | "USD" | "EUR";
type DurationOption = "M15" | "M30" | "H1" | "H2" | "H3";
type PlaceLabel = "A" | "B" | "C" | "D" | "E";
type Step = "configure" | "paid";
type Choice = DurationOption | null | undefined;
type PaymentOrder = Omit<
  CreatePaymentInput,
  "currency" | "successUrl" | "cancelUrl"
>;

interface Tier {
  value: DurationOption;
  place: PlaceLabel;
  mins: number;
  mult: number;
  title: string;
  position: string;
}
interface VoucherSelection {
  id: string;
  rowIndex: number;
  choice: Choice;
}
interface VoucherSheet {
  id: string;
  slots: VoucherSelection[];
}

/* ---------- pricing (mirrors server PLACE_MAP) ---------- */
const TIERS: Tier[] = [
  {
    position: "A",
    value: "M15",
    place: "A",
    mins: 15,
    mult: 1,
    title: "15 minutes",
  },
  {
    position: "B",
    value: "M30",
    place: "B",
    mins: 30,
    mult: 2,
    title: "30 minutes",
  },
  {
    position: "C",
    value: "H1",
    place: "C",
    mins: 60,
    mult: 4,
    title: "1 hour",
  },
  {
    position: "D",
    value: "H2",
    place: "D",
    mins: 120,
    mult: 8,
    title: "2 hours",
  },
  {
    position: "E",
    value: "H3",
    place: "E",
    mins: 180,
    mult: 12,
    title: "3 hours",
  },
];

const env = import.meta.env as Record<string, string | undefined>;
const envNumber = (key: string, fallback: number) => {
  const n = Number(env[key]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const round2 = (n: number) => Math.round(n * 100) / 100;

const KES_PER_USD = envNumber("VITE_EXCHANGE_RATE", 131);
const BASE_KES = envNumber("VITE_VOUCHER_BASE_KES", 70);
const BASE_USD = envNumber(
  "VITE_VOUCHER_BASE_USD",
  round2(BASE_KES / KES_PER_USD),
);
const BASE_EUR = envNumber("VITE_VOUCHER_BASE_EUR", BASE_USD);
const BASE: Record<Currency, number> = {
  KES: BASE_KES,
  USD: BASE_USD,
  EUR: BASE_EUR,
};

const envCur = (env.VITE_VOUCHER_CURRENCY ?? "").toUpperCase();
const ENV_CURRENCY: Currency =
  envCur === "USD" || envCur === "EUR" || envCur === "KES" ? envCur : "KES";

/* ---------- props / emits ---------- */
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    persistent?: boolean;
    message?: string;
    token?: string | null;
    reason?: string | null;
    currency?: Currency;
    payer?: { name: string; email: string; phone?: string; country?: string };
    successUrl?: string;
    cancelUrl?: string;
    ticketLength?: number;
  }>(),
  {
    persistent: false,
    message: "",
    token: null,
    reason: null,
    currency: undefined,
    payer: undefined,
    successUrl: "/museum/vouchers/success",
    cancelUrl: "/museum/vouchers/cancel",
    ticketLength: 7,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "payment-success", data: any): void;
  (e: "payment-error", error: string): void;
  (e: "ticket-submit", token: string): void;
}>();

const { mobile } = useDisplay();
const currency = computed<Currency>(() => props.currency ?? ENV_CURRENCY);

/* ---------- constants ---------- */
const MAX_SHEETS = 5;
const ROWS_PER_SHEET = 4;
let nextSheetId = 1;
let nextSlotId = 1;

/* ---------- state ---------- */
const step = ref<Step>("configure");
const currentTab = ref("sheet-1");
const payKey = ref(0);
const emailTouched = ref(false);

const paypalDialog = ref(false);
const mpesaDialog = ref(false);
const order = ref<PaymentOrder | null>(null);

const payerForm = reactive({
  name: props.payer?.name ?? "",
  email: props.payer?.email ?? "",
  phone: props.payer?.phone ?? "",
});

function createSheet(): VoucherSheet {
  return {
    id: `sheet-${nextSheetId++}`,
    slots: Array.from({ length: ROWS_PER_SHEET }, (_, rowIndex) => ({
      id: `slot-${nextSlotId++}`,
      rowIndex,
      choice: null,
    })),
  };
}
const sheets = ref<VoucherSheet[]>([createSheet()]);

const activeSheet = computed(
  () => sheets.value.find((s) => s.id === currentTab.value) ?? sheets.value[0],
);
const isLastSheet = computed(
  () => activeSheet.value?.id === sheets.value[sheets.value.length - 1].id,
);
const activeFilled = computed(
  () => activeSheet.value?.slots.filter((s) => !!s.choice).length ?? 0,
);

/* ---------- formatting ---------- */
const fmtIn = (cur: Currency, major: number) =>
  new Intl.NumberFormat(cur === "KES" ? "en-KE" : "en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: cur === "KES" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);
const fmt = (major: number) => fmtIn(currency.value, major);

const shortTitle = (t: Tier) =>
  t.mins < 60 ? `${t.mins}m` : `${t.mins / 60}h`;
const multOf = (c: Choice) => TIERS.find((t) => t.value === c)?.mult ?? 0;

function altPrice(units: number): string {
  const others = (["KES", "USD", "EUR"] as Currency[]).filter(
    (c) => c !== currency.value,
  );
  return others.map((c) => fmtIn(c, BASE[c] * units)).join(" / ");
}

/* ---------- rows / sheets ---------- */
const isRowUnlocked = (i: number) =>
  i === 0 || !!activeSheet.value?.slots[i - 1]?.choice;

function setChoice(i: number, v: unknown) {
  const sheet = activeSheet.value;
  if (!sheet) return;
  const val = (v as DurationOption | null | undefined) ?? null;
  sheet.slots[i].choice = val;
  if (!val)
    for (let j = i + 1; j < sheet.slots.length; j++)
      sheet.slots[j].choice = null;
}

function fillSheet(value: DurationOption | null) {
  activeSheet.value?.slots.forEach((s) => (s.choice = value));
}

const isSheetComplete = (s: VoucherSheet) => s.slots.every((x) => !!x.choice);
const canOpenSheet = (index: number) =>
  index === 0 || sheets.value.slice(0, index).every(isSheetComplete);
const canAddSheet = computed(
  () =>
    sheets.value.length < MAX_SHEETS &&
    isSheetComplete(sheets.value[sheets.value.length - 1]),
);

function addSheet() {
  if (!canAddSheet.value) return;
  const sheet = createSheet();
  sheets.value.push(sheet);
  currentTab.value = sheet.id;
}
function removeLastSheet() {
  if (sheets.value.length < 2) return;
  sheets.value.pop();
  currentTab.value = sheets.value[sheets.value.length - 1].id;
}

/* ---------- totals ---------- */
const allSlots = computed(() => sheets.value.flatMap((s) => s.slots));
const paidCount = computed(() => allSlots.value.filter((s) => s.choice).length);
const totalUnits = computed(() =>
  allSlots.value.reduce((t, s) => t + multOf(s.choice), 0),
);
const totalCost = computed(() => BASE[currency.value] * totalUnits.value);
const usdTotal = computed(() => round2(BASE.USD * totalUnits.value));
const kesTotal = computed(() => Math.round(BASE.KES * totalUnits.value));

const lastUsedSheet = computed(() => {
  let last = -1;
  sheets.value.forEach((s, i) => {
    if (s.slots.some((x) => x.choice)) last = i;
  });
  return last;
});
const usedSheetCount = computed(() => Math.max(1, lastUsedSheet.value + 1));
const sheetsValid = computed(() =>
  sheets.value.every((s, i) => i >= lastUsedSheet.value || isSheetComplete(s)),
);

const summaryLines = computed(() =>
  TIERS.map((t) => ({
    ...t,
    count: allSlots.value.filter((s) => s.choice === t.value).length,
  })).filter((l) => l.count > 0),
);

/* ---------- validation ---------- */
const emailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payerForm.email.trim()),
);
const checkoutHint = computed(() => {
  if (paidCount.value === 0) return "Pick at least one duration.";
  if (!sheetsValid.value) return "Fill every row on the earlier sheets.";
  if (payerForm.name.trim().length < 2) return "Enter your full name.";
  if (!emailValid.value) return "Enter a valid email address.";
  return "";
});

/* ---------- checkout ---------- */
const keyBySig = new Map<string, string>();
function idempotencyKey(sig: string) {
  let k = keyBySig.get(sig);
  if (!k) {
    k = `vou-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    keyBySig.set(sig, k);
  }
  return k;
}

function buildOrder(cur: "USD" | "KES"): PaymentOrder {
  const slots: VoucherSlotInput[] = [];
  sheets.value.forEach((sheet, sIdx) => {
    sheet.slots.forEach((slot) => {
      const tier = TIERS.find((t) => t.value === slot.choice);
      if (!tier) return;
      slots.push({
        sheetIndex: sIdx + 1,
        rowIndex: slot.rowIndex,
        placeLabel: tier.place,
        isImpression: false,
      });
    });
  });
  const payer = {
    name: payerForm.name.trim(),
    email: payerForm.email.trim(),
    ...(payerForm.phone.trim() ? { phone: payerForm.phone.trim() } : {}),
  };
  const sig = `${cur}|${payer.email}|${slots
    .map((s) => `${s.sheetIndex}${s.rowIndex}${s.placeLabel}`)
    .join(",")}`;
  return {
    unitPriceCents: Math.round(BASE[cur] * 100),
    slots,
    payer,
    description: `Tukema Vouchers · ${slots.length} voucher(s) · ${usedSheetCount.value} sheet(s)`,
    idempotencyKey: idempotencyKey(sig),
  } satisfies PaymentOrder;
}

const mpesaPaymentData = computed(() => ({ totalAmount: usdTotal.value }));

function openPaypal() {
  emailTouched.value = true;
  if (checkoutHint.value) return;
  order.value = buildOrder("USD");
  payKey.value++;
  paypalDialog.value = true;
}

function openMpesa() {
  emailTouched.value = true;
  if (checkoutHint.value) return;
  order.value = buildOrder("KES");
  payKey.value++;
  mpesaDialog.value = true;
}

function onPaymentSuccess(data: any) {
  paypalDialog.value = false;
  mpesaDialog.value = false;
  emit("payment-success", data);
  if (props.persistent) step.value = "paid";
  else emit("update:modelValue", false);
}
function onPaymentError(msg: string) {
  emit("payment-error", msg);
}

function closeDialog() {
  if (props.persistent) return;
  emit("update:modelValue", false);
}
function onDialogModel(v: boolean) {
  if (!v && props.persistent) return;
  emit("update:modelValue", v);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) return;
    step.value = "configure";
    paypalDialog.value = false;
    mpesaDialog.value = false;
    order.value = null;
    ticketReset();
  },
);

/* ---------- ticket entry ---------- */
const ticketLength = computed(() => Math.max(1, props.ticketLength));
const ticketDigits = ref<string[]>(
  Array.from({ length: ticketLength.value }, () => ""),
);
const ticketBusy = ref(false);
const ticketError = ref<string | null>(null);
const ticketEntryEl = ref<HTMLElement | null>(null);
const ticketInputs: HTMLInputElement[] = [];

function setTicketInputRef(el: any, idx: number) {
  if (el) ticketInputs[idx] = el as HTMLInputElement;
}

const normalizedTicket = computed(() => ticketDigits.value.join(""));
const ticketTokenValid = computed(
  () =>
    normalizedTicket.value.length === ticketLength.value &&
    /^\d+$/.test(normalizedTicket.value),
);

function focusTicketEntry() {
  ticketEntryEl.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  void nextTick(() => ticketInputs[0]?.focus());
}

function onTicketFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select();
  ticketError.value = null;
}

function onTicketInput(idx: number, e: Event) {
  const el = e.target as HTMLInputElement;
  const digit = el.value.replace(/\D/g, "").slice(-1);
  ticketDigits.value[idx] = digit;
  el.value = digit;
  ticketError.value = null;
  if (digit && idx < ticketLength.value - 1) ticketInputs[idx + 1]?.focus();
  if (ticketTokenValid.value) submitTicket();
}

function onTicketKeydown(idx: number, e: KeyboardEvent) {
  if (e.key === "Backspace") {
    if (ticketDigits.value[idx]) {
      ticketDigits.value[idx] = "";
    } else if (idx > 0) {
      ticketDigits.value[idx - 1] = "";
      ticketInputs[idx - 1]?.focus();
    }
    e.preventDefault();
  } else if (e.key === "ArrowLeft" && idx > 0) {
    e.preventDefault();
    ticketInputs[idx - 1]?.focus();
  } else if (e.key === "ArrowRight" && idx < ticketLength.value - 1) {
    e.preventDefault();
    ticketInputs[idx + 1]?.focus();
  } else if (e.key === "Enter") {
    e.preventDefault();
    submitTicket();
  }
}

function onTicketPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  const run = text.match(/(?<!\d)\d{7}(?!\d)/)?.[0];
  const cleaned = (run ?? text.replace(/\D/g, "")).slice(0, ticketLength.value);
  if (!cleaned) return;
  e.preventDefault();
  ticketDigits.value = Array.from(
    { length: ticketLength.value },
    (_, i) => cleaned[i] ?? "",
  );
  ticketError.value = null;
  void nextTick(() =>
    ticketInputs[Math.min(cleaned.length, ticketLength.value) - 1]?.focus(),
  );
  if (ticketTokenValid.value) submitTicket();
}

function clearTicket() {
  ticketDigits.value = Array.from({ length: ticketLength.value }, () => "");
  ticketError.value = null;
  void nextTick(() => ticketInputs[0]?.focus());
}

async function submitTicket() {
  if (ticketBusy.value) return;

  if (!ticketTokenValid.value) {
    ticketError.value = `Enter the ${ticketLength.value}-digit ticket code.`;
    return;
  }

  ticketBusy.value = true;
  ticketError.value = null;

  try {
    // Actual GraphQL backend redemption, no mock timer.
    const result = await voucherStore.redeem(normalizedTicket.value);

    if (!result.success) {
      ticketError.value =
        result.message ||
        voucherStore.error ||
        "Voucher redemption failed. Please try again.";
      return;
    }

    // Notify the parent only after successful redemption.
    // The parent can use this event to start the application session.
    emit("ticket-submit", normalizedTicket.value);
  } catch (error: unknown) {
    ticketError.value =
      error instanceof Error
        ? error.message
        : "Unable to redeem the ticket. Please try again.";
  } finally {
    ticketBusy.value = false;
  }
}

function ticketReset() {
  ticketDigits.value = Array.from({ length: ticketLength.value }, () => "");
  ticketBusy.value = false;
  ticketError.value = null;
}
defineExpose({ focusTicketEntry, ticketReset });

/* ---------- header / reason ---------- */
const headerTitle = computed(() =>
  step.value === "configure" ? "Tukema Museum Access" : "Payment received",
);
const headerSubtitle = computed(() =>
  step.value === "configure"
    ? paidCount.value
      ? "Ready for checkout — confirm with your PIN."
      : "Pick a duration per row, then pay in one tap."
    : "Check your email for the PDFs",
);

const reasonText = computed(() =>
  `${props.reason ?? ""} ${props.message ?? ""}`.toLowerCase(),
);
const reasonKind = computed(() =>
  /already (redeemed|used)/.test(reasonText.value)
    ? "already-redeemed"
    : "generic",
);
const reasonTitle = computed(() => {
  const v = reasonText.value;
  if (reasonKind.value === "already-redeemed")
    return "Voucher already redeemed";
  if (v.includes("expired")) return "Voucher expired";
  if (v.includes("cancelled")) return "Voucher cancelled";
  if (v.includes("impression")) return "Impression-only slot";
  if (v.includes("not recognised") || v.includes("not found"))
    return "Voucher not recognised";
  if (v.includes("7 digits")) return "Invalid voucher code";
  return "Museum access";
});
</script>

<style scoped>
/* ==========================================
   TUKEMA VOUCHER CHECKOUT
   Responsive shell and layout
========================================== */

.vi-root {
  --brand-primary: #8b4513;
  --brand-secondary: #2b2b2b;
  --brand-accent: #f08228;
  --brand-light: #f5efe6;
  --brand-dark: #1a1a1a;

  --vi-gap: 16px;
  --vi-radius: 24px;

  width: 100%;
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
}

/* Main card — padding handled by Vuetify utilities */
.vi {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 92dvh;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: rgb(var(--v-theme-surface));
  border-radius: var(--vi-radius) !important;
}

/* Header */
.vi__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 0 0 auto;
  margin-bottom: 12px;
}

.vi__head-text {
  flex: 1 1 auto;
  min-width: 0;
}

.vi__title {
  margin: 0;
  color: var(--brand-secondary);
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.vi__sub {
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.875rem;
  line-height: 1.4;
}

.vi__close {
  flex: 0 0 auto;
}

/* Main responsive grid */
.vi__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: var(--vi-gap);
  width: 100%;
  min-width: 0;
}

.vi__left,
.vi__right {
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vplan,
.vrow,
.vticket {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (min-width: 960px) {
  .vi {
    overflow-y: auto;
  }

  .vi__grid {
    grid-template-columns:
      minmax(0, 1.55fr)
      minmax(300px, 0.85fr);
    gap: 20px;
  }

  .vi__left {
    padding-right: 4px;
  }

  .vi__right {
    position: sticky;
    top: 0;
    align-self: start;
  }
}

@media (min-width: 1280px) {
  .vi__grid {
    grid-template-columns:
      minmax(0, 1.65fr)
      minmax(320px, 0.85fr);
    gap: 24px;
  }
}

@media (max-width: 599px) {
  .vi {
    min-height: 100%;
    max-height: 100dvh;
    border-radius: 0 !important;
  }

  .vi__head {
    margin-bottom: 10px;
  }

  .vi__grid {
    gap: 14px;
  }

  .vi__right {
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .vi__title {
    font-size: 1.1rem;
  }
}

/* ---------- plan / summary card ---------- */
.vplan {
  padding: 12px 14px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px;
  background: var(--brand-light, rgb(var(--v-theme-surface)));
}
.vplan__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}
.vplan__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--brand-primary);
}
.vplan__price {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.vplan__amount {
  font-size: clamp(1.45rem, 3vw, 1.9rem);
  font-weight: 850;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  color: var(--brand-secondary);
}
.vplan__per {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.vplan__pill {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  max-width: 100%;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  line-height: 1.3;
  background: rgba(139, 69, 19, 0.1);
  color: var(--brand-primary);
}
.vplan__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}
.vplan__feature:last-child {
  margin-top: 0;
}

/* ---------- lines ---------- */
.vlines {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}
.vline {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
}
.vline__pos {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.625rem;
  font-weight: 700;
  background: rgba(139, 69, 19, 0.14);
  color: var(--brand-primary);
}

/* ---------- quick fill ---------- */
.vfill {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.vfill__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 2px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.vfill__chip {
  cursor: pointer;
}
.vfill__count {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
.vchip__pos {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 50%;
  font-size: 0.5625rem;
  font-weight: 700;
  background: rgba(139, 69, 19, 0.16);
  color: var(--brand-primary);
}

/* ---------- Voucher rows ---------- */
.vrows {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.vrow {
  padding: 10px 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}
.vrow--done {
  border-color: rgba(139, 69, 19, 0.55);
  background: rgba(139, 69, 19, 0.025);
}
.vrow--disabled {
  opacity: 0.55;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.vrow__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-bottom: 10px;
  padding: 0;
}
.vrow__idx {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.vrow--done .vrow__idx {
  background: var(--brand-primary);
  color: #fff;
}
.vrow__label {
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 750;
}
.vrow__cost {
  margin-left: auto;
  flex: 0 0 auto;
  text-align: right;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.vrow__main-cost {
  line-height: 1.15;
}
.vrow__alt-cost {
  font-size: 0.625rem;
  font-weight: 400;
  line-height: 1.15;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.vrow__clear--hidden {
  visibility: hidden;
}

/* ---------- Duration options ---------- */
.vtiers {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.vtier {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  width: 100%;
  min-width: 0;
  min-height: 60px;
  padding: 10px 2px 6px;

  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;

  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;

  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease;
}
.vtier:hover:not(:disabled) {
  border-color: var(--brand-primary);
}
.vtier:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
.vtier:disabled {
  cursor: not-allowed;
}
.vtier--on {
  border-color: var(--brand-primary);
  background: rgba(139, 69, 19, 0.09);
  box-shadow: inset 0 0 0 1px var(--brand-primary);
}

.vtier__badge {
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.5625rem;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  max-width: calc(100% - 4px);
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(240, 130, 40, 0.2);
  color: var(--brand-accent);
}
.vtier--on .vtier__badge {
  background: var(--brand-primary);
  color: #fff;
}

.vtier__title {
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  font-weight: 800;
  line-height: 1.15;
}
.vtier__price {
  max-width: 100%;
  font-size: clamp(0.58rem, 0.85vw, 0.7rem);
  line-height: 1.25;
  text-align: center;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.vtier--on .vtier__price {
  color: var(--brand-primary);
  font-weight: 800;
}

.vhelp {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.75rem;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.vhelp .v-icon {
  margin-top: 2px;
}

/* ---------- details + pay ---------- */
.vsec-label {
  margin-bottom: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
}
.vinput :deep(.v-field) {
  min-width: 0;
  background: rgba(139, 69, 19, 0.035);
  border-radius: 12px;
  font-size: 0.9375rem;
}
.vinput :deep(.v-field__outline) {
  --v-field-border-opacity: 0.35;
  color: var(--brand-primary);
}
.vinput :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}
.vinput :deep(.v-field__prepend-inner) {
  padding-inline-end: 8px;
  margin-inline-end: 8px;
  border-inline-end: thin solid
    rgba(var(--v-border-color), var(--v-border-opacity));
  align-self: stretch;
  align-items: center;
  color: var(--brand-primary);
}

.vpay {
  width: 100%;
  min-height: 48px;
  height: auto !important;
  padding: 10px 16px;
  white-space: normal;
  line-height: 1.35;
  border-radius: 12px !important;
  font-weight: 800 !important;
  box-shadow: none !important;
  background: var(--brand-primary) !important;
  color: #fff !important;
}

.vpay__alt {
  margin-top: 8px;
  text-align: center;
}
.vpay__link {
  background: none;
  border: 0;
  padding: 2px 4px;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--brand-primary);
  cursor: pointer;
}
.vpay__link:hover:not(:disabled) {
  text-decoration: underline;
}
.vpay__link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.vpay__link:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ---------- payment processors ---------- */
.vpay__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
}

.vpay__brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 140px;
  min-width: 112px;
  min-height: 48px;
  padding: 8px 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(139, 69, 19, 0.35);
  border-radius: 12px;
  cursor: pointer;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.vpay__brand:hover {
  background: rgba(139, 69, 19, 0.06);
  border-color: var(--brand-primary);
  transform: translateY(-1px);
}

.vpay__brand:active {
  transform: scale(0.98);
}

.vpay__brand:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 3px;
}

/* Remain clickable when checkout validation fails */
.vpay__brand[aria-disabled="true"] {
  opacity: 0.85;
  cursor: pointer;
}

/* Native images have predictable dimensions */
.vpay__logo {
  display: block;
  width: auto;
  height: 26px;
  max-width: 100px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
}

.vpay__note {
  margin-top: 6px;
  font-size: 0.72rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: center;
}
.vpay__note--trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

@media (max-width: 400px) {
  .vpay__logos {
    gap: 8px;
  }

  .vpay__brand {
    flex: 1 1 0;
    min-width: 0;
    padding: 8px 10px;
  }

  .vpay__logo {
    height: 24px;
    max-width: 100%;
  }
}

/* ---------- ticket entry ---------- */
.vticket {
  width: 100%;
  min-width: 0;
  padding: 12px 10px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  text-align: center;
}
.vticket__title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 800;
}
.vticket__caption {
  margin: 4px 0 8px;
  font-size: 0.78rem;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.vticket__otp {
  display: flex;
  justify-content: center;
  gap: clamp(4px, 1.5vw, 8px);
  width: 100%;
  max-width: 340px;
  margin-inline: auto;
}
.vticket__box {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  max-width: 40px;
  height: 42px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.vticket__box:hover:not(:disabled) {
  border-color: rgba(139, 69, 19, 0.6);
}
.vticket__box:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.25);
}
.vticket__box--filled {
  background: rgba(139, 69, 19, 0.08);
  border-color: rgba(139, 69, 19, 0.5);
}
.vticket__box--error {
  border-color: rgb(var(--v-theme-error));
}
.vticket__box:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.vticket__hint,
.vticket__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.6875rem;
}
.vticket__hint {
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.vticket__error {
  color: rgb(var(--v-theme-error));
}
.vticket__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

/* ---------- small screens ---------- */
@media (max-width: 400px) {
  .vrow {
    padding: 8px 10px;
    border-radius: 12px;
  }
  .vtiers {
    gap: 4px;
  }
  .vtier {
    min-height: 56px;
    padding: 8px 1px 5px;
    border-radius: 8px;
    gap: 3px;
  }
  .vtier__badge {
    font-size: 0.5rem;
    padding-inline: 4px;
  }
  .vtier__title {
    font-size: 0.75rem;
  }
  .vtier__price {
    font-size: 0.55rem;
  }
  .vticket__box {
    height: 36px;
    border-radius: 8px;
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vrow,
  .vtier,
  .vticket__box,
  .vpay__brand {
    transition: none;
  }
}
</style>
