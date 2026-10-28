<!-- client/src/components/forms/CampaignCreator.vue -->
<template>
  <v-card rounded="lg" class="campaign-creator">
    <v-card-title class="d-flex align-center pa-4 bg-primary flex-shrink-0">
      <v-icon icon="mdi-bullhorn-variant" size="26" class="mr-2" />
      <div class="flex-grow-1">
        <div class="text-subtitle-1 font-weight-bold">Launch a Campaign</div>
        <div class="text-caption text-medium-emphasis">
          Details &amp; schedule · max 84 days
        </div>
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        :disabled="submitting"
        @click="close"
      />
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4 pa-md-6">
      <v-form ref="formRef" @submit.prevent="submit">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.title"
              label="Campaign Title"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.maxLength(120)]"
              counter="120"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.organizationName"
              label="Organization"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.maxLength(80)]"
              counter="80"
              clearable
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="3"
              auto-grow
              :rules="[rules.required, rules.maxLength(500)]"
              counter="500"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.externalLink"
              label="External link (optional)"
              variant="outlined"
              density="comfortable"
              :rules="[rules.optionalUrl]"
              clearable
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.campaignStartDate"
              label="Start Date"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              :min="todayIso"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.campaignEndDate"
              label="End Date"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.endDateAfterStart]"
              :min="form.campaignStartDate || todayIso"
              :max="maxEndDateIso"
            />
          </v-col>
        </v-row>

        <v-alert
          v-if="durationDays !== null"
          :type="durationValid ? 'success' : 'error'"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mt-3"
        >
          {{ durationDays }} day{{ durationDays === 1 ? "" : "s" }} ·
          {{
            durationValid
              ? "within the 84-day limit"
              : "exceeds the 84-day limit"
          }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mt-3"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4">
      <v-btn variant="text" :disabled="submitting" @click="close">Cancel</v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-arrow-right"
        :loading="submitting"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        Save &amp; Continue
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import axios, { AxiosError } from "axios";

const emit = defineEmits<{
  (
    e: "created",
    payload: {
      campaignId: string;
      campaign: Record<string, unknown>;
      status: "active" | "queued";
      queuePosition: number | null;
    },
  ): void;
  (e: "cancel"): void;
}>();

interface VFormRef {
  validate: () => Promise<{ valid: boolean }>;
}

interface ApiSuccessData {
  campaign: {
    _id: string;
    title: string;
    status: "active" | "queued";
    queuePosition: number | null;
  };
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: ApiSuccessData;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE}/api/campaigns/create`;

const MAX_DAYS = 84;

const formRef = ref<VFormRef | null>(null);
const submitting = ref(false);
const errorMessage = ref("");

const form = reactive({
  title: "",
  organizationName: "",
  description: "",
  externalLink: "",
  campaignStartDate: "",
  campaignEndDate: "",
});

const todayIso = computed(() => new Date().toISOString().split("T")[0]);

const durationDays = computed<number | null>(() => {
  if (!form.campaignStartDate || !form.campaignEndDate) return null;
  const s = new Date(form.campaignStartDate);
  const e = new Date(form.campaignEndDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  return Math.round((e.getTime() - s.getTime()) / 86_400_000);
});

const durationValid = computed(
  () =>
    durationDays.value !== null &&
    durationDays.value > 0 &&
    durationDays.value <= MAX_DAYS,
);

const maxEndDateIso = computed(() => {
  if (!form.campaignStartDate) return undefined;
  const s = new Date(form.campaignStartDate);
  if (isNaN(s.getTime())) return undefined;
  const max = new Date(s);
  max.setDate(max.getDate() + MAX_DAYS);
  return max.toISOString().split("T")[0];
});

const isValidUrl = (v: string) => {
  if (!v.trim()) return true;
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const rules = {
  required: (v: string) => !!v?.trim() || "Required",
  maxLength: (n: number) => (v: string) =>
    !v || v.length <= n || `Max ${n} characters`,
  optionalUrl: (v: string) => isValidUrl(v) || "Enter a valid http(s) URL",
  endDateAfterStart: (v: string) => {
    if (!v || !form.campaignStartDate) return true;
    const s = new Date(form.campaignStartDate);
    const e = new Date(v);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return true;
    if (e <= s) return "End date must be after start";
    if ((e.getTime() - s.getTime()) / 86_400_000 > MAX_DAYS)
      return `Max ${MAX_DAYS} days`;
    return true;
  },
};

const canSubmit = computed(
  () =>
    form.title.trim().length > 0 &&
    form.organizationName.trim().length > 0 &&
    form.description.trim().length > 0 &&
    !!form.campaignStartDate &&
    !!form.campaignEndDate &&
    durationValid.value &&
    isValidUrl(form.externalLink),
);

async function submit() {
  errorMessage.value = "";
  const v = await formRef.value?.validate();
  if (!v?.valid || !canSubmit.value) return;

  submitting.value = true;
  try {
    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("organizationName", form.organizationName.trim());
    payload.append("description", form.description.trim());
    if (form.externalLink.trim())
      payload.append("externalLink", form.externalLink.trim());
    payload.append("campaignStartDate", form.campaignStartDate);
    payload.append("campaignEndDate", form.campaignEndDate);

    const { data } = await axios.post<ApiSuccessResponse | ApiErrorResponse>(
      API_URL,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      },
    );

    if (!data.success) {
      errorMessage.value = data.error || "Failed to create campaign.";
      return;
    }

    emit("created", {
      campaignId: data.data.campaign._id,
      campaign: data.data.campaign as unknown as Record<string, unknown>,
      status: data.data.campaign.status,
      queuePosition: data.data.campaign.queuePosition,
    });
  } catch (err) {
    const ax = err as AxiosError<ApiErrorResponse>;
    errorMessage.value =
      ax.response?.data?.error || ax.message || "Failed to create campaign.";
  } finally {
    submitting.value = false;
  }
}

function close() {
  if (submitting.value) return;
  emit("cancel");
}
</script>

<style scoped>
.campaign-creator :deep(.v-field) {
  font-size: 0.95rem;
}
</style>
