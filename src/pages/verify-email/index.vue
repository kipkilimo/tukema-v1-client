<!-- src/views/auth/VerifyEmail.vue -->
<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="pa-4 pa-md-6" elevation="2" :loading="loading">
          <!-- Loading State -->
          <v-card-text v-if="loading" class="text-center py-6">
            <v-progress-circular
              indeterminate
              size="48"
              color="primary"
              class="mb-3"
            />
            <div class="text-subtitle-1">Verifying your email...</div>
          </v-card-text>

          <!-- Success State -->
          <v-card-text v-else-if="verificationSuccess" class="text-center py-4">
            <v-icon
              icon="mdi-check-circle"
              size="56"
              color="success"
              class="mb-3"
            />
            <div class="text-h6 font-weight-bold">Email Verified!</div>
            <div class="text-body-2 text-medium-emphasis mt-1 mb-4">
              Your account is now active.
            </div>
            <v-btn
              color="primary"
              size="large"
              block
              :loading="redirecting"
              @click="redirectToLogin"
            >
              Go to Login
            </v-btn>
          </v-card-text>

          <!-- Error State -->
          <v-card-text v-else-if="verificationError" class="text-center py-4">
            <v-icon
              icon="mdi-alert-circle"
              size="56"
              color="error"
              class="mb-3"
            />
            <div class="text-h6 font-weight-bold">{{ errorTitle }}</div>
            <div class="text-body-2 text-medium-emphasis mt-1 mb-4">
              {{ errorMessage }}
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              block
              class="mb-2"
              :loading="resending"
              @click="resendVerification"
            >
              Resend Email
            </v-btn>

            <v-btn
              color="grey"
              variant="text"
              size="large"
              block
              @click="redirectToLogin"
            >
              Back to Login
            </v-btn>

            <!-- Resend Success Message -->
            <v-alert
              v-if="resendSuccess"
              type="success"
              variant="tonal"
              density="compact"
              class="mt-3"
            >
              Verification email sent! Please check your inbox.
            </v-alert>
          </v-card-text>

          <!-- Footer -->
          <v-card-actions class="justify-center pt-2">
            <div class="text-caption text-medium-emphasis">
              Need help?
              <a href="/support" class="text-primary">Contact Support</a>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useVoucherStore } from "@/stores/vouchers";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const snackbarStore = useVoucherStore();

// State
const loading = ref(true);
const redirecting = ref(false);
const resending = ref(false);
const verificationSuccess = ref(false);
const verificationError = ref(false);
const resendSuccess = ref(false);
const errorMessage = ref("The verification link is invalid or has expired.");
const errorTitle = ref("Verification Failed");
const email = ref("");
const token = ref("");

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4005";

// Methods
const getParams = () => {
  token.value = (route.query.token as string) || "";
  email.value = (route.query.email as string) || "";

  // Support for token in params as well
  if (!token.value && route.params.token) {
    token.value = route.params.token as string;
  }

  // Decode email if it was URL encoded
  if (email.value) {
    try {
      email.value = decodeURIComponent(email.value);
    } catch (e) {
      console.error("Failed to decode email:", e);
    }
  }
};

const verifyEmail = async () => {
  if (!token.value) {
    loading.value = false;
    verificationError.value = true;
    errorTitle.value = "Invalid Link";
    errorMessage.value = "No verification token provided.";
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/auth/verify-email`, {
      params: {
        token: token.value,
        email: email.value || undefined,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Success
    verificationSuccess.value = true;
    verificationError.value = false;

    snackbarStore.show({
      message: response.data.message || "Email verified successfully!",
      type: "success",
      timeout: 4000,
    });

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      if (verificationSuccess.value) {
        redirectToLogin();
      }
    }, 3000);
  } catch (error: any) {
    console.error("Verification error:", error);
    verificationSuccess.value = false;
    verificationError.value = true;

    // Extract error message from response
    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        errorTitle.value = "Invalid Link";
        errorMessage.value =
          error.response.data?.error ||
          "The verification link is invalid or has expired.";
      } else if (status === 401) {
        errorTitle.value = "Authentication Required";
        errorMessage.value = "Please log in to verify your email.";
      } else if (status === 404) {
        errorTitle.value = "Not Found";
        errorMessage.value = "Verification endpoint not found.";
      } else if (status === 500) {
        errorTitle.value = "Server Error";
        errorMessage.value =
          "An error occurred on the server. Please try again later.";
      } else {
        errorTitle.value = "Verification Failed";
        errorMessage.value =
          error.response.data?.error || "Unable to verify your email.";
      }
    } else if (error.request) {
      errorTitle.value = "Network Error";
      errorMessage.value =
        "Cannot reach the server. Please check your connection.";
    } else {
      errorTitle.value = "Error";
      errorMessage.value = error.message || "An unexpected error occurred.";
    }

    snackbarStore.show({
      message: errorMessage.value,
      type: "error",
      timeout: 4000,
    });
  } finally {
    loading.value = false;
  }
};

const resendVerification = async () => {
  if (!email.value) {
    snackbarStore.show({
      message: "Email address not found. Please use the link from your email.",
      type: "error",
    });
    return;
  }

  resending.value = true;
  resendSuccess.value = false;

  try {
    const response = await axios.post(
      `${API_URL}/auth/resend-verification`,
      {
        email: email.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      resendSuccess.value = true;
      snackbarStore.show({
        message: "Verification email sent successfully!",
        type: "success",
        timeout: 4000,
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        resendSuccess.value = false;
      }, 5000);
    } else {
      throw new Error(
        response.data.error || "Failed to resend verification email",
      );
    }
  } catch (error: any) {
    console.error("Resend error:", error);
    snackbarStore.show({
      message:
        error.response?.data?.error ||
        "Failed to resend verification email. Please try again.",
      type: "error",
      timeout: 4000,
    });
  } finally {
    resending.value = false;
  }
};

const redirectToLogin = () => {
  redirecting.value = true;
  router.push("/auth/login");
};

// Lifecycle
onMounted(() => {
  getParams();
  verifyEmail();
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: #f5f7fa;
}

:deep(.v-card) {
  border-radius: 12px;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.2px;
}

@media (max-width: 600px) {
  :deep(.v-card) {
    margin: 12px;
  }
}
</style>
