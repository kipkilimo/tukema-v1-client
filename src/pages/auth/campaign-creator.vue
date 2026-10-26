<template>
  <v-card class="campaign-card" rounded="xl">
    <!-- ============================================================ -->
    <!-- HEADER (fixed) -->
    <!-- ============================================================ -->
    <v-card-title class="d-flex align-center pa-6 bg-primary flex-shrink-0">
      <v-icon icon="mdi-bullhorn-variant" size="32" class="mr-3" />
      <div>
        <div class="text-h5 font-weight-bold">Launch a Campaign</div>
        <div class="text-caption text-medium-emphasis">
          Max 84 days &middot; 10 campaigns run simultaneously
        </div>
      </div>
    </v-card-title>

    <!-- ============================================================ -->
    <!-- SCROLLABLE BODY (only this area scrolls) -->
    <!-- ============================================================ -->
    <v-card-text class="campaign-scroll-area pa-0">
      <v-form
        ref="formRef"
        @submit.prevent="submitCampaign"
        class="pa-4 pa-md-6"
      >
        <v-stepper
          v-model="step"
          :items="stepperItems"
          flat
          hide-actions
          class="campaign-stepper"
          @update:model-value="handleStepChange"
        >
          <!-- ============================================================
                   STEP 1 — CAMPAIGN DETAILS + SCHEDULE
                   ============================================================ -->
          <template #item.1>
            <div class="step-content pt-2">
              <div class="step-heading mb-5">
                <div class="d-flex align-center">
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="42"
                    class="mr-3"
                  >
                    <v-icon icon="mdi-information-outline" />
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">Campaign Details</div>
                    <div class="text-body-2 text-medium-emphasis">
                      Tell us about the campaign and when it should run.
                    </div>
                  </div>
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.title"
                    label="Campaign Title"
                    placeholder="e.g. World Malaria Day 2027"
                    variant="outlined"
                    prepend-inner-icon="mdi-format-title"
                    :rules="[rules.required, rules.maxLength(100)]"
                    counter="100"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.organizationName"
                    label="Organization Name"
                    placeholder="e.g. tukema"
                    variant="outlined"
                    prepend-inner-icon="mdi-domain"
                    :rules="[rules.required, rules.maxLength(80)]"
                    counter="80"
                    clearable
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Campaign Description"
                    placeholder="Briefly describe the campaign..."
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    rows="4"
                    auto-grow
                    :rules="[rules.required, rules.maxLength(500)]"
                    counter="500"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.externalLink"
                    label="External Link"
                    hint="Optional — e.g. your campaign or organisation website"
                    persistent-hint
                    variant="outlined"
                    prepend-inner-icon="mdi-link-variant"
                    placeholder="https://example.com/campaign"
                    :rules="[rules.optionalUrl]"
                    clearable
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Schedule -->
              <div class="step-heading mb-4">
                <div class="d-flex align-center">
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="42"
                    class="mr-3"
                  >
                    <v-icon icon="mdi-calendar-range" />
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      Campaign Schedule
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      Choose when your campaign should appear.
                    </div>
                  </div>
                </div>
              </div>

              <v-alert
                type="info"
                variant="tonal"
                density="comfortable"
                rounded="lg"
                class="mb-5"
              >
                <template #prepend>
                  <v-icon icon="mdi-information-outline" />
                </template>
                Campaigns can run for a maximum of
                <strong>84 days</strong>. If all 10 campaign slots are occupied,
                your campaign will automatically enter the queue.
              </v-alert>

              <v-row>
                <!-- START DATE -->
                <v-col cols="12" md="6">
                  <div
                    ref="startDateWrapRef"
                    class="date-field-wrap"
                    @click="openPicker(startDateInputRef)"
                  >
                    <v-text-field
                      v-model="form.campaignStartDate"
                      label="Start Date"
                      type="date"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar-start"
                      :rules="[rules.required]"
                      :min="todayIso"
                      @update:model-value="onStartDateChange"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-calendar-search"
                          variant="text"
                          color="primary"
                          size="small"
                          tabindex="-1"
                          aria-label="Open start date picker"
                          @click.stop="openPicker(startDateInputRef)"
                        />
                      </template>
                    </v-text-field>

                    <input
                      ref="startDateInputRef"
                      type="date"
                      class="native-date-input"
                      :value="form.campaignStartDate"
                      :min="todayIso"
                      @change="onStartNativeChange"
                    />
                  </div>
                </v-col>

                <!-- END DATE -->
                <v-col cols="12" md="6">
                  <div
                    ref="endDateWrapRef"
                    class="date-field-wrap"
                    @click="openPicker(endDateInputRef)"
                  >
                    <v-text-field
                      v-model="form.campaignEndDate"
                      label="End Date"
                      type="date"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar-end"
                      :rules="[rules.required, rules.endDateAfterStart]"
                      :min="form.campaignStartDate || todayIso"
                      :max="maxEndDateIso"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-calendar-search"
                          variant="text"
                          color="primary"
                          size="small"
                          tabindex="-1"
                          aria-label="Open end date picker"
                          @click.stop="openPicker(endDateInputRef)"
                        />
                      </template>
                    </v-text-field>

                    <input
                      ref="endDateInputRef"
                      type="date"
                      class="native-date-input"
                      :value="form.campaignEndDate"
                      :min="form.campaignStartDate || todayIso"
                      :max="maxEndDateIso"
                      @change="onEndNativeChange"
                    />
                  </div>
                </v-col>
              </v-row>

              <!-- Duration feedback -->
              <v-card
                v-if="durationDays !== null"
                variant="tonal"
                rounded="lg"
                class="mt-2"
                :color="durationValid ? 'success' : 'error'"
              >
                <v-card-text class="py-3">
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="
                        durationValid ? 'mdi-check-circle' : 'mdi-alert-circle'
                      "
                      class="mr-3"
                    />
                    <div>
                      <div class="font-weight-medium">
                        {{ durationDays }}
                        day{{ durationDays === 1 ? "" : "s" }}
                      </div>
                      <div v-if="durationValid" class="text-caption">
                        Campaign duration is within the allowed 84-day limit.
                      </div>
                      <div v-else class="text-caption">
                        Campaign duration must be between 1 and 84 days.
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Step status -->
              <v-alert
                v-if="!detailsValid"
                type="warning"
                variant="tonal"
                density="compact"
                rounded="lg"
                class="mt-4"
              >
                <strong>Complete the required fields</strong>
                before continuing to the banner step.
              </v-alert>
            </div>
          </template>

          <!-- ============================================================
                   STEP 2 — BANNER + REVIEW
                   ============================================================ -->
          <template #item.2>
            <div class="step-content pt-2">
              <div class="step-heading mb-5">
                <div class="d-flex align-center">
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="42"
                    class="mr-3"
                  >
                    <v-icon icon="mdi-image-outline" />
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      Banner &amp; Review
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      Upload your campaign banner and review the details.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Banner -->
              <div class="text-subtitle-1 font-weight-bold mb-2">
                Campaign Banner <span class="text-error">*</span>
              </div>

              <div class="text-body-2 text-medium-emphasis mb-3">
                Use a clear promotional image in JPG, PNG, WEBP or AVIF format.
              </div>

              <v-card
                variant="outlined"
                rounded="lg"
                class="banner-dropzone"
                :class="{
                  'banner-dropzone--dragging': isDragging,
                  'banner-dropzone--error': !!bannerError,
                  'banner-dropzone--has-image': !!bannerPreview,
                }"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <v-img
                  v-if="bannerPreview"
                  :src="bannerPreview"
                  max-height="280"
                  contain
                  class="rounded-lg"
                />

                <div v-else class="banner-placeholder text-center pa-8">
                  <v-avatar color="primary" variant="tonal" size="76">
                    <v-icon icon="mdi-cloud-upload-outline" size="40" />
                  </v-avatar>

                  <div class="text-subtitle-1 font-weight-bold mt-4">
                    Upload your campaign banner
                  </div>

                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Click to browse or drag &amp; drop an image here
                  </div>

                  <div class="text-caption text-medium-emphasis mt-3">
                    JPG · JPEG · PNG · WEBP · AVIF · Maximum 5 MB
                  </div>

                  <v-btn
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-upload"
                    class="mt-4"
                    @click.stop="triggerFileInput"
                  >
                    Choose Image
                  </v-btn>
                </div>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  class="d-none"
                  @change="handleFileSelect"
                />

                <v-btn
                  v-if="bannerPreview"
                  icon="mdi-close"
                  size="small"
                  color="error"
                  variant="flat"
                  class="banner-remove-btn"
                  aria-label="Remove banner"
                  @click.stop="clearBanner"
                />
              </v-card>

              <v-alert
                v-if="bannerError"
                type="error"
                variant="tonal"
                density="comfortable"
                rounded="lg"
                class="mt-3"
              >
                {{ bannerError }}
              </v-alert>

              <v-alert
                v-else-if="bannerFile"
                type="success"
                variant="tonal"
                density="compact"
                rounded="lg"
                class="mt-3"
              >
                <div class="d-flex align-center">
                  <v-icon icon="mdi-check-circle" class="mr-2 flex-shrink-0" />
                  <div class="text-truncate">
                    <strong>{{ bannerFile.name }}</strong>
                    · {{ formatFileSize(bannerFile.size) }}
                  </div>
                </div>
              </v-alert>

              <v-divider class="my-6" />

              <!-- Review -->
              <div class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon icon="mdi-clipboard-check-outline" class="mr-1" />
                Review your campaign
              </div>

              <v-card variant="outlined" rounded="lg" class="review-card">
                <v-list lines="two">
                  <v-list-item
                    prepend-icon="mdi-format-title"
                    title="Campaign title"
                    :subtitle="form.title || 'Not provided'"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-domain"
                    title="Organization"
                    :subtitle="form.organizationName || 'Not provided'"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-calendar-range"
                    title="Schedule"
                    :subtitle="`${form.campaignStartDate || '—'} → ${
                      form.campaignEndDate || '—'
                    }`"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-clock-outline"
                    title="Duration"
                    :subtitle="
                      durationDays !== null
                        ? `${durationDays} day${durationDays === 1 ? '' : 's'}`
                        : 'Not calculated'
                    "
                  />
                  <template v-if="form.externalLink">
                    <v-divider />
                    <v-list-item
                      prepend-icon="mdi-link-variant"
                      title="External link"
                      :subtitle="form.externalLink"
                      class="review-link-item"
                    />
                  </template>
                </v-list>
              </v-card>

              <!-- Final readiness -->
              <v-alert
                :type="canSubmit ? 'success' : 'warning'"
                variant="tonal"
                rounded="lg"
                class="mt-5"
              >
                <template #prepend>
                  <v-icon
                    :icon="
                      canSubmit ? 'mdi-check-circle' : 'mdi-information-outline'
                    "
                  />
                </template>

                <strong v-if="canSubmit"
                  >Your campaign is ready to submit.</strong
                >
                <span v-else
                  >Upload a valid banner image to enable submission.</span
                >
              </v-alert>
            </div>
          </template>
        </v-stepper>
      </v-form>
    </v-card-text>

    <!-- ============================================================ -->
    <!-- FOOTER (fixed, outside the scroll area) -->
    <!-- ============================================================ -->
    <v-divider />
    <v-card-actions class="stepper-footer flex-shrink-0">
      <div class="stepper-footer-inner">
        <!-- Progress -->
        <div class="step-progress">
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
            class="step-chip"
          >
            <v-icon start icon="mdi-progress-check" />
            Step {{ step }} of 2
          </v-chip>

          <span class="step-progress-label">
            {{
              step === 1
                ? "Campaign details & schedule"
                : "Banner & final review"
            }}
          </span>
        </div>

        <v-divider class="my-3" />

        <div class="stepper-actions">
          <!-- Left -->
          <div class="action-group">
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :disabled="isSubmitting"
              @click="resetForm"
            >
              Reset
            </v-btn>

            <v-btn
              variant="text"
              prepend-icon="mdi-close"
              :disabled="isSubmitting"
              @click="handleCancel"
            >
              Cancel
            </v-btn>
          </div>

          <v-spacer />

          <!-- Step 1 navigation -->
          <v-btn
            v-if="step === 1"
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            append-icon="mdi-arrow-right"
            class="nav-btn"
            :disabled="!detailsValid || isSubmitting"
            @click="goToStep2"
          >
            Continue to Banner
          </v-btn>

          <!-- Step 2 navigation -->
          <div v-else class="action-group step-two-actions">
            <v-btn
              variant="tonal"
              color="primary"
              size="large"
              rounded="lg"
              prepend-icon="mdi-arrow-left"
              :disabled="isSubmitting"
              @click="goToStep1"
            >
              Back to Details
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              size="large"
              rounded="lg"
              prepend-icon="mdi-send"
              class="nav-btn submit-btn"
              :loading="isSubmitting"
              :disabled="!canSubmit || isSubmitting"
              @click="submitCampaign"
            >
              Submit Campaign
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-actions>

    <!-- ============================================================ -->
    <!-- SNACKBAR -->
    <!-- ============================================================ -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="6000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2" />
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- ============================================================ -->
    <!-- SUCCESS DIALOG -->
    <!-- ============================================================ -->
    <v-dialog v-model="successDialog.show" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon
            :icon="
              successDialog.status === 'active'
                ? 'mdi-check-circle'
                : 'mdi-clock-outline'
            "
            :color="successDialog.status === 'active' ? 'success' : 'warning'"
            class="mr-2"
          />
          {{
            successDialog.status === "active"
              ? "Campaign is Live!"
              : "Campaign Queued"
          }}
        </v-card-title>

        <v-card-text>
          <p v-if="successDialog.status === 'active'">
            Your campaign has been submitted and is now live on the landing
            page.
          </p>
          <p v-else>
            All 10 campaign slots are currently occupied. Your campaign has been
            queued and will automatically activate when a slot opens up.
          </p>

          <v-alert
            v-if="
              successDialog.status === 'queued' && successDialog.queuePosition
            "
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            Queue Position: <strong>#{{ successDialog.queuePosition }}</strong>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="closeSuccessDialog">
            Got it
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import axios, { AxiosError } from "axios";

// ============================================================
// EMITS
// ============================================================

const emit = defineEmits<{
  (
    e: "created",
    payload: { status: "active" | "queued"; queuePosition: number | null },
  ): void;
  (e: "cancel"): void;
}>();

// ============================================================
// TYPES
// ============================================================

interface CampaignForm {
  title: string;
  description: string;
  organizationName: string;
  externalLink: string;
  campaignStartDate: string;
  campaignEndDate: string;
}

interface ApiSuccessData {
  campaign: {
    _id: string;
    status: "active" | "queued";
    queuePosition: number | null;
  };
  fileMetadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    storageKey: string;
    publicUrl: string;
  };
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  code: string;
  data: ApiSuccessData;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

interface VFormRef {
  validate: () => Promise<{ valid: boolean }>;
  reset: () => void;
  resetValidation: () => void;
}

// ============================================================
// CONSTANTS & ENV
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_ENDPOINT = `${API_BASE_URL}/api/campaigns/create`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAMPAIGN_DURATION_DAYS = 28 * 3;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

// ============================================================
// STEPPER
// ============================================================

const step = ref(1);

// Items are objects (not plain strings) so step 2's tab can be disabled
// until step 1 is valid — this is what makes header-tab navigation safe
// to enable instead of only allowing it via the "Continue" button.
const stepperItems = computed(() => [
  { title: "Details & Schedule", value: 1 },
  {
    title: "Banner & Review",
    value: 2,
    disabled: !detailsValid.value,
  },
]);

// ============================================================
// STATE
// ============================================================

const formRef = ref<VFormRef | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const startDateInputRef = ref<HTMLInputElement | null>(null);
const endDateInputRef = ref<HTMLInputElement | null>(null);
const startDateWrapRef = ref<HTMLElement | null>(null);
const endDateWrapRef = ref<HTMLElement | null>(null);

const isSubmitting = ref(false);
const isDragging = ref(false);

const bannerFile = ref<File | null>(null);
const bannerPreview = ref<string | null>(null);
const bannerError = ref<string>("");

const form = reactive<CampaignForm>({
  title: "",
  description: "",
  organizationName: "",
  externalLink: "",
  campaignStartDate: "",
  campaignEndDate: "",
});

const snackbar = reactive({
  show: false,
  message: "",
  color: "success" as "success" | "error" | "warning" | "info",
  icon: "mdi-check-circle",
});

const successDialog = reactive({
  show: false,
  status: "active" as "active" | "queued",
  queuePosition: null as number | null,
});

// ============================================================
// HELPERS
// ============================================================

const isValidUrl = (value: string): boolean => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ============================================================
// COMPUTED
// ============================================================

const todayIso = computed(() => new Date().toISOString().split("T")[0]);

const durationDays = computed<number | null>(() => {
  if (!form.campaignStartDate || !form.campaignEndDate) return null;

  const start = new Date(form.campaignStartDate);
  const end = new Date(form.campaignEndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
});

const durationValid = computed(() => {
  if (durationDays.value === null) return false;
  return (
    durationDays.value > 0 && durationDays.value <= MAX_CAMPAIGN_DURATION_DAYS
  );
});

const maxEndDateIso = computed(() => {
  if (!form.campaignStartDate) return undefined;

  const start = new Date(form.campaignStartDate);
  if (isNaN(start.getTime())) return undefined;

  const max = new Date(start);
  max.setDate(max.getDate() + MAX_CAMPAIGN_DURATION_DAYS);

  return max.toISOString().split("T")[0];
});

// ============================================================
// STEPPER VALIDITY
// ============================================================

const detailsValid = computed(() => {
  const title = form.title.trim();
  const description = form.description.trim();
  const organization = form.organizationName.trim();
  const externalLink = form.externalLink.trim();

  const titleValid = title.length > 0 && title.length <= 100;
  const descriptionValid = description.length > 0 && description.length <= 500;
  const organizationValid =
    organization.length > 0 && organization.length <= 80;
  const externalLinkValid = !externalLink || isValidUrl(externalLink);

  const datesValid =
    !!form.campaignStartDate && !!form.campaignEndDate && durationValid.value;

  return (
    titleValid &&
    descriptionValid &&
    organizationValid &&
    externalLinkValid &&
    datesValid
  );
});

const canSubmit = computed(() => {
  return detailsValid.value && !!bannerFile.value && !bannerError.value;
});

// Alias kept in case other code already references it.
const canGoToStep2 = computed(() => detailsValid.value);

// ============================================================
// VALIDATION RULES
// ============================================================

const rules = {
  required: (v: string) => !!v?.trim() || "This field is required.",

  maxLength: (max: number) => (v: string) =>
    !v || v.length <= max || `Must be ${max} characters or less.`,

  optionalUrl: (v: string) =>
    isValidUrl(v) || "Please enter a valid HTTP or HTTPS URL.",

  endDateAfterStart: (v: string) => {
    if (!v || !form.campaignStartDate) return true;

    const start = new Date(form.campaignStartDate);
    const end = new Date(v);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;

    if (end <= start) return "End date must be after start date.";

    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (days > MAX_CAMPAIGN_DURATION_DAYS) {
      return `Duration cannot exceed ${MAX_CAMPAIGN_DURATION_DAYS} days.`;
    }
    return true;
  },
};

// ============================================================
// WATCHERS
// ============================================================

watch(
  () => form.campaignStartDate,
  (newStart) => {
    if (!newStart || !form.campaignEndDate) return;

    const start = new Date(newStart);
    const end = new Date(form.campaignEndDate);

    if (end <= start) {
      form.campaignEndDate = "";
    }
  },
);

// ============================================================
// DATE PICKER
// ============================================================

const openPicker = (el: HTMLInputElement | null) => {
  if (!el) return;
  try {
    // @ts-expect-error — showPicker not in all TS lib defs
    if (typeof el.showPicker === "function") {
      el.showPicker();
      return;
    }
  } catch {
    /* fall through */
  }
  el.focus();
  el.click();
};

const onStartNativeChange = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  if (value) {
    form.campaignStartDate = value;
    onStartDateChange();
  }
};

const onEndNativeChange = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  if (value) {
    form.campaignEndDate = value;
  }
};

const onStartDateChange = () => {
  formRef.value?.validate();
};

// ============================================================
// STEPPER NAVIGATION
// ============================================================

const goToStep1 = () => {
  if (isSubmitting.value) return;
  step.value = 1;
};

const goToStep2 = async () => {
  if (isSubmitting.value) return;

  const validation = await formRef.value?.validate();

  if (!validation?.valid || !detailsValid.value) {
    step.value = 1;
    showSnackbar("Please complete all required campaign details.", "warning");
    return;
  }

  if (!durationValid.value) {
    step.value = 1;
    showSnackbar("Campaign duration must be between 1 and 84 days.", "error");
    return;
  }

  step.value = 2;
};

/**
 * Handles clicks on the stepper header tabs. Step 2's tab is disabled
 * (see stepperItems) whenever details aren't valid, so this mostly just
 * keeps `step` in sync and re-validates when returning to step 1.
 */
const handleStepChange = (requestedStep: number) => {
  if (isSubmitting.value) return;

  if (requestedStep === 1) {
    step.value = 1;
    return;
  }

  if (requestedStep === 2) {
    if (detailsValid.value) {
      step.value = 2;
    } else {
      step.value = 1;
      showSnackbar(
        "Complete the campaign details before continuing.",
        "warning",
      );
    }
  }
};

// ============================================================
// FILE HANDLING
// ============================================================

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) processFile(file);
  target.value = "";
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) processFile(file);
};

const processFile = (file: File) => {
  bannerError.value = "";

  const fileName = file.name.toLowerCase();

  const extension = ALLOWED_EXTENSIONS.find((ext) => fileName.endsWith(ext));
  const validExtension = !!extension;
  const validMime = ALLOWED_MIME_TYPES.includes(file.type);

  if (!validExtension || !validMime) {
    bannerFile.value = null;
    bannerPreview.value = null;
    bannerError.value =
      "Invalid image. Please use JPG, JPEG, PNG, WEBP or AVIF.";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    bannerFile.value = null;
    bannerPreview.value = null;
    bannerError.value = `File too large (${formatFileSize(
      file.size,
    )}). Maximum size is 5 MB.`;
    return;
  }

  bannerFile.value = file;

  const reader = new FileReader();

  reader.onload = (event) => {
    bannerPreview.value = event.target?.result as string;
  };

  reader.onerror = () => {
    bannerFile.value = null;
    bannerPreview.value = null;
    bannerError.value =
      "Unable to preview this image. Please choose another file.";
  };

  reader.readAsDataURL(file);
};

const clearBanner = () => {
  bannerFile.value = null;
  bannerPreview.value = null;
  bannerError.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
};

// ============================================================
// SUBMIT
// ============================================================

const submitCampaign = async () => {
  bannerError.value = "";

  const validation = await formRef.value?.validate();

  if (!validation?.valid) {
    step.value = 1;
    showSnackbar("Please complete all required campaign details.", "warning");
    return;
  }

  if (!durationValid.value) {
    step.value = 1;
    showSnackbar("Campaign duration must be between 1 and 84 days.", "error");
    return;
  }

  if (!bannerFile.value) {
    bannerError.value = "Please upload a banner image.";
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("organizationName", form.organizationName.trim());
    payload.append("campaignStartDate", form.campaignStartDate);
    payload.append("campaignEndDate", form.campaignEndDate);

    if (form.externalLink.trim()) {
      payload.append("externalLink", form.externalLink.trim());
    }

    payload.append("bannerImage", bannerFile.value);

    const { data } = await axios.post<ApiResponse>(API_ENDPOINT, payload, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    if (!data.success) {
      showSnackbar(data.error, "error");
      return;
    }

    showSnackbar(
      data.message || "Campaign submitted successfully!",
      data.data.campaign.status === "active" ? "success" : "info",
    );

    successDialog.status = data.data.campaign.status;
    successDialog.queuePosition = data.data.campaign.queuePosition;
    successDialog.show = true;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to submit campaign. Please try again.";

    showSnackbar(message, "error");
  } finally {
    isSubmitting.value = false;
  }
};

// ============================================================
// RESET / DIALOG
// ============================================================

const resetForm = () => {
  formRef.value?.reset();
  formRef.value?.resetValidation();

  Object.assign(form, {
    title: "",
    description: "",
    organizationName: "",
    externalLink: "",
    campaignStartDate: "",
    campaignEndDate: "",
  });

  clearBanner();
  step.value = 1;
};

const closeSuccessDialog = () => {
  successDialog.show = false;

  emit("created", {
    status: successDialog.status,
    queuePosition: successDialog.queuePosition,
  });

  resetForm();
};

const handleCancel = () => {
  resetForm();
  emit("cancel");
};

// ============================================================
// SNACKBAR
// ============================================================

const showSnackbar = (
  message: string,
  color: "success" | "error" | "warning" | "info",
) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.icon =
    color === "success"
      ? "mdi-check-circle"
      : color === "error"
        ? "mdi-alert-circle"
        : color === "warning"
          ? "mdi-alert"
          : "mdi-information";
  snackbar.show = true;
};
</script>

<style scoped>
/* ============================================================
   CARD SHELL — this is what prevents overflow: the card itself
   is height-capped and only the middle section scrolls. The
   header and footer never move.
   ============================================================ */

.campaign-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
  height: min(88vh, 900px);
  max-height: 88vh;
  overflow: hidden; /* nothing escapes the card's rounded corners */
}

.campaign-scroll-area {
  flex: 1 1 auto;
  min-height: 0; /* required so flex children can actually scroll */
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

/* ============================================================
   STEPPER
   ============================================================ */

.campaign-stepper {
  overflow: visible;
  background: transparent;
}

.campaign-stepper :deep(.v-stepper-header) {
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: thin;
  box-shadow: none;
}

.campaign-stepper :deep(.v-stepper-window) {
  margin: 0;
}

.campaign-stepper :deep(.v-stepper-item) {
  min-width: 150px;
}

/* Clear affordance that tabs are clickable / gated */
.campaign-stepper :deep(.v-stepper-item:not(.v-stepper-item--disabled)) {
  cursor: pointer;
}

.campaign-stepper :deep(.v-stepper-item--disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}

.step-content {
  min-height: 0;
}

.step-heading {
  padding-bottom: 2px;
}

/* ============================================================
   FOOTER
   ============================================================ */

.stepper-footer {
  display: block;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
}

.stepper-footer-inner {
  width: 100%;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.step-progress-label {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-chip {
  flex-shrink: 0;
}

.stepper-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-two-actions {
  flex-wrap: wrap;
}

.nav-btn {
  min-width: 210px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.submit-btn {
  min-width: 190px;
}

/* ============================================================
   BANNER UPLOAD
   ============================================================ */

.banner-dropzone {
  min-height: 270px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.banner-dropzone:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 12px rgba(var(--v-theme-on-surface), 0.08);
}

.banner-dropzone--dragging {
  border: 2px dashed rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}

.banner-dropzone--error {
  border-color: rgb(var(--v-theme-error));
}

.banner-dropzone--has-image {
  padding: 12px;
}

.banner-placeholder {
  min-height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.banner-remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

/* ============================================================
   REVIEW
   ============================================================ */

.review-card {
  overflow: hidden;
  width: 100%;
}

.review-card :deep(.v-list-item-subtitle) {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.review-link-item :deep(.v-list-item-subtitle) {
  color: rgb(var(--v-theme-primary));
}

/* ============================================================
   DATE FIELDS
   ============================================================ */

.date-field-wrap {
  position: relative;
  cursor: pointer;
}

.date-field-wrap :deep(.v-field) {
  cursor: pointer;
}

.date-field-wrap :deep(.v-field__append-inner .v-btn) {
  opacity: 1;
}

.native-date-input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 600px) {
  .campaign-card {
    height: 100vh;
    max-height: 100vh;
    border-radius: 0 !important;
  }

  .stepper-footer {
    padding: 12px;
  }

  .step-progress {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .stepper-actions {
    width: 100%;
  }

  .stepper-actions > .action-group {
    width: 100%;
  }

  .step-two-actions {
    width: 100%;
  }

  .step-two-actions .v-btn,
  .action-group .v-btn,
  .nav-btn {
    flex: 1 1 0;
    min-width: 0;
  }

  .nav-btn {
    width: 100%;
  }

  .banner-placeholder {
    min-height: 240px;
    padding: 24px 16px;
  }
}
</style>
