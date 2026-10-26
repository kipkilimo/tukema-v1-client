<template>
  <v-dialog
    :model-value="modelValue"
    max-width="880"
    persistent
    :fullscreen="mobile"
    @update:model-value="$emit('update:modelValue', $event)"
    @keydown.esc="requestClose"
  >
    <v-card class="artefact-card d-flex flex-column">
      <!-- ───────────── Header ───────────── -->
      <v-card-title class="d-flex align-center ga-3 py-4 flex-grow-0">
        <v-avatar color="#3D8361" variant="tonal" size="40" rounded="lg">
          <v-icon>mdi-palette-outline</v-icon>
        </v-avatar>
        <div class="d-flex flex-column">
          <span class="text-h6 lh-tight">
            {{ isEdit ? "Edit artefact" : "New artefact" }}
          </span>
          <span class="text-caption text-medium-emphasis">
            Step {{ step }} of {{ steps.length }}: {{ currentStep.hint }}
          </span>
        </div>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Close"
          :disabled="saving"
          @click="requestClose"
        />
      </v-card-title>

      <v-progress-linear
        v-if="loading"
        indeterminate
        color="#3D8361"
        class="flex-grow-0"
      />
      <v-divider v-else />

      <!-- ───────────── Stepper ───────────── -->
      <v-stepper
        v-model="step"
        flat
        class="bg-transparent artefact-stepper d-flex flex-column flex-grow-1"
      >
        <v-stepper-header class="flex-grow-0">
          <template v-for="(s, i) in steps" :key="s.value">
            <v-stepper-item
              :value="s.value"
              :title="mobile && step !== s.value ? undefined : s.title"
              :subtitle="mobile ? undefined : s.subtitle"
              :icon="s.icon"
              :complete="step > s.value"
              :error="stepHasError[s.value]"
              :editable="isStepEditable(s.value)"
              color="#3D8361"
            />
            <v-divider v-if="i < steps.length - 1" />
          </template>
        </v-stepper-header>

        <v-stepper-window class="flex-grow-1 step-window" :touch="false">
          <!-- STEP 1 — Basics -->
          <v-stepper-window-item :value="1" eager>
            <v-form
              ref="basicsFormRef"
              :disabled="loading"
              @submit.prevent="next"
            >
              <v-row dense>
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model="form.title"
                    v-bind="field"
                    label="Title"
                    :rules="[required]"
                    counter="120"
                    maxlength="120"
                    autofocus
                  />
                </v-col>
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="form.slug"
                    v-bind="field"
                    label="URL slug"
                    prefix="/"
                    :hint="slugHint"
                    persistent-hint
                    @update:model-value="onSlugInput"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    v-bind="field"
                    label="Description"
                    :rules="[required]"
                    rows="4"
                    auto-grow
                    max-rows="10"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>

          <!-- STEP 2 — Classification, pricing, visibility, tags -->
          <v-stepper-window-item :value="2" eager>
            <v-form
              ref="detailsFormRef"
              :disabled="loading"
              @submit.prevent="next"
            >
              <section class="form-section">
                <h3 class="section-title">Classification</h3>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.category"
                      v-bind="field"
                      :items="categoryItems"
                      item-title="title"
                      item-value="value"
                      label="Category"
                      :rules="[required]"
                      prepend-inner-icon="mdi-shape-outline"
                      :loading="taxonomyLoading"
                      :no-data-text="
                        taxonomyError
                          ? 'Failed to load categories'
                          : 'No categories'
                      "
                      @update:model-value="onCategoryChange"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.subcategory"
                      v-bind="field"
                      :items="subcategoryItems"
                      item-title="title"
                      item-value="value"
                      label="Subcategory"
                      :placeholder="
                        subcategoryItems.length ? 'Optional' : 'None available'
                      "
                      :disabled="taxonomyLoading || !subcategoryItems.length"
                      prepend-inner-icon="mdi-shape-plus-outline"
                      clearable
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.region"
                      v-bind="field"
                      :items="regionItems"
                      label="Region of origin"
                      prepend-inner-icon="mdi-map-marker-outline"
                      clearable
                      @update:model-value="onRegionChange"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="form.communities"
                      v-bind="field"
                      :items="communityItems"
                      label="Communities"
                      :placeholder="
                        form.region ? 'Pick or type' : 'e.g. Maasai'
                      "
                      prepend-inner-icon="mdi-account-group-outline"
                      multiple
                      chips
                      closable-chips
                      :hint="
                        form.region
                          ? `Suggestions for ${form.region}`
                          : 'Press Enter to add'
                      "
                      persistent-hint
                    />
                  </v-col>
                </v-row>
              </section>

              <section class="form-section">
                <h3 class="section-title">Pricing and visibility</h3>
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="form.currency"
                      v-bind="field"
                      :items="currencyItems"
                      item-title="title"
                      item-value="value"
                      label="Currency"
                      prepend-inner-icon="mdi-cash"
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model.number="form.price"
                      v-bind="field"
                      type="number"
                      min="0"
                      step="1"
                      label="Price"
                      :prefix="form.currency"
                      :rules="[required, nonNegativeInt]"
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="form.status"
                      v-bind="field"
                      :items="statusItems"
                      item-title="title"
                      item-value="value"
                      label="Status"
                      :disabled="!isAdmin"
                      :hint="isAdmin ? undefined : 'Use Publish / Archive'"
                      persistent-hint
                      prepend-inner-icon="mdi-eye-outline"
                    >
                      <template #selection="{ item }">
                        <v-chip
                          size="small"
                          label
                          :color="statusColor(item.value)"
                          variant="tonal"
                        >
                          {{ item.title }}
                        </v-chip>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </section>

              <!-- Auto-generated, read-only tags -->
              <section class="form-section">
                <h3 class="section-title d-flex align-center ga-2">
                  Tags
                  <v-chip
                    size="x-small"
                    label
                    variant="tonal"
                    prepend-icon="mdi-auto-fix"
                  >
                    Auto-generated
                  </v-chip>
                </h3>
                <div v-if="form.tags.length" class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="t in form.tags"
                    :key="t"
                    label
                    variant="tonal"
                    color="#3D8361"
                  >
                    {{ t }}
                  </v-chip>
                </div>
                <div v-else class="text-caption text-medium-emphasis">
                  Tags appear once you add a title and description.
                </div>
              </section>
            </v-form>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>

      <v-divider />

      <!-- ───────────── Footer ───────────── -->
      <v-card-actions class="px-4 py-3 flex-grow-0">
        <v-btn
          v-if="step > 1"
          variant="text"
          prepend-icon="mdi-arrow-left"
          :disabled="saving"
          @click="prev"
        >
          Back
        </v-btn>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="requestClose">
          Cancel
        </v-btn>
        <v-btn
          v-if="step < steps.length"
          color="#3D8361"
          variant="flat"
          append-icon="mdi-arrow-right"
          :disabled="saving || loading || taxonomyLoading"
          @click="next"
        >
          Next
        </v-btn>
        <v-btn
          v-else
          color="#3D8361"
          variant="flat"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="saving || loading || taxonomyLoading"
          @click="submit"
        >
          {{ isEdit ? "Save changes" : "Create artefact" }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Discard confirmation -->
    <v-dialog v-model="discardDialog" max-width="400">
      <v-card>
        <v-card-title>Discard changes?</v-card-title>
        <v-card-text>
          You have unsaved changes. If you close now, they'll be lost.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="discardDialog = false">
            Keep editing
          </v-btn>
          <v-btn color="error" variant="text" @click="confirmDiscard">
            Discard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error feedback -->
    <v-snackbar v-model="errorSnackbar" color="error" timeout="6000">
      {{ errorMessage || "Something went wrong. Please try again." }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import { useDialogStore } from "@/stores/dialogs";
import {
  useArtefactsStore,
  type ArtefactStatus,
  type CategorySlug,
  type SubcategorySlug,
  type CreateArtefactInput,
  type UpdateArtefactInput,
} from "@/stores/artefacts";

import { generateTags } from "@/composables/useAutoTags";

// ---------- props / emits ----------
const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "edit";
  artefactId?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "saved", payload: { id: string; created: boolean }): void;
}>();

// ---------- regions → communities ----------
// ---------- regions → communities ----------
const kenyaRegionsEthnicCommunities: Record<string, string[]> = {
  // Traditional areas (old provinces): native communities only
  Coast: [
    "Mijikenda",
    "Swahili",
    "Taita",
    "Taveta",
    "Bajuni",
    "Pokomo",
    "Orma",
    "Sakuye",
    "Waata",
  ],
  "Rift Valley": [
    // Kalenjin sub-communities
    "Kipsigis",
    "Nandi",
    "Keiyo",
    "Marakwet",
    "Tugen",
    "Pokot",
    "Sabaot",
    "Terik",
    "Ogiek",
    "Endorois",
    "Sebei",

    // Other communities of the Rift Valley
    "Maasai",
    "Samburu",
    "Turkana",
    "Ilchamus",
    "Rendille",
  ],

  Eastern: ["Kamba", "Embu", "Meru", "Mbeere", "Tharaka"],

  "North Eastern": ["Somali", "Borana", "Rendille", "Gabra"],

  Central: ["Kikuyu", "Ndia", "Gichugu"],

  Nyanza: ["Luo", "Kisii", "Kuria", "Suba", "Abasuba"],

  Western: ["Luhya", "Teso", "Sabaot"],

  // Urban: non-native communities only
  Urban: ["Indian Kenyan", "Arab Kenyan", "Italian Kenyan"],
};

// ---------- setup ----------
const { mobile } = useDisplay();
const dialog = useDialogStore();
const store = useArtefactsStore();

const isEdit = computed(() => props.mode === "edit");
const isAdmin = ref(true); // TODO: bind to auth store

const loading = ref(false);
const saving = computed(() => store.saving);

// Error feedback (declared early: used by the hydrate watcher)
const errorSnackbar = ref(false);
const errorMessage = ref("");

// Shared props so every input renders at identical height / style.
const field = {
  variant: "outlined",
  density: "comfortable",
  hideDetails: "auto",
} as const;

// ---------- stepper ----------
const steps = [
  {
    value: 1,
    title: "Basics",
    subtitle: "Name and describe",
    hint: "Name and describe the piece",
    icon: "mdi-text-box-outline",
  },
  {
    value: 2,
    title: "Details",
    subtitle: "Origin, price, status",
    hint: "Origin, price and status",
    icon: "mdi-shape-outline",
  },
] as const;

const step = ref<number>(1);
const currentStep = computed(() => steps[step.value - 1]);
const stepHasError = reactive<Record<number, boolean>>({ 1: false, 2: false });

// refs
const basicsFormRef = ref();
const detailsFormRef = ref();

// ---------- enums ----------
const STATUSES: ArtefactStatus[] = ["draft", "published", "archived"];
const CURRENCIES = ["KES", "USD", "EUR", "GBP"] as const;

const statusItems = STATUSES.map((s) => ({
  title: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}));
const currencyItems = CURRENCIES.map((c) => ({ title: c, value: c }));

const statusColor = (s: ArtefactStatus) =>
  ({ draft: "warning", published: "success", archived: "grey" })[s];

// ---------- form model ----------
interface ArtefactForm {
  title: string;
  slug: string;
  description: string;
  category: CategorySlug;
  subcategory: SubcategorySlug | null;
  communities: string[];
  region: string;
  price: number;
  currency: string;
  status: ArtefactStatus;
  tags: string[];
}

function blankForm(): ArtefactForm {
  return {
    title: "",
    slug: "",
    description: "",
    category: store.categories[0]?.slug ?? "",
    subcategory: null,
    communities: [],
    region: "",
    price: 0,
    currency: "KES",
    status: "draft",
    tags: [],
  };
}

const form = ref<ArtefactForm>(blankForm());

// Media is owned by ArtefactCoverDialog now — but we must not clobber any
// URLs that already exist on an artefact when editing.
const originalMediaUrls = ref<string[]>([]);

// ---------- region / communities ----------
const regionItems = computed(() => {
  const known = Object.keys(kenyaRegionsEthnicCommunities);
  const current = form.value.region;
  // keep legacy free-text regions selectable when editing old records
  return current && !known.includes(current) ? [...known, current] : known;
});

const communityItems = computed(
  () => kenyaRegionsEthnicCommunities[form.value.region] ?? [],
);

function onRegionChange() {
  // Suggestions are region-specific; drop communities from the old region.
  form.value.communities = [];
}

// ---------- taxonomy (from the artefacts store) ----------
const taxonomyLoading = ref(false);
const taxonomyError = ref(false);

async function loadTaxonomy() {
  if (store.taxonomyLoaded) return;
  taxonomyLoading.value = true;
  taxonomyError.value = false;
  try {
    await store.fetchTaxonomy();
  } catch (err) {
    console.error("[ArtefactDialog] taxonomy load failed", err);
    taxonomyError.value = true;
  } finally {
    taxonomyLoading.value = false;
  }
}

const categoryItems = computed(() =>
  store.categories.map((c) => ({ title: c.label, value: c.slug })),
);

const subcategoryItems = computed(() =>
  store.subcategoriesOf(form.value.category).map((s) => ({
    title: s.label,
    value: s.slug,
  })),
);

function onCategoryChange() {
  // Server rejects subcategories outside the parent; clear on change.
  form.value.subcategory = null;
}

// ---------- slug ----------
const slugTouched = ref(false);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

watch(
  () => form.value.title,
  (title) => {
    if (!slugTouched.value) form.value.slug = slugify(title);
  },
);

function onSlugInput(v: string) {
  slugTouched.value = !!v;
  if (v) form.value.slug = slugify(v);
}

const slugHint = computed(() =>
  slugTouched.value ? "Custom slug" : "Generated from the title",
);

// ---------- validation ----------
const required = (v: unknown) =>
  (v !== null && v !== undefined && v !== "" && !Number.isNaN(v)) || "Required";

const nonNegativeInt = (v: unknown) => {
  if (typeof v !== "number") return "Must be a number";
  if (!Number.isInteger(v)) return "Must be a whole number";
  if (v < 0) return "Must be 0 or more";
  return true;
};

async function validateStep(n: number): Promise<boolean> {
  let ok = true;

  if (n === 1) {
    const { valid } = await basicsFormRef.value.validate();
    ok = valid;
  } else if (n === 2) {
    const { valid } = await detailsFormRef.value.validate();
    ok = valid;
    // Guard: subcategory must belong to the chosen category
    if (
      ok &&
      form.value.subcategory &&
      !store.isValidSubcategory(form.value.category, form.value.subcategory)
    ) {
      form.value.subcategory = null;
    }
  }

  stepHasError[n] = !ok;
  return ok;
}

// ---------- stepper header editability ----------
function isStepEditable(value: number): boolean {
  if (saving.value) return false;
  return step.value > value;
}

// ---------- auto tags ----------
const categoryLabel = (slug?: string) =>
  store.categories.find((c) => c.slug === slug)?.label;

const subcategoryLabel = (slug?: string | null) =>
  slug
    ? store.subcategoriesOf(form.value.category).find((s) => s.slug === slug)
        ?.label
    : undefined;

function regenerateTags() {
  const f = form.value;
  f.tags = generateTags({
    title: f.title,
    description: f.description,
    categoryLabel: categoryLabel(f.category),
    subcategoryLabel: subcategoryLabel(f.subcategory),
    region: f.region,
    communities: f.communities,
  });
}

let tagTimer: ReturnType<typeof setTimeout>;
watch(
  () => [
    form.value.title,
    form.value.description,
    form.value.category,
    form.value.subcategory,
    form.value.region,
    form.value.communities.join(","),
  ],
  () => {
    clearTimeout(tagTimer);
    tagTimer = setTimeout(regenerateTags, 300);
  },
);
onBeforeUnmount(() => clearTimeout(tagTimer));

// ---------- form → store inputs ----------
function buildCreateInput(): CreateArtefactInput {
  regenerateTags(); // never submit stale tags
  const f = form.value;
  return {
    title: f.title.trim(),
    slug: f.slug || null,
    description: f.description.trim(),
    category: f.category,
    subcategory: f.subcategory ?? null,
    communities: f.communities.length ? f.communities : null,
    region: f.region?.trim() || null,
    price: f.price,
    currency: f.currency || "KES",
    mediaUrls: [], // cover is added in the next dialog
    status: isAdmin.value ? f.status : "draft",
    tags: f.tags,
  };
}

function buildUpdateInput(): UpdateArtefactInput {
  regenerateTags();
  const f = form.value;
  return {
    title: f.title.trim(),
    slug: f.slug || null,
    description: f.description.trim(),
    category: f.category,
    subcategory: f.subcategory ?? null, // explicit null clears server-side
    communities: f.communities,
    region: f.region?.trim() || null,
    price: f.price,
    currency: f.currency,
    mediaUrls: originalMediaUrls.value,
    status: isAdmin.value ? f.status : null,
    tags: f.tags,
  };
}

// ---------- dirty tracking ----------
const snapshot = ref("");
const serialize = () => JSON.stringify(form.value);
const isDirty = computed(() => snapshot.value !== serialize());

// ---------- hydrate on open ----------
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;

    step.value = 1;
    stepHasError[1] = stepHasError[2] = false;
    loading.value = true;
    errorSnackbar.value = false;

    try {
      // Taxonomy must be ready before the selects (and blankForm) need it.
      await loadTaxonomy();

      if (isEdit.value && props.artefactId) {
        const a =
          (await store.fetchArtefact(props.artefactId, true)) ??
          store.getById(props.artefactId);

        if (a) {
          form.value = {
            title: a.title ?? "",
            slug: a.slug ?? "",
            description: a.description ?? "",
            category: a.category,
            subcategory: a.subcategory ?? null,
            communities: [...(a.communities ?? [])],
            region: a.region ?? "",
            price: a.price ?? 0,
            currency: a.currency ?? "KES",
            status: a.status,
            tags: [...(a.tags ?? [])],
          };
          slugTouched.value = !!a.slug;
          originalMediaUrls.value = [...(a.mediaUrls ?? [])];

          if (
            form.value.category &&
            !store.categories.some((c) => c.slug === form.value.category)
          ) {
            console.warn(
              `[ArtefactDialog] category "${form.value.category}" not in taxonomy`,
            );
          }
        }
      } else {
        form.value = blankForm();
        slugTouched.value = false;
        originalMediaUrls.value = [];
      }
    } catch (err) {
      console.error("[ArtefactDialog] hydration failed", err);
      errorMessage.value =
        store.error ?? "Could not load the form data. Close and try again.";
      errorSnackbar.value = true;
    } finally {
      loading.value = false;
      snapshot.value = serialize();
      await nextTick();
      basicsFormRef.value?.resetValidation?.();
      detailsFormRef.value?.resetValidation?.();
    }
  },
  { immediate: true },
);

// ---------- close / discard ----------
const discardDialog = ref(false);

function requestClose() {
  if (saving.value) return;
  if (isDirty.value) discardDialog.value = true;
  else close();
}

function confirmDiscard() {
  discardDialog.value = false;
  close();
}

function close() {
  dialog.close();
  emit("update:modelValue", false);
}

// ---------- navigation ----------
async function next() {
  if (step.value >= steps.length) return;
  if (!(await validateStep(step.value))) return;
  step.value++;
}

function prev() {
  if (step.value > 1) step.value--;
}

// ---------- submit ----------
async function submit() {
  // Re-validate every step; jump to the first one with a problem.
  for (const s of steps) {
    if (!(await validateStep(s.value))) {
      step.value = s.value;
      return;
    }
  }

  try {
    let id: string;
    let created = false;

    if (isEdit.value && props.artefactId) {
      await store.updateArtefact(props.artefactId, buildUpdateInput());
      id = props.artefactId;
    } else {
      const artefact = await store.createArtefact(buildCreateInput());
      // Store already sets byId/list/currentArtefact for this artefact.
      id = String(artefact.id);
      created = true;
    }

    snapshot.value = serialize(); // saved → no discard prompt
    close();
    emit("saved", { id, created });
  } catch (err) {
    console.error("[ArtefactDialog] submit failed", err);
    errorMessage.value = store.error ?? (err as Error).message ?? "";
    errorSnackbar.value = true;
  }
}
</script>

<style scoped>
.artefact-card {
  max-height: calc(100vh - 48px);
}
:deep(.artefact-stepper) {
  min-height: 0;
}
/* Let the active step scroll while header and footer stay put. */
:deep(.step-window) {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 24px 8px;
}
.form-section {
  padding: 4px 0 20px;
}
.form-section + .form-section {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-top: 20px;
}
.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.lh-tight {
  line-height: 1.2;
}
</style>
