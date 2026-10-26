<template>
  <v-card
    class="forgot-password-card"
    elevation="0"
    rounded="lg"
    style="border: 1px solid rgba(26, 82, 118, 0.1)"
  >
    <!-- HEADER -->
    <div class="px-4 px-sm-6 pt-4 pt-sm-6 pb-1">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h4 class="text-subtitle-1 font-weight-bold" style="color: #1a5276">
            Reset Your Password
          </h4>
          <div class="text-caption" style="font-size: 10px; color: #5d6d7e">
            Epidemiology • Biostatistics • Research Methods
          </div>
        </div>
        <v-btn to="/auth/login" variant="text" size="small" color="#1a5276" class="pa-0">
          <v-icon start size="14">mdi-arrow-left</v-icon>
          <span class="text-caption">Back to Login</span>
        </v-btn>
      </div>
      <v-divider class="mt-2" style="border-color: #2e86c1" />
    </div>

    <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
      <!-- Check for reset token in URL (legacy link-based flow) -->
      <div v-if="hasResetToken" class="mb-3">
        <v-alert type="success" variant="tonal" density="compact" color="success">
          <div class="d-flex align-center">
            <v-icon size="16" class="mr-2" color="success">mdi-check-circle</v-icon>
            <span class="text-caption">
              Reset token verified. Please enter your new password below.
            </span>
          </div>
        </v-alert>
      </div>

      <!-- Stepper - Only 2 steps for optimized flow -->
      <v-stepper
        v-model="step"
        :items="steps"
        show-actions
        hide-actions
        class="custom-stepper"
        style="background: transparent"
      >
        <!-- STEP 1: Email -->
        <template v-slot:item.1>
          <div class="step-content">
            <div class="d-flex align-center mb-2">
              <v-icon color="#1a5276" size="20" class="mr-2">mdi-email</v-icon>
              <h5 class="text-subtitle-2 font-weight-medium" style="color: #1a5276">
                Enter Your Email
              </h5>
            </div>

            <p class="text-caption mb-2" style="color: #5d6d7e">
              We'll send a verification code to your registered email address.
            </p>

            <!-- Email Input + Action Button - Same Row -->
            <div class="d-flex align-center gap-2" style="gap: 8px">
              <v-text-field
                v-model="email"
                type="email"
                label="Email Address"
                placeholder="your@email.com"
                variant="outlined"
                density="compact"
                single-line
                flat
                hide-details
                clearable
                prepend-inner-icon="mdi-email"
                color="#1a5276"
                :disabled="loading || userStore.resetCooldownActive"
                :error-messages="emailError"
                @update:model-value="clearEmailError"
                @keyup.enter="requestResetCode"
                autofocus
              />
              <v-tooltip text="Request Reset Password Code" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    size="x-small"
                    variant="outlined"
                    color="#1a5276"
                    :loading="loading"
                    :disabled="!isEmailValid || loading || userStore.resetCooldownActive"
                    @click="requestResetCode"
                  >
                    <v-icon size="18">
                      {{ loading ? "mdi-loading mdi-spin" : "mdi-send-variant-clock" }}
                    </v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>

            <!-- Cooldown indicator -->
            <div v-if="userStore.resetCooldownActive" class="mt-1">
              <v-progress-linear
                :model-value="(userStore.resetCooldownSeconds / 60) * 100"
                color="#1a5276"
                height="4"
                class="rounded"
              />
              <div class="text-caption mt-1" style="color: #5d6d7e; font-size: 10px">
                Please wait {{ userStore.resetCooldownSeconds }}s before requesting again
              </div>
            </div>

            <v-alert
              v-if="emailHelp"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
              color="info"
            >
              <div class="d-flex align-center">
                <v-icon size="14" class="mr-2" color="info">mdi-information</v-icon>
                <span class="text-caption">{{ emailHelp }}</span>
              </div>
            </v-alert>
          </div>
        </template>

        <!-- STEP 2: OTP + New Password (Combined - Optimized) -->
        <template v-slot:item.2>
          <div class="step-content">
            <div class="d-flex align-center mb-2">
              <v-icon color="#1a5276" size="20" class="mr-2">mdi-lock-reset</v-icon>
              <h5 class="text-subtitle-2 font-weight-medium" style="color: #1a5276">
                Reset Your Password
              </h5>
            </div>

            <p class="text-caption mb-2" style="color: #5d6d7e">
              Enter the 6-character code sent to <strong>{{ maskEmail(email) }}</strong>
              and choose a new password.
            </p>

            <!-- OTP Input - Accepts alphanumeric codes like RVNLJU -->
            <v-text-field
              v-model="verificationCode"
              label="Verification Code"
              density="compact"
              placeholder="e.g., RVNLJU"
              variant="outlined"
              :type="showCode ? 'text' : 'password'"
              prepend-inner-icon="mdi-shield-key"
              :append-inner-icon="showCode ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="toggleCodeVisibility"
              :error-messages="codeError"
              @update:model-value="clearCodeError"
              @keyup.enter="resetPassword"
              autofocus
              hide-details="auto"
              color="#1a5276"
              maxlength="6"
              counter="6"
              class="mb-2"
            />

            <!-- New Password -->
            <v-text-field
              density="compact"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              label="New Password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="toggleNewPasswordVisibility"
              :disabled="loading"
              :error-messages="passwordError"
              @update:model-value="clearPasswordError"
              class="mb-2"
              hide-details="auto"
              color="#1a5276"
              placeholder="Min 6 characters"
            />

            <!-- Confirm Password -->
            <v-text-field
              density="compact"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirm Password"
              variant="outlined"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="toggleConfirmPasswordVisibility"
              :disabled="loading"
              :error-messages="confirmError"
              @update:model-value="clearConfirmError"
              class="mb-2"
              hide-details="auto"
              color="#1a5276"
              placeholder="Confirm your password"
            />

            <!-- Password Requirements -->
            <v-card
              variant="tonal"
              color="info"
              class="pa-2 mt-1"
              style="background: #eaf2f8; border-radius: 8px"
            >
              <div
                class="text-caption font-weight-medium mb-1"
                style="color: #1a5276; font-size: 10px"
              >
                Password must contain:
              </div>
              <div class="d-flex flex-wrap" style="gap: 4px">
                <v-chip
                  v-for="req in passwordRequirements"
                  :key="req.label"
                  size="x-small"
                  :color="req.met ? 'success' : 'grey'"
                  :variant="req.met ? 'flat' : 'outlined'"
                  class="text-caption"
                  style="font-size: 9px; height: 20px"
                >
                  <v-icon start size="10">
                    {{ req.met ? "mdi-check-circle" : "mdi-circle-outline" }}
                  </v-icon>
                  {{ req.label }}
                </v-chip>
              </div>
            </v-card>

            <!-- Reset Button - SINGLE SOURCE OF TRUTH -->
            <div class="mt-3">
              <v-btn
                color="#1a5276"
                variant="elevated"
                size="small"
                block
                :loading="loading"
                :disabled="!canResetPassword"
                @click="resetPassword"
                style="background: #1a5276 !important; border-radius: 50px; height: 40px"
              >
                <v-icon start size="16" v-if="!loading">mdi-check-circle</v-icon>
                <span v-if="!loading">Reset Password</span>
                <span v-else>Resetting...</span>
              </v-btn>
            </div>

            <!-- Footer Actions -->
            <div class="d-flex align-center justify-space-between mt-3">
              <v-btn
                variant="text"
                size="x-small"
                color="#1a5276"
                @click="resendCode"
                :disabled="userStore.resetCooldownActive || loading"
                class="pa-0"
              >
                <v-icon start size="12">mdi-refresh</v-icon>
                {{
                  userStore.resetCooldownActive
                    ? `Resend in ${userStore.resetCooldownSeconds}s`
                    : "Resend Code"
                }}
              </v-btn>

              <v-btn
                variant="text"
                size="x-small"
                color="#5d6d7e"
                @click="goBackToEmail"
                class="pa-0"
              >
                <v-icon start size="12">mdi-arrow-left</v-icon>
                Change Email
              </v-btn>
            </div>
          </div>
        </template>

        <!-- Stepper Navigation (Bottom) -->
        <template v-slot:actions>
          <div class="stepper-navigation mt-3">
            <v-divider class="mb-3" style="border-color: #d4e6f1" />
            <div class="d-flex align-center justify-space-between">
              <!-- Back button (except step 1) -->
              <v-btn
                v-if="step > 1"
                variant="text"
                color="#1a5276"
                size="x-small"
                @click="step--"
                :disabled="loading"
                class="pa-0"
              >
                <v-icon start size="14">mdi-arrow-left</v-icon>
                Back
              </v-btn>
              <div v-else></div>

              <!-- Step indicator -->
              <div class="text-caption" style="color: #5d6d7e; font-size: 10px">
                Step {{ step }} of {{ steps.length }}
              </div>

              <!-- Next button -->
              <v-btn
                v-if="step < 2"
                variant="text"
                color="#1a5276"
                size="x-small"
                @click="step++"
                :disabled="!canProceedNext || loading"
                class="pa-0"
              >
                Next
                <v-icon end size="14">mdi-arrow-right</v-icon>
              </v-btn>
              <div v-else></div>
            </div>
          </div>
        </template>
      </v-stepper>
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
      <v-icon :color="snackbar.iconColor" size="20" class="mr-2">
        {{ snackbar.icon }}
      </v-icon>
      <div>
        <div
          v-if="snackbar.title"
          class="text-subtitle-2 font-weight-bold"
          style="font-size: 12px"
        >
          {{ snackbar.title }}
        </div>
        <div class="text-body-2" style="font-size: 12px">
          {{ snackbar.message }}
        </div>
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="x-small"
        @click="snackbar.show = false"
        :color="snackbar.iconColor"
      />
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/users";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// ============================================
// STATE - OPTIMIZED (2 steps instead of 3)
// ============================================

const steps = ["Email", "Reset Password"];

const step = ref(1);
const email = ref("");
const verificationCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const codeSent = ref(false);
const hasResetToken = ref(false);

// Visibility toggles
const showCode = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Auto-hide timers
let codeHideTimer: number | null = null;
let newPasswordHideTimer: number | null = null;
let confirmPasswordHideTimer: number | null = null;

// Errors
const emailError = ref("");
const codeError = ref("");
const passwordError = ref("");
const confirmError = ref("");

// Help messages
const emailHelp = ref("");
const passwordHelp = ref("");

// ============================================
// UTILITY: Normalize Verification Code
// ============================================

const normalizeVerificationCode = (value: unknown): string => {
  return String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .toUpperCase();
};

// ============================================
// COMPUTED - Password Requirements
// ============================================

const passwordRequirements = computed(() => {
  const pwd = newPassword.value;
  return [
    { label: "Min 6 chars", met: pwd.length >= 6 },
    { label: "Has letters", met: /[A-Za-z]/.test(pwd) },
    { label: "Has number", met: /\d/.test(pwd) },
  ];
});

// ============================================
// COMPUTED - Validations (ALPHANUMERIC OTP)
// ============================================

const isEmailValid = computed(() => {
  const value = String(email.value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

// ✅ FIXED: OTP validation accepts alphanumeric codes (6 characters)
// Valid examples: RVNLJU, DMGYFN, A7K29P, 123456
const isCodeValid = computed(() => {
  const code = normalizeVerificationCode(verificationCode.value);
  return /^[A-Z0-9]{6}$/.test(code);
});

const isPasswordValid = computed(() => {
  const value = String(newPassword.value || "");
  return value.length >= 6 && /[A-Za-z]/.test(value) && /\d/.test(value);
});

const doPasswordsMatch = computed(() => {
  const password = String(newPassword.value || "");
  const confirm = String(confirmPassword.value || "");
  return password.length > 0 && confirm.length > 0 && password === confirm;
});

const canProceedNext = computed(() => {
  if (step.value === 1) {
    return isEmailValid.value && !loading.value && !userStore.resetCooldownActive;
  }
  return false;
});

// ============================================
// SINGLE SOURCE OF TRUTH: Reset Button Eligibility
// ============================================

const canResetPassword = computed(() => {
  // Normalize OTP once using the same function
  const code = normalizeVerificationCode(verificationCode.value);

  const password = String(newPassword.value || "");
  const confirm = String(confirmPassword.value || "");

  // ✅ FIXED: Accepts exactly 6 alphanumeric characters
  const validCode = /^[A-Z0-9]{6}$/.test(code);

  const validPassword =
    password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const passwordsMatch =
    password.length > 0 && confirm.length > 0 && password === confirm;

  // Button is enabled ONLY when ALL conditions are met AND we're on step 2
  return (
    step.value === 2 && validCode && validPassword && passwordsMatch && !loading.value
  );
});

// ============================================
// SNACKBAR SYSTEM
// ============================================

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
  timeout: number = 5000
) => {
  const configs = {
    success: { color: "success", icon: "mdi-check-circle", iconColor: "success" },
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

// ============================================
// UTILITY FUNCTIONS
// ============================================

const maskEmail = (emailStr: string) => {
  if (!emailStr) return emailStr;
  const [name, domain] = emailStr.split("@");
  if (!domain) return emailStr;
  if (name.length <= 3) return emailStr;
  return `${name.slice(0, 2)}***@${domain}`;
};

// ============================================
// TOGGLE VISIBILITY FUNCTIONS
// ============================================

const toggleCodeVisibility = () => {
  showCode.value = !showCode.value;
  if (codeHideTimer) clearTimeout(codeHideTimer);
  if (showCode.value) {
    codeHideTimer = window.setTimeout(() => {
      showCode.value = false;
      codeHideTimer = null;
    }, 5000);
  }
};

const toggleNewPasswordVisibility = () => {
  showNewPassword.value = !showNewPassword.value;
  if (newPasswordHideTimer) clearTimeout(newPasswordHideTimer);
  if (showNewPassword.value) {
    newPasswordHideTimer = window.setTimeout(() => {
      showNewPassword.value = false;
      newPasswordHideTimer = null;
    }, 5000);
  }
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
  if (confirmPasswordHideTimer) clearTimeout(confirmPasswordHideTimer);
  if (showConfirmPassword.value) {
    confirmPasswordHideTimer = window.setTimeout(() => {
      showConfirmPassword.value = false;
      confirmPasswordHideTimer = null;
    }, 5000);
  }
};

// ============================================
// ERROR CLEARING
// ============================================

const clearEmailError = () => {
  emailError.value = "";
  emailHelp.value = "";
};

const clearCodeError = () => {
  codeError.value = "";
};

const clearPasswordError = () => {
  passwordError.value = "";
  passwordHelp.value = "";
};

const clearConfirmError = () => {
  confirmError.value = "";
};

// ============================================
// VERIFY RESET TOKEN FROM URL (Legacy link-based flow)
// ============================================

const verifyTokenFromUrl = async () => {
  const token = route.query.token as string;

  if (!token) {
    step.value = 1;
    return;
  }

  try {
    showSnackbar("info", "Verifying reset token...", "Please wait", 3000);

    const result = await userStore.verifyResetToken(token);

    if (result && result.valid && result.email) {
      hasResetToken.value = true;
      email.value = result.email;
      step.value = 2;

      showSnackbar(
        "success",
        "Reset token verified! Please enter your new password.",
        "Token Verified",
        4000
      );
    } else {
      showSnackbar(
        "error",
        "Invalid or expired reset token. Please request a new one.",
        "Token Invalid",
        5000
      );
      step.value = 1;
    }
  } catch (error) {
    console.error("Token verification error:", error);
    showSnackbar(
      "error",
      "Failed to verify reset token. Please request a new one.",
      "Verification Failed",
      5000
    );
    step.value = 1;
  }
};

// ============================================
// STEP 1: Request Reset Code (TRIP 1 of 2)
// ============================================

const requestResetCode = async () => {
  if (!isEmailValid.value) {
    emailError.value = "Please enter a valid email address";
    return;
  }

  loading.value = true;
  emailHelp.value = "Sending verification code...";

  try {
    const result = await userStore.requestPasswordReset(email.value);

    if (result && result.success) {
      codeSent.value = true;

      showSnackbar(
        "success",
        `Verification code sent to ${maskEmail(email.value)}`,
        "Code Sent",
        4000
      );

      step.value = 2;
      emailHelp.value = "";
    } else {
      throw new Error(result?.message || "Failed to send reset code");
    }
  } catch (err: any) {
    handleError(err, "Failed to send verification code");
    emailHelp.value = "";
  } finally {
    loading.value = false;
  }
};

// ============================================
// STEP 2: Complete Reset (TRIP 2 of 2)
// ============================================

const resetPassword = async () => {
  // ✅ FIXED: Normalize OTP using the same function
  const normalizedOtp = normalizeVerificationCode(verificationCode.value);

  // ✅ FIXED: Validate as alphanumeric (6 characters)
  if (!/^[A-Z0-9]{6}$/.test(normalizedOtp)) {
    codeError.value =
      "Please enter a valid 6-character verification code (letters and/or numbers)";
    return;
  }

  // Validate Password
  const password = String(newPassword.value || "");
  if (password.length < 6 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    passwordError.value = "Please meet all password requirements";
    return;
  }

  // Validate Confirm Password
  const confirm = String(confirmPassword.value || "");
  if (password !== confirm || password.length === 0 || confirm.length === 0) {
    confirmError.value = "Passwords do not match";
    return;
  }

  loading.value = true;

  try {
    // ✅ OPTIMIZED: Single call to complete password reset
    const result = await userStore.completePasswordReset({
      email: email.value.trim(),
      otpCode: normalizedOtp, // Normalized OTP (uppercase, no whitespace)
      otpId: userStore.resetOtpId || "",
      newPassword: password,
      confirmPassword: confirm,
    });

    if (result && result.success) {
      showSnackbar(
        "success",
        "Password reset successfully! You are now logged in.",
        "Success",
        4000
      );

      // Clear sensitive data
      codeSent.value = false;
      hasResetToken.value = false;
      verificationCode.value = "";
      newPassword.value = "";
      confirmPassword.value = "";

      // Redirect to dashboard (user is now auto-logged in)
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      throw new Error(result?.message || "Failed to reset password");
    }
  } catch (err: any) {
    // Handle specific error types
    const errorMessage = err.message?.toLowerCase() || "";
    if (errorMessage.includes("otp") || errorMessage.includes("code")) {
      codeError.value = err.message;
    } else if (errorMessage.includes("password")) {
      passwordError.value = err.message;
    } else {
      handleError(err, "Failed to reset password");
    }
  } finally {
    loading.value = false;
  }
};

// ============================================
// Resend Code
// ============================================

const resendCode = async () => {
  if (userStore.resetCooldownActive) {
    showSnackbar(
      "info",
      `Please wait ${userStore.resetCooldownSeconds} seconds`,
      "Cooldown"
    );
    return;
  }

  verificationCode.value = "";
  await requestResetCode();
};

// ============================================
// Go back to email
// ============================================

const goBackToEmail = () => {
  step.value = 1;
  verificationCode.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  codeError.value = "";
  passwordError.value = "";
  confirmError.value = "";
  codeSent.value = false;
  showCode.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

// ============================================
// ERROR HANDLER
// ============================================

const handleError = (error: any, fallback: string) => {
  let message = fallback;
  let title = "Error";

  if (error?.graphQLErrors?.length) {
    message = error.graphQLErrors[0].message;
    title = "Request Failed";
  } else if (error?.networkError) {
    message = "Network error. Please check your connection.";
    title = "Connection Error";
  } else if (error?.message) {
    message = error.message;
  }

  showSnackbar("error", message, title, 6000);
  return message;
};

// ============================================
// CLEANUP
// ============================================

const clearAllTimers = () => {
  if (codeHideTimer) clearTimeout(codeHideTimer);
  if (newPasswordHideTimer) clearTimeout(newPasswordHideTimer);
  if (confirmPasswordHideTimer) clearTimeout(confirmPasswordHideTimer);
};

// ============================================
// WATCH FOR URL CHANGES
// ============================================

watch(
  () => route.query.token,
  async (newToken) => {
    if (newToken) {
      await verifyTokenFromUrl();
    }
  }
);

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  await userStore.init();

  if (route.query.email) {
    email.value = route.query.email as string;
  }

  // Check if we have a stored reset OTP ID (session recovery)
  if (userStore.resetOtpId && userStore.resetEmail) {
    email.value = userStore.resetEmail;
    step.value = 2;
    showSnackbar("info", "Continue your password reset", "Session Restored", 3000);
  }

  await verifyTokenFromUrl();
});

onUnmounted(() => {
  clearAllTimers();
});
</script>

<style scoped>
.forgot-password-card {
  max-width: 100%;
  margin: auto;
}

.custom-stepper {
  background: transparent !important;
}

.custom-stepper :deep(.v-stepper-header) {
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.custom-stepper :deep(.v-stepper-item) {
  padding: 6px 0 !important;
}

.custom-stepper :deep(.v-stepper-item .v-stepper-actions) {
  margin-right: 6px !important;
}

.custom-stepper :deep(.v-stepper-item__title) {
  font-size: 10px !important;
  font-weight: 500 !important;
}

.step-content {
  padding: 4px 0 2px 0;
}

.gap-2 {
  gap: 8px;
}

.flex-grow-1 {
  flex: 1 1 auto;
  min-width: 0;
}

.w-100 {
  width: 100%;
}

/* Compact spacing overrides */
:deep(.v-field) {
  --v-field-padding-start: 10px;
  --v-field-padding-end: 10px;
  --v-field-padding-top: 4px;
  --v-field-padding-bottom: 4px;
}

:deep(.v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 12px;
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
  font-size: 11px;
  color: #4a6a7f;
}

:deep(.v-messages) {
  font-size: 9px;
  min-height: 14px;
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
  font-size: 12px;
}

:deep(.v-divider) {
  margin-top: 4px;
  margin-bottom: 4px;
}

:deep(.v-snackbar) {
  margin-top: 16px;
}

:deep(.v-field--focused) {
  border-color: #2e86c1 !important;
}

:deep(.v-field--focused .v-label) {
  color: #1a5276 !important;
}

:deep(.v-alert) {
  border-radius: 8px !important;
}

/* Chip styling */
:deep(.v-chip) {
  height: 18px !important;
  font-size: 9px !important;
}

/* Stepper progress styling */
:deep(.v-stepper-actions .v-avatar) {
  width: 24px !important;
  height: 24px !important;
  font-size: 10px !important;
}

:deep(.v-stepper-actions .v-avatar--disabled) {
  opacity: 0.6;
}

/* Mobile responsive */
@media (min-width: 600px) {
  .forgot-password-card {
    max-width: 480px;
    margin: 1rem auto;
  }
}

/* Animation */
.v-slide-y-transition-enter-active,
.v-slide-y-transition-leave-active {
  transition: all 0.25s ease;
}

.v-slide-y-transition-enter-from,
.v-slide-y-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<route lang="yaml">
meta:
  layout: AuthLayout
  requiresGuest: true
</route>
