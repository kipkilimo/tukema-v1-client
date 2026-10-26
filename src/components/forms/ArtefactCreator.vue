<template>
  <v-container class="pa-2 pa-sm-3" fluid>
    <!-- Loading State -->
    <v-card v-if="loading" variant="tonal" rounded="lg" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary" size="32" width="3" />
      <div class="mt-2 text-body-2">Loading...</div>
    </v-card>

    <template v-else>
      <v-stepper
        v-model="step"
        :items="steps"
        :disabled="isProcessing"
        flat
        border
        rounded="lg"
        hide-actions
        class="stepper-container"
      >
        <!-- ============================================ -->
        <!-- STEP 1: CLINIC DETAILS                       -->
        <!-- ============================================ -->
        <template #item.1>
          <v-form ref="detailsForm" @submit.prevent="goToStep(2)">
            <v-card variant="outlined" rounded="lg" class="step-card">
              <div class="step-header pa-3 pa-sm-4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" size="32" rounded="lg">
                    <v-icon size="18">mdi-file-document-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Clinic Details</div>
                    <div class="text-caption text-medium-emphasis">
                      Title, purpose, and research information
                    </div>
                  </div>
                </div>
              </div>

              <v-divider />

              <div class="scroll-content pa-3 pa-sm-4">
                <!-- Title -->
                <v-text-field
                  v-model="clinicData.title"
                  label="Clinic title *"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-format-title"
                  placeholder="e.g. Investigating the effects of..."
                  :rules="[rules.required('Title is required'), rules.title]"
                  hide-details="auto"
                  class="mb-4"
                  :disabled="isProcessing"
                  counter="355"
                  maxlength="355"
                />

                <!-- Purpose / Objective -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-1 d-block"
                    >Purpose / Objective *</label
                  >
                  <div
                    ref="purposeEditor"
                    contenteditable="true"
                    class="rich-editor"
                    :class="{ 'is-invalid': purposeError }"
                    @paste="handlePaste"
                    @input="updatePurpose"
                    @blur="validatePurpose"
                  ></div>
                  <div v-if="purposeError" class="text-error text-caption mt-1">
                    {{ purposeError }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    <span v-if="purposeLength > 0">
                      {{ purposeLength }}/5000 characters
                      <span v-if="purposeLength > 5000" class="text-error"
                        >(exceeds limit)</span
                      >
                    </span>
                    <span v-else
                      >Describe the main objective and purpose of this research
                      clinic</span
                    >
                  </div>
                </div>

                <!-- Student & Program -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.studentName"
                      label="Student name *"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-outline"
                      placeholder="Full name"
                      :rules="[rules.required('Student name is required')]"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="clinicData.program"
                      :items="courseOptions"
                      label="Program *"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-school-outline"
                      :rules="[rules.required('Program is required')]"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <!-- Research Stage & Methodology -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="clinicData.researchStage"
                      :items="researchStageOptions"
                      label="Research stage *"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-chart-timeline-variant"
                      :rules="[rules.required('Research stage is required')]"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="clinicData.methodology"
                      :items="methodologyOptions"
                      label="Methodology"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-science"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <!-- Level & Supervisor -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.level"
                      label="Academic level"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-graduation-cap-outline"
                      placeholder="e.g. Masters, PhD"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.supervisor"
                      label="Supervisor"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-tie-outline"
                      placeholder="Supervisor name"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <!-- Department & Institution -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.department"
                      label="Department"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-domain"
                      placeholder="e.g. Department of Medicine"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="clinicData.institutionId"
                      :items="institutions"
                      item-title="name"
                      item-value="id"
                      label="Institution"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-bank"
                      placeholder="Search institutions..."
                      hide-details="auto"
                      :disabled="isProcessing"
                      :loading="loadingInstitutions"
                      @update:search="searchInstitutions"
                    />
                  </v-col>
                </v-row>

                <!-- Keywords -->
                <v-combobox
                  v-model="clinicData.keywords"
                  label="Keywords"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-tag-outline"
                  placeholder="Type and press enter"
                  multiple
                  chips
                  closable-chips
                  hide-details="auto"
                  :disabled="isProcessing"
                  class="mt-2"
                />

                <!-- IREC / Ethics Section -->
                <v-divider class="my-4" />

                <div class="text-body-2 font-weight-medium mb-2">
                  IREC / Ethics Approval
                </div>

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="clinicData.irecStatus"
                      :items="irecStatusOptions"
                      label="IREC Status"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-shield-check-outline"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.irecReference"
                      label="IREC Reference"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-file-document-outline"
                      placeholder="e.g. IREC-2024-001"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <!-- Principal Investigator & Funding -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.principalInvestigator"
                      label="Principal Investigator"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-badge-outline"
                      placeholder="PI name"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="clinicData.fundingSource"
                      label="Funding Source"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-cash-multiple"
                      placeholder="e.g. NIH, University Grant"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <!-- Conflict of Interest -->
                <v-text-field
                  v-model="clinicData.conflictOfInterest"
                  label="Conflict of Interest Disclosure"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-alert-circle-outline"
                  placeholder="None declared"
                  hide-details="auto"
                  :disabled="isProcessing"
                  class="mt-2"
                />
              </div>

              <v-divider />

              <div class="step-footer pa-3 pa-sm-4">
                <v-btn
                  color="primary"
                  variant="flat"
                  append-icon="mdi-arrow-right"
                  :disabled="!isDetailsValid || isProcessing"
                  @click="goToStep(2)"
                >
                  Continue
                </v-btn>
              </div>
            </v-card>
          </v-form>
        </template>

        <!-- ============================================ -->
        <!-- STEP 2: SESSION SETTINGS & MENTORS           -->
        <!-- ============================================ -->
        <template #item.2>
          <v-form ref="settingsForm" @submit.prevent="goToStep(3)">
            <v-card variant="outlined" rounded="lg" class="step-card">
              <div class="step-header pa-3 pa-sm-4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" size="32" rounded="lg">
                    <v-icon size="18">mdi-account-group-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Session & Mentors</div>
                    <div class="text-caption text-medium-emphasis">
                      Review deadline, mentors, and access settings
                    </div>
                  </div>
                </div>
              </div>

              <v-divider />

              <div class="scroll-content pa-3 pa-sm-4">
                <!-- Review Deadline -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block"
                    >Review deadline</label
                  >
                  <v-menu
                    v-model="deadlineMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="400px"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="displayDeadline"
                        label="Review deadline *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-calendar-clock"
                        readonly
                        v-bind="props"
                        :rules="[rules.required('Deadline is required')]"
                        hide-details="auto"
                        :disabled="isProcessing"
                      />
                    </template>

                    <v-card class="pa-3">
                      <v-date-picker
                        v-model="selectedDeadlineDate"
                        :min="minDate"
                        hide-header
                        show-adjacent-months
                      />
                      <div class="d-flex ga-2 mt-3">
                        <v-text-field
                          v-model="selectedDeadlineTime"
                          label="Time"
                          type="time"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :min="minTime"
                        />
                      </div>
                      <v-card-actions class="pa-0 mt-2">
                        <v-btn variant="text" size="small" @click="deadlineMenu = false">
                          Cancel
                        </v-btn>
                        <v-spacer />
                        <v-btn
                          color="primary"
                          variant="flat"
                          size="small"
                          :disabled="!selectedDeadlineDate"
                          @click="applyDeadline"
                        >
                          OK
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </div>

                <!-- Mentor Settings -->
                <v-divider class="my-4" />

                <div class="text-body-2 font-weight-medium mb-2">Mentor Settings</div>

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="clinicData.settings.minMentorsRequired"
                      label="Min mentors required"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-plus-outline"
                      type="number"
                      min="1"
                      max="25"
                      placeholder="1"
                      :rules="[rules.minMentors]"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="clinicData.settings.maxMentorsAllowed"
                      label="Max mentors allowed"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-multiple-plus-outline"
                      type="number"
                      min="1"
                      max="25"
                      placeholder="3"
                      :rules="[rules.maxMentors]"
                      hide-details="auto"
                      :disabled="isProcessing"
                    />
                  </v-col>
                </v-row>

                <v-switch
                  v-model="clinicData.settings.requireAllMentors"
                  label="Require all mentors to review before completion"
                  color="primary"
                  density="comfortable"
                  hide-details
                  :disabled="isProcessing"
                />

                <v-switch
                  v-model="clinicData.settings.allowObserverComments"
                  label="Allow observers to comment"
                  color="primary"
                  density="comfortable"
                  hide-details
                  :disabled="isProcessing"
                  class="mt-2"
                />

                <v-divider class="my-4" />

                <!-- Access Level -->
                <div class="text-body-2 font-weight-medium mb-2">Access Level</div>
                <v-radio-group
                  v-model="clinicData.visibility"
                  density="compact"
                  hide-details
                  :disabled="isProcessing"
                >
                  <v-radio label="Public" value="PUBLIC" />
                  <v-radio label="Private" value="PRIVATE" />
                  <v-radio label="Unlisted" value="UNLISTED" />
                </v-radio-group>

                <!-- Session ID -->
                <v-text-field
                  v-model="clinicData.sessionId"
                  label="Session ID (optional)"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-identifier"
                  placeholder="e.g. CLINIC-2024-001"
                  hide-details="auto"
                  :disabled="isProcessing"
                  class="mt-2"
                />

                <!-- Summary Card -->
                <v-card variant="tonal" color="info" rounded="lg" class="mt-4">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-start ga-2">
                      <v-icon color="primary" size="20">mdi-information-outline</v-icon>
                      <div class="min-width-0">
                        <div class="text-body-2 font-weight-bold text-truncate">
                          {{ clinicData.title || "Untitled clinic" }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ clinicData.studentName || "Unknown student" }}
                          <span v-if="clinicData.program"
                            >· {{ getCourseLabel(clinicData.program) }}</span
                          >
                        </div>
                        <div class="d-flex flex-wrap ga-1 mt-1">
                          <v-chip size="x-small" variant="outlined">
                            <v-icon start size="12">mdi-calendar-clock-outline</v-icon>
                            {{ displayDeadline || "Not set" }}
                          </v-chip>
                          <v-chip size="x-small" variant="outlined">
                            <v-icon start size="12">mdi-account-multiple-outline</v-icon>
                            {{ clinicData.settings.minMentorsRequired || 1 }}-
                            {{ clinicData.settings.maxMentorsAllowed || 3 }} mentors
                          </v-chip>
                          <v-chip size="x-small" variant="outlined">
                            <v-icon start size="12">mdi-eye-outline</v-icon>
                            {{ clinicData.visibility || "PRIVATE" }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <v-divider />

              <div class="step-footer pa-3 pa-sm-4">
                <v-btn
                  variant="tonal"
                  prepend-icon="mdi-arrow-left"
                  :disabled="isProcessing"
                  @click="goToStep(1)"
                >
                  Back
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  append-icon="mdi-arrow-right"
                  :disabled="!isSettingsValid || isProcessing"
                  :loading="isProcessing"
                  @click="createAndGoToStep3"
                >
                  Continue
                </v-btn>
              </div>
            </v-card>
          </v-form>
        </template>

        <!-- ============================================ -->
        <!-- STEP 3: DOCUMENT UPLOAD                      -->
        <!-- ============================================ -->
        <template #item.3>
          <v-card variant="outlined" rounded="lg" class="step-card">
            <div class="step-header pa-3 pa-sm-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="32" rounded="lg">
                  <v-icon size="18">mdi-cloud-upload-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Upload Document</div>
                  <div class="text-caption text-medium-emphasis">
                    Upload your research document for review
                  </div>
                </div>
              </div>
            </div>

            <v-divider />

            <v-container class="pa-3 pa-sm-4">
              <!-- Clinic summary -->
              <v-card variant="tonal" color="success" rounded="lg" class="mb-4 pa-3">
                <div class="d-flex align-center ga-2">
                  <v-icon color="success" size="24">mdi-check-circle</v-icon>
                  <div class="min-width-0">
                    <div class="text-subtitle-2 font-weight-medium">Clinic created</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ clinicData.title }}
                      <span class="mx-1">·</span>
                      {{ clinicData.studentName }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Clinic ID: {{ createdClinic?.id || "Generating..." }}
                    </div>
                  </div>
                </div>
              </v-card>

              <!-- Uploader Component -->
              <ConsultationClinicUploader
                ref="uploaderRef"
                :clinic-id="createdClinic?.id"
                :session-id="clinicData.sessionId"
                :metadata="{
                  title: clinicData.title,
                  studentName: clinicData.studentName,
                  program: clinicData.program,
                }"
                @upload-complete="handleUploadComplete"
                @upload-error="handleUploadError"
                @upload-start="handleUploadStart"
                @upload-progress="handleUploadProgress"
                @preview="handlePreview"
              />

              <v-progress-linear
                v-if="uploading"
                :model-value="uploadProgress"
                color="primary"
                height="4"
                striped
                class="mt-2 rounded"
              />
            </v-container>

            <v-divider />

            <div class="step-footer pa-3 pa-sm-4">
              <v-btn
                variant="tonal"
                prepend-icon="mdi-arrow-left"
                :disabled="isProcessing"
                @click="goToStep(2)"
              >
                Back
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-check"
                :loading="submitting"
                :disabled="!uploadComplete || submitting"
                @click="finish"
              >
                Complete
              </v-btn>
            </div>
          </v-card>
        </template>
      </v-stepper>
    </template>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" multi-line>
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useConsultationStore } from "@/stores/consultation";
import { useUserStore } from "@/stores/users";
import { useDialogStore } from "@/stores/dialogs";
import { storeToRefs } from "pinia";
import ConsultationClinicUploader from "@/components/uploaders/GLBImagesUploader.vue";

// ===== Router & Stores =====
const router = useRouter();
const consultationStore = useConsultationStore();
const userStore = useUserStore();
const dialogStore = useDialogStore();

// ===== Store Refs =====
const { currentClinic } = storeToRefs(consultationStore);
const { user } = storeToRefs(userStore);

// ===== Emits =====
const emit = defineEmits(["success", "cancel"]);

// ===== State =====
const loading = ref(false);
const loadingInstitutions = ref(false);
const isProcessing = ref(false);
const submitting = ref(false);

// Upload state
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadComplete = ref(false);
const uploadError = ref(null);
const uploadedFile = ref(null);

const step = ref(1);
const detailsForm = ref(null);
const settingsForm = ref(null);
const uploaderRef = ref(null);
const purposeEditor = ref(null);

// Purpose editor state
const purposeError = ref("");

// Date picker state
const deadlineMenu = ref(false);
const selectedDeadlineDate = ref(null);
const selectedDeadlineTime = ref("17:00");

// Created clinic
const createdClinic = ref(null);

// Institutions
const institutions = ref([]);

// Snackbar
const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// ===== Steps =====
const steps = [
  { title: "Details", value: 1 },
  { title: "Session", value: 2 },
  { title: "Upload", value: 3 },
];

// ===== Options =====
const courseOptions = [
  { title: "Master of Science", value: "MASTER_OF_SCIENCE" },
  { title: "Master of Medicine", value: "MASTER_OF_MEDICINE" },
  { title: "Master of Public Health", value: "MASTER_OF_PUBLIC_HEALTH" },
  { title: "Master of Arts", value: "MASTER_OF_ARTS" },
  { title: "Doctor of Philosophy", value: "DOCTOR_OF_PHILOSOPHY" },
];

const researchStageOptions = [
  { title: "Idea", value: "IDEA" },
  { title: "Concept", value: "CONCEPT" },
  { title: "Protocol", value: "PROTOCOL" },
  { title: "Proposal", value: "PROPOSAL" },
  { title: "Ethics Approval", value: "ETHICS" },
  { title: "Data Collection", value: "DATA_COLLECTION" },
  { title: "Analysis", value: "ANALYSIS" },
  { title: "Manuscript", value: "MANUSCRIPT" },
  { title: "Defense", value: "DEFENSE" },
  { title: "Publication", value: "PUBLICATION" },
];

const methodologyOptions = [
  { title: "Quantitative", value: "QUANTITATIVE" },
  { title: "Qualitative", value: "QUALITATIVE" },
  { title: "Mixed Methods", value: "MIXED_METHODS" },
  { title: "Systematic Review", value: "SYSTEMATIC_REVIEW" },
  { title: "Meta-Analysis", value: "META_ANALYSIS" },
  { title: "Other", value: "OTHER" },
];

const irecStatusOptions = [
  { title: "Not Required", value: "NOT_REQUIRED" },
  { title: "Preparing", value: "PREPARING" },
  { title: "Submitted", value: "SUBMITTED" },
  { title: "Approved", value: "APPROVED" },
  { title: "Rejected", value: "REJECTED" },
  { title: "Exempt", value: "EXEMPT" },
];

// ===== Clinic Data =====
const clinicData = reactive({
  title: "",
  purpose: "",
  purposeHTML: "",
  studentName: "",
  program: null,
  level: "",
  methodology: null,
  researchStage: null,
  keywords: [],
  institutionId: null,
  department: "",
  supervisor: "",
  principalInvestigator: "",
  irecStatus: "NOT_REQUIRED",
  irecReference: "",
  fundingSource: "",
  conflictOfInterest: "",
  sessionId: "",
  visibility: "PRIVATE",
  reviewDeadline: null,
  settings: {
    allowObserverComments: true,
    autoCloseDays: 30,
    requireAllMentors: false,
    minMentorsRequired: 1,
    maxMentorsAllowed: 3,
  },
});

// ===== Computed =====
const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
});

const minTime = computed(() => "09:00");

const displayDeadline = computed({
  get: () => {
    if (!clinicData.reviewDeadline) return "";
    return formatDisplayTime(clinicData.reviewDeadline);
  },
  set: () => {},
});

const purposeLength = computed(() => clinicData.purpose?.length || 0);

const isDetailsValid = computed(() => {
  const plainText = clinicData.purpose || "";
  return (
    !!clinicData.title?.trim() &&
    !!plainText.trim() &&
    plainText.length <= 5000 &&
    !purposeError.value &&
    !!clinicData.studentName?.trim() &&
    !!clinicData.program &&
    !!clinicData.researchStage
  );
});

const isSettingsValid = computed(() => {
  return (
    !!clinicData.reviewDeadline &&
    clinicData.settings.minMentorsRequired >= 1 &&
    clinicData.settings.maxMentorsAllowed >= clinicData.settings.minMentorsRequired &&
    clinicData.settings.maxMentorsAllowed <= 25
  );
});

// ===== Rules =====
const rules = {
  required: (msg) => (v) => !!String(v ?? "").trim() || msg,

  title: (v) => {
    if (!v) return true;
    if (v.length > 355) return "Title must be 355 characters or less";
    return true;
  },

  minMentors: (v) => {
    if (!v) return true;
    const n = Number(v);
    if (n < 1) return "Minimum 1";
    if (n > 25) return "Maximum 25";
    if (n > (clinicData.settings.maxMentorsAllowed || 25)) {
      return "Cannot exceed max mentors";
    }
    return true;
  },

  maxMentors: (v) => {
    if (!v) return true;
    const n = Number(v);
    if (n < 1) return "Minimum 1";
    if (n > 25) return "Maximum 25";
    if (n < (clinicData.settings.minMentorsRequired || 1)) {
      return "Cannot be less than min mentors";
    }
    return true;
  },
};

// ===== Helpers =====
function formatDisplayTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getCourseLabel(value) {
  const found = courseOptions.find((c) => c.value === value);
  return found ? found.title : value;
}

// ===== Purpose Editor Methods =====
function handlePaste(event) {
  event.preventDefault();
  const clipboardData = event.clipboardData || window.clipboardData;
  const htmlData = clipboardData.getData("text/html");
  const textData = clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, htmlData || textData);
  updatePurpose();
}

function updatePurpose() {
  if (!purposeEditor.value) return;
  const htmlContent = purposeEditor.value.innerHTML || "";
  const plainText = purposeEditor.value.innerText || "";
  clinicData.purposeHTML = htmlContent;
  clinicData.purpose = plainText;
  if (plainText.length > 5000) {
    purposeError.value = "Purpose exceeds 5000 character limit";
  } else {
    purposeError.value = "";
  }
}

function validatePurpose() {
  const plainText = clinicData.purpose || "";
  if (!plainText || plainText.trim().length === 0) {
    purposeError.value = "Purpose is required";
  } else if (plainText.length > 5000) {
    purposeError.value = "Purpose must be 5000 characters or less";
  } else {
    purposeError.value = "";
  }
}

// ===== Date Picker Methods =====
function applyDeadline() {
  if (selectedDeadlineDate.value) {
    const [h, m] = (selectedDeadlineTime.value || "17:00").split(":").map(Number);
    const d = new Date(selectedDeadlineDate.value);
    d.setHours(h || 17, m || 0, 0, 0);
    clinicData.reviewDeadline = d.toISOString();
    deadlineMenu.value = false;
  }
}

// ===== Institution Search =====
async function searchInstitutions(search) {
  if (!search || search.length < 2) {
    institutions.value = [];
    return;
  }
  loadingInstitutions.value = true;
  try {
    // TODO: Replace with actual API call
    // const results = await fetchInstitutions(search);
    // institutions.value = results;
    institutions.value = [
      { id: "1", name: "Harvard University" },
      { id: "2", name: "Stanford University" },
      { id: "3", name: "MIT" },
      { id: "4", name: "University of Oxford" },
      { id: "5", name: "University of Cambridge" },
    ].filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  } catch (error) {
    console.error("Failed to search institutions:", error);
  } finally {
    loadingInstitutions.value = false;
  }
}

// ===== Upload Handlers =====
function handleUploadStart(data) {
  uploading.value = true;
  uploadProgress.value = 0;
  uploadComplete.value = false;
  uploadError.value = null;
}

function handleUploadProgress(progress) {
  uploadProgress.value = progress;
}

function handleUploadComplete(data) {
  uploadedFile.value = data.details;
  uploadComplete.value = true;
  uploading.value = false;
  uploadProgress.value = 100;

  snackbar.value = {
    show: true,
    text: "Document uploaded successfully!",
    color: "success",
  };
}

function handleUploadError(error) {
  uploading.value = false;
  uploadProgress.value = 0;
  uploadError.value = error.message || "Upload failed";

  snackbar.value = {
    show: true,
    text: uploadError.value,
    color: "error",
  };
}

function handlePreview(file) {
  if (file?.url) {
    window.open(file.url, "_blank");
  }
}

// ===== Navigation =====
function goToStep(target) {
  step.value = target;
}

// ===== Create Clinic =====
async function createClinic() {
  isProcessing.value = true;

  try {
    const currentUserId = user.value?.id;
    if (!currentUserId) {
      throw new Error("User not authenticated. Please log in.");
    }

    const input = {
      title: clinicData.title,
      purpose: clinicData.purposeHTML || clinicData.purpose,
      studentName: clinicData.studentName,
      program: clinicData.program,
      researchStage: clinicData.researchStage,
      level: clinicData.level || null,
      methodology: clinicData.methodology || null,
      keywords: clinicData.keywords || [],
      institutionId: clinicData.institutionId || null,
      department: clinicData.department || null,
      supervisor: clinicData.supervisor || null,
      principalInvestigator: clinicData.principalInvestigator || null,
      irecStatus: clinicData.irecStatus || "NOT_REQUIRED",
      irecReference: clinicData.irecReference || null,
      fundingSource: clinicData.fundingSource || null,
      conflictOfInterest: clinicData.conflictOfInterest || null,
      sessionId: clinicData.sessionId || null,
      settings: {
        allowObserverComments: clinicData.settings.allowObserverComments,
        autoCloseDays: clinicData.settings.autoCloseDays || 30,
        requireAllMentors: clinicData.settings.requireAllMentors,
        minMentorsRequired: clinicData.settings.minMentorsRequired || 1,
        maxMentorsAllowed: clinicData.settings.maxMentorsAllowed || 3,
      },
    };

    const clinic = await consultationStore.createClinic(input);
    createdClinic.value = clinic;

    if (!clinic) throw new Error("Failed to create clinic");

    snackbar.value = {
      show: true,
      text: `Clinic "${clinic.title}" created!`,
      color: "success",
    };
  } catch (error) {
    console.error("Create clinic error:", error);
    snackbar.value = {
      show: true,
      text: error?.message || "Failed to create clinic",
      color: "error",
    };
  } finally {
    isProcessing.value = false;
  }
}

async function createAndGoToStep3() {
  if (!isSettingsValid.value) return;
  if (settingsForm.value) {
    const { valid } = await settingsForm.value.validate();
    if (!valid) return;
  }
  await createClinic();
  if (createdClinic.value) {
    step.value = 3;
  }
}

// ===== Finish =====
async function finish() {
  if (!uploadComplete.value) {
    snackbar.value = {
      show: true,
      text: "Please upload your document first",
      color: "warning",
    };
    return;
  }

  submitting.value = true;

  try {
    const clinicId = createdClinic.value?.id || currentClinic.value?.id;
    if (!clinicId) throw new Error("No clinic ID");

    emit("success", createdClinic.value);

    snackbar.value = {
      show: true,
      text: "Clinic ready for review!",
      color: "success",
    };

    // Navigate to clinic page
    setTimeout(() => {
      router.push(`/consultation/${clinicId}`);
    }, 400);

    dialogStore.close("CREATE_CONSULTATION");
  } catch (error) {
    snackbar.value = {
      show: true,
      text: error?.message || "Failed to finalize",
      color: "error",
    };
  } finally {
    submitting.value = false;
  }
}

// ===== Initialize =====
function initialize() {
  loading.value = true;

  // Set default deadline (7 days from now)
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);
  defaultDeadline.setHours(17, 0, 0, 0);
  clinicData.reviewDeadline = defaultDeadline.toISOString();

  // Set default student name from user
  if (user.value?.fullName) {
    clinicData.studentName = user.value.fullName;
  }

  loading.value = false;

  nextTick(() => {
    if (purposeEditor.value) {
      purposeEditor.value.innerHTML = clinicData.purposeHTML || "";
    }
  });
}

// ===== Lifecycle =====
onMounted(initialize);

watch(
  () => currentClinic.value,
  (newClinic) => {
    if (newClinic && !createdClinic.value) {
      createdClinic.value = newClinic;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.stepper-container {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.step-card {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.step-header {
  flex-shrink: 0;
  background: var(--v-theme-surface);
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(85vh - 160px);
}

.scroll-content::-webkit-scrollbar {
  width: 4px;
}

.scroll-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.scroll-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.step-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: var(--v-theme-surface);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Rich Editor */
.rich-editor {
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  font-size: 14px;
  line-height: 1.6;
  transition: border-color 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.rich-editor:focus {
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
}

.rich-editor.is-invalid {
  border-color: rgb(var(--v-theme-error));
}

.rich-editor.is-invalid:focus {
  border-color: rgb(var(--v-theme-error));
  border-width: 2px;
}

.rich-editor b,
.rich-editor strong {
  font-weight: bold;
}

.rich-editor i,
.rich-editor em {
  font-style: italic;
}

.rich-editor ul,
.rich-editor ol {
  padding-left: 24px;
  margin: 0.5em 0;
}

.rich-editor blockquote {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  padding-left: 16px;
  margin: 0.5em 0;
  color: rgba(0, 0, 0, 0.6);
}

.min-width-0 {
  min-width: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .step-footer {
    flex-wrap: wrap;
    justify-content: center;
  }

  .step-footer > * {
    flex: 1 1 auto;
    min-width: 100px;
  }

  .scroll-content {
    max-height: calc(85vh - 180px);
  }

  .rich-editor {
    min-height: 80px;
    max-height: 200px;
  }
}

@media (max-width: 400px) {
  .scroll-content {
    max-height: calc(85vh - 200px);
  }
}
</style>
