<!-- components/payments/PayPalPayment.vue -->
<template>
  <v-card variant="outlined" class="pa-4">
    <v-card-text>
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular
          indeterminate
          color="#092457"
          size="32"
          width="3"
        />
        <p class="text-caption text-medium-emphasis">Loading PayPal…</p>
      </div>

      <div
        id="paypal-button-container"
        class="mt-2"
        :class="{ 'opacity-50': loading }"
      />

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="statusMessage"
        :type="statusType"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ statusMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { usePaymentStore, type CreatePaymentInput } from "@/stores/payments";

const props = withDefaults(
  defineProps<{
    mode?: "plan" | "voucher";
    amount?: number;
    planId?: string;
    successUrl?: string;
    cancelUrl?: string;
    voucherOrder?: Omit<
      CreatePaymentInput,
      "currency" | "successUrl" | "cancelUrl"
    > | null;
    currency?: "USD" | "KES" | "EUR";
    /** 👇 NEW: real payer from the parent dialog */
    payer?: { name: string; email: string; phone?: string };
  }>(),
  {
    mode: "plan",
    amount: 0,
    planId: "STARTER",
    successUrl: "/payment/success",
    cancelUrl: "/payment/cancel",
    voucherOrder: null,
    currency: "USD",
    payer: undefined,
  },
);

const emit = defineEmits<{
  (e: "payment-success", data: any): void;
  (e: "payment-error", error: string): void;
  (e: "payment-initiated"): void;
}>();

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const payments = usePaymentStore();

const loading = ref(true);
const errorMessage = ref<string | null>(null);
const statusMessage = ref("");
const statusType = ref<"info" | "success" | "error" | "warning">("info");

let buttonsInstance: any = null;
let paymentProcessed = false;

const isVoucher = computed(() => props.mode === "voucher");

const setStatus = (
  msg: string,
  type: "info" | "success" | "error" | "warning" = "info",
) => {
  statusMessage.value = msg;
  statusType.value = type;
};

const ensureSdk = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if ((window as any).paypal) return resolve((window as any).paypal);

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paypal-sdk="1"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).paypal));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load PayPal SDK")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "1";
    script.onload = () => resolve((window as any).paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });

const renderButtons = async () => {
  loading.value = true;
  errorMessage.value = null;
  setStatus("");

  try {
    const paypal = await ensureSdk();
    if (!paypal) throw new Error("PayPal SDK unavailable");

    const config: any = {
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
        height: 45,
        tagline: false,
      },
      onInit: () => {
        loading.value = false;
        emit("payment-initiated");
      },
      onCancel: () => {
        paymentProcessed = false;
        setStatus("Payment cancelled", "warning");
        emit("payment-error", "Payment cancelled by user");
      },
      onError: (err: any) => {
        paymentProcessed = false;
        errorMessage.value = err?.message ?? "Unknown PayPal error";
        setStatus(errorMessage.value!, "error");
        emit("payment-error", errorMessage.value!);
      },
    };

    if (isVoucher.value) {
      /* -------- voucher mode -------- */
      config.createOrder = async () => {
        if (!props.voucherOrder)
          throw new Error("voucherOrder is required in voucher mode");

        const created = await payments.createPaypal({
          ...props.voucherOrder,
          currency: props.currency,
          successUrl: props.successUrl,
          cancelUrl: props.cancelUrl,
          payer: {
            name:
              props.payer?.name?.trim() ||
              props.voucherOrder.payer?.name ||
              "Customer",
            email:
              props.payer?.email?.trim() ||
              props.voucherOrder.payer?.email ||
              "customer@example.com",
            ...(props.payer?.phone || props.voucherOrder.payer?.phone
              ? { phone: props.payer?.phone || props.voucherOrder.payer?.phone }
              : {}),
          },
        });
        if (!created.checkoutReference)
          throw new Error("Server did not return a PayPal order id");
        setStatus(created.providerMessage ?? "Redirecting to PayPal…", "info");
        return created.checkoutReference;
      };

      config.onApprove = async (data: any) => {
        if (paymentProcessed) return;
        paymentProcessed = true;
        try {
          if (!payments.current?.id)
            throw new Error("No voucher payment on file");
          setStatus("Payment approved — issuing vouchers…", "info");
          const issued = await payments.confirm({
            paymentId: payments.current.id,
            channel: "PAYPAL",
            externalId: data.orderID,
            providerStatus: "COMPLETED",
            rawPayload: data,
          });
          setStatus(
            issued.emailSent
              ? "Vouchers emailed to your inbox."
              : "Payment captured — email will follow shortly.",
            "success",
          );
          emit("payment-success", {
            ...issued,
            provider: "PAYPAL",
            orderId: data.orderID,
          });
        } catch (e: any) {
          paymentProcessed = false;
          errorMessage.value = e?.message ?? "Payment failed";
          setStatus(errorMessage.value!, "error");
          emit("payment-error", errorMessage.value!);
        }
      };
    } else {
      /* -------- plan mode -------- */
      config.createOrder = async (_d: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: (props.amount ?? 0).toString(),
              },
              description: `tukema ${props.planId} Plan`,
            },
          ],
          application_context: { shipping_preference: "NO_SHIPPING" },
        });
      };

      config.onApprove = async (data: any, actions: any) => {
        if (paymentProcessed) return;
        paymentProcessed = true;
        try {
          setStatus("Processing payment…", "info");
          const details = await actions.order.capture();
          // Plan mode not supported in this build
          throw new Error("Plan mode is not supported in this context.");
        } catch (e: any) {
          paymentProcessed = false;
          errorMessage.value = e?.message ?? "Payment failed";
          setStatus(errorMessage.value!, "error");
          emit("payment-error", errorMessage.value!);
        }
      };
    }

    buttonsInstance = paypal.Buttons(config);
    const container = document.getElementById("paypal-button-container");
    if (!container) throw new Error("PayPal container not found");
    container.innerHTML = "";
    await buttonsInstance.render(container);
  } catch (e: any) {
    loading.value = false;
    errorMessage.value = e?.message ?? "Failed to initialise PayPal";
    emit("payment-error", errorMessage.value!);
  }
};

watch(
  () => [props.amount, props.planId, props.voucherOrder, props.currency],
  () => {
    if (isVoucher.value && props.voucherOrder) void renderButtons();
    else if (!isVoucher.value && (props.amount ?? 0) > 0) void renderButtons();
  },
);

onMounted(() => {
  void renderButtons();
});

onBeforeUnmount(() => {
  try {
    buttonsInstance?.close?.();
  } catch {
    /* ignore */
  }
  buttonsInstance = null;
  paymentProcessed = false;
  const container = document.getElementById("paypal-button-container");
  if (container) container.innerHTML = "";
});
</script>

<style scoped>
#paypal-button-container {
  min-height: 45px;
  transition: opacity 0.3s ease;
}
.opacity-50 {
  opacity: 0.5;
}
:deep(.paypal-buttons) {
  position: relative;
  z-index: 1;
}
#paypal-button-container:empty::after {
  content: "Loading payment options…";
  display: block;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  padding: 12px 0;
}
</style>
