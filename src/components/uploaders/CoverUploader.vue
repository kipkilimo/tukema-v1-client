<!-- client/src/components/uploaders/CoverUploader.vue -->
<template>
  <v-card rounded="lg">
    <v-card-title
      class="bg-primary-light pa-4 d-flex align-center justify-space-between"
    >
      <div class="d-flex align-center">
        <v-icon size="26" class="mr-2">mdi-image-outline</v-icon>
        <span class="text-h6 font-weight-medium">Upload Cover Image</span>
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        :disabled="uploading"
        @click="close"
      />
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <!-- Artefact info from store -->
      <v-card
        v-if="currentArtefact"
        variant="tonal"
        color="secondary"
        rounded="lg"
        class="mb-4"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-center ga-2">
            <v-icon color="secondary" size="20">mdi-palette-outline</v-icon>
            <div class="min-width-0">
              <div class="text-body-2 font-weight-medium text-truncate">
                {{ currentArtefact.title || "Untitled artefact" }}
              </div>
              <div class="text-caption text-medium-emphasis">
                ID: {{ effectiveArtefactId }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <p class="text-body-2 text-grey-darken-1 mb-4">
        Upload the primary cover image for this artefact. Accepted formats:
        <strong>JPG, PNG, WebP</strong> — up to {{ maxSizeMB }}MB.
      </p>

      <!-- Drop zone -->
      <v-card
        class="drop-zone"
        :class="{
          'drop-zone--active': isDragOver,
          'has-file': file,
          'drop-zone--error': !!fileError,
        }"
        elevation="2"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="!uploading && fileInput?.click()"
      >
        <v-card-text class="text-center pa-6">
          <!-- Image preview if file selected -->
          <div v-if="previewUrl" class="mb-3 d-flex justify-center">
            <v-img
              :src="previewUrl"
              max-height="160"
              max-width="240"
              cover
              class="rounded border"
            />
          </div>
          <v-icon
            v-else
            :size="42"
            :color="file ? 'primary' : 'grey-darken-1'"
            class="mb-3"
          >
            {{ fileIcon }}
          </v-icon>

          <h4 class="text-subtitle-1 mb-1">
            {{ file ? file.name : "Drop your image here" }}
          </h4>

          <p v-if="file" class="text-caption text-grey mb-2">
            {{ formatFileSize(file.size) }}
            <v-chip size="x-small" color="success" variant="tonal" class="ml-2">
              Image ✓
            </v-chip>
          </p>
          <p v-else class="text-caption text-grey mb-2">
            or click to browse &middot; .jpg, .png, .webp
          </p>

          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            :disabled="uploading"
            @click.stop="fileInput?.click()"
          >
            <v-icon start size="16">mdi-folder-open</v-icon>
            {{ file ? "Change image" : "Select image" }}
          </v-btn>

          <input
            ref="fileInput"
            type="file"
            class="d-none"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFileSelect"
          />
        </v-card-text>
      </v-card>

      <v-alert
        v-if="fileError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ fileError }}
      </v-alert>

      <!-- Upload progress -->
      <v-card v-if="uploading" variant="outlined" rounded="lg" class="mt-4">
        <v-card-text class="pa-3">
          <div class="d-flex align-center ga-2 mb-2">
            <v-progress-circular
              indeterminate
              size="18"
              width="2"
              color="primary"
            />
            <span class="text-caption">Uploading cover image…</span>
          </div>
          <v-progress-linear indeterminate color="primary" height="4" rounded />
        </v-card-text>
      </v-card>

      <v-alert
        v-if="uploadError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-3"
        closable
        @click:close="uploadError = null"
      >
        {{ uploadError }}
      </v-alert>

      <v-alert
        v-if="uploadComplete"
        type="success"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        <v-icon start size="16">mdi-check-circle</v-icon>
        Cover image uploaded successfully!
      </v-alert>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4">
      <v-btn
        v-if="file && !uploadComplete"
        variant="text"
        color="error"
        :disabled="uploading"
        @click="removeFile"
      >
        Clear
      </v-btn>
      <v-spacer />
      <v-btn variant="text" :disabled="uploading" @click="close">
        {{ uploadComplete ? "Close" : "Cancel" }}
      </v-btn>
      <v-btn
        v-if="!uploadComplete"
        color="primary"
        variant="flat"
        :loading="uploading"
        :disabled="!file || !!fileError || !effectiveArtefactId"
        @click="doUpload"
      >
        <v-icon start size="16" v-if="!uploading">mdi-upload</v-icon>
        Upload cover
      </v-btn>
      <v-btn v-else color="primary" variant="flat" @click="close"> Done </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useArtefactsStore } from "@/stores/artefacts";
import { useUserStore } from "@/stores/users";
import {
  getAccessToken,
  removeTokens,
  isTokenValid,
} from "@/graphql/apolloClient";

// ============================================================
// PROPS & EMITS
// ============================================================

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    artefactId?: string;
    maxSizeMB?: number;
  }>(),
  {
    maxSizeMB: 5,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "uploaded",
    data: { file: File; artefactId: string; fileUrl: string },
  ): void;
  (e: "error", error: Error): void;
}>();

// ============================================================
// STORES & ROUTER
// ============================================================

const artefactStore = useArtefactsStore();
const userStore = useUserStore();
const router = useRouter();

// ============================================================
// LOCAL STATE
// ============================================================

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const previewUrl = ref<string>("");
const fileError = ref<string | null>(null);
const isDragOver = ref(false);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadComplete = ref(false);

// ============================================================
// COMPUTED
// ============================================================

const currentArtefact = computed(() => {
  if (props.artefactId) {
    return (
      artefactStore.getById(props.artefactId) || artefactStore.currentArtefact
    );
  }
  return artefactStore.currentArtefact;
});

const effectiveArtefactId = computed(() => {
  if (props.artefactId) return props.artefactId;
  if (currentArtefact.value?.id) return currentArtefact.value.id;
  return null;
});

const fileIcon = computed(() => {
  if (!file.value) return "mdi-cloud-upload-outline";
  return "mdi-image-outline";
});

// ============================================================
// VALIDATION & PREVIEW
// ============================================================

function validateFile(candidate: File): string | null {
  const name = candidate.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasAllowedMime =
    !candidate.type || ALLOWED_MIME_TYPES.includes(candidate.type);

  if (!hasAllowedExt || !hasAllowedMime) {
    return "Only JPG, PNG, or WebP images are accepted.";
  }
  const maxBytes = props.maxSizeMB * 1024 * 1024;
  if (candidate.size > maxBytes) {
    return `File is too large. Max size is ${props.maxSizeMB}MB.`;
  }
  return null;
}

function setFile(candidate: File) {
  const err = validateFile(candidate);
  if (err) {
    fileError.value = err;
    file.value = null;
    previewUrl.value = "";
    return;
  }
  fileError.value = null;
  file.value = candidate;
  uploadError.value = null;
  uploadComplete.value = false;

  // Create preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(candidate);
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) setFile(input.files[0]);
  input.value = "";
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  const dropped = event.dataTransfer?.files[0];
  if (dropped) setFile(dropped);
}

function removeFile() {
  file.value = null;
  fileError.value = null;
  uploadError.value = null;
  uploadComplete.value = false;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ============================================================
// GET AUTH TOKEN
// ============================================================

function getAuthToken(): string | null {
  try {
    const token = getAccessToken();
    if (token) {
      if (!isTokenValid(token)) {
        console.warn("⚠️ [DEBUG] Token is invalid or expired");
        return token;
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error("❌ [DEBUG] Error getting token:", error);
    return null;
  }
}

// ============================================================
// UPLOAD
// ============================================================

async function doUpload() {
  if (!file.value || fileError.value) {
    uploadError.value = "Please select a valid image file.";
    return;
  }

  if (!effectiveArtefactId.value) {
    uploadError.value =
      "Artefact ID is required. Please save the artefact first.";
    return;
  }

  if (!userStore.user?.id) {
    uploadError.value = "User ID missing. Please log in again.";
    return;
  }

  uploading.value = true;
  uploadError.value = null;
  uploadComplete.value = false;

  try {
    const token = getAuthToken();
    if (!token) {
      uploadError.value = "Authentication required. Please log in again.";
      uploading.value = false;
      return;
    }

    const formData = new FormData();
    formData.append("file", file.value);
    formData.append("artefactId", effectiveArtefactId.value);
    formData.append("userId", userStore.user.id); // Send userId to server

    const apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://192.168.43.218:4000";
    // Ensure this matches your Express route for cover uploads
    const uploadUrl = `${apiBaseUrl}/api/artefacts/upload-cover`;

    console.log("🔄 [DEBUG] Attempting cover upload to:", uploadUrl);

    const { data } = await axios.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 60000, // 1 min timeout for images
    });

    if (data.success) {
      uploadComplete.value = true;
      const fileUrl = data.data?.fileUrl || data.fileUrl || "";

      // Refresh the artefact in the store so the dashboard table updates
      await artefactStore.fetchArtefact(effectiveArtefactId.value, true);

      emit("uploaded", {
        file: file.value!,
        artefactId: effectiveArtefactId.value!,
        fileUrl: fileUrl,
      });

      setTimeout(() => {
        close();
      }, 2000);
    } else {
      throw new Error(data.message || "Upload failed");
    }
  } catch (err: any) {
    console.error("❌ Upload error details:", err);
    let errorMessage = "Failed to upload image.";

    if (err.response) {
      if (err.response.status === 401) {
        const errorMsg = err.response.data?.message || "";
        const errorCode = err.response.data?.code || "";

        if (errorCode === "USER_NOT_FOUND") {
          errorMessage = "User not found. Please log in again.";
          removeTokens();
          setTimeout(() => router.push("/auth/login"), 3000);
        } else if (
          errorMsg.includes("expired") ||
          errorCode === "TOKEN_EXPIRED"
        ) {
          errorMessage = "Your session has expired. Please log in again.";
          removeTokens();
          setTimeout(() => router.push("/auth/login"), 3000);
        } else {
          errorMessage = errorMsg || "Authentication error.";
        }
      } else if (err.response.status === 404) {
        errorMessage = "Upload endpoint not found.";
      } else if (err.response.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage =
          err.response.data?.message || `Error: ${err.response.status}`;
      }
    } else if (err.request) {
      errorMessage = "No response from server. Check your connection.";
    } else {
      errorMessage = err.message;
    }

    uploadError.value = errorMessage;
    emit("error", err);
  } finally {
    uploading.value = false;
  }
}

// ============================================================
// DIALOG CONTROLS & WATCHERS
// ============================================================

function close() {
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      removeFile();
    }
  },
);

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.drop-zone--active {
  border-color: #3d8361;
  background: #eef2ff;
}

.drop-zone--error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

.drop-zone.has-file {
  border-color: #3d8361;
  background-color: rgba(61, 131, 97, 0.05);
}

.bg-primary-light {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.min-width-0 {
  min-width: 0;
}

:deep(.v-card-text) {
  padding-top: 12px;
}
</style>
