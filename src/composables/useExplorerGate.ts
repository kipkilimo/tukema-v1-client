import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVoucherStore } from "@/stores/vouchers";

const TOKEN_RE = /(?<!\d)\d{7}(?!\d)/;

export type GateState =
  | { kind: "validating" }
  | { kind: "unlocked"; code: string | null }
  | { kind: "invalid"; code: string | null; message: string; reason: string };

export function useExplorerGate() {
  const route = useRoute();
  const router = useRouter();
  const voucher = useVoucherStore();

  const restored = voucher.restore();
  const initial: GateState = restored
    ? { kind: "unlocked", code: voucher.code }
    : { kind: "validating" };

  const gate = ref<GateState>(initial);
  const accessGranted = computed(() => gate.value.kind === "unlocked");

  function readToken() {
    const q = route.query.tokenKey;
    const raw = (Array.isArray(q) ? q[0] : q)?.toString().trim() ?? "";
    return { raw, code: raw.match(TOKEN_RE)?.[0] ?? null };
  }

  function stripToken() {
    if (!("tokenKey" in route.query)) return;
    const { tokenKey: _drop, ...rest } = route.query;
    void router.replace({ query: rest });
  }

  let inflight: Promise<void> | null = null;

  async function runGate(): Promise<void> {
    if (inflight) return inflight;

    inflight = (async () => {
      const { raw, code } = readToken();

      if (!raw && voucher.isRedeemed) {
        gate.value = { kind: "unlocked", code: voucher.code };
        return;
      }

      if (!raw) {
        gate.value = {
          kind: "invalid",
          code: null,
          message: "A valid Tukema access token is required.",
          reason: "no-token",
        };
        return;
      }

      if (!code) {
        gate.value = {
          kind: "invalid",
          code: raw,
          message:
            "Voucher code should be 7 digits. Scan the QR code again or enter the code from your email.",
          reason: "malformed",
        };
        return;
      }

      if (voucher.isRedeemed && voucher.code === code) {
        stripToken();
        gate.value = { kind: "unlocked", code };
        return;
      }

      gate.value = { kind: "validating" };
      voucher.error = null;
      const res = await voucher.redeem(code);

      if (res.success) {
        stripToken();
        gate.value = { kind: "unlocked", code };
      } else {
        gate.value = {
          kind: "invalid",
          code,
          message: res.message ?? "This voucher could not be redeemed.",
          reason: res.reason ?? "redeem-failed",
        };
      }
    })().finally(() => {
      inflight = null;
    });

    return inflight;
  }

  async function unlockWith(code: string): Promise<boolean> {
    gate.value = { kind: "validating" };
    const res = await voucher.redeem(code);
    if (res.success) {
      gate.value = { kind: "unlocked", code };
      return true;
    }
    gate.value = {
      kind: "invalid",
      code,
      message: res.message ?? "This voucher could not be redeemed.",
      reason: res.reason ?? "redeem-failed",
    };
    return false;
  }

  void runGate();

  watch(
    () => route.query.tokenKey,
    (next, prev) => {
      if (next && next !== prev) void runGate();
    },
  );

  return { gate, accessGranted, runGate, unlockWith };
}
