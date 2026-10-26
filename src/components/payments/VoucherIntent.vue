<!-- components/payments/VoucherIntent.vue -->
<template>
  <div class="vi-root">
    <!-- =============== MAIN DIALOG =============== -->
    <v-dialog
      :model-value="modelValue"
      :fullscreen="mobile"
      :max-width="mobile ? undefined : 1080"
      persistent
      scrollable
      scrim="black"
      :scrim-opacity="persistent ? 0.85 : undefined"
      z-index="2600"
      @update:model-value="onDialogModel"
    >
      <v-card variant="flat" class="vi pa-3">
        <!-- Header -->
        <v-toolbar density="compact" flat color="surface" class="vi__bar">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" rounded="lg" size="32">
              <v-icon icon="mdi-ticket-confirmation-outline" size="18" />
            </v-avatar>
          </template>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold">
            {{ headerTitle }}
            <span
              class="text-caption text-medium-emphasis ml-2 d-none d-sm-inline"
            >
              {{ headerSubtitle }}
            </span>
          </v-toolbar-title>

          <v-chip size="small" variant="tonal" color="primary" class="mr-1">
            {{ fmt(totalCost) }}
          </v-chip>
          <v-chip size="small" variant="tonal" color="success" class="mr-1">
            {{ currency }}
          </v-chip>

          <v-btn
            v-if="!persistent"
            icon="mdi-close"
            variant="text"
            size="small"
            aria-label="Close"
            @click="closeDialog"
          />
        </v-toolbar>
        <v-divider />

        <v-row dense>
          <!-- ============ LEFT ============ -->
          <v-col cols="12" md="8">
            <v-alert
              v-if="message || token"
              :type="reasonKind === 'already-redeemed' ? 'warning' : 'info'"
              variant="tonal"
              density="compact"
              class="mb-3 mt-2"
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
              class="mb-3 mt-3"
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

            <!-- ---------- CONFIGURE ---------- -->
            <template v-if="step === 'configure'">
              <div class="d-flex align-center ga-2 mb-2 mt-2">
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
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-plus"
                  class="text-none"
                  :disabled="!canAddSheet"
                  @click="addSheet"
                >
                  Sheet
                </v-btn>
              </div>

              <!-- Sheet progress + quick fill -->
              <div class="vfill mb-3">
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
                  <!-- index / state -->
                  <span class="vrow__idx" aria-hidden="true">
                    <v-icon v-if="slot.choice" icon="mdi-check" size="14" />
                    <v-icon
                      v-else-if="!isRowUnlocked(i)"
                      icon="mdi-lock-outline"
                      size="13"
                    />
                    <template v-else>{{ i + 1 }}</template>
                  </span>

                  <!-- duration chips -->
                  <v-chip-group
                    :model-value="slot.choice"
                    column
                    class="vrow__chips"
                    :aria-label="`Voucher ${i + 1} duration`"
                    :disabled="!isRowUnlocked(i)"
                    @update:model-value="(v: unknown) => setChoice(i, v)"
                  >
                    <v-chip
                      v-for="t in TIERS"
                      :key="t.value"
                      :value="t.value"
                      size="default"
                      rounded="lg"
                      :variant="slot.choice === t.value ? 'flat' : 'tonal'"
                      :color="slot.choice === t.value ? 'primary' : undefined"
                      class="vchip"
                      :class="{ 'vchip--on': slot.choice === t.value }"
                      :title="`Position ${t.place} · ${fmt(BASE[currency] * t.mult)}`"
                    >
                      <span class="vchip__pos">{{ t.place }}</span>
                      {{ shortTitle(t) }}
                    </v-chip>
                  </v-chip-group>

                  <!-- cost + clear -->
                  <span class="vrow__side">
                    <span class="vrow__cost">
                      <template v-if="slot.choice">
                        <div class="vrow__main-cost">
                          {{ fmt(BASE[currency] * multOf(slot.choice)) }}
                        </div>
                        <div class="vrow__alt-cost">
                          {{ altPrice(multOf(slot.choice)) }}
                        </div>
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
                  </span>
                </div>
              </div>

              <div class="vhelp mt-3">
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
            >
              <div class="font-weight-bold">Payment received</div>
              <div class="mt-1">
                Your voucher PDFs are on their way to
                <strong>{{ payerForm.email }}</strong
                >. Enter a token below, or open the QR link on a voucher, to
                start exploring.
              </div>
            </v-alert>

            <!-- ---------- TICKET ENTRY (both steps) ---------- -->
            <div id="ticket-entry" ref="ticketEntryEl" class="vticket mt-4">
              <div class="vticket__title">
                <v-icon icon="mdi-qrcode-scan" size="16" />
                Have a ticket already?
                <span class="text-caption text-medium-emphasis">
                  Enter the {{ ticketLength }}-digit code from your voucher.
                </span>
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

              <div v-if="ticketError" class="vticket__error">
                <v-icon icon="mdi-alert-circle-outline" size="14" />
                {{ ticketError }}
              </div>
              <div v-else class="vticket__hint">
                Digits only. Spaces and dashes are ignored.
              </div>

              <div class="vticket__actions">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  prepend-icon="mdi-login-variant"
                  :loading="ticketBusy"
                  :disabled="!ticketTokenValid || ticketBusy"
                  @click="submitTicket"
                >
                  Use ticket
                </v-btn>
                <v-btn
                  v-if="normalizedTicket"
                  variant="text"
                  size="small"
                  :disabled="ticketBusy"
                  @click="clearTicket"
                >
                  Clear
                </v-btn>
              </div>
            </div>
          </v-col>

          <!-- ============ RIGHT ============ -->
          <v-col cols="12" md="4" class="mt-2">
            <div class="vside">
              <div class="vcard">
                <div class="vcard__title">
                  <v-icon icon="mdi-receipt-text-outline" size="16" />
                  Order summary
                  <span class="ml-auto text-caption text-medium-emphasis">
                    {{ usedSheetCount }} sheet{{
                      usedSheetCount === 1 ? "" : "s"
                    }}
                    · {{ paidCount }} voucher{{ paidCount === 1 ? "" : "s" }}
                  </span>
                </div>

                <div v-if="summaryLines.length" class="vlines">
                  <div v-for="l in summaryLines" :key="l.value" class="vline">
                    <span class="vline__pos">{{ l.place }}</span>
                    <span>{{ l.title }}</span>
                    <span class="text-medium-emphasis">× {{ l.count }}</span>
                    <span class="ml-auto text-right">
                      <div class="font-weight-medium">
                        {{ fmt(BASE[currency] * l.mult * l.count) }}
                      </div>
                      <div class="vline__alt">
                        {{ altPrice(l.mult * l.count) }}
                      </div>
                    </span>
                  </div>
                </div>
                <div v-else class="vempty">
                  <v-icon icon="mdi-ticket-outline" size="20" />
                  Select at least one slot to continue.
                </div>

                <v-divider class="my-2" />
                <div class="d-flex align-baseline">
                  <span class="text-body-2 font-weight-bold">Total</span>
                  <span class="ml-auto text-right">
                    <div class="text-h6 font-weight-bold text-primary">
                      {{ fmt(totalCost) }}
                    </div>
                    <div class="vline__alt">{{ altPrice(totalUnits) }}</div>
                  </span>
                </div>
                <div class="text-caption text-medium-emphasis">
                  Valid 120 days from issue · price re-verified by server
                </div>
              </div>

              <div v-if="step === 'configure'" class="vcard">
                <div class="vcard__title">
                  <v-icon
                    icon="mdi-shield-lock-outline"
                    size="16"
                    color="success"
                  />
                  Secure checkout
                </div>

                <v-text-field
                  v-model="payerForm.name"
                  label="Full name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  autocomplete="name"
                  class="mb-2"
                />
                <v-text-field
                  v-model="payerForm.email"
                  label="Email for voucher PDFs"
                  type="email"
                  density="compact"
                  variant="outlined"
                  autocomplete="email"
                  :error="emailTouched && !emailValid"
                  :hide-details="!(emailTouched && !emailValid)"
                  :error-messages="
                    emailTouched && !emailValid ? 'Enter a valid email' : ''
                  "
                  class="mb-2"
                  @blur="emailTouched = true"
                />

                <div class="vmethods mb-2" role="group" aria-label="Pay with">
                  <button
                    type="button"
                    class="vbrand"
                    :disabled="!!checkoutHint"
                    aria-label="Pay with PayPal or card"
                    @click="openPaypal"
                  >
                    <img
                      :src="paypalIcon"
                      alt="PayPal"
                      class="vbrand__img"
                      draggable="false"
                    />
                  </button>
                  <button
                    type="button"
                    class="vbrand"
                    :disabled="!!checkoutHint"
                    aria-label="Pay with M-PESA"
                    @click="openMpesa"
                  >
                    <img
                      :src="mpesaIcon"
                      alt="M-PESA"
                      class="vbrand__img"
                      draggable="false"
                    />
                  </button>
                </div>

                <div v-if="checkoutHint" class="text-caption text-warning">
                  {{ checkoutHint }}
                </div>
                <div v-else class="text-caption text-medium-emphasis">
                  PayPal is charged in USD ({{ fmtIn("USD", usdTotal) }});
                  M-PESA in KES ({{ fmtIn("KES", kesTotal) }}).
                </div>

                <div class="vtrust">
                  <v-icon icon="mdi-lock-check-outline" size="14" />
                  Encrypted checkout · we never see your card or PIN
                </div>

                <v-btn
                  v-if="!persistent"
                  block
                  variant="text"
                  size="small"
                  class="mt-1 text-none"
                  @click="closeDialog"
                >
                  Cancel
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
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
      ? "Ready for checkout"
      : "Pick a duration per row"
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
.vi__bar {
  flex: 0 0 auto;
}

/* ---------- rows ---------- */
.vrows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.vrow {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 12px;
  min-height: 56px;
  padding: 8px 12px 8px 10px;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  transition:
    border-color 0.15s,
    background-color 0.15s,
    opacity 0.15s,
    box-shadow 0.15s;
}
.vrow:hover:not(.vrow--disabled) {
  border-color: rgba(var(--v-theme-primary), 0.35);
}
.vrow--done {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.05);
  box-shadow: 0 1px 0 rgba(var(--v-theme-primary), 0.08);
}
.vrow--disabled {
  opacity: 0.5;
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.vrow__idx {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(var(--v-theme-on-surface), 0.08);
  transition:
    background-color 0.15s,
    color 0.15s;
}
.vrow--done .vrow__idx {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
.vrow__chips {
  min-width: 0;
}
.vrow__chips :deep(.v-slide-group__content) {
  gap: 6px;
  padding: 0;
}
.vrow__side {
  display: flex;
  align-items: center;
  gap: 2px;
}
.vrow__cost {
  min-width: 84px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.vrow__main-cost {
  line-height: 1.15;
}
.vrow__alt-cost,
.vline__alt {
  font-size: 0.65rem;
  font-weight: 400;
  line-height: 1.15;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.vrow__clear--hidden {
  visibility: hidden;
}

/* ---------- chips (tonal idle, flat selected) ---------- */
.vchip {
  margin: 0 !important;
  padding-inline: 6px 12px !important;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.15s;
}
.vchip:hover:not(.v-chip--disabled) {
  transform: translateY(-1px);
}
.vchip:active:not(.v-chip--disabled) {
  transform: translateY(0);
}
.vchip--on {
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.35);
}
.vchip__pos {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
  background: rgba(var(--v-theme-primary), 0.16);
  color: rgb(var(--v-theme-primary));
}
.vchip--on .vchip__pos {
  background: rgba(255, 255, 255, 0.28);
  color: inherit;
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

/* ---------- ticket ---------- */
.vticket {
  padding: 10px 12px;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.03);
}
.vticket__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
}
.vticket__otp {
  display: flex;
  gap: 6px;
}
.vticket__box {
  width: 38px;
  height: 44px;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.vticket__box:hover:not(:disabled) {
  border-color: rgba(var(--v-theme-primary), 0.6);
}
.vticket__box:focus {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.25);
}
.vticket__box--filled {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.5);
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
  gap: 4px;
  margin-top: 6px;
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
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

/* ---------- side cards ---------- */
.vside {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (min-width: 960px) {
  .vside {
    position: sticky;
    top: 0;
  }
}
.vcard {
  padding: 12px;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
}
.vcard__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
}
.vlines {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vline {
  display: flex;
  align-items: center;
  gap: 6px;
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
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
}
.vempty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: thin dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.vmethods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.vbrand {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 8px 12px;
  background: #fff;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    transform 0.1s;
}
.vbrand:hover:not(:disabled) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.vbrand:active:not(:disabled) {
  transform: translateY(1px);
}
.vbrand:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.vbrand:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.vbrand__img {
  max-width: 100%;
  max-height: 32px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
.vtrust {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* ---------- mobile: chips drop under the index/cost line ---------- */
@media (max-width: 600px) {
  .vrow {
    grid-template-columns: 28px 1fr auto;
    grid-template-areas:
      "idx . side"
      "chips chips chips";
    row-gap: 6px;
    padding: 8px 10px;
  }
  .vrow__idx {
    grid-area: idx;
  }
  .vrow__side {
    grid-area: side;
  }
  .vrow__chips {
    grid-area: chips;
  }
  .vrow__cost {
    min-width: 0;
  }
  .vticket__box {
    width: 32px;
    height: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .vrow,
  .vrow__idx,
  .vchip,
  .vbrand,
  .vticket__box {
    transition: none;
  }
}
</style>
