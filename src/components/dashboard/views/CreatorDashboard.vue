<template>
  <div class="artefacts-dashboard">
    <!-- ===================== HEADER ===================== -->
    <header class="d-flex align-center flex-wrap ga-3 mb-5">
      <v-avatar color="#3D8361" size="44" rounded="lg">
        <v-icon color="white">mdi-palette</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <h1 class="text-h5 font-weight-bold mb-1">
          {{ t("artefacts.title", "Artefacts") }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ totalCount }} {{ t("stats.artefacts", "artefacts") }} ·
          {{ t("artefacts.browse", "Browse") }}
        </p>
      </div>

      <!-- Admin-only: toggle between own artefacts and the public catalogue -->
      <v-btn-toggle
        v-if="isAdmin"
        v-model="viewMode"
        mandatory
        density="comfortable"
        variant="outlined"
        divided
        color="#3D8361"
        class="mr-2"
        @update:model-value="onViewModeChange"
      >
        <v-btn value="mine" prepend-icon="mdi-account-outline">
          {{ t("artefacts.mine", "Mine") }}
        </v-btn>
        <v-btn value="all" prepend-icon="mdi-earth">
          {{ t("artefacts.all", "All") }}
        </v-btn>
      </v-btn-toggle>

      <v-btn
        v-if="canCreate"
        color="#3D8361"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        @click="open('artefact:create')"
      >
        {{ t("artefacts.upload", "Add Artefact") }}
      </v-btn>
    </header>

    <!-- ===================== FILTER BAR ===================== -->
    <v-sheet class="filter-bar pa-3 mb-3" rounded="lg" border>
      <div class="d-flex align-center flex-wrap ga-2">
        <v-text-field
          v-model="filter.search"
          :label="t('common.search', 'Search')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="flex-grow-1 search-field"
          @update:model-value="debouncedFetch"
        />

        <v-select
          v-model="filter.category"
          :items="categoryItems"
          :label="t('artefacts.fields.category', 'Category')"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="category-field"
          @update:model-value="applyFilters"
        />

        <v-btn
          variant="text"
          class="text-none"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="refresh()"
        >
          {{ t("common.refresh", "Refresh") }}
        </v-btn>
      </div>

      <!-- Status tabs for everyone -->
      <div class="d-flex align-center flex-wrap ga-2 mt-3">
        <v-chip-group
          v-model="statusTab"
          mandatory
          selected-class="tab-active"
          @update:model-value="applyFilters"
        >
          <v-chip
            v-for="tab in statusTabs"
            :key="tab.value"
            :value="tab.value"
            size="small"
            variant="tonal"
            :prepend-icon="tab.icon"
          >
            {{ tab.title }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Active filters summary -->
      <v-expand-transition>
        <div v-if="hasFilters" class="d-flex align-center flex-wrap ga-2 mt-3">
          <span class="text-caption text-medium-emphasis">
            {{ t("common.filteredBy", "Filtered by") }}
          </span>
          <v-chip
            v-if="filter.search"
            size="small"
            closable
            @click:close="clearOne('search')"
          >
            “{{ filter.search }}”
          </v-chip>
          <v-chip
            v-if="filter.category"
            size="small"
            closable
            @click:close="clearOne('category')"
          >
            {{ store.categoryLabel(filter.category) }}
          </v-chip>
          <v-btn
            size="small"
            variant="text"
            class="text-none"
            @click="clearFilters"
          >
            {{ t("common.clearAll", "Clear all") }}
          </v-btn>
        </div>
      </v-expand-transition>
    </v-sheet>

    <!-- ===================== LOAD ERROR (with retry) ===================== -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-3"
      :title="t('artefacts.loadFailed', 'Couldn’t load artefacts')"
      @click:close="store.clearError()"
    >
      {{ error }}
      <template #append>
        <v-btn variant="text" size="small" class="text-none" @click="refresh()">
          {{ t("common.retry", "Try again") }}
        </v-btn>
      </template>
    </v-alert>

    <!-- ===================== BULK ACTION BAR (admin) ===================== -->
    <v-slide-y-transition>
      <v-sheet
        v-if="isAdmin && selected.length"
        class="bulk-bar pa-2 px-4 mb-3 d-flex align-center flex-wrap ga-2"
        rounded="lg"
        elevation="2"
      >
        <span class="text-body-2 font-weight-medium">
          {{
            t(
              "common.selectedCount",
              { n: selected.length },
              `${selected.length} selected`,
            )
          }}
        </span>
        <v-spacer />
        <v-btn
          size="small"
          variant="tonal"
          color="#3D8361"
          prepend-icon="mdi-rocket-launch-outline"
          class="text-none"
          :loading="bulkBusy"
          @click="bulkSetStatus('published')"
        >
          {{ t("artefacts.publish", "Publish") }}
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="#B8860B"
          prepend-icon="mdi-archive-outline"
          class="text-none"
          :loading="bulkBusy"
          @click="bulkSetStatus('archived')"
        >
          {{ t("artefacts.archive", "Archive") }}
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="error"
          prepend-icon="mdi-delete-outline"
          class="text-none"
          :loading="bulkBusy"
          @click="bulkDelete"
        >
          {{ t("artefacts.delete", "Delete") }}
        </v-btn>
        <v-btn
          size="small"
          variant="text"
          class="text-none"
          @click="selected = []"
        >
          {{ t("common.clearSelection", "Clear selection") }}
        </v-btn>
      </v-sheet>
    </v-slide-y-transition>

    <!-- ===================== DATA TABLE ===================== -->
    <v-sheet rounded="lg" border class="overflow-hidden">
      <v-data-table-server
        v-model="selected"
        :headers="visibleHeaders"
        :items="rows"
        :items-length="totalCount"
        :loading="loading"
        :items-per-page="pageSize"
        :page="page"
        :items-per-page-options="[10, 20, 50]"
        :show-select="isAdmin"
        item-value="id"
        item-selectable="selectable"
        density="comfortable"
        hover
        fixed-header
        height="calc(100vh - 360px)"
        class="artefacts-table"
        @update:options="onTableOptions"
      >
        <!-- THUMBNAIL + TITLE -->
        <template #[`item.title`]="{ item }">
          <div class="d-flex align-center ga-3 py-1">
            <v-avatar
              size="44"
              rounded="lg"
              color="grey-lighten-4"
              :class="{
                'cursor-pointer': !coverOf(item) && isOwnerOrAdmin(item),
              }"
              @click="
                !coverOf(item) &&
                isOwnerOrAdmin(item) &&
                open('artefact:cover', { id: item.id })
              "
            >
              <v-img
                v-if="coverOf(item)"
                :src="coverOf(item)"
                :alt="item.title"
                cover
              />
              <v-icon
                v-else
                size="20"
                color="#B0BEC5"
                :title="t('artefacts.addCover', 'Add a cover image')"
              >
                mdi-image-plus-outline
              </v-icon>
            </v-avatar>
            <div class="min-w-0">
              <router-link
                :to="`/artefacts/${item.id}`"
                class="title-link font-weight-medium text-truncate d-block"
              >
                {{ item.title }}
              </router-link>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ item.slug }}
              </div>
            </div>
          </div>
        </template>

        <template #[`item.category`]="{ item }">
          <v-chip size="small" variant="tonal" color="#1B4B66">
            {{ store.categoryLabel(item.category) }}
          </v-chip>
        </template>

        <template #[`item.region`]="{ item }">
          <span class="text-body-2">{{ item.region || "—" }}</span>
        </template>

        <template #[`item.price`]="{ item }">
          <span class="font-weight-medium text-no-wrap">
            {{ item.price }} {{ item.currency }}
          </span>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            size="small"
            variant="tonal"
            :prepend-icon="statusIcon(item.status)"
          >
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <template #[`item.tags`]="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="tag in item.tags?.slice(1, 4)"
              :key="tag"
              size="x-small"
              variant="tonal"
              color="#7E57C2"
            >
              {{ tag }}
            </v-chip>
            <v-chip
              v-if="(item.tags?.length ?? 0) > 4"
              size="x-small"
              variant="text"
            >
              +{{ item.tags.length - 4 }}
            </v-chip>
          </div>
        </template>

        <!-- ROW ACTIONS: two primary icons + overflow menu -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end ga-1">
            <v-btn
              icon="mdi-eye-outline"
              size="small"
              variant="text"
              :to="`/artefacts/${item.id}`"
              :aria-label="t('artefacts.preview', 'Preview')"
              :title="t('artefacts.preview', 'Preview')"
            />
            <v-btn
              v-if="isOwnerOrAdmin(item)"
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              color="#1B4B66"
              :aria-label="t('artefacts.edit', 'Edit')"
              :title="t('artefacts.edit', 'Edit')"
              @click="open('artefact:edit', { id: item.id, mode: 'edit' })"
            />

            <v-menu v-if="isOwnerOrAdmin(item)" location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  :aria-label="t('common.moreActions', 'More actions')"
                />
              </template>
              <v-list density="compact" min-width="190">
                <!-- Media actions -->
                <v-list-item
                  prepend-icon="mdi-image-plus-outline"
                  :title="t('artefacts.uploadCover', 'Upload cover image')"
                  @click="open('artefact:cover', { id: item.id })"
                />
                <v-list-item
                  prepend-icon="mdi-cube-outline"
                  :title="t('artefacts.process3d', 'Process 3D views')"
                  @click="open('artefact:glb', { id: item.id })"
                />

                <v-divider class="my-1" />

                <!-- Status actions -->
                <v-list-item
                  v-if="item.status !== 'published'"
                  prepend-icon="mdi-rocket-launch-outline"
                  :title="t('artefacts.publish', 'Publish')"
                  @click="open('artefact:publish', { id: item.id })"
                />
                <v-list-item
                  v-if="item.status !== 'archived'"
                  prepend-icon="mdi-archive-outline"
                  :title="t('artefacts.archive', 'Archive')"
                  @click="open('artefact:archive', { id: item.id })"
                />
                <v-divider class="my-1" />
                <v-list-item
                  prepend-icon="mdi-delete-outline"
                  base-color="error"
                  :title="t('artefacts.delete', 'Delete')"
                  @click="confirmDelete(item)"
                />
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- EMPTY: different invitation for "no results" vs "nothing yet" -->
        <template #no-data>
          <div class="text-center py-10">
            <v-icon size="48" color="#B0BEC5">
              {{ hasFilters ? "mdi-magnify-close" : "mdi-palette-outline" }}
            </v-icon>
            <p class="text-body-1 font-weight-medium mt-2 mb-1">
              {{
                hasFilters
                  ? t("artefacts.noMatches", "No artefacts match these filters")
                  : viewMode === "mine"
                    ? t(
                        "artefacts.emptyMine",
                        "You haven’t created any artefacts yet",
                      )
                    : t("common.noData", "No data available")
              }}
            </p>
            <v-btn
              v-if="hasFilters"
              variant="tonal"
              class="text-none mt-2"
              @click="clearFilters"
            >
              {{ t("common.clearAll", "Clear all") }}
            </v-btn>
            <v-btn
              v-else-if="canCreate"
              variant="flat"
              color="#3D8361"
              prepend-icon="mdi-plus"
              class="text-none mt-2"
              @click="open('artefact:create')"
            >
              {{ t("artefacts.upload", "Add Artefact") }}
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-sheet>

    <!-- ===================== DANGER ZONE (admin only, collapsed) ===================== -->
    <v-expansion-panels
      v-if="isAdmin"
      class="danger-zone mt-8"
      variant="accordion"
    >
      <v-expansion-panel elevation="0">
        <v-expansion-panel-title>
          <v-icon color="error" class="mr-3">mdi-alert-octagon-outline</v-icon>
          <span class="text-subtitle-2 font-weight-bold text-error">
            {{ t("artefacts.danger.title", "Danger Zone") }}
          </span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex align-center ga-3 flex-wrap">
            <p class="text-body-2 text-medium-emphasis flex-grow-1 mb-0">
              {{
                t(
                  "artefacts.danger.message",
                  "Careful, these actions affect all artefacts.",
                )
              }}
            </p>
            <v-btn
              variant="tonal"
              color="error"
              prepend-icon="mdi-refresh"
              class="text-none"
              @click="clearList"
            >
              {{ t("artefacts.danger.clearList", "Clear List") }}
            </v-btn>
            <v-btn
              variant="flat"
              color="error"
              prepend-icon="mdi-delete-sweep-outline"
              class="text-none"
              @click="confirmReset"
            >
              {{ t("artefacts.danger.resetStore", "Reset Store") }}
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- ===================== TOASTS + CONFIRM DIALOG ===================== -->
    <Teleport to="body">
      <!-- ============ TOAST STACK ============ -->
      <div class="toast-stack" aria-live="polite" aria-atomic="false">
        <transition-group name="toast" tag="div" class="toast-list">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="`toast--${toast.type}`"
            :role="toast.type === 'error' ? 'alert' : 'status'"
          >
            <v-icon
              :icon="toastIcons[toast.type]"
              size="22"
              class="toast__icon"
            />

            <div class="toast__body">
              <div class="toast__title">{{ toast.title }}</div>
              <div v-if="toast.message" class="toast__message">
                {{ toast.message }}
              </div>
            </div>

            <v-btn
              v-if="toast.action"
              variant="text"
              size="small"
              class="text-none toast__action"
              @click="runAction(toast)"
            >
              {{ toast.action.label }}
            </v-btn>

            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              :aria-label="t('common.close', 'Close')"
              @click="dismiss(toast.id)"
            />

            <span
              v-if="toast.timeout > 0"
              class="toast__timer"
              :style="{ animationDuration: `${toast.timeout}ms` }"
              @animationend="dismiss(toast.id)"
            />
          </div>
        </transition-group>
      </div>

      <!-- ============ CONFIRM DIALOG ============ -->
      <v-dialog
        :model-value="confirmState.open"
        max-width="440"
        persistent
        @keydown.esc="settleConfirm(false)"
      >
        <v-card rounded="lg" class="confirm-card">
          <div class="d-flex ga-4 pa-5 pb-2">
            <v-avatar
              :color="tone"
              variant="tonal"
              size="44"
              class="flex-shrink-0"
            >
              <v-icon :icon="confirmState.icon || 'mdi-alert-outline'" />
            </v-avatar>
            <div class="min-w-0">
              <h2 class="text-h6 font-weight-bold mb-1">
                {{ confirmState.title }}
              </h2>
              <p
                v-if="confirmState.message"
                class="text-body-2 text-medium-emphasis mb-0"
              >
                {{ confirmState.message }}
              </p>
            </div>
          </div>

          <div
            v-if="confirmState.items?.length"
            class="px-5 pt-2 d-flex flex-wrap ga-1"
          >
            <v-chip
              v-for="name in confirmState.items.slice(0, 5)"
              :key="name"
              size="small"
              variant="tonal"
            >
              {{ name }}
            </v-chip>
            <v-chip
              v-if="confirmState.items.length > 5"
              size="small"
              variant="text"
            >
              +{{ confirmState.items.length - 5 }}
            </v-chip>
          </div>

          <div v-if="confirmState.requireText" class="px-5 pt-4">
            <v-text-field
              v-model="typed"
              variant="outlined"
              density="compact"
              hide-details
              autofocus
              :label="
                t(
                  'common.typeToConfirm',
                  { word: confirmState.requireText },
                  `Type ${confirmState.requireText} to confirm`,
                )
              "
              @keydown.enter="canConfirm && settleConfirm(true)"
            />
          </div>

          <v-card-actions class="pa-5 pt-4 justify-end ga-2">
            <v-btn
              variant="text"
              class="text-none"
              @click="settleConfirm(false)"
            >
              {{ confirmState.cancelText || t("common.cancel", "Cancel") }}
            </v-btn>
            <v-btn
              variant="flat"
              :color="tone"
              class="text-none"
              :disabled="!canConfirm"
              :autofocus="!confirmState.requireText"
              @click="settleConfirm(true)"
            >
              {{ confirmState.confirmText || t("common.confirm", "Confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import {
  useArtefactsStore,
  type Artefact,
  type ArtefactStatus,
  type ArtefactFilterInput,
  type CategorySlug,
} from "@/stores/artefacts";
import {
  useDialogStore,
  type DialogKey,
  type DialogPayload,
} from "@/stores/dialogs";
import { useUserStore } from "@/stores/users";

// ===================== SETUP =====================
const { t } = useI18n();
const { smAndDown } = useDisplay();
const store = useArtefactsStore();
const dialog = useDialogStore();
const userStore = useUserStore();

// ===================== TOASTS + CONFIRM =====================
type ToastType = "success" | "error" | "warning" | "info";

interface ToastAction {
  label: string;
  handler: () => void;
}

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  timeout: number;
  action?: ToastAction;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  color?: "error" | "warning" | "primary" | string;
  icon?: string;
  requireText?: string;
  items?: string[];
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((ok: boolean) => void) | null;
}

const toasts = ref<Toast[]>([]);
const confirmState = ref<ConfirmState>({
  open: false,
  title: "",
  resolve: null,
});

let seq = 0;
const MAX_TOASTS = 4;

function push(
  type: ToastType,
  title: string,
  opts: { message?: string; timeout?: number; action?: ToastAction } = {},
) {
  const toast: Toast = {
    id: ++seq,
    type,
    title,
    message: opts.message,
    action: opts.action,
    timeout: opts.timeout ?? (type === "error" ? 0 : 5000),
  };
  toasts.value = [...toasts.value, toast].slice(-MAX_TOASTS);
  return toast.id;
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((x) => x.id !== id);
}

function confirm(options: ConfirmOptions): Promise<boolean> {
  confirmState.value.resolve?.(false);
  return new Promise<boolean>((resolve) => {
    confirmState.value = { ...options, open: true, resolve };
  });
}

function settleConfirm(ok: boolean) {
  confirmState.value.resolve?.(ok);
  confirmState.value = { ...confirmState.value, open: false, resolve: null };
}

const notify = {
  confirm,
  success: (title: string, o?: Parameters<typeof push>[2]) =>
    push("success", title, o),
  error: (title: string, o?: Parameters<typeof push>[2]) =>
    push("error", title, o),
  warning: (title: string, o?: Parameters<typeof push>[2]) =>
    push("warning", title, o),
  info: (title: string, o?: Parameters<typeof push>[2]) =>
    push("info", title, o),
};

const toastIcons = {
  success: "mdi-check-circle-outline",
  error: "mdi-alert-circle-outline",
  warning: "mdi-alert-outline",
  info: "mdi-information-outline",
} as const;

const typed = ref("");
watch(
  () => confirmState.value.open,
  (isOpen) => isOpen && (typed.value = ""),
);
const tone = computed(() => confirmState.value.color || "primary");
const canConfirm = computed(
  () =>
    !confirmState.value.requireText ||
    typed.value.trim() === confirmState.value.requireText,
);
function runAction(toast: Toast) {
  toast.action?.handler();
  dismiss(toast.id);
}

const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.role === "ADMIN");
const isCreator = computed(() => user.value?.role === "CREATOR");
const canCreate = computed(() => isAdmin.value || isCreator.value);

// ===================== VIEW MODE (mine / all) =====================
const viewMode = ref<"mine" | "all">("mine");

function onViewModeChange() {
  page.value = 1;
  selected.value = [];
  refresh();
}

// ===================== STATE =====================
const filter = reactive<ArtefactFilterInput>({
  search: "",
  category: null,
  status: null,
});
const statusTab = ref<ArtefactStatus | "all">("all");
const selected = ref<string[]>([]);
const bulkBusy = ref(false);

const page = ref(1);
const pageSize = ref(10);

// ===================== DATA SOURCE =====================
const items = computed<Artefact[]>(() => {
  if (viewMode.value === "all") return store.items;

  // Filter the "mine" list locally to support search/category/status instantly
  const q = filter.search?.trim().toLowerCase();
  return store.myItems.filter(
    (a) =>
      (!q ||
        a.title.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))) &&
      (!filter.category || a.category === filter.category) &&
      (!filter.status || a.status === filter.status),
  );
});

const totalCount = computed(() =>
  viewMode.value === "mine" ? items.value.length : store.totalCount,
);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const hasFilters = computed(
  () => !!(filter.search?.trim() || filter.category || filter.status),
);

const rows = computed(() =>
  items.value.map((i) => ({ ...i, selectable: isOwnerOrAdmin(i) })),
);

// ===================== TABLE HEADERS =====================
const headers = computed(() => [
  {
    title: t("artefacts.fields.title", "Title"),
    key: "title",
    sortable: false,
    width: "28%",
  },
  {
    title: t("artefacts.fields.category", "Category"),
    key: "category",
    sortable: false,
  },
  {
    title: t("artefacts.fields.origin", "Origin"),
    key: "region",
    sortable: false,
  },
  {
    title: t("artefacts.fields.price", "Price"),
    key: "price",
    sortable: false,
    align: "end" as const,
  },
  { title: t("artefacts.status", "Status"), key: "status", sortable: false },
  { title: t("artefacts.fields.tags", "Tags"), key: "tags", sortable: false },
  {
    title: t("common.actions", "Actions"),
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: "150px",
  },
]);

const visibleHeaders = computed(() =>
  headers.value.filter(
    (h) => !smAndDown.value || ["title", "status", "actions"].includes(h.key),
  ),
);

// ===================== MEDIA HELPERS =====================
const isGlb = (u?: string) => !!u && /\.(glb|gltf)(\?.*)?$/i.test(u);
const coverOf = (a: Artefact) => a.mediaUrls?.find((u) => !isGlb(u)) ?? "";

// ===================== CATEGORY & STATUS OPTIONS =====================
const categoryItems = computed(() =>
  store.categories.map((c) => ({
    title: c.label,
    value: c.slug as CategorySlug,
  })),
);

const statusLabel = (s: ArtefactStatus) =>
  t(`artefacts.statuses.${s}`, s.charAt(0).toUpperCase() + s.slice(1));

const statusTabs = computed(() => [
  {
    value: "all",
    title: t("common.all", "All"),
    icon: "mdi-view-grid-outline",
  },
  { value: "draft", title: statusLabel("draft"), icon: statusIcon("draft") },
  {
    value: "published",
    title: statusLabel("published"),
    icon: statusIcon("published"),
  },
  {
    value: "archived",
    title: statusLabel("archived"),
    icon: statusIcon("archived"),
  },
]);

// ===================== DIALOG DISPATCH =====================
function open(key: DialogKey, payload: DialogPayload = {}) {
  dialog.open(key, payload);
}

// ===================== STATUS CHIPS =====================
function statusColor(s: ArtefactStatus): string {
  return s === "published"
    ? "#3D8361"
    : s === "archived"
      ? "#B8860B"
      : "#1B4B66";
}
function statusIcon(s: ArtefactStatus): string {
  return s === "published"
    ? "mdi-check-circle-outline"
    : s === "archived"
      ? "mdi-archive-outline"
      : "mdi-pencil-circle-outline";
}

// ===================== OWNERSHIP =====================
function isOwnerOrAdmin(a: Artefact): boolean {
  if (isAdmin.value) return true;
  if (!user.value) return false;
  return a.createdBy === user.value.id;
}

// ===================== FETCH =====================
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onBeforeUnmount(() => debounceTimer && clearTimeout(debounceTimer));

function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 300);
}

function applyFilters() {
  filter.status = statusTab.value === "all" ? null : statusTab.value;
  page.value = 1;
  return refresh();
}

async function refresh() {
  selected.value = [];
  try {
    if (viewMode.value === "mine") {
      const uid = user.value?.id;
      if (!uid) return;
      await store.fetchMyArtefacts(
        uid,
        { limit: pageSize.value, offset: (page.value - 1) * pageSize.value },
        { reset: true },
      );
    } else {
      await store.fetchArtefacts(
        {
          filter: {
            search: filter.search?.trim() || null,
            category: filter.category ?? null,
            status: filter.status ?? null,
          },
          limit: pageSize.value,
          offset: (page.value - 1) * pageSize.value,
        },
        { reset: true },
      );
    }
  } catch {
    // Handled via store.error alert
  }
}

function onTableOptions(opts: { page: number; itemsPerPage: number }) {
  const changed =
    opts.page !== page.value || opts.itemsPerPage !== pageSize.value;
  page.value = opts.page;
  pageSize.value = opts.itemsPerPage;
  if (changed) refresh();
}

// Initial load only when user is resolved
watch(
  () => user.value?.id,
  (id) => id && refresh(),
  { immediate: true },
);

function clearOne(key: "search" | "category") {
  filter[key] = key === "search" ? "" : null;
  applyFilters();
}
function clearFilters() {
  filter.search = "";
  filter.category = null;
  statusTab.value = "all";
  applyFilters();
}

// ===================== SINGLE-ITEM ACTIONS =====================
async function confirmDelete(artefact: Artefact) {
  const ok = await notify.confirm({
    title: t("artefacts.delete", "Delete Artefact"),
    message: t(
      "artefacts.confirmDelete",
      { title: artefact.title },
      `Are you sure you want to delete "${artefact.title}"?`,
    ),
    confirmText: t("artefacts.delete", "Delete"),
    color: "error",
    icon: "mdi-delete-outline",
  });
  if (!ok) return;
  try {
    await store.deleteArtefact(artefact.id);
    if (items.value.length === 1 && page.value > 1) page.value--;
    await refresh();
    notify.success(t("artefacts.deleted", "Deleted"), {
      message: artefact.title,
    });
  } catch (e) {
    notify.error(t("artefacts.deleteFailed", "Couldn’t delete artefact"), {
      message: errMsg(e),
      action: {
        label: t("common.retry", "Try again"),
        handler: () => confirmDelete(artefact),
      },
    });
  }
}

// ===================== BULK ACTIONS (admin) =====================
const selectedArtefacts = () =>
  items.value.filter((i) => selected.value.includes(i.id));

async function setStatus(id: string, status: ArtefactStatus) {
  return store.updateArtefact(id, { status });
}

async function bulkSetStatus(status: ArtefactStatus) {
  const targets = selectedArtefacts().filter((a) => a.status !== status);
  if (!targets.length) {
    notify.info(t("common.nothingToDo", "Nothing to change"), {
      message: `Selected artefacts are already ${status}.`,
    });
    return;
  }
  const verb = status === "published" ? "Published" : "Archived";
  const previous = targets.map((a) => ({ id: a.id, status: a.status }));

  bulkBusy.value = true;
  const results = await Promise.allSettled(
    targets.map((a) => setStatus(a.id, status)),
  );
  bulkBusy.value = false;

  const failed = results.filter((r) => r.status === "rejected").length;
  const done = results.length - failed;

  if (failed) {
    notify.warning(`${verb} ${done} of ${results.length}`, {
      message: `${failed} failed. They stay selected so you can try again.`,
    });
  } else {
    notify.success(`${verb} ${done} artefact${done === 1 ? "" : "s"}`, {
      timeout: 8000,
      action: {
        label: t("common.undo", "Undo"),
        handler: async () => {
          await Promise.allSettled(
            previous.map((p) => setStatus(p.id, p.status)),
          );
          notify.info(t("common.undone", "Undone"));
          refresh();
        },
      },
    });
  }
  await refresh();
}

async function bulkDelete() {
  const targets = selectedArtefacts();
  const ok = await notify.confirm({
    title: `Delete ${targets.length} artefact${targets.length === 1 ? "" : "s"}?`,
    message: t("artefacts.bulkDeleteWarning", "This can’t be undone."),
    confirmText: t("artefacts.delete", "Delete"),
    color: "error",
    icon: "mdi-delete-alert-outline",
    items: targets.map((a) => a.title),
    requireText: targets.length > 5 ? "DELETE" : undefined,
  });
  if (!ok) return;

  bulkBusy.value = true;
  const results = await Promise.allSettled(
    targets.map((a) => store.deleteArtefact(a.id)),
  );
  bulkBusy.value = false;

  const failed = results.filter((r) => r.status === "rejected").length;
  const done = results.length - failed;
  if (failed) {
    notify.warning(`Deleted ${done} of ${results.length}`, {
      message: `${failed} couldn’t be deleted.`,
    });
  } else {
    notify.success(`Deleted ${done} artefact${done === 1 ? "" : "s"}`);
  }
  await refresh();
}

// ===================== DANGER ZONE =====================
async function clearList() {
  store.clearList();
  notify.info(t("artefacts.listCleared", "List cleared"), {
    message: "Only the local view was cleared. No data was deleted.",
    action: { label: t("common.refresh", "Refresh"), handler: () => refresh() },
  });
}

async function confirmReset() {
  const ok = await notify.confirm({
    title: t("artefacts.danger.resetStore", "Reset Store"),
    message: t(
      "artefacts.danger.confirmReset",
      "This will clear all loaded data.",
    ),
    confirmText: t("artefacts.danger.resetStore", "Reset Store"),
    color: "error",
    icon: "mdi-alert-octagon-outline",
    requireText: "RESET",
  });
  if (!ok) return;
  store.reset();
  notify.success(t("artefacts.resetDone", "Store reset"));
}

function errMsg(e: unknown): string {
  return e instanceof Error
    ? e.message
    : t("common.unknownError", "Something went wrong. Try again.");
}
</script>

<style scoped>
.artefacts-dashboard {
  max-width: 99.9%;
  margin: 0 auto;
}

.filter-bar {
  border-color: rgba(27, 75, 102, 0.14) !important;
}
.search-field {
  min-width: 220px;
}
.category-field {
  min-width: 180px;
  max-width: 240px;
}

/* Custom active state for the status chips */
.tab-active {
  background-color: #3d8361 !important;
  color: #ffffff !important;
  border-color: #3d8361 !important;
}

.bulk-bar {
  background: rgba(27, 75, 102, 0.06);
  border: 1px solid rgba(27, 75, 102, 0.18);
}

.artefacts-table :deep(.v-data-table__th) {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: rgba(27, 75, 102, 0.7);
  background: rgba(27, 75, 102, 0.03);
  font-weight: 600;
}
.artefacts-table :deep(.v-data-table__tr:hover) {
  background: rgba(27, 75, 102, 0.03);
}

.title-link {
  color: inherit;
  text-decoration: none;
}
.title-link:hover,
.title-link:focus-visible {
  color: #3d8361;
  text-decoration: underline;
}

.min-w-0 {
  min-width: 0;
}

.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s;
}
.cursor-pointer:hover {
  background-color: #e0e0e0 !important;
}

.danger-zone {
  border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 8px;
  background: rgba(211, 47, 47, 0.04) !important;
}

@media (max-width: 600px) {
  .filter-bar {
    padding: 8px !important;
  }
  .search-field,
  .category-field {
    min-width: 100%;
    max-width: none;
  }
}

/* TOAST STYLES */
.toast-stack {
  position: fixed;
  z-index: 3000;
  right: 16px;
  bottom: 16px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}
.toast-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  --accent: #1b4b66;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 8px 12px 14px;
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-left: 4px solid var(--accent);
  box-shadow: 0 8px 24px rgba(16, 32, 44, 0.16);
}
.toast--success {
  --accent: #3d8361;
}
.toast--error {
  --accent: #c62828;
}
.toast--warning {
  --accent: #b8860b;
}
.toast--info {
  --accent: #1b4b66;
}

.toast__icon {
  color: var(--accent);
  margin-top: 1px;
}
.toast__body {
  flex: 1;
  min-width: 0;
}
.toast__title {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.3;
}
.toast__message {
  margin-top: 2px;
  font-size: 0.8125rem;
  opacity: 0.75;
  overflow-wrap: anywhere;
}
.toast__action {
  color: var(--accent);
  font-weight: 600;
}

.toast__timer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: var(--accent);
  opacity: 0.45;
  transform-origin: left;
  animation: toast-timer linear forwards;
}
.toast:hover .toast__timer,
.toast:focus-within .toast__timer {
  animation-play-state: paused;
}
@keyframes toast-timer {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
.toast-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 600px) {
  .toast-stack {
    right: 16px;
    left: 16px;
    width: auto;
    bottom: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.1s;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
