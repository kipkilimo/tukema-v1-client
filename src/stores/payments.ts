// stores/payments.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { gql } from "graphql-tag";
import { apolloClient } from "@/graphql/apolloClient";

/* ================================================================== */
/* GraphQL                                                            */
/* ================================================================== */

const CREATE_PAYPAL_PAYMENT = gql`
  mutation CreatePaypalPayment($input: CreatePaymentInput!) {
    createPaypalPayment(input: $input) {
      id
      status
      channel
      currency
      amount
      amountCaptured
      batchId
      checkoutUrl
      checkoutReference
      providerMessage
      payer {
        name
        email
        phone
      }
    }
  }
`;

const CREATE_MPESA_PAYMENT = gql`
  mutation CreateMpesaPayment($input: CreatePaymentInput!) {
    createMpesaPayment(input: $input) {
      id
      status
      channel
      currency
      amount
      amountCaptured
      batchId
      checkoutReference
      providerMessage
      payer {
        name
        email
        phone
      }
    }
  }
`;

const CONFIRM_VOUCHER_PAYMENT = gql`
  mutation ConfirmVoucherPayment($input: ConfirmVoucherPaymentInput!) {
    confirmVoucherPayment(input: $input) {
      paymentId
      batchId
      totalVouchers
      totalSheets
      totalCost
      currency
      pdfs {
        sheetIndex
        filename
      }
      emailSent
      emailMessage
    }
  }
`;

const CANCEL_VOUCHER_ORDER = gql`
  mutation CancelVoucherOrder($paymentId: ID!) {
    cancelVoucherOrder(paymentId: $paymentId) {
      id
      status
    }
  }
`;

const PAYMENT_BY_ID = gql`
  query PaymentById($id: ID!) {
    payment(id: $id) {
      id
      status
      channel
      currency
      amount
      amountCaptured
      batchId
      checkoutUrl
      checkoutReference
      providerMessage
      paidAt
      failedAt
      cancelledAt
      payer {
        name
        email
        phone
      }
    }
  }
`;

/**
 * Server-side `checkPayment` triggers late dispatch when it sees a paid
 * payment without a batch. The client polls this query — not just a
 * PAYMENT_BY_ID query — so a stuck-at-paid payment gets recovered on the
 * next tick.
 */
const CHECK_PAYMENT = gql`
  query CheckPayment($paymentId: ID!) {
    checkPayment(paymentId: $paymentId) {
      status
      completed
      fulfilled
      fulfillmentState
      retryAfterMs
      payment {
        id
        status
        channel
        currency
        amount
        amountCaptured
        batchId
        checkoutUrl
        checkoutReference
        providerMessage
        paidAt
        failedAt
        cancelledAt
        payer {
          name
          email
          phone
        }
      }
    }
  }
`;

const MY_PAYMENTS = gql`
  query MyPayments($status: PaymentStatus, $limit: Int, $offset: Int) {
    myPayments(status: $status, limit: $limit, offset: $offset) {
      id
      status
      channel
      currency
      amount
      batchId
      paidAt
      createdAt
    }
  }
`;

/* ================================================================== */
/* Types                                                              */
/* ================================================================== */

export type Currency = "KES" | "USD" | "EUR";
export type PaymentChannel =
  "PAYPAL" | "PESAPAL" | "MPESA" | "STRIPE" | "MANUAL";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";
export type PlaceLabel = "A" | "B" | "C" | "D" | "E";

export interface VoucherSlotInput {
  sheetIndex: number;
  rowIndex: number;
  placeLabel: PlaceLabel;
  isImpression?: boolean;
}

export interface PayerInput {
  name: string;
  email: string;
  phone?: string;
  country?: string;
}

export interface CreatePaymentInput {
  currency: Currency;
  unitPriceCents: number;
  slots: VoucherSlotInput[];
  payer: PayerInput;
  idempotencyKey?: string;
  description?: string;
  metadata?: Record<string, any>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentRecord {
  id: string;
  status: PaymentStatus;
  channel: PaymentChannel;
  currency: string;
  amount: number;
  amountCaptured: number;
  batchId?: string | null;
  checkoutUrl?: string | null;
  checkoutReference?: string | null;
  providerMessage?: string | null;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  payer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface IssueVouchersResult {
  paymentId: string;
  batchId: string;
  totalVouchers: number;
  totalSheets: number;
  totalCost: number;
  currency: string;
  pdfs: { sheetIndex: number; filename: string }[];
  emailSent: boolean;
  emailMessage: string | null;
}

export interface CheckPaymentResult {
  status: PaymentStatus;
  completed: boolean;
  fulfilled: boolean;
  fulfillmentState: string | null;
  retryAfterMs?: number | null;
  payment?: PaymentRecord | null;
}

/**
 * Metadata passed to the `onTick` callback on every poll iteration so the
 * UI can reflect the *exact* stage (e.g. "paid but batch not yet linked")
 * instead of guessing from a raw attempt count.
 */
export interface PollTickMeta {
  /** Server-suggested delay before the next check (ms). */
  retryAfterMs: number | null;
  /** True when the payment is PAID but the voucher batch isn't linked yet. */
  batchWait: boolean;
  /** True when we've already called confirm() for this payment. */
  confirmed: boolean;
  /** How many batch-wait ticks have elapsed (only meaningful when batchWait). */
  batchWaitAttempts: number;
}

export interface PollMpesaArgs {
  paymentId: string;
  intervalMs?: number;
  maxAttempts?: number;
  onTick?: (p: PaymentRecord, attempt: number, meta: PollTickMeta) => void;
}

/* ================================================================== */
/* Store                                                              */
/* ================================================================== */

export const usePaymentStore = defineStore("payments", () => {
  const current = ref<PaymentRecord | null>(null);
  const lastIssued = ref<IssueVouchersResult | null>(null);
  const creating = ref(false);
  const confirming = ref(false);
  const polling = ref(false);
  const error = ref<string | null>(null);

  const isPaid = computed(() => current.value?.status === "paid");
  const isSettled = computed(() => {
    const s = current.value?.status;
    return s === "paid" || s === "failed" || s === "cancelled";
  });
  const vouchersIssued = computed(
    () => lastIssued.value !== null && lastIssued.value.emailSent === true,
  );

  function clearError() {
    error.value = null;
  }

  function reset() {
    current.value = null;
    lastIssued.value = null;
    creating.value = false;
    confirming.value = false;
    polling.value = false;
    error.value = null;
  }

  /* -------- create -------- */
  async function createPaypal(
    input: CreatePaymentInput,
  ): Promise<PaymentRecord> {
    creating.value = true;
    error.value = null;
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PAYPAL_PAYMENT,
        variables: { input },
        fetchPolicy: "no-cache",
      });
      const p = data?.createPaypalPayment as PaymentRecord | undefined;
      if (!p) throw new Error("PayPal order was not created");
      current.value = p;
      return p;
    } catch (e: any) {
      error.value = e?.message ?? "PayPal order failed";
      throw e;
    } finally {
      creating.value = false;
    }
  }

  async function createMpesa(
    input: CreatePaymentInput,
  ): Promise<PaymentRecord> {
    creating.value = true;
    error.value = null;
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_MPESA_PAYMENT,
        variables: { input },
        fetchPolicy: "no-cache",
      });
      const p = data?.createMpesaPayment as PaymentRecord | undefined;
      if (!p) throw new Error("M-PESA order was not created");
      current.value = p;
      return p;
    } catch (e: any) {
      error.value = e?.message ?? "M-PESA order failed";
      throw e;
    } finally {
      creating.value = false;
    }
  }

  /* -------- confirm -------- */
  async function confirm(args: {
    paymentId: string;
    channel: PaymentChannel;
    externalId?: string;
    receiptNumber?: string;
    providerStatus?: string;
    rawPayload?: any;
  }): Promise<IssueVouchersResult> {
    confirming.value = true;
    error.value = null;
    try {
      const { data } = await apolloClient.mutate({
        mutation: CONFIRM_VOUCHER_PAYMENT,
        variables: {
          input: {
            paymentId: args.paymentId,
            channel: args.channel,
            externalId: args.externalId ?? null,
            receiptNumber: args.receiptNumber ?? null,
            providerStatus: args.providerStatus ?? null,
            rawPayload: args.rawPayload ?? null,
          },
        },
        fetchPolicy: "no-cache",
      });
      const res = data?.confirmVoucherPayment as
        IssueVouchersResult | undefined;
      if (!res) throw new Error("Confirmation failed");
      lastIssued.value = res;
      if (current.value && current.value.id === res.paymentId) {
        current.value = {
          ...current.value,
          status: res.emailSent ? "paid" : "processing",
          batchId: res.batchId,
        };
      }
      return res;
    } catch (e: any) {
      error.value = e?.message ?? "Confirmation failed";
      throw e;
    } finally {
      confirming.value = false;
    }
  }

  /* -------- check (single tick, uses server's late-dispatch path) -------- */
  async function checkOnce(paymentId: string): Promise<CheckPaymentResult> {
    const { data } = await apolloClient.query({
      query: CHECK_PAYMENT,
      variables: { paymentId },
      fetchPolicy: "network-only",
    });
    const res = data?.checkPayment as CheckPaymentResult | undefined;
    if (!res) throw new Error("checkPayment returned no result");
    if (res.payment) current.value = res.payment;
    return res;
  }

  /* -------- poll M-PESA settlement (WAITS for batchId) -------- */
  async function pollMpesaUntilSettled(
    args: PollMpesaArgs,
  ): Promise<PaymentRecord> {
    // 30 attempts × 4s ≈ 120s. The server awaits the full dispatch
    // (poll → paid → PDFs → email → persist) inside createMpesaPayment
    // and inside checkPayment. That can take 40–80s when the render + email
    // pipeline runs. Give it enough headroom.
    const intervalMs = args.intervalMs ?? 4000;
    const maxAttempts = args.maxAttempts ?? 30;
    const batchWaitLimit = 20; // ~40s at 2s per retry
    polling.value = true;
    let confirmed = false;
    let batchWaitAttempts = 0;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Ask the SERVER — checkPayment triggers late dispatch when it sees
        // paid-with-no-batch, so a stuck payment recovers on the next tick.
        const res = await checkOnce(args.paymentId);
        const p = res.payment;
        if (!p) throw new Error("Payment not found");

        current.value = p;
        args.onTick?.(p, attempt, {
          retryAfterMs: res.retryAfterMs ?? null,
          batchWait: p.status === "paid" && !p.batchId,
          confirmed,
          batchWaitAttempts,
        });

        // ---------- TERMINAL: PAID ----------
        if (p.status === "paid") {
          // Server already dispatched → return immediately
          if (p.batchId || res.fulfilled) {
            if (!confirmed) {
              confirmed = true;
              try {
                await confirm({
                  paymentId: p.id,
                  channel: "MPESA",
                  externalId: p.checkoutReference ?? undefined,
                  providerStatus: "COMPLETED",
                });
              } catch {
                /* confirm is idempotent — safe to ignore here */
              }
            }
            return current.value!;
          }

          // Paid but no batch yet — server is mid-dispatch. Keep waiting.
          if (!confirmed) {
            confirmed = true;
            try {
              await confirm({
                paymentId: p.id,
                channel: "MPESA",
                externalId: p.checkoutReference ?? undefined,
                providerStatus: "COMPLETED",
              });
            } catch {
              /* fall through to wait loop */
            }
          }

          batchWaitAttempts++;
          // Give the server up to ~40s to finish dispatch and link batchId.
          if (batchWaitAttempts >= batchWaitLimit) {
            throw new Error(
              "Payment received — vouchers are still being compiled. Check your email in a moment.",
            );
          }
          await new Promise((r) => setTimeout(r, res.retryAfterMs ?? 2000));
          attempt--; // don't consume the main poll slot
          continue;
        }

        // ---------- TERMINAL: FAILED / CANCELLED ----------
        if (p.status === "failed" || p.status === "cancelled") return p;

        // ---------- PENDING — keep waiting ----------
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, intervalMs));
        }
      }

      throw new Error(
        "M-PESA payment is still pending after the polling window. " +
          "Check your M-PESA statement or contact support.",
      );
    } finally {
      polling.value = false;
    }
  }

  /* -------- cancel / refresh / history -------- */
  async function cancel(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CANCEL_VOUCHER_ORDER,
        variables: { paymentId },
        fetchPolicy: "no-cache",
      });
      const p = data?.cancelVoucherOrder as
        Pick<PaymentRecord, "id" | "status"> | undefined;
      if (p && current.value?.id === p.id) {
        current.value = { ...current.value, status: p.status };
      }
      return (p as PaymentRecord) ?? null;
    } catch (e: any) {
      error.value = e?.message ?? "Cancel failed";
      return null;
    }
  }

  async function refresh(paymentId: string): Promise<PaymentRecord> {
    const { data } = await apolloClient.query({
      query: PAYMENT_BY_ID,
      variables: { id: paymentId },
      fetchPolicy: "network-only",
    });
    const p = data?.payment as PaymentRecord | undefined;
    if (!p) throw new Error("Payment not found");
    current.value = p;
    return p;
  }

  async function myPayments(
    status?: PaymentStatus,
    limit = 20,
    offset = 0,
  ): Promise<PaymentRecord[]> {
    const { data } = await apolloClient.query({
      query: MY_PAYMENTS,
      variables: { status, limit, offset },
      fetchPolicy: "network-only",
    });
    return (data?.myPayments ?? []) as PaymentRecord[];
  }

  return {
    current,
    lastIssued,
    creating,
    confirming,
    polling,
    error,
    isPaid,
    isSettled,
    vouchersIssued,
    createPaypal,
    createMpesa,
    confirm,
    checkOnce,
    pollMpesaUntilSettled,
    cancel,
    refresh,
    myPayments,
    clearError,
    reset,
  };
});
