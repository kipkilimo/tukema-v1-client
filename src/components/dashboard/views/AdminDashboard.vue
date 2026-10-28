<template>
  <div class="admin-dashboard">
    <!-- ===================== STICKY HEADER ===================== -->
    <div class="admin-header d-flex align-center flex-wrap ga-3 mb-4">
      <v-avatar color="#1B4B66" size="44" rounded="lg">
        <v-icon color="white">mdi-shield-account</v-icon>
      </v-avatar>
      <div class="flex-grow-1 min-width-0">
        <h1 class="text-h6 font-weight-bold mb-0 text-truncate">
          {{ t("admin.title") }}
        </h1>
        <p class="text-caption text-medium-emphasis mb-0 text-truncate">
          {{ user?.name }} · {{ user?.email }} · {{ user?.role }}
        </p>
      </div>

      <v-btn
        color="#3D8361"
        variant="flat"
        prepend-icon="mdi-bullhorn-variant"
        class="text-none"
        :loading="launchFlow.open"
        @click="openLaunchFlow"
      >
        Launch Campaign
      </v-btn>
      <v-btn
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="anyLoading"
        @click="refreshAll"
      >
        Refresh
      </v-btn>
    </div>

    <!-- ===================== STATS ROW ===================== -->
    <v-row dense class="mb-4">
      <v-col v-for="stat in stats" :key="stat.key" cols="6" sm="3">
        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-3 stat-card stat-card--clickable"
          tabindex="0"
          role="button"
          :aria-label="`Open ${stat.label}`"
          @click="selectTab(stat.key)"
          @keydown.enter="selectTab(stat.key)"
          @keydown.space.prevent="selectTab(stat.key)"
        >
          <div class="d-flex align-center ga-2">
            <v-avatar :color="stat.color" size="32" rounded="lg">
              <v-icon color="white" size="18">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div class="min-width-0">
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ stat.label }}
              </div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ stat.value }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ===================== TABS ===================== -->
    <v-sheet rounded="lg" variant="outlined" class="pa-0 overflow-hidden">
      <v-tabs
        v-model="tab"
        color="#1B4B66"
        density="comfortable"
        align-tabs="start"
        show-arrows
      >
        <v-tab value="users" prepend-icon="mdi-account-multiple-outline">
          {{ t("admin.users") }}
        </v-tab>
        <v-tab value="artefacts" prepend-icon="mdi-palette-outline">
          {{ t("artefacts.title") }}
        </v-tab>
        <v-tab value="payments" prepend-icon="mdi-cash-multiple">
          Payments
        </v-tab>
        <v-tab value="vouchers" prepend-icon="mdi-ticket-confirmation">
          Vouchers
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="tab" class="pa-2 pa-sm-3">
        <!-- ============================================================
             USERS
             ============================================================ -->
        <v-window-item value="users">
          <div class="d-flex align-center flex-wrap ga-2 mb-3">
            <v-text-field
              v-model="users.filter.search"
              :label="t('common.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="flex-grow-1 tab-search"
              @update:model-value="debouncedUsersLoad"
            />
            <v-select
              v-model="users.filter.role"
              :items="userRoleItems"
              label="Role"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tab-select"
              @update:model-value="onUsersFilterChanged"
            />
            <v-select
              v-model="users.filter.isActive"
              :items="activeItems"
              label="Active"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tab-select"
              @update:model-value="onUsersFilterChanged"
            />
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="users.loading"
              @click="loadUsers"
            >
              Refresh
            </v-btn>
            <v-btn
              color="#1B4B66"
              variant="flat"
              prepend-icon="mdi-account-plus"
              class="text-none"
              @click="open('user:create')"
            >
              Add user
            </v-btn>
          </div>

          <v-data-table-server
            :headers="userHeaders"
            :items="users.items"
            :items-length="users.total"
            :loading="users.loading"
            v-model:items-per-page="users.limit"
            v-model:page="users.page"
            :items-per-page-options="[10, 20, 50]"
            density="comfortable"
            class="admin-table"
            :no-data-text="t('common.noData')"
            @update:options="loadUsers"
          >
            <template #no-data>
              <div class="table-empty">
                <v-icon size="40" class="mb-2"
                  >mdi-account-search-outline</v-icon
                >
                <div class="text-body-2">No users match this filter.</div>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="#1B4B66"
                  class="mt-2"
                  @click="open('user:create')"
                >
                  Add the first user
                </v-btn>
              </div>
            </template>

            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="28" :color="roleColor(item.role)">
                  <span class="text-caption text-white">
                    {{ initials(item.name) }}
                  </span>
                </v-avatar>
                <span class="font-weight-medium">{{ item.name }}</span>
              </div>
            </template>

            <template #[`item.role`]="{ item }">
              <v-chip
                :color="roleColor(item.role)"
                variant="tonal"
                size="small"
                :prepend-icon="roleIcon(item.role)"
              >
                {{ item.role }}
              </v-chip>
            </template>

            <template #[`item.isActive`]="{ item }">
              <v-chip
                :color="item.isActive ? '#3D8361' : 'error'"
                variant="tonal"
                size="small"
                :prepend-icon="
                  item.isActive
                    ? 'mdi-check-circle-outline'
                    : 'mdi-close-circle-outline'
                "
              >
                {{ item.isActive ? "Active" : "Inactive" }}
              </v-chip>
            </template>

            <template #[`item.createdAt`]="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex ga-1">
                <v-tooltip location="top" :text="t('artefacts.edit')">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="text"
                      color="#1B4B66"
                      @click="open('user:edit', { id: item.id, mode: 'edit' })"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Deactivate">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-account-off-outline"
                      size="x-small"
                      variant="text"
                      color="#B8860B"
                      :disabled="!item.isActive"
                      @click="open('user:deactivate', { id: item.id })"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Delete">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="confirmDeleteUser(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- ============================================================
             ARTEFACTS
             ============================================================ -->
        <v-window-item value="artefacts">
          <div class="d-flex align-center flex-wrap ga-2 mb-3">
            <v-text-field
              v-model="artefacts.filter.search"
              :label="t('common.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="flex-grow-1 tab-search"
              @update:model-value="debouncedArtefactsLoad"
            />
            <v-select
              v-model="artefacts.filter.category"
              :items="categoryItems"
              :label="t('artefacts.fields.category')"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tab-select"
              @update:model-value="onArtefactsFilterChanged"
            />
            <v-select
              v-model="artefacts.filter.status"
              :items="statusItems"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tab-select"
              @update:model-value="onArtefactsFilterChanged"
            />
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="artefacts.loading"
              @click="loadArtefacts"
            >
              Refresh
            </v-btn>
            <v-btn
              color="#3D8361"
              variant="flat"
              prepend-icon="mdi-plus"
              class="text-none"
              @click="open('artefact:create')"
            >
              {{ t("artefacts.upload") }}
            </v-btn>
          </div>

          <v-data-table-server
            :headers="artefactHeaders"
            :items="artefacts.items"
            :items-length="artefacts.total"
            :loading="artefacts.loading"
            v-model:items-per-page="artefacts.limit"
            v-model:page="artefacts.page"
            :items-per-page-options="[10, 20, 50]"
            density="comfortable"
            class="admin-table"
            @update:options="loadArtefacts"
          >
            <template #no-data>
              <div class="table-empty">
                <v-icon size="40" class="mb-2">mdi-palette-outline</v-icon>
                <div class="text-body-2">No artefacts match this filter.</div>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="#3D8361"
                  class="mt-2"
                  @click="open('artefact:create')"
                >
                  Upload the first artefact
                </v-btn>
              </div>
            </template>

            <template #[`item.title`]="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" rounded="lg" color="#F1F3F5">
                  <v-img
                    v-if="item.mediaUrls?.[0]"
                    :src="item.mediaUrls[0]"
                    cover
                  />
                  <v-icon v-else size="16" color="#B0BEC5">mdi-palette</v-icon>
                </v-avatar>
                <div class="min-width-0">
                  <div class="font-weight-medium text-truncate">
                    {{ item.title }}
                  </div>
                  <div class="text-caption text-medium-emphasis text-truncate">
                    {{ item.slug }}
                  </div>
                </div>
              </div>
            </template>

            <template #[`item.category`]="{ item }">
              <v-chip size="small" variant="tonal" color="#1B4B66">
                {{ item.category }}
              </v-chip>
            </template>

            <template #[`item.price`]="{ item }">
              {{ item.price }} {{ item.currency }}
            </template>

            <template #[`item.status`]="{ item }">
              <v-chip
                :color="artefactStatusColor(item.status)"
                size="small"
                variant="tonal"
                :prepend-icon="artefactStatusIcon(item.status)"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex ga-1">
                <v-tooltip location="top" :text="t('artefacts.edit')">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="text"
                      color="#1B4B66"
                      @click="
                        open('artefact:edit', { id: item.id, mode: 'edit' })
                      "
                    />
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="item.status !== 'published'"
                  location="top"
                  text="Publish"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-rocket-launch-outline"
                      size="x-small"
                      variant="text"
                      color="#3D8361"
                      @click="open('artefact:publish', { id: item.id })"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="item.status !== 'archived'"
                  location="top"
                  text="Archive"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-archive-outline"
                      size="x-small"
                      variant="text"
                      color="#B8860B"
                      @click="open('artefact:archive', { id: item.id })"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Delete">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="confirmDeleteArtefact(item)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- ============================================================
             PAYMENTS
             ============================================================ -->
        <v-window-item value="payments">
          <div class="d-flex align-center flex-wrap ga-2 mb-3">
            <v-select
              v-model="payments.filter.status"
              :items="paymentStatusItems"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tab-select"
              @update:model-value="onPaymentsFilterChanged"
            />
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="payments.loading"
              @click="loadPayments"
            >
              {{ t("common.refresh") }}
            </v-btn>
          </div>

          <v-data-table-server
            :headers="paymentHeaders"
            :items="payments.items"
            :items-length="payments.total"
            :loading="payments.loading"
            v-model:items-per-page="payments.limit"
            v-model:page="payments.page"
            :items-per-page-options="[10, 20, 50]"
            density="comfortable"
            class="admin-table"
            @update:options="loadPayments"
          >
            <template #no-data>
              <div class="table-empty">
                <v-icon size="40" class="mb-2">mdi-cash-multiple</v-icon>
                <div class="text-body-2">No payments recorded yet.</div>
              </div>
            </template>

            <template #[`item.amount`]="{ item }">
              <span class="font-weight-medium">
                {{ item.amount }} {{ item.currency }}
              </span>
            </template>

            <template #[`item.channel`]="{ item }">
              <v-chip size="small" variant="tonal" color="#1B4B66">
                {{ item.channel }}
              </v-chip>
            </template>

            <template #[`item.status`]="{ item }">
              <v-chip
                :color="paymentStatusColor(item.status)"
                size="small"
                variant="tonal"
                :prepend-icon="paymentStatusIcon(item.status)"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.payer`]="{ item }">
              <div class="min-width-0">
                <div class="font-weight-medium text-truncate">
                  {{ item.payer?.name }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.payer?.email }}
                </div>
              </div>
            </template>

            <template #[`item.createdAt`]="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex ga-1">
                <v-tooltip location="top" text="Confirm">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-check-outline"
                      size="x-small"
                      variant="text"
                      color="#3D8361"
                      :disabled="item.status === 'paid'"
                      @click="open('payment:confirm', { id: item.id })"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip location="top" text="Issue vouchers">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-ticket-confirmation-outline"
                      size="x-small"
                      variant="text"
                      color="#016FB8"
                      :disabled="item.status !== 'paid'"
                      @click="open('payment:issue-vouchers', { id: item.id })"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- ============================================================
             VOUCHERS
             ============================================================ -->
        <v-window-item value="vouchers">
          <div class="d-flex align-center flex-wrap ga-2 mb-3">
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="vouchers.loading"
              @click="loadVouchers"
            >
              {{ t("common.refresh") }}
            </v-btn>
          </div>

          <v-data-table-server
            :headers="voucherHeaders"
            :items="vouchers.items"
            :items-length="vouchers.total"
            :loading="vouchers.loading"
            v-model:items-per-page="vouchers.limit"
            v-model:page="vouchers.page"
            :items-per-page-options="[10, 20, 50]"
            density="comfortable"
            class="admin-table"
            @update:options="loadVouchers"
          >
            <template #no-data>
              <div class="table-empty">
                <v-icon size="40" class="mb-2">mdi-ticket-confirmation</v-icon>
                <div class="text-body-2">
                  No voucher batches yet — they arrive after a paid payment.
                </div>
              </div>
            </template>

            <template #[`item.totalCost`]="{ item }">
              <span class="font-weight-medium">
                {{ item.totalCost }} {{ item.currency }}
              </span>
            </template>

            <template #[`item.status`]="{ item }">
              <v-chip
                :color="item.status === 'issued' ? '#3D8361' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.createdAt`]="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex ga-1">
                <v-tooltip location="top" text="Regenerate batch">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-refresh-circle"
                      size="x-small"
                      variant="text"
                      color="#016FB8"
                      @click="regenerateBatch(item.id)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>
      </v-window>
    </v-sheet>

    <!-- ===================== DANGER ZONE ===================== -->
    <v-sheet
      class="danger-zone mt-6 pa-4"
      rounded="lg"
      variant="outlined"
      color="error"
    >
      <div class="d-flex align-center flex-wrap ga-3">
        <v-icon color="error">mdi-alert-octagon-outline</v-icon>
        <div class="flex-grow-1">
          <div class="text-subtitle-2 font-weight-bold text-error">
            Danger zone
          </div>
          <div class="text-caption text-medium-emphasis">
            Reset all client-side caches. Server data is untouched.
          </div>
        </div>
        <v-btn
          variant="flat"
          color="error"
          prepend-icon="mdi-delete-sweep-outline"
          class="text-none"
          @click="confirmResetCaches"
        >
          Reset caches
        </v-btn>
      </div>
    </v-sheet>

    <!-- ============================================================
         CONFIRM DIALOG (replaces window.confirm)
         ============================================================ -->
    <v-dialog v-model="confirmDialog.open" max-width="420" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 pa-4">
          <v-icon color="warning">mdi-alert-outline</v-icon>
          <span class="text-subtitle-1 font-weight-bold">
            {{ confirmDialog.title }}
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-0">{{ confirmDialog.message }}</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="confirmDialog.busy"
            @click="confirmDialog.open = false"
          >
            Cancel
          </v-btn>
          <v-btn
            :color="confirmDialog.danger ? 'error' : 'primary'"
            variant="flat"
            :loading="confirmDialog.busy"
            @click="runConfirmedAction"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============================================================
         LAUNCH CAMPAIGN FLOW — details → poster crop & upload
         ============================================================ -->
    <v-dialog
      v-model="launchFlow.open"
      max-width="720"
      persistent
      scrollable
      :fullscreen="$vuetify.display.smAndDown"
    >
      <CampaignCreator
        v-if="launchFlow.open && launchFlow.step === 'details'"
        @created="onCampaignCreated"
        @cancel="closeLaunchFlow"
      />

      <CampaignUploader
        v-else-if="
          launchFlow.open &&
          launchFlow.step === 'poster' &&
          launchFlow.campaignId
        "
        :campaign-id="launchFlow.campaignId"
        @uploaded="onPosterUploaded"
        @cancel="onPosterSkipped"
      />
    </v-dialog>

    <v-snackbar
      v-model="launchFlow.toast.show"
      :color="launchFlow.toast.color"
      :timeout="5000"
      location="top"
    >
      {{ launchFlow.toast.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { gql } from "graphql-tag";
import { apolloClient } from "@/graphql/apolloClient";
import { useUserStore } from "@/stores/users";
import {
  useDialogStore,
  type DialogKey,
  type DialogPayload,
} from "@/stores/dialogs";
import {
  useArtefactsStore,
  type ArtefactCategory,
  type ArtefactStatus,
} from "@/stores/artefacts";
import CampaignCreator from "@/components/forms/CampaignCreator.vue";
import CampaignUploader from "@/components/uploaders/CampaignUploader.vue";

// ============================================================
// SETUP
// ============================================================

const { t } = useI18n();
const userStore = useUserStore();
const dialog = useDialogStore();
const artefactsStore = useArtefactsStore();

const user = computed(() => userStore.user);
const tab = ref<"users" | "artefacts" | "payments" | "vouchers">("users");

// ============================================================
// GRAPHQL
// ============================================================

const LIST_USERS = gql`
  query ListUsers($input: ListUsersInput) {
    users(input: $input) {
      items {
        id
        name
        email
        role
        isActive
        createdAt
        updatedAt
      }
      total
      limit
      offset
      hasMore
    }
  }
`;

const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($id: ID!) {
    adminDeleteUser(id: $id)
  }
`;

const LIST_MY_PAYMENTS = gql`
  query MyPayments($status: PaymentStatus, $limit: Int, $offset: Int) {
    myPayments(status: $status, limit: $limit, offset: $offset) {
      id
      purpose
      channel
      status
      currency
      amount
      amountCaptured
      payer {
        userId
        name
        email
        phone
        country
      }
      createdAt
    }
  }
`;

// Kept for the payment:confirm dialog handler in `useDialogStore`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONFIRM_PAYMENT = gql`
  mutation ConfirmVoucherPayment($input: ConfirmVoucherPaymentInput!) {
    confirmVoucherPayment(input: $input) {
      paymentId
      batchId
      totalVouchers
      totalSheets
      totalCost
      currency
      pdfs {
        sheetIndex
        filename
      }
      emailSent
      emailMessage
    }
  }
`;

const MY_VOUCHER_BATCHES = gql`
  query MyVoucherBatches($limit: Int, $offset: Int) {
    myVoucherBatches(limit: $limit, offset: $offset) {
      id
      paymentId
      totalVouchers
      totalSheets
      totalCost
      currency
      status
      createdAt
    }
  }
`;

const REGEN_BATCH = gql`
  mutation RegenerateVoucherBatch($batchId: ID!) {
    regenerateVoucherBatch(batchId: $batchId) {
      paymentId
      batchId
      totalVouchers
      totalSheets
      totalCost
      currency
      pdfs {
        sheetIndex
        filename
      }
      emailSent
      emailMessage
    }
  }
`;

// ============================================================
// USERS STATE
// ============================================================

const users = reactive({
  items: [] as any[],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  filter: {
    search: "",
    role: null as string | null,
    isActive: null as boolean | null,
  },
});

const userHeaders = [
  { title: "Name", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Role", key: "role", sortable: true },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const userRoleItems = [
  { title: "ADMIN", value: "ADMIN" },
  { title: "CREATOR", value: "CREATOR" },
  { title: "VIEWER", value: "VIEWER" },
];

const activeItems = [
  { title: "Active", value: true },
  { title: "Inactive", value: false },
];

async function loadUsers() {
  users.loading = true;
  try {
    const { data } = await apolloClient.query({
      query: LIST_USERS,
      variables: {
        input: {
          filter: {
            search: users.filter.search?.trim() || null,
            role: users.filter.role || null,
            isActive: users.filter.isActive,
          },
          limit: users.limit,
          offset: (users.page - 1) * users.limit,
          sortBy: "CREATED_AT",
          sortDir: "DESC",
        },
      },
      fetchPolicy: "network-only",
    });
    users.items = data?.users?.items ?? [];
    users.total = data?.users?.total ?? 0;
  } finally {
    users.loading = false;
  }
}

async function deleteUser(id: string) {
  await apolloClient.mutate({ mutation: ADMIN_DELETE_USER, variables: { id } });
  await loadUsers();
}

function onUsersFilterChanged() {
  users.page = 1;
  void loadUsers();
}

// ============================================================
// ARTEFACTS STATE
// ============================================================

const artefacts = reactive({
  items: [] as any[],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  filter: {
    search: "",
    category: null as ArtefactCategory | null,
    status: null as ArtefactStatus | null,
  },
});

const artefactHeaders = [
  { title: "Title", key: "title", sortable: false },
  { title: "Category", key: "category", sortable: false },
  { title: "Price", key: "price", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const CATEGORIES: ArtefactCategory[] = [
  "sculpture",
  "textile",
  "jewelry",
  "pottery",
  "painting",
  "carving",
  "beadwork",
  "metalwork",
  "other",
];

const STATUSES: ArtefactStatus[] = ["draft", "published", "archived"];

const categoryItems = computed(() =>
  CATEGORIES.map((c) => ({ title: t(`artefacts.categories.${c}`), value: c })),
);

const statusItems = computed(() =>
  STATUSES.map((s) => ({ title: s, value: s })),
);

async function loadArtefacts() {
  artefacts.loading = true;
  try {
    await artefactsStore.fetchArtefacts(
      {
        filter: {
          search: artefacts.filter.search?.trim() || null,
          category: artefacts.filter.category,
          status: artefacts.filter.status,
        },
        limit: artefacts.limit,
        offset: (artefacts.page - 1) * artefacts.limit,
      },
      { reset: true },
    );
    artefacts.items = artefactsStore.items;
    artefacts.total = artefactsStore.totalCount;
  } finally {
    artefacts.loading = false;
  }
}

async function deleteArtefact(id: string) {
  await artefactsStore.deleteArtefact(id);
  await loadArtefacts();
}

function onArtefactsFilterChanged() {
  artefacts.page = 1;
  void loadArtefacts();
}

// ============================================================
// PAYMENTS STATE
// ============================================================

const payments = reactive({
  items: [] as any[],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  filter: { status: null as string | null },
});

const paymentHeaders = [
  { title: "Payer", key: "payer", sortable: false },
  { title: "Amount", key: "amount", sortable: false },
  { title: "Channel", key: "channel", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Created", key: "createdAt", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const paymentStatusItems = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
].map((s) => ({ title: s, value: s }));

async function loadPayments() {
  payments.loading = true;
  try {
    const { data } = await apolloClient.query({
      query: LIST_MY_PAYMENTS,
      variables: {
        status: payments.filter.status,
        limit: payments.limit,
        offset: (payments.page - 1) * payments.limit,
      },
      fetchPolicy: "network-only",
    });
    const items = data?.myPayments ?? [];
    payments.items = items;
    // `myPayments` has no total — reflect the current page length as
    // a lower bound so the paginator doesn't crash.
    payments.total = Math.max(payments.total, items.length);
  } finally {
    payments.loading = false;
  }
}

function onPaymentsFilterChanged() {
  payments.page = 1;
  void loadPayments();
}

// ============================================================
// VOUCHERS STATE
// ============================================================

const vouchers = reactive({
  items: [] as any[],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
});

const voucherHeaders = [
  { title: "Batch", key: "id", sortable: false },
  { title: "Vouchers", key: "totalVouchers", sortable: false },
  { title: "Sheets", key: "totalSheets", sortable: false },
  { title: "Cost", key: "totalCost", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Created", key: "createdAt", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

async function loadVouchers() {
  vouchers.loading = true;
  try {
    const { data } = await apolloClient.query({
      query: MY_VOUCHER_BATCHES,
      variables: {
        limit: vouchers.limit,
        offset: (vouchers.page - 1) * vouchers.limit,
      },
      fetchPolicy: "network-only",
    });
    const items = data?.myVoucherBatches ?? [];
    vouchers.items = items;
    vouchers.total = Math.max(vouchers.total, items.length);
  } finally {
    vouchers.loading = false;
  }
}

async function regenerateBatch(batchId: string) {
  await apolloClient.mutate({ mutation: REGEN_BATCH, variables: { batchId } });
  await loadVouchers();
}

// ============================================================
// STATS
// ============================================================

const stats = computed(() => [
  {
    key: "users" as const,
    label: t("admin.users"),
    value: users.total,
    icon: "mdi-account-multiple",
    color: "#1B4B66",
  },
  {
    key: "artefacts" as const,
    label: t("artefacts.title"),
    value: artefacts.total,
    icon: "mdi-palette",
    color: "#3D8361",
  },
  {
    key: "payments" as const,
    label: "Payments",
    value: payments.total,
    icon: "mdi-cash-multiple",
    color: "#016FB8",
  },
  {
    key: "vouchers" as const,
    label: "Vouchers",
    value: vouchers.total,
    icon: "mdi-ticket-confirmation",
    color: "#B8860B",
  },
]);

const anyLoading = computed(
  () =>
    users.loading || artefacts.loading || payments.loading || vouchers.loading,
);

function selectTab(value: "users" | "artefacts" | "payments" | "vouchers") {
  tab.value = value;
}

function refreshAll() {
  void loadUsers();
  void loadArtefacts();
  void loadPayments();
  void loadVouchers();
}

// ============================================================
// DIALOG DISPATCH
// ============================================================

function open(key: DialogKey, payload: DialogPayload = {}) {
  dialog.open(key, payload);
}

// ============================================================
// CONFIRM DIALOG (replaces window.confirm)
// ============================================================

const confirmDialog = reactive({
  open: false,
  title: "Confirm",
  message: "",
  danger: true,
  busy: false,
  action: (() => Promise.resolve()) as () => void | Promise<void>,
});

function askConfirm(opts: {
  title: string;
  message: string;
  danger?: boolean;
  action: () => void | Promise<void>;
}) {
  confirmDialog.title = opts.title;
  confirmDialog.message = opts.message;
  confirmDialog.danger = opts.danger ?? true;
  confirmDialog.busy = false;
  confirmDialog.action = opts.action;
  confirmDialog.open = true;
}

async function runConfirmedAction() {
  if (confirmDialog.busy) return;
  confirmDialog.busy = true;
  try {
    await confirmDialog.action();
  } finally {
    confirmDialog.busy = false;
    confirmDialog.open = false;
  }
}

function confirmDeleteUser(item: any) {
  askConfirm({
    title: "Delete user?",
    message: `This will permanently remove ${item.name ?? "this user"}. Server-side data may be preserved depending on retention rules.`,
    action: () => deleteUser(item.id),
  });
}

function confirmDeleteArtefact(item: any) {
  askConfirm({
    title: "Delete artefact?",
    message: `Delete “${item.title ?? "this artefact"}” and its media? This cannot be undone.`,
    action: () => deleteArtefact(item.id),
  });
}

function confirmResetCaches() {
  askConfirm({
    title: "Reset caches?",
    message:
      "Clears all local caches and re-fetches users, artefacts, payments and vouchers. Server data is untouched.",
    danger: false,
    action: resetAllCaches,
  });
}

// ============================================================
// LAUNCH CAMPAIGN FLOW
// ============================================================

const launchFlow = reactive({
  open: false,
  step: "details" as "details" | "poster",
  campaignId: null as string | null,
  campaign: null as Record<string, unknown> | null,
  status: "active" as "active" | "queued",
  queuePosition: null as number | null,
  toast: {
    show: false,
    message: "",
    color: "success" as "success" | "info" | "error" | "warning",
  },
});

function openLaunchFlow() {
  launchFlow.open = true;
  launchFlow.step = "details";
  launchFlow.campaignId = null;
  launchFlow.campaign = null;
}

function closeLaunchFlow() {
  launchFlow.open = false;
  launchFlow.step = "details";
  launchFlow.campaignId = null;
  launchFlow.campaign = null;
}

function onCampaignCreated(payload: {
  campaignId: string;
  campaign: Record<string, unknown>;
  status: "active" | "queued";
  queuePosition: number | null;
}) {
  launchFlow.campaignId = payload.campaignId;
  launchFlow.campaign = payload.campaign;
  launchFlow.status = payload.status;
  launchFlow.queuePosition = payload.queuePosition;
  launchFlow.step = "poster";

  launchFlow.toast.message =
    payload.status === "active"
      ? "Campaign created — now upload a poster."
      : `Campaign queued at #${payload.queuePosition ?? "?"} — now upload a poster.`;
  launchFlow.toast.color = payload.status === "active" ? "success" : "info";
  launchFlow.toast.show = true;
}

function onPosterUploaded(payload: { fileUrl: string; campaignId: string }) {
  const saved = !!payload.fileUrl;

  closeLaunchFlow();

  launchFlow.toast.message = saved
    ? "Campaign and poster saved."
    : "Campaign saved (no poster).";
  launchFlow.toast.color = saved ? "success" : "warning";
  launchFlow.toast.show = true;

  refreshAll();
}

function onPosterSkipped() {
  closeLaunchFlow();
  launchFlow.toast.message = "Campaign created without a poster.";
  launchFlow.toast.color = "warning";
  launchFlow.toast.show = true;
  refreshAll();
}

// ============================================================
// SMALL HELPERS
// ============================================================

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function roleColor(role: string) {
  return role === "ADMIN"
    ? "#1B4B66"
    : role === "CREATOR"
      ? "#3D8361"
      : "#7E57C2";
}

function roleIcon(role: string) {
  return role === "ADMIN"
    ? "mdi-shield-account"
    : role === "CREATOR"
      ? "mdi-pencil"
      : "mdi-eye";
}

function artefactStatusColor(s: ArtefactStatus) {
  return s === "published"
    ? "#3D8361"
    : s === "archived"
      ? "#B8860B"
      : "#1B4B66";
}

function artefactStatusIcon(s: ArtefactStatus) {
  return s === "published"
    ? "mdi-check-circle-outline"
    : s === "archived"
      ? "mdi-archive-outline"
      : "mdi-pencil-circle-outline";
}

function paymentStatusColor(s: string) {
  if (s === "paid") return "#3D8361";
  if (s === "failed" || s === "cancelled") return "error";
  if (s === "refunded" || s === "partially_refunded") return "#B8860B";
  return "#1B4B66";
}

function paymentStatusIcon(s: string) {
  if (s === "paid") return "mdi-check-circle-outline";
  if (s === "failed" || s === "cancelled") return "mdi-close-circle-outline";
  if (s === "refunded" || s === "partially_refunded") return "mdi-cash-refund";
  return "mdi-clock-outline";
}

// ============================================================
// DEBOUNCERS
// ============================================================

let usersTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedUsersLoad() {
  if (usersTimer) clearTimeout(usersTimer);
  usersTimer = setTimeout(() => {
    users.page = 1;
    void loadUsers();
  }, 300);
}

let artefactsTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedArtefactsLoad() {
  if (artefactsTimer) clearTimeout(artefactsTimer);
  artefactsTimer = setTimeout(() => {
    artefacts.page = 1;
    void loadArtefacts();
  }, 300);
}

// ============================================================
// RESET
// ============================================================

function resetAllCaches() {
  artefactsStore.reset();
  refreshAll();
}

// ============================================================
// MOUNT
// ============================================================

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 12px;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 4;
  padding: 12px 0;
  background: rgba(var(--v-theme-surface), 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(27, 75, 102, 0.08);
}

.min-width-0 {
  min-width: 0;
}

.stat-card {
  border-color: rgba(27, 75, 102, 0.12) !important;
}

.stat-card--clickable {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.stat-card--clickable:hover,
.stat-card--clickable:focus-visible {
  border-color: rgba(27, 75, 102, 0.35) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(27, 75, 102, 0.08);
  outline: none;
}

.tab-search {
  min-width: 200px;
}
.tab-select {
  min-width: 130px;
  max-width: 200px;
}

.admin-table {
  border: 1px solid rgba(27, 75, 102, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.admin-table :deep(.v-data-table__th) {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: rgba(27, 75, 102, 0.7);
  background: rgba(27, 75, 102, 0.03);
  font-weight: 600;
}

.admin-table :deep(.v-data-table__tr:hover) {
  background: rgba(27, 75, 102, 0.03);
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  opacity: 0.85;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.danger-zone {
  border-color: rgba(211, 47, 47, 0.35) !important;
  background: rgba(211, 47, 47, 0.04) !important;
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 600px) {
  .admin-dashboard {
    padding: 0 8px;
  }

  .admin-header {
    gap: 8px !important;
  }

  .stat-card {
    padding: 8px !important;
  }

  /* Tables scroll horizontally; first column stays put. */
  .admin-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .admin-table :deep(.v-data-table__th),
  .admin-table :deep(.v-data-table__td) {
    font-size: 0.8rem;
    padding-inline: 8px;
  }
  .admin-table :deep(.v-data-table__th:first-child),
  .admin-table :deep(.v-data-table__td:first-child) {
    position: sticky;
    left: 0;
    z-index: 1;
    background: rgb(var(--v-theme-surface));
  }
  .admin-table :deep(.v-data-table__th:first-child) {
    background: rgba(27, 75, 102, 0.06);
  }

  .tab-search,
  .tab-select {
    min-width: 0;
    max-width: none;
    width: 100%;
  }
}
</style>
