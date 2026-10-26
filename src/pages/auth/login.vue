<template>
  <v-card class="login-card" elevation="0" rounded="lg">
    <!-- Header -->
    <v-card-text class="px-4 px-sm-6 pt-4 pt-sm-6 pb-1">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h4 class="text-subtitle-1 font-weight-bold" style="color: #1a5276">
            Welcome Back to tukema
          </h4>
          <div class="text-caption" style="font-size: 10px; color: #5d6d7e">
            Culture • Heritage • Posterity
          </div>
        </div>
      </div>
      <v-divider class="mt-2" color="#2e86c1" />
    </v-card-text>

    <!-- Form -->
    <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          variant="outlined"
          prepend-inner-icon="mdi-email"
          :disabled="loading"
          :error-messages="emailError"
          autofocus
          density="compact"
          class="mb-2"
          hide-details="auto"
          color="#1a5276"
          autocomplete="email"
          @update:model-value="clearEmailError"
        />

        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          variant="outlined"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :disabled="loading"
          :error-messages="passwordError"
          density="compact"
          class="mb-1"
          hide-details="auto"
          color="#1a5276"
          autocomplete="current-password"
          @click:append-inner="togglePasswordVisibility"
          @update:model-value="clearPasswordError"
        />

        <div class="text-right mt-0">
          <v-btn
            variant="text"
            size="x-small"
            color="#1a5276"
            class="pa-0"
            :disabled="loading"
            @click="forgotPassword"
          >
            Forgot password?
          </v-btn>
        </div>

        <div class="mt-1">
          <v-checkbox
            v-model="rememberMe"
            label="Remember me"
            hide-details
            density="compact"
            class="mt-0"
            color="#1a5276"
            :disabled="loading"
          />
        </div>

        <v-divider class="my-3" color="#d4e6f1" />

        <div class="d-flex align-center justify-space-between ga-2">
          <v-btn
            type="submit"
            color="#1a5276"
            variant="elevated"
            :loading="loading"
            :disabled="!canSubmit"
            size="small"
            min-width="130"
          >
            <v-icon start size="16">mdi-login</v-icon>
            Sign In
          </v-btn>

          <v-btn
            to="/auth/register"
            variant="text"
            color="#1a5276"
            size="small"
            :disabled="loading"
          >
            <v-icon size="16">mdi-account-plus</v-icon>
            <span class="d-none d-sm-inline ml-1 text-caption">Register</span>
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <!-- Footer -->
    <v-card-actions class="px-4 px-sm-6 pb-4 pt-0">
      <div class="w-100">
        <v-divider class="mb-3" color="#d4e6f1" />
        <div class="text-caption" style="color: #5d6d7e; font-size: 10px">
          Secure sign-in powered by tukema
        </div>
      </div>
    </v-card-actions>
  </v-card>

  <!-- Snackbar -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top end"
    variant="flat"
    elevation="6"
    rounded="lg"
    class="mt-4"
  >
    <div class="d-flex align-center">
      <v-icon :color="snackbar.iconColor" size="24" class="mr-3">
        {{ snackbar.icon }}
      </v-icon>

      <div>
        <div v-if="snackbar.title" class="text-subtitle-2 font-weight-bold">
          {{ snackbar.title }}
        </div>
        <div class="text-body-2">{{ snackbar.message }}</div>
      </div>
    </div>

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        :color="snackbar.iconColor"
        aria-label="Close notification"
        @click="snackbar.show = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/users";

// ============================================================
// SETUP
// ============================================================
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// ============================================================
// STATE
// ============================================================
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const showPassword = ref(false);

const emailError = ref("");
const passwordError = ref("");

let passwordHideTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================================
// SNACKBAR
// ============================================================
type SnackbarType = "success" | "error" | "info" | "warning";

interface SnackbarState {
  show: boolean;
  message: string;
  title: string;
  color: string;
  icon: string;
  iconColor: string;
  timeout: number;
}

const snackbar = ref<SnackbarState>({
  show: false,
  message: "",
  title: "",
  color: "error",
  icon: "mdi-alert-circle",
  iconColor: "error",
  timeout: 5000,
});

const snackbarConfigs: Record<
  SnackbarType,
  { color: string; icon: string; iconColor: string }
> = {
  success: { color: "success", icon: "mdi-check-circle", iconColor: "success" },
  error: { color: "error", icon: "mdi-alert-circle", iconColor: "error" },
  info: { color: "info", icon: "mdi-information", iconColor: "info" },
  warning: { color: "warning", icon: "mdi-alert", iconColor: "warning" },
};

const showSnackbar = (
  type: SnackbarType,
  message: string,
  title = "",
  timeout = 5000,
): void => {
  const config = snackbarConfigs[type];

  // Force a close-then-open transition so a new snackbar is
  // always shown, even if one is currently visible.
  snackbar.value = { ...snackbar.value, show: false };

  requestAnimationFrame(() => {
    snackbar.value = {
      show: true,
      message,
      title,
      ...config,
      timeout,
    };
  });
};

// ============================================================
// VALIDATION
// ============================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isEmailValid = computed(() => EMAIL_RE.test(email.value.trim()));
const isPasswordValid = computed(
  () => password.value.length >= MIN_PASSWORD_LENGTH,
);
const canSubmit = computed(
  () => isEmailValid.value && isPasswordValid.value && !loading.value,
);

const clearEmailError = (): void => {
  emailError.value = "";
};
const clearPasswordError = (): void => {
  passwordError.value = "";
};

// ============================================================
// PASSWORD VISIBILITY (auto-hide after 5s)
// ============================================================
const clearPasswordHideTimer = (): void => {
  if (passwordHideTimer !== null) {
    clearTimeout(passwordHideTimer);
    passwordHideTimer = null;
  }
};

const togglePasswordVisibility = (): void => {
  clearPasswordHideTimer();
  showPassword.value = !showPassword.value;

  if (showPassword.value) {
    passwordHideTimer = setTimeout(() => {
      showPassword.value = false;
      passwordHideTimer = null;
    }, 5000);
  }
};

// ============================================================
// ERROR EXTRACTION & CLASSIFICATION
// ============================================================
interface GraphQLErrorLike {
  message?: string;
  path?: Array<string | number>;
  code?: string;
  extensions?: { code?: string; [k: string]: unknown };
}

interface ApolloErrorLike {
  message?: string;
  graphQLErrors?: GraphQLErrorLike[];
  errors?: GraphQLErrorLike[];
  networkError?: {
    message?: string;
    statusCode?: number;
    status?: number;
    result?: { errors?: GraphQLErrorLike[] };
  } | null;
  cause?: unknown;
  code?: string;
  path?: Array<string | number>;
  extensions?: { code?: string; [k: string]: unknown };
}

interface ErrorDetails {
  message: string;
  code: string;
  status: number | null;
  isNetwork: boolean;
}

/** Messages that carry no useful information on their own. */
const GENERIC_MESSAGES = new Set([
  "login failed",
  "unable to sign in",
  "error",
]);

const isGeneric = (msg: string): boolean =>
  !msg || GENERIC_MESSAGES.has(msg.toLowerCase());

/** Walks the error (and its causes) to collect the most specific details. */
const extractDetails = (error: unknown, depth = 0): ErrorDetails => {
  const empty: ErrorDetails = {
    message: "",
    code: "",
    status: null,
    isNetwork: false,
  };
  if (!error || typeof error !== "object" || depth > 4) return empty;

  const e = error as ApolloErrorLike;
  const details: ErrorDetails = { ...empty };

  // 1. GraphQL errors (Apollo arrays, or errors tucked inside a networkError result)
  const gqlErrors = [
    ...(Array.isArray(e.graphQLErrors) ? e.graphQLErrors : []),
    ...(Array.isArray(e.errors) ? e.errors : []),
    ...(Array.isArray(e.networkError?.result?.errors)
      ? (e.networkError?.result?.errors as GraphQLErrorLike[])
      : []),
  ];
  const first = gqlErrors.find(
    (g) => typeof g?.message === "string" && g.message.trim(),
  );
  if (first) {
    details.message = first.message!.trim();
    details.code = first.extensions?.code ?? first.code ?? "";
  }

  // 2. Bare GraphQL error object:
  //    { message: "Invalid credentials", path: ["login"], code: "..." }
  if (
    !details.message &&
    typeof e.message === "string" &&
    e.message.trim() &&
    (Array.isArray(e.path) || e.code || e.extensions?.code)
  ) {
    details.message = e.message.trim();
    details.code = e.extensions?.code ?? e.code ?? "";
  }

  // 3. Network / HTTP status
  if (e.networkError) {
    details.status = e.networkError.statusCode ?? e.networkError.status ?? null;
    details.isNetwork = details.status === null;
  }

  // 4. Nested cause: prefer it when we only have a generic message so far
  if (e.cause && e.cause !== error) {
    const nested = extractDetails(e.cause, depth + 1);
    if (nested.message && isGeneric(details.message)) {
      details.message = nested.message;
      details.code = nested.code || details.code;
    }
    details.status ??= nested.status;
    details.isNetwork ||= nested.isNetwork;
  }

  // 5. Plain Error message (last resort)
  if (!details.message && typeof e.message === "string" && e.message.trim()) {
    details.message = e.message.trim();
  }

  if (
    /failed to fetch|network ?error|network request failed|load failed/i.test(
      details.message,
    )
  ) {
    details.isNetwork = true;
  }

  return details;
};

type FailureKind =
  | "credentials"
  | "not_found"
  | "disabled"
  | "unverified"
  | "rate_limit"
  | "session"
  | "network"
  | "server"
  | "unknown";

interface Failure {
  kind: FailureKind;
  type: SnackbarType;
  title: string;
  message: string;
  field?: "email" | "password";
  fieldMessage?: string;
}

/**
 * Message-first classification. The server's error code is unreliable
 * (bad credentials currently arrive as INTERNAL_SERVER_ERROR), so we
 * match on the message and only use the code as a secondary signal.
 */
const classify = (d: ErrorDetails): Failure => {
  const msg = d.message.toLowerCase();

  if (d.isNetwork) {
    return {
      kind: "network",
      type: "error",
      title: "Connection Problem",
      message:
        "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  if (d.status === 429 || /too many|rate limit/.test(msg)) {
    return {
      kind: "rate_limit",
      type: "warning",
      title: "Too Many Attempts",
      message:
        "You've tried to sign in too many times. Please wait a few minutes and try again.",
    };
  }

  if (
    /not (yet )?verified|unverified|verify your email|confirm your email/.test(
      msg,
    )
  ) {
    return {
      kind: "unverified",
      type: "warning",
      title: "Email Not Verified",
      message:
        "Please verify your email address using the link we sent you, then sign in.",
      field: "email",
      fieldMessage: "Email address not verified.",
    };
  }

  if (
    /deactivat|disabled|suspended|locked|banned|blocked/.test(msg) ||
    d.code === "FORBIDDEN"
  ) {
    return {
      kind: "disabled",
      type: "error",
      title: "Account Unavailable",
      message:
        "This account is deactivated or locked. Contact the administrator to restore access.",
    };
  }

  if (
    /user not found|account not found|no (user|account)|does not exist/.test(
      msg,
    )
  ) {
    return {
      kind: "not_found",
      type: "error",
      title: "Account Not Found",
      message:
        "No account exists for that email address. Check the spelling or register a new account.",
      field: "email",
      fieldMessage: "No account found for this email.",
    };
  }

  if (
    /invalid (credentials|email or password|login|password)|incorrect (password|email)|wrong (password|credentials)|bad credentials/.test(
      msg,
    ) ||
    d.code === "UNAUTHENTICATED"
  ) {
    return {
      kind: "credentials",
      type: "error",
      title: "Incorrect Email or Password",
      message:
        "The email or password you entered doesn't match our records. Check them and try again, or use “Forgot password?”.",
      field: "password",
      fieldMessage: "Incorrect email or password.",
    };
  }

  if (d.status === 401 || d.status === 403) {
    return {
      kind: "session",
      type: "error",
      title: "Session Expired",
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (
    (d.status && d.status >= 500) ||
    /internal server error|internal_server_error/.test(msg)
  ) {
    return {
      kind: "server",
      type: "error",
      title: "Server Error",
      message:
        "Something went wrong on our side while signing you in. Please try again shortly.",
    };
  }

  // The server sent something specific we don't recognise:
  // show it, unless it's a bare code or a generic message.
  const isCodeLike = /^[A-Z_]+$/.test(d.message);
  if (d.message && !isCodeLike && !isGeneric(d.message)) {
    return {
      kind: "unknown",
      type: "error",
      title: "Sign-In Failed",
      message: d.message,
    };
  }

  return {
    kind: "unknown",
    type: "error",
    title: "Sign-In Failed",
    message: "We couldn't sign you in. Please check your details and try again.",
  };
};

const handleError = (error: unknown): Failure => {
  const details = extractDetails(error);
  const storeMsg =
    typeof userStore.error === "string" ? userStore.error.trim() : "";

  // If the error carried nothing specific, fall back to the store's message.
  if (isGeneric(details.message) && storeMsg && !isGeneric(storeMsg)) {
    details.message = storeMsg;
  }

  const failure = classify(details);

  console.error("[Login] Authentication failed:", {
    kind: failure.kind,
    details,
    storeError: storeMsg || null,
    raw: error,
  });

  // Inline field feedback alongside the snackbar.
  if (failure.field === "email") emailError.value = failure.fieldMessage ?? "";
  if (failure.field === "password") {
    passwordError.value = failure.fieldMessage ?? "";
  }

  showSnackbar(failure.type, failure.message, failure.title, 7000);
  return failure;
};

// ============================================================
// REDIRECT SAFETY
// ============================================================
const getRedirectPath = (): string => {
  const requested = route.query.redirect;

  if (
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.startsWith("/\\")
  ) {
    return requested;
  }
  return "/dashboard";
};

// ============================================================
// SUBMIT
// ============================================================
const handleSubmit = async (): Promise<void> => {
  if (loading.value) return;

  if (!isEmailValid.value) {
    emailError.value = "Enter a valid email address.";
    showSnackbar(
      "warning",
      "Please enter a valid email address.",
      "Validation Error",
      4000,
    );
    return;
  }

  if (!isPasswordValid.value) {
    passwordError.value = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    showSnackbar(
      "warning",
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      "Validation Error",
      4000,
    );
    return;
  }

  loading.value = true;
  emailError.value = "";
  passwordError.value = "";

  try {
    await userStore.login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    });

    showSnackbar(
      "success",
      `Welcome back, ${userStore.user?.name ?? "user"}!`,
      "Signed In",
      2500,
    );

    await router.replace(getRedirectPath());
  } catch (error: unknown) {
    password.value = "";
    handleError(error);
  } finally {
    loading.value = false;
  }
};

// ============================================================
// NAVIGATION
// ============================================================
const forgotPassword = (): void => {
  void router.push("/forgot-password");
};

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(async () => {
  try {
    await userStore.init();

    if (userStore.isAuthenticated) {
      await router.replace(getRedirectPath());
      return;
    }

    // Prefill email when returning from registration.
    const queryEmail = route.query.email;
    if (typeof queryEmail === "string") {
      email.value = queryEmail;
    }

    if (route.query.justRegistered === "true") {
      showSnackbar(
        "success",
        "Your account has been created. Please sign in.",
        "Welcome to tukema",
        5000,
      );
    }
  } catch (error) {
    console.error("[Login] Session initialisation failed:", error);
    showSnackbar(
      "error",
      "Unable to initialise your session. Please try again.",
      "Session Error",
      6000,
    );
  }
});

// React to external authentication changes (e.g. token refreshed).
watch(
  () => userStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await router.replace(getRedirectPath());
    }
  },
);

onUnmounted(() => {
  clearPasswordHideTimer();
});
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 460px;
  margin: auto;
  flex: 0 0 auto;
  border: 1px solid rgba(26, 82, 118, 0.1);
  background: #ffffff;
}

:deep(.v-field) {
  --v-field-padding-start: 12px;
  --v-field-padding-end: 12px;
  --v-field-padding-top: 6px;
  --v-field-padding-bottom: 4px;
}

:deep(.v-field__input) {
  padding-top: 6px;
  padding-bottom: 6px;
  font-size: 13px;
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
}

:deep(.v-label) {
  font-size: 12px;
  color: #4a6a7f;
}

:deep(.v-messages) {
  font-size: 10px;
  min-height: 16px;
}

:deep(.v-checkbox .v-label) {
  font-size: 11px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
}

:deep(.v-field--focused) {
  border-color: #2e86c1 !important;
}

:deep(.v-field--focused .v-label) {
  color: #1a5276 !important;
}

@media (max-width: 600px) {
  .login-card {
    max-width: 100%;
  }
}
</style>