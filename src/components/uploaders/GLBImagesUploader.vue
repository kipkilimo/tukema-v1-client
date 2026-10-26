<!-- client/src/components/uploaders/GLBImagesUploader.vue -->
<template>
  <v-card rounded="lg" class="glb-uploader-card">
    <!-- Header -->
    <v-card-title
      class="bg-primary-light pa-4 d-flex align-center justify-space-between"
    >
      <div class="d-flex align-center">
        <v-icon size="26" class="mr-3 text-primary">mdi-cube-outline</v-icon>
        <div>
          <span class="text-h6 font-weight-bold">Upload 3D Model</span>
          <div class="text-caption text-medium-emphasis">
            Attach a pre-built .glb file to this artefact
          </div>
        </div>
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

    <v-card-text class="pa-4 pa-sm-6">
      <!-- Artefact Context -->
      <v-card
        v-if="currentArtefact"
        variant="tonal"
        color="secondary"
        rounded="lg"
        class="mb-5 border-sm"
      >
        <v-card-text class="pa-3 d-flex align-center ga-3">
          <v-avatar color="secondary" size="36" rounded="lg">
            <v-icon>mdi-palette-outline</v-icon>
          </v-avatar>
          <div class="min-width-0">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ currentArtefact.title || "Untitled artefact" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              ID: {{ effectiveArtefactId }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-space-between align-end mb-4 flex-wrap ga-2">
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Upload the finished 3D model (.glb) generated from your local Tukema
          GLB Builder.
        </p>
        <v-chip
          size="small"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-information-outline"
        >
          Max {{ maxSizeMB }}MB
        </v-chip>
      </div>

      <!-- Dropzone -->
      <v-sheet
        class="drop-zone d-flex flex-column align-center justify-center py-8 px-4"
        :class="{
          'drop-zone--active': isDragOver,
          'drop-zone--error': !!fileError,
          'drop-zone--disabled': uploading,
          'has-file': file,
        }"
        rounded="lg"
        border
        @dragover.prevent="!uploading && (isDragOver = true)"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="!uploading && handleDrop"
        @click="!uploading && fileInput?.click()"
      >
        <!-- Icon state -->
        <v-icon
          :size="48"
          :color="
            fileError
              ? 'error'
              : file
                ? 'success'
                : isDragOver
                  ? 'primary'
                  : 'grey-darken-1'
          "
          class="mb-3"
          style="transition: transform 0.2s"
          :style="{ transform: isDragOver ? 'scale(1.1)' : 'scale(1)' }"
        >
          {{ file ? "mdi-check-circle-outline" : "mdi-cube-outline" }}
        </v-icon>

        <h4 class="text-subtitle-1 font-weight-bold mb-1 text-center">
          {{
            isDragOver
              ? "Drop .glb file now!"
              : file
                ? file.name
                : "Drag & drop your .glb file here"
          }}
        </h4>

        <p
          v-if="file"
          class="text-caption text-success font-weight-medium mb-4 text-center"
        >
          {{ formatFileSize(file.size) }} &middot; Ready to upload
        </p>
        <p v-else class="text-caption text-medium-emphasis mb-4 text-center">
          Only binary glTF (.glb) files are accepted
        </p>

        <v-btn
          v-if="!file"
          color="primary"
          variant="flat"
          prepend-icon="mdi-folder-open"
          :disabled="uploading"
          class="text-none px-6"
          @click.stop="fileInput?.click()"
        >
          Browse File
        </v-btn>
        <v-btn
          v-else
          variant="tonal"
          color="error"
          size="small"
          :disabled="uploading"
          @click.stop="clearFile"
        >
          Remove File
        </v-btn>

        <input
          ref="fileInput"
          type="file"
          class="d-none"
          accept=".glb,model/gltf-binary"
          @change="handleFileSelect"
        />
      </v-sheet>

      <!-- Validation Error -->
      <v-expand-transition>
        <v-alert
          v-if="fileError"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-4"
          closable
          @click:close="fileError = null"
        >
          <div class="d-flex align-center">
            <v-icon start size="20">mdi-alert-circle-outline</v-icon>
            {{ fileError }}
          </div>
        </v-alert>
      </v-expand-transition>

      <!-- Processing Progress -->
      <v-expand-transition>
        <v-card
          v-if="uploading"
          variant="flat"
          color="primary-lighten-5"
          class="mt-6 border-sm"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-progress-circular
                indeterminate
                size="24"
                width="3"
                color="primary"
              />
              <div>
                <div class="text-body-2 font-weight-bold text-primary">
                  Uploading 3D Model
                </div>
                <div class="text-caption text-medium-emphasis">
                  Sending to Cloudflare R2...
                </div>
              </div>
            </div>
            <v-progress-linear
              indeterminate
              color="primary"
              height="6"
              rounded
            />
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- Server Error -->
      <v-alert
        v-if="uploadError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-4"
        closable
        @click:close="uploadError = null"
      >
        {{ uploadError }}
      </v-alert>

      <!-- Success -->
      <v-alert
        v-if="uploadComplete"
        type="success"
        variant="tonal"
        class="mt-4"
      >
        <div class="d-flex align-center">
          <v-icon start size="24">mdi-check-circle</v-icon>
          <div>
            <div class="font-weight-bold">Upload Complete!</div>
            <div class="text-caption">
              The 3D model has been successfully attached to this artefact.
            </div>
          </div>
        </div>
      </v-alert>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4 bg-grey-lighten-5">
      <v-spacer />
      <v-btn
        variant="text"
        :disabled="uploading"
        @click="close"
        class="text-none"
      >
        {{ uploadComplete ? "Close" : "Cancel" }}
      </v-btn>
      <v-btn
        v-if="!uploadComplete"
        color="primary"
        variant="flat"
        :loading="uploading"
        :disabled="!file || uploading"
        prepend-icon="mdi-cloud-upload"
        class="text-none px-6"
        @click="doUpload"
      >
        Upload GLB
      </v-btn>
      <v-btn
        v-else
        color="primary"
        variant="flat"
        @click="close"
        class="text-none"
      >
        Done
      </v-btn>
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
    maxSizeMB: 250, // Aligned with server's 250MB multer limit
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "uploaded", data: { artefactId: string; fileUrl: string }): void;
  (e: "error", error: Error): void;
}>();

// ============================================================
// STORES & ROUTER
// ============================================================

const artefactStore = useArtefactsStore();
const userStore = useUserStore();
const router = useRouter();

// ============================================================
// STATE
// ============================================================

const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
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

// ============================================================
// VALIDATION & FILE HANDLING
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function validateFile(candidate: File): string | null {
  const name = candidate.name.toLowerCase();
  if (!name.endsWith(".glb") && candidate.type !== "model/gltf-binary") {
    return `"${candidate.name}" is not a valid GLB file. Only .glb allowed.`;
  }

  const maxBytes = props.maxSizeMB * 1024 * 1024;
  if (candidate.size > maxBytes) {
    return `"${candidate.name}" is too large. Max size is ${props.maxSizeMB}MB.`;
  }
  return null;
}

function setFile(candidate: File) {
  const err = validateFile(candidate);
  if (err) {
    fileError.value = err;
    file.value = null;
    return;
  }
  fileError.value = null;
  uploadError.value = null;
  uploadComplete.value = false;
  file.value = candidate;
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    setFile(input.files[0]);
  }
  input.value = "";
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  const dropped = event.dataTransfer?.files[0];
  if (dropped) setFile(dropped);
}

function clearFile() {
  file.value = null;
  fileError.value = null;
  uploadError.value = null;
  uploadComplete.value = false;
}

// ============================================================
// UPLOAD
// ============================================================

function getAuthToken(): string | null {
  try {
    const token = getAccessToken();
    if (token && isTokenValid(token)) return token;
    return null;
  } catch {
    return null;
  }
}

async function doUpload() {
  if (!file.value) {
    fileError.value = "Please select a .glb file.";
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
    formData.append("artefactId", effectiveArtefactId.value);
    formData.append("userId", userStore.user.id);

    // Append the single .glb file matching the backend route expectation
    formData.append("glb", file.value);

    const apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://192.168.43.218:4000";
    const uploadUrl = `${apiBaseUrl}/api/artefacts/upload-glb`;

    console.log("🔄 [DEBUG] Attempting GLB upload to:", uploadUrl);

    const { data } = await axios.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 120000, // 2 mins is plenty for a raw file upload
    });

    if (data.success) {
      uploadComplete.value = true;
      const fileUrl = data.data?.fileUrl || "";

      // Refresh the artefact in the store so the dashboard updates
      await artefactStore.fetchArtefact(effectiveArtefactId.value, true);

      emit("uploaded", {
        artefactId: effectiveArtefactId.value,
        fileUrl: fileUrl,
      });

      setTimeout(() => {
        close();
      }, 3000);
    } else {
      throw new Error(data.message || "Upload failed");
    }
  } catch (err: any) {
    console.error("❌ GLB Upload error:", err);
    let errorMessage = "Failed to upload 3D model.";

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
      } else if (err.response.status === 413) {
        errorMessage = "File is too large for the server to handle.";
      } else if (err.response.status === 500) {
        errorMessage = "Server error during upload. Please try again.";
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
      clearFile();
      isDragOver.value = false;
    }
  },
);
</script>

<style scoped>
.glb-uploader-card {
  max-width: 800px;
  margin: 0 auto;
}

.bg-primary-light {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.drop-zone {
  background: #f8fafc;
  border: 2px dashed #cbd5e1 !important;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.drop-zone:hover:not(.drop-zone--disabled) {
  border-color: #3d8361 !important;
  background: #f0fdf4;
}

.drop-zone--active {
  border-color: #3d8361 !important;
  background: #e8f5e9 !important;
  border-style: solid !important;
}

.drop-zone--error {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.drop-zone.has-file {
  border-color: #4caf50 !important;
  background: rgba(76, 175, 80, 0.05);
}

.drop-zone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.min-width-0 {
  min-width: 0;
}

/* Utility for slight borders */
.border-sm {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
