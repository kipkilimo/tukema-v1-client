<template>
  <v-card
    class="sso-auto-login-card"
    elevation="0"
    rounded="lg"
    style="border: 1px solid rgba(26, 82, 118, 0.1)"
  >
    <!-- HEADER -->
    <div class="px-4 px-sm-6 pt-4 pt-sm-6 pb-1">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h4 class="text-subtitle-1 font-weight-bold" style="color: #1a5276">
            {{ getHeaderText }}
          </h4>
          <div class="text-caption" style="font-size: 10px; color: #5d6d7e">
            Epidemiology • Biostatistics • Research Methods
          </div>
        </div>
        <v-chip size="small" color="#1a5276" variant="tonal">
          <v-icon start size="14">mdi-key</v-icon>
          SSO
        </v-chip>
      </div>
      <v-divider class="mt-2" style="border-color: #2e86c1" />
    </div>

    <!-- CONTENT -->
    <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
      <!-- Processing State -->
      <div v-if="isProcessing && !error && !success" class="text-center py-6">
        <v-progress-circular
          indeterminate
          color="#1a5276"
          size="48"
          width="4"
          class="mb-4"
        />
        <h5 class="text-h6 font-weight-medium" style="color: #1a5276">
          Verifying Your Sign-In
        </h5>
        <p class="text-caption mt-2" style="color: #5d6d7e">
          Please wait while we securely sign you in...
        </p>
        <div class="mt-4">
          <v-chip size="small" color="#1a5276" variant="tonal">
            <v-icon start size="12">mdi-check-circle</v-icon>
            Code: {{ code || "..." }}
          </v-chip>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="text-center py-6">
        <v-icon size="64" color="success" class="mb-3"
          >mdi-check-circle-outline</v-icon
        >
        <h5 class="text-h6 font-weight-medium" style="color: #1a5276">
          Sign-In Successful! 🎉
        </h5>
        <p class="text-caption mt-2" style="color: #5d6d7e">
          {{ successMessage }}
        </p>
        <v-progress-circular
          indeterminate
          color="#1a5276"
          size="20"
          width="2"
          class="mt-3"
        />
        <p class="text-caption mt-1" style="color: #5d6d7e; font-size: 11px">
          Redirecting to dashboard...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-6">
        <v-icon size="64" color="error" class="mb-3"
          >mdi-alert-circle-outline</v-icon
        >
        <h5 class="text-h6 font-weight-medium" style="color: #c62828">
          Sign-In Failed
        </h5>
        <p class="text-caption mt-2" style="color: #5d6d7e">
          {{ errorMessage }}
        </p>
        <div class="d-flex flex-wrap justify-center gap-2 mt-3">
          <v-btn
            color="#1a5276"
            variant="elevated"
            size="small"
            style="background: #1a5276 !important"
            @click="goToLogin"
          >
            <v-icon start size="16">mdi-login</v-icon>
            Go to Login
          </v-btn>
          <v-btn
            color="#1a5276"
            variant="outlined"
            size="small"
            @click="retrySSO"
            :loading="isProcessing"
          >
            <v-icon start size="16">mdi-refresh</v-icon>
            Try Again
          </v-btn>
        </div>
      </div>

      <!-- No Code State -->
      <div v-else class="text-center py-6">
        <v-icon size="64" color="#1a5276" class="mb-3">mdi-key</v-icon>
        <h5 class="text-h6 font-weight-medium" style="color: #1a5276">
          No Sign-In Code Found
        </h5>
        <p class="text-caption mt-2" style="color: #5d6d7e">
          Please use the sign-in link from your email or enter your code below.
        </p>
        <v-text-field
          density="compact"
          v-model="manualCode"
          label="Enter Sign-In Code"
          placeholder="e.g., FBYR7YYM"
          variant="outlined"
          prepend-inner-icon="mdi-key"
          class="mt-3"
          hide-details="auto"
          color="#1a5276"
          @keyup.enter="loginWithCode"
          :loading="isProcessing"
          :disabled="isProcessing"
        />
        <v-btn
          color="#1a5276"
          variant="elevated"
          size="small"
          class="mt-3"
          :disabled="!manualCode || manualCode.length < 4 || isProcessing"
          style="background: #1a5276 !important"
          @click="loginWithCode"
          :loading="isProcessing"
        >
          <v-icon start size="16">mdi-login</v-icon>
          Sign In
        </v-btn>
        <div class="mt-3">
          <v-btn
            variant="text"
            size="x-small"
            color="#5d6d7e"
            @click="goToLogin"
          >
            <v-icon start size="12">mdi-arrow-left</v-icon>
            Back to Login
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- FOOTER -->
    <v-card-actions class="px-4 px-sm-6 pb-4 pt-0">
      <v-divider class="mb-3" style="border-color: #d4e6f1" />
      <div class="text-caption" style="color: #5d6d7e; font-size: 10px">
        Secure single sign-in powered by tukema
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useUserStore } from "@/stores/users";
import { useVoucherStore } from "@/stores/vouchers";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const snackbarStore = useVoucherStore();

// ============================================
// STATE
// ============================================

const isProcessing = ref(false);
const success = ref(false);
const error = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const code = ref("");
const manualCode = ref("");

const isRedirecting = ref(false);
const redirectTimer = ref<number | null>(null);
const authWatcher = ref<(() => void) | null>(null);
const loginAttempted = ref(false);

// ✅ CRITICAL: Prevent duplicate success handling
const successHandled = ref(false);
const errorHandled = ref(false);

// ============================================
// COMPUTED
// ============================================

const getHeaderText = computed(() => {
  if (isProcessing.value && !error.value && !success.value)
    return "Signing You In...";
  if (success.value) return "Sign-In Successful! 🎉";
  if (error.value) return "Sign-In Failed";
  return "Single Sign-In";
});

// ============================================
// ✅ SUCCESS HANDLER (Single source of truth)
// ============================================

const handleSuccessfulLogin = () => {
  // Never show success twice
  if (successHandled.value) return;

  successHandled.value = true;
  errorHandled.value = false;

  const userName = userStore.userFullName || userStore.user?.fullName || "User";

  success.value = true;
  error.value = false;
  errorMessage.value = "";
  isProcessing.value = false;
  isRedirecting.value = false;

  successMessage.value = `Welcome back, ${userName}!`;

  // Start redirect timer
  startRedirectTimer();
};

// ============================================
// ✅ ERROR HANDLER
// ============================================

const handleError = (err: any, fallback: string) => {
  if (errorHandled.value) return;
  errorHandled.value = true;

  const errorMsg = err?.message || "";
  let displayMsg = fallback;

  if (errorMsg.toLowerCase().includes("expired")) {
    displayMsg = "The sign-in code has expired. Please request a new one.";
  } else if (errorMsg.toLowerCase().includes("invalid")) {
    displayMsg = "Invalid sign-in code. Please check and try again.";
  } else if (errorMsg.toLowerCase().includes("not found")) {
    displayMsg = "No account found for this sign-in code.";
  } else if (errorMsg.toLowerCase().includes("network")) {
    displayMsg = "Network error. Please check your connection.";
  }

  errorMessage.value = displayMsg;
  error.value = true;
  success.value = false;
  isProcessing.value = false;
  isRedirecting.value = false;

  // Auto-redirect to login after 4 seconds on error
  setTimeout(() => {
    if (error.value && !isRedirecting.value && !successHandled.value) {
      goToLogin();
    }
  }, 4000);
};

// ============================================
// NAVIGATION
// ============================================

const goToLogin = () => {
  if (isRedirecting.value) return;

  isRedirecting.value = true;

  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
    redirectTimer.value = null;
  }

  isProcessing.value = false;
  error.value = false;
  success.value = false;

  router.push("/auth/login");
};

const goToDashboard = () => {
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
    redirectTimer.value = null;
  }

  isRedirecting.value = true;
  router.replace("/dashboard");
};

// ============================================
// ✅ SSO LOGIN - Disables snackbar in store
// ============================================

const loginWithCode = async (codeToUse?: string) => {
  const signInCode = codeToUse || manualCode.value.trim();

  if (!signInCode || signInCode.length < 4) {
    errorMessage.value = "Please enter a valid sign-in code";
    error.value = true;
    return;
  }

  // Prevent duplicate login attempts
  if (isProcessing.value || successHandled.value || loginAttempted.value) {
    return;
  }

  loginAttempted.value = true;
  isProcessing.value = true;
  error.value = false;
  errorMessage.value = "";
  success.value = false;
  successHandled.value = false;
  errorHandled.value = false;

  try {
    console.log("[SSOAutoLogin] Completing SSO login with code:", signInCode);

    // ✅ Pass { showSnackbar: false } to prevent store from showing snackbars
    const result = await userStore.loginWithSingleSignIn(signInCode, {
      showSnackbar: false,
    });

    // Check if authentication actually succeeded
    if (
      userStore.isAuthenticated ||
      result?.user ||
      userStore.getAccessToken()
    ) {
      handleSuccessfulLogin();
      return;
    }

    // If we get here, authentication failed
    throw new Error("Authentication was not completed.");
  } catch (err: any) {
    // If authentication succeeded but something else threw, show success
    if (userStore.isAuthenticated || userStore.getAccessToken()) {
      console.warn(
        "[SSOAutoLogin] Login completed despite post-login error:",
        err,
      );
      handleSuccessfulLogin();
      return;
    }

    handleError(err, "Failed to sign in. Please try again.");

    if (!codeToUse) {
      manualCode.value = "";
    }
  } finally {
    // Only reset processing if not in success state
    if (!success.value) {
      isProcessing.value = false;
    }
    // Allow retry after a delay
    setTimeout(() => {
      loginAttempted.value = false;
    }, 2000);
  }
};

// ============================================
// URL CODE
// ============================================

const processUrlCode = async () => {
  const urlCode = route.query.code as string;

  if (urlCode && urlCode.length >= 4) {
    code.value = urlCode;
    console.log("[SSOAutoLogin] Found code in URL:", urlCode);
    await loginWithCode(urlCode);
  } else {
    console.log("[SSOAutoLogin] No code found in URL");
    isProcessing.value = false;
  }
};

// ============================================
// REDIRECT
// ============================================

const startRedirectTimer = () => {
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
  }

  redirectTimer.value = window.setTimeout(() => {
    goToDashboard();
  }, 1500);
};

// ============================================
// RETRY
// ============================================

const retrySSO = () => {
  if (isProcessing.value) return;

  error.value = false;
  errorMessage.value = "";
  success.value = false;
  successHandled.value = false;
  errorHandled.value = false;
  loginAttempted.value = false;

  const codeToUse = code.value || manualCode.value.trim();

  if (codeToUse) {
    loginWithCode(codeToUse);
  } else {
    errorMessage.value = "Please enter a sign-in code";
    error.value = true;
  }
};

// ============================================
// EXISTING AUTH
// ============================================

const checkExistingAuth = async () => {
  if (userStore.isAuthenticated) {
    console.log("[SSOAutoLogin] User already authenticated");
    handleSuccessfulLogin();
    return true;
  }

  const token = userStore.getAccessToken();

  if (token) {
    try {
      await userStore.restoreSession();

      if (userStore.isAuthenticated) {
        console.log("[SSOAutoLogin] Session restored");
        handleSuccessfulLogin();
        return true;
      }
    } catch (err) {
      console.error("[SSOAutoLogin] Failed to restore session:", err);
      userStore.clearTokens();
      userStore.clearUser();
    }
  }

  return false;
};

// ============================================
// AUTH WATCHER
// ============================================

const setupAuthWatcher = () => {
  if (authWatcher.value) {
    authWatcher.value();
    authWatcher.value = null;
  }

  authWatcher.value = watch(
    () => userStore.isAuthenticated,
    (isAuth) => {
      // Only handle if not already handled and not in error state
      if (
        isAuth &&
        !successHandled.value &&
        !error.value &&
        !errorHandled.value
      ) {
        console.log("[SSOAutoLogin] Auth state changed to authenticated");
        handleSuccessfulLogin();
      }
    },
  );
};

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  // Initialize store first
  await userStore.init();

  const isAuthenticated = await checkExistingAuth();
  if (isAuthenticated) return;

  setupAuthWatcher();

  await nextTick();
  await processUrlCode();
});

onUnmounted(() => {
  if (redirectTimer.value) {
    clearTimeout(redirectTimer.value);
    redirectTimer.value = null;
  }

  if (authWatcher.value) {
    authWatcher.value();
    authWatcher.value = null;
  }

  isRedirecting.value = false;
  isProcessing.value = false;
});

// ============================================
// ROUTE CODE WATCHER
// ============================================

watch(
  () => route.query.code,
  async (newCode) => {
    if (
      newCode &&
      typeof newCode === "string" &&
      newCode.length >= 4 &&
      code.value !== newCode &&
      !successHandled.value &&
      !isProcessing.value &&
      !error.value &&
      !loginAttempted.value
    ) {
      console.log("[SSOAutoLogin] Code changed in URL:", newCode);
      code.value = newCode;
      await loginWithCode(newCode);
    }
  },
);
</script>

<style scoped>
.sso-auto-login-card {
  max-width: 100%;
  margin: auto;
  border: 1px solid rgba(26, 82, 118, 0.1);
}

@media (min-width: 600px) {
  .sso-auto-login-card {
    max-width: 460px;
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

:deep(.v-label) {
  font-size: 12px;
  color: #4a6a7f;
}

:deep(.v-messages) {
  font-size: 10px;
  min-height: 16px;
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

:deep(.v-field--focused) {
  border-color: #2e86c1 !important;
}

:deep(.v-field--focused .v-label) {
  color: #1a5276 !important;
}

.gap-2 {
  gap: 8px;
}
</style>

<route lang="yaml">
meta:
  layout: AuthLayout
  requiresGuest: true
</route>
