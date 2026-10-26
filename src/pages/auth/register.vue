<template>
  <div class="register-wrapper">
    <v-card class="register-card" elevation="0" rounded="lg">
      <!-- HEADER - tukema Style -->
      <div class="px-4 px-sm-6 pt-4 pt-sm-6 pb-1">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h4 class="text-subtitle-1 font-weight-bold" style="color: #1a5276">
              Join tukema
            </h4>
          <div class="text-caption" style="font-size: 10px; color: #5d6d7e">
            Culture • Heritage • Posterity
          </div>
          </div>
          <v-btn
            variant="text"
            size="small"
            to="/auth/login"
            color="#1a5276"
            class="pa-0"
          >
            <v-icon start size="16">mdi-login</v-icon>
            <span class="text-caption">Sign In</span>
          </v-btn>
        </div>
        <v-divider class="mt-2" style="border-color: #2e86c1" />
      </div>

      <!-- FORM -->
      <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
        <v-form @submit.prevent="handleRegister">
          <!-- FULL NAME -->
          <v-text-field
            v-model="name"
            label="Full Name"
            type="text"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            :disabled="loading"
            :error-messages="nameError"
            @update:model-value="clearNameError"
            autofocus
            density="compact"
            class="mb-2"
            hide-details="auto"
            color="#1a5276"
          />

          <!-- EMAIL -->
          <v-text-field
            v-model="email"
            label="Email Address"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            :disabled="loading"
            :error-messages="emailError"
            @update:model-value="clearEmailError"
            density="compact"
            class="mb-2"
            hide-details="auto"
            color="#1a5276"
          />

          <!-- PASSWORD -->
          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="togglePasswordVisibility"
            :disabled="loading"
            :error-messages="passwordError"
            @update:model-value="clearPasswordError"
            density="compact"
            class="mb-1"
            hide-details="auto"
            color="#1a5276"
          />

          <!-- Password Strength -->
          <div v-if="password.length > 0" class="mt-1 mb-2">
            <v-progress-linear
              :model-value="passwordStrength.score * 25"
              :color="passwordStrength.color"
              height="3"
            />
            <div
              class="text-caption mt-1"
              style="font-size: 10px; color: #5d6d7e"
            >
              {{ passwordStrength.message }}
            </div>
          </div>

          <!-- Terms & Conditions - tukema Style -->
          <div class="terms-container mt-2 mb-2">
            <div class="d-flex align-center">
              <v-checkbox
                v-model="agreeTerms"
                hide-details
                density="compact"
                class="terms-checkbox ma-0 pa-0"
                @update:model-value="handleTermsChange"
                color="#1a5276"
              />
              <span class="text-caption ml-1" style="color: #2c3e50">
                I agree to the
                <a href="#" @click.prevent="showTermsDialog" class="terms-link"
                  >Terms of Service</a
                >
                and
                <a
                  href="#"
                  @click.prevent="showPrivacyDialog"
                  class="terms-link"
                  >Privacy Policy</a
                >
              </span>
            </div>
            <div
              v-if="termsAcceptedAt"
              class="text-caption mt-1"
              style="font-size: 9px; color: #2e86c1"
            >
              ✓ Terms accepted {{ formatDate(termsAcceptedAt) }}
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="d-flex align-center justify-space-between mt-3">
            <v-btn
              type="submit"
              color="#1a5276"
              variant="elevated"
              :loading="loading"
              :disabled="!canRegister"
              size="small"
              min-width="140"
              style="background: #1a5276 !important"
            >
              <v-icon start size="18">mdi-account-plus</v-icon>
              Join tukema
            </v-btn>

            <v-btn to="/auth/login" variant="text" color="#1a5276" size="small">
              <v-icon size="18">mdi-login</v-icon>
              <span class="d-none d-sm-inline ml-1 text-caption">Sign In</span>
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Terms of Service Dialog -->
    <TermsOfUseDialog
      v-model="termsDialogVisible"
      @accept="handleTermsAccept"
      @close="termsDialogVisible = false"
    />

    <!-- SNACKBAR for errors and success messages -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/users";
import TermsOfUseDialog from "@/components/dialogs/TermsOfUseDialog.vue";

const router = useRouter();
const userStore = useUserStore();

let passwordHideTimer: number | null = null;

/* ============================================
 STATE
============================================ */
const name = ref("");
const email = ref("");
const password = ref("");
const agreeTerms = ref(false);
const loading = ref(false);
const termsAcceptedAt = ref<Date | null>(null);
const termsAcceptedVersion = ref<string>("2.0");
const showPassword = ref(false);
const termsDialogVisible = ref(false);

/* ============================================
 SNACKBAR
============================================ */
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
    success: { color: "success", icon: "mdi-check-circle", iconColor: "success" },
    error: { color: "error", icon: "mdi-alert-circle", iconColor: "error" },
    info: { color: "info", icon: "mdi-information", iconColor: "info" },
    warning: { color: "warning", icon: "mdi-alert", iconColor: "warning" },
  };

  const c = configs[type];
  snackbar.value = {
    show: true,
    message,
    title: title ?? "",
    color: c.color,
    icon: c.icon,
    iconColor: c.iconColor,
    timeout,
  };
};

/* ============================================
 VALIDATION
============================================ */
const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");

const isNameValid = computed(() => name.value.trim().length >= 2);
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
);
const isPasswordValid = computed(() => password.value.length >= 8);

const canRegister = computed(
  () =>
    isNameValid.value &&
    isEmailValid.value &&
    isPasswordValid.value &&
    agreeTerms.value &&
    !loading.value,
);

/* ============================================
 PASSWORD STRENGTH
============================================ */
const passwordStrength = computed(() => {
  const pwd = password.value;
  let score = 0;

  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const pct = (Math.min(score, 5) / 5) * 100;

  if (pwd.length === 0) {
    return { score: 0, message: "Enter a password", color: "grey" };
  }
  if (pct < 40) return { score: 1, message: "Weak", color: "red" };
  if (pct < 60) return { score: 2, message: "Fair", color: "orange" };
  if (pct < 80) return { score: 3, message: "Good", color: "blue" };
  return { score: 4, message: "Strong!", color: "green" };
});

/* ============================================
 PASSWORD VISIBILITY TOGGLE
============================================ */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;

  if (passwordHideTimer) {
    clearTimeout(passwordHideTimer);
    passwordHideTimer = null;
  }

  if (showPassword.value) {
    passwordHideTimer = window.setTimeout(() => {
      showPassword.value = false;
      passwordHideTimer = null;
    }, 5000);
  }
};

/* ============================================
 TERMS & CONDITIONS
============================================ */
const handleTermsChange = (value: boolean) => {
  if (value && !termsAcceptedAt.value) {
    showSnackbar(
      "info",
      "Please review the Terms of Service and Privacy Policy before accepting.",
      "Review Required",
      5000,
    );
    agreeTerms.value = false;
    termsDialogVisible.value = true;
  }
};

const handleTermsAccept = () => {
  agreeTerms.value = true;
  termsAcceptedAt.value = new Date();
  termsAcceptedVersion.value = "2.0";
  termsDialogVisible.value = false;

  try {
    localStorage.setItem("termsAccepted", "true");
    localStorage.setItem("termsAcceptedAt", termsAcceptedAt.value.toISOString());
    localStorage.setItem("termsVersion", "2.0");
    localStorage.setItem("privacyAccepted", "true");
  } catch (err) {
    console.error("Failed to save terms acceptance:", err);
  }

  showSnackbar(
    "success",
    "You have accepted the Terms of Service and Privacy Policy",
    "Accepted",
    4000,
  );
};

const showTermsDialog = () => {
  termsDialogVisible.value = true;
};

const showPrivacyDialog = () => {
  termsDialogVisible.value = true;
};

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/* ============================================
 ERROR HANDLER
============================================ */
const handleError = (error: unknown, fallback: string): string => {
  let message = fallback;
  let title = "Registration Failed";

  if (error && typeof error === "object") {
    if (
      "graphQLErrors" in error &&
      Array.isArray((error as any).graphQLErrors) &&
      (error as any).graphQLErrors.length
    ) {
      const gqlErr = (error as any).graphQLErrors[0];
      message = gqlErr.message || fallback;
      console.error("[Register] GraphQL error:", {
        message: gqlErr.message,
        extensions: gqlErr.extensions,
      });

      const lower = message.toLowerCase();

      if (
        lower.includes("email already") ||
        lower.includes("already registered")
      ) {
        title = "Email Already Exists";
        emailError.value = "Email already registered. Sign in instead.";
        showSnackbar(
          "error",
          "This email is already registered. Please sign in instead.",
          title,
          6000,
        );
        return message;
      }

      if (lower.includes("password must be at least")) {
        title = "Password Requirements";
        passwordError.value = "Password must be at least 8 characters";
        showSnackbar(
          "error",
          "Password must be at least 8 characters long.",
          title,
          5000,
        );
        return message;
      }

      if (lower.includes("invalid") || lower.includes("incorrect")) {
        title = "Invalid Input";
        showSnackbar("error", message, title, 5000);
        return message;
      }
    } else if ("networkError" in error && (error as any).networkError) {
      message = "Network error. Please check your connection.";
      title = "Connection Error";
      console.error("[Register] Network error:", (error as any).networkError);
    } else if ("message" in error && typeof (error as any).message === "string") {
      message = (error as any).message;
    }
  }

  showSnackbar("error", message, title, 6000);
  return message;
};

/* ============================================
 REGISTER — Pinia-driven, role forced to VIEWER
============================================ */
const handleRegister = async () => {
  /* client-side guards */
  if (!isNameValid.value) {
    nameError.value = "Enter your full name";
    showSnackbar(
      "warning",
      "Please enter your full name",
      "Validation Error",
      4000,
    );
    return;
  }
  if (!isEmailValid.value) {
    emailError.value = "Enter a valid email";
    showSnackbar(
      "warning",
      "Please enter a valid email address",
      "Validation Error",
      4000,
    );
    return;
  }
  if (!isPasswordValid.value) {
    passwordError.value = "Password must be at least 8 characters";
    showSnackbar(
      "warning",
      "Password must be at least 8 characters",
      "Validation Error",
      4000,
    );
    return;
  }
  if (!agreeTerms.value) {
    showSnackbar(
      "warning",
      "Please agree to the Terms of Service",
      "Terms Required",
      5000,
    );
    termsDialogVisible.value = true;
    return;
  }

  loading.value = true;
  nameError.value = "";
  emailError.value = "";
  passwordError.value = "";

  try {
    console.log("[Register] Creating account for:", email.value);

    /*
     * Sends exactly { name, email, password, role } —
     * matches RegisterUserInput and the store's signature.
     * Role is explicitly VIEWER; backend enforces the same for
     * unauthenticated callers, so this is intent, not escalation.
     */
    const user = await userStore.register({
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      role: "VIEWER",
    });

    console.log("[Register] Registration successful:", user);

    /*
     * register() returns an AuthPayload-shaped user and the store has
     * already persisted accessToken + user. Caller is signed in.
     * We still route to /auth/login with a `justRegistered` flag so
     * the user sees the welcome banner.
     */
    showSnackbar(
      "success",
      `Welcome to tukema, ${user.name}! Your account is ready.`,
      "Registration Successful",
      5000,
    );

    name.value = "";
    password.value = "";
    agreeTerms.value = false;

    setTimeout(() => {
      router.push({
        path: "/auth/login",
        query: {
          email: user.email,
          justRegistered: "true",
        },
      });
    }, 2000);
  } catch (error: unknown) {
    console.error("[Register] Error:", error);
    handleError(error, "Failed to create account");
  } finally {
    loading.value = false;
  }
};

/* ============================================
 CLEAR ERRORS
============================================ */
const clearNameError = () => {
  nameError.value = "";
};
const clearEmailError = () => {
  emailError.value = "";
};
const clearPasswordError = () => {
  passwordError.value = "";
};

/* ============================================
 CLEANUP
============================================ */
onUnmounted(() => {
  if (passwordHideTimer) {
    clearTimeout(passwordHideTimer);
    passwordHideTimer = null;
  }
  console.log("[Register] Component unmounting");
});
</script>

<style scoped>
.register-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.register-card {
  max-width: 100%;
  margin: auto;
  width: 100%;
  border: 1px solid rgba(26, 82, 118, 0.1);
}

@media (min-width: 600px) {
  .register-card {
    max-width: 480px;
    margin: 1rem auto;
  }
}

/* Terms & Conditions - tukema Style */
.terms-container {
  background: #f0f5fa;
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid #d4e6f1;
  transition: all 0.2s ease;
}

.terms-container:hover {
  background: #eaf2f8;
  border-color: #a9cce3;
}

.terms-checkbox {
  flex-shrink: 0;
}

.terms-link {
  color: #1a5276;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.terms-link:hover {
  color: #2e86c1;
  text-decoration: underline;
}

.terms-link::after {
  content: " ↗";
  font-size: 10px;
  opacity: 0.6;
}

/* Typography - Using App Fonts */
.register-wrapper {
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

.register-card {
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

.text-subtitle-1 {
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

.text-caption {
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

/* Compact spacing overrides */
:deep(.v-field) {
  --v-field-padding-start: 12px;
  --v-field-padding-end: 12px;
  --v-field-padding-top: 8px;
  --v-field-padding-bottom: 4px;
}

:deep(.v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
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
  font-family: var(
    --font-family,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif
  );
  color: #4a6a7f;
}

:deep(.v-messages) {
  font-size: 10px;
  min-height: 16px;
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

:deep(.v-checkbox .v-label) {
  font-size: 11px;
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

/* Snackbar custom positioning */
:deep(.v-snackbar) {
  margin-top: 16px;
}

/* Input focus styles */
:deep(.v-field--focused) {
  border-color: #2e86c1 !important;
}

:deep(.v-field--focused .v-label) {
  color: #1a5276 !important;
}

/* Password strength bar */
:deep(.v-progress-linear) {
  border-radius: 4px;
}
</style>

<route lang="yaml">
meta:
  layout: AuthLayout
  requiresGuest: true
</route>