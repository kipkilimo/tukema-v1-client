<template>
  <v-card
    class="activation-card"
    elevation="0"
    rounded="lg"
    style="border: 1px solid rgba(26, 82, 118, 0.1)"
  >
    <!-- HEADER - tukema Style -->
    <div class="px-4 px-sm-6 pt-4 pt-sm-6 pb-1">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h4 class="text-subtitle-1 font-weight-bold" style="color: #1a5276">
            {{ isActivating ? "Activating Account" : "Account Activation" }}
          </h4>
          <div class="text-caption" style="font-size: 10px; color: #5d6d7e">
            Epidemiology • Biostatistics • Research Methods
          </div>
        </div>
        <v-btn
          v-if="!isActivating && !activationSuccess"
          to="/auth/login"
          variant="text"
          size="small"
          color="#1a5276"
          class="pa-0"
        >
          <v-icon start size="14">mdi-arrow-left</v-icon>
          <span class="text-caption">Back to Login</span>
        </v-btn>
      </div>
      <v-divider class="mt-2" style="border-color: #2e86c1" />
    </div>

    <!-- CONTENT -->
    <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
      <!-- Activating State -->
      <div v-if="isActivating" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="#1a5276"
          size="64"
          class="mb-4"
        />
        <h3 class="text-h6 font-weight-medium" style="color: #1a5276">
          Please wait...
        </h3>
        <p class="text-body-2 text-grey mt-2">
          We're activating your account. This may take a moment.
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="activationSuccess" class="text-center py-6">
        <v-icon
          size="72"
          color="success"
          icon="mdi-check-circle-outline"
          class="mb-4"
        />
        <h3 class="text-h6 font-weight-bold success--text">
          Account Activated!
        </h3>
        <p class="text-body-1 mt-3 text-grey">
          Your account has been successfully activated.
          <br />
          You can now access all tukema features.
        </p>

        <div class="mt-6">
          <v-btn
            color="#1a5276"
            variant="elevated"
            size="large"
            to="/dashboard/library"
            block
            style="background: #1a5276 !important"
          >
            <v-icon start size="18">mdi-bookshelf</v-icon>
            Go to Library
          </v-btn>
        </div>

        <div class="mt-3">
          <v-btn
            variant="text"
            size="small"
            color="#1a5276"
            to="/dashboard"
            class="pa-0"
          >
            <v-icon start size="14">mdi-view-dashboard</v-icon>
            Go to Dashboard
          </v-btn>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="activationError" class="text-center py-6">
        <v-icon
          size="72"
          color="error"
          icon="mdi-alert-circle-outline"
          class="mb-4"
        />
        <h3 class="text-h6 font-weight-bold error--text">Activation Failed</h3>
        <v-alert
          variant="tonal"
          type="error"
          class="mt-3 text-left"
          density="comfortable"
        >
          {{ activationError }}
        </v-alert>

        <div class="mt-6 d-flex flex-column gap-2">
          <v-btn
            color="#1a5276"
            variant="elevated"
            size="large"
            to="/auth/login"
            block
            style="background: #1a5276 !important"
          >
            <v-icon start size="18">mdi-login</v-icon>
            Back to Login
          </v-btn>

          <v-btn
            v-if="canRetry"
            color="warning"
            variant="tonal"
            size="medium"
            @click="retryActivation"
            block
          >
            <v-icon start size="16">mdi-refresh</v-icon>
            Retry Activation
          </v-btn>

          <v-btn
            color="grey"
            variant="text"
            size="medium"
            @click="resendActivationEmail"
            block
          >
            <v-icon start size="16">mdi-email-send</v-icon>
            Resend Activation Email
          </v-btn>
        </div>

        <div class="mt-4">
          <p class="text-caption text-grey">
            <v-icon size="12" class="mr-1">mdi-email</v-icon>
            Need help?
            <a
              href="mailto:support@tukema.org"
              class="text-decoration-none"
              style="color: #1a5276"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <!-- Expired State (special case) -->
      <div v-else-if="activationExpired" class="text-center py-6">
        <v-icon
          size="72"
          color="warning"
          icon="mdi-timer-alert-outline"
          class="mb-4"
        />
        <h3 class="text-h6 font-weight-bold warning--text">
          Activation Link Expired
        </h3>
        <p class="text-body-1 mt-3 text-grey">
          Your activation link has expired or is invalid.
          <br />
          Please request a new activation email.
        </p>

        <div class="mt-6 d-flex flex-column gap-2">
          <v-btn
            color="#1a5276"
            variant="elevated"
            size="large"
            @click="resendActivationEmail"
            block
            style="background: #1a5276 !important"
          >
            <v-icon start size="18">mdi-email-send</v-icon>
            Resend Activation Email
          </v-btn>

          <v-btn
            color="grey"
            variant="text"
            size="medium"
            to="/auth/login"
            block
          >
            <v-icon start size="16">mdi-arrow-left</v-icon>
            Back to Login
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- SNACKBAR -->
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
        <div class="text-body-2">
          {{ snackbar.message }}
        </div>
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        @click="snackbar.show = false"
        :color="snackbar.iconColor"
      />
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/users";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// ===== State =====
const isActivating = ref(false);
const activationSuccess = ref(false);
const activationError = ref<string | null>(null);
const activationExpired = ref(false);
const token = ref<string | null>(null);
const canRetry = ref(true);
const resendEmail = ref<string | null>(null);

// Snackbar
const snackbar = ref({
  show: false,
  message: "",
  title: "",
  color: "error",
  icon: "mdi-alert-circle",
  iconColor: "error",
  timeout: 5000,
});

const showSnackbar = (
  type: "success" | "error" | "info" | "warning",
  message: string,
  title?: string,
  timeout: number = 5000,
) => {
  const configs = {
    success: {
      color: "success",
      icon: "mdi-check-circle",
      iconColor: "success",
    },
    error: { color: "error", icon: "mdi-alert-circle", iconColor: "error" },
    info: { color: "info", icon: "mdi-information", iconColor: "info" },
    warning: { color: "warning", icon: "mdi-alert", iconColor: "warning" },
  };

  const config = configs[type];
  snackbar.value = {
    show: true,
    message,
    title: title || "",
    color: config.color,
    icon: config.icon,
    iconColor: config.iconColor,
    timeout,
  };
};

// ===== Computed =====
const isAuthenticated = computed(() => userStore.isAuthenticated);

// ===== Methods =====
const extractToken = (): string | null => {
  // Try to get token from URL query parameter
  let tokenParam = route.query.token as string;

  // If not in query, try to get from URL path
  if (!tokenParam) {
    const pathSegments = route.path.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && lastSegment !== "activate") {
      tokenParam = lastSegment;
    }
  }

  return tokenParam || null;
};

const extractEmail = (): string | null => {
  return (route.query.email as string) || null;
};

// ✅ FIXED: Use userStore.activateAccount - aligned with store
const activateAccount = async (activationToken: string) => {
  isActivating.value = true;
  activationError.value = null;
  activationExpired.value = false;

  try {
    console.log(
      "[Activation] Activating account with token:",
      activationToken.substring(0, 10) + "...",
    );

    // ✅ Use userStore.activateAccount() - returns ActivateAccountResponse
    const result = await userStore.activateAccount(activationToken);

    if (result.success && result.user) {
      activationSuccess.value = true;

      // ✅ If activation returns a user, set it in store (already handled by store)
      // The store already sets the user via setUser()

      showSnackbar(
        "success",
        result.message || "Your account has been activated successfully!",
        "Welcome to tukema",
        5000,
      );

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/dashboard/library");
      }, 3000);
    } else {
      throw new Error(result.message || "Activation failed");
    }
  } catch (error: any) {
    console.error("[Activation] Error:", error);

    const errorMessage = error?.message || "Activation failed";
    const errorLower = errorMessage.toLowerCase();

    // Check for specific error types
    if (
      errorLower.includes("expired") ||
      errorLower.includes("invalid or expired") ||
      errorLower.includes("link has expired") ||
      errorLower.includes("activation token expired") ||
      errorLower.includes("token expired")
    ) {
      activationExpired.value = true;
      showSnackbar(
        "warning",
        "Your activation link has expired. Please request a new one.",
        "Link Expired",
        6000,
      );
    } else if (
      errorLower.includes("already activated") ||
      errorLower.includes("already active") ||
      errorLower.includes("account already activated")
    ) {
      // Account already activated - redirect to login
      showSnackbar(
        "info",
        "This account is already activated. Please login.",
        "Account Already Active",
        4000,
      );
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return;
    } else if (
      errorLower.includes("invalid token") ||
      errorLower.includes("invalid activation token") ||
      errorLower.includes("token invalid")
    ) {
      activationError.value =
        "The activation token is invalid. Please check your link.";
      showSnackbar(
        "error",
        "Invalid activation token.",
        "Activation Failed",
        5000,
      );
    } else if (
      errorLower.includes("network") ||
      errorLower.includes("failed to fetch")
    ) {
      activationError.value =
        "Network error. Please check your connection and try again.";
      showSnackbar(
        "error",
        "Network error. Please try again.",
        "Connection Error",
        5000,
      );
    } else {
      activationError.value = errorMessage || "An unexpected error occurred.";
      showSnackbar("error", activationError.value!, "Activation Failed", 6000);
    }

    // Allow retry for network errors or general errors
    canRetry.value =
      errorLower.includes("network") ||
      errorLower.includes("failed to fetch") ||
      errorLower.includes("timeout") ||
      errorLower.includes("connection");
  } finally {
    isActivating.value = false;
  }
};

// ✅ FIXED: Retry activation
const retryActivation = async () => {
  if (!token.value) {
    activationError.value = "No activation token available.";
    showSnackbar("error", "No activation token found.", "Error", 4000);
    return;
  }
  canRetry.value = false;
  await activateAccount(token.value);
};

// ✅ FIXED: Resend activation email using store
const resendActivationEmail = async () => {
  const email = resendEmail.value || extractEmail();

  if (!email) {
    // If no email, show dialog or redirect to resend page
    showSnackbar(
      "info",
      "Please enter your email address to resend the activation link.",
      "Email Required",
      4000,
    );
    // Navigate to resend page or show input
    router.push("/auth/resend-activation");
    return;
  }

  try {
    // ✅ Use userStore.resendActivationEmail() - aligned with store
    const result = await userStore.resendActivationEmail(email);

    if (result.success) {
      showSnackbar(
        "success",
        result.message || "A new activation link has been sent to your email.",
        "Email Sent",
        5000,
      );

      // Reset expired state
      activationExpired.value = false;
      activationError.value = null;

      // Update token from URL if present
      const newToken = extractToken();
      if (newToken) {
        token.value = newToken;
      }
    } else {
      showSnackbar(
        "error",
        result.message ||
          "Failed to resend activation email. Please try again.",
        "Error",
        5000,
      );
    }
  } catch (error: any) {
    console.error("[Activation] Resend error:", error);
    showSnackbar(
      "error",
      error?.message || "Failed to resend activation email. Please try again.",
      "Error",
      5000,
    );
  }
};

// ===== Lifecycle =====
onMounted(async () => {
  // Extract token and email from URL
  token.value = extractToken();
  resendEmail.value = extractEmail();

  if (!token.value) {
    activationError.value = "No activation token found in the URL.";
    showSnackbar("error", "Missing activation token.", "Invalid Link", 5000);
    return;
  }

  console.log(
    "[Activation] Token found:",
    token.value.substring(0, 10) + "...",
  );

  // ✅ Check if user is already authenticated using store
  if (isAuthenticated.value) {
    showSnackbar(
      "info",
      "You are already logged in.",
      "Already Authenticated",
      3000,
    );
    setTimeout(() => {
      router.push("/dashboard/library");
    }, 1500);
    return;
  }

  // Attempt activation
  await activateAccount(token.value);
});
</script>

<style scoped>
.activation-card {
  max-width: 100%;
  margin: auto;
  border: 1px solid rgba(26, 82, 118, 0.1);
}

.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}

@media (min-width: 600px) {
  .activation-card {
    max-width: 480px;
    margin: 1rem auto;
  }
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

:deep(.v-divider) {
  margin-top: 8px;
  margin-bottom: 8px;
}

/* Success text color */
.success--text {
  color: #2e7d32 !important;
}

.error--text {
  color: #c62828 !important;
}

.warning--text {
  color: #e65100 !important;
}

.text-grey {
  color: #5d6d7e !important;
}

/* Alert styling */
:deep(.v-alert) {
  background: #f5f5f5 !important;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .activation-card {
    background: #1a1a2e !important;
    border-color: #333 !important;
  }

  :deep(.v-divider) {
    border-color: #333 !important;
  }

  :deep(.v-alert) {
    background: #2a2a3e !important;
  }

  .success--text {
    color: #66bb6a !important;
  }

  .error--text {
    color: #ef5350 !important;
  }

  .warning--text {
    color: #ffa726 !important;
  }

  .text-grey {
    color: #9e9e9e !important;
  }

  :deep(.v-progress-circular) {
    color: #1976d2 !important;
  }
}
</style>

<route lang="yaml">
meta:
  layout: AuthLayout
  requiresGuest: true
</route>
