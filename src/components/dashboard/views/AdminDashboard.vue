<template>
  <div class="admin-dashboard">
    <!-- ===================== HEADER ===================== -->
    <div class="d-flex align-center flex-wrap ga-3 mb-6">
      <v-avatar color="#1B4B66" size="48" rounded="lg">
        <v-icon color="white">mdi-shield-account</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <h1 class="text-h5 font-weight-bold mb-1">
          {{ t("admin.title") }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ user?.name }} · {{ user?.email }} · {{ user?.role }}
        </p>
      </div>
      <v-chip
        color="#3D8361"
        variant="tonal"
        prepend-icon="mdi-check-circle-outline"
        size="small"
      >
        {{ t("common.success") }}
      </v-chip>
    </div>

    <!-- ===================== STATS ROW ===================== -->
    <v-row dense class="mb-4">
      <v-col v-for="stat in stats" :key="stat.key" cols="6" sm="3">
        <v-card variant="outlined" rounded="lg" class="pa-3 stat-card">
          <div class="d-flex align-center ga-2">
            <v-avatar :color="stat.color" size="34" rounded="lg">
              <v-icon color="white" size="18">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">
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

      <v-window v-model="tab" class="pa-3">
        <!-- =====================================================
             USERS
             ===================================================== -->
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
              class="flex-grow-1"
              style="min-width: 200px"
              @update:model-value="debouncedUsersLoad"
            />
            <v-select
              v-model="users.filter.role"
              :items="userRoleItems"
              :label="'Role'"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 160px"
              @update:model-value="loadUsers"
            />
            <v-select
              v-model="users.filter.isActive"
              :items="activeItems"
              label="Active"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 130px"
              @update:model-value="loadUsers"
            />
            <v-btn
              color="#1B4B66"
              variant="flat"
              prepend-icon="mdi-account-plus"
              class="text-none"
              @click="open('user:create')"
            >
              {{ t("admin.users") }}
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
            @update:options="loadUsers"
          >
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
                      @click="
                        confirmAction('Delete user?', () => deleteUser(item.id))
                      "
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- =====================================================
             ARTEFACTS
             ===================================================== -->
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
              class="flex-grow-1"
              style="min-width: 200px"
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
              style="min-width: 160px"
              @update:model-value="loadArtefacts"
            />
            <v-select
              v-model="artefacts.filter.status"
              :items="statusItems"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 130px"
              @update:model-value="loadArtefacts"
            />
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
            <template #[`item.title`]="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" rounded="lg" :color="'#F1F3F5'">
                  <v-img
                    v-if="item.mediaUrls?.[0]"
                    :src="item.mediaUrls[0]"
                    cover
                  />
                  <v-icon v-else size="16" color="#B0BEC5">mdi-palette</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.title }}</div>
                  <div class="text-caption text-medium-emphasis">
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
                  location="top"
                  text="Publish"
                  v-if="item.status !== 'published'"
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
                  location="top"
                  text="Archive"
                  v-if="item.status !== 'archived'"
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
                      @click="
                        confirmAction('Delete artefact?', () =>
                          deleteArtefact(item.id),
                        )
                      "
                    />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table-server>
        </v-window-item>

        <!-- =====================================================
             PAYMENTS
             ===================================================== -->
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
              style="min-width: 160px"
              @update:model-value="loadPayments"
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
              <div>
                <div class="font-weight-medium">{{ item.payer?.name }}</div>
                <div class="text-caption text-medium-emphasis">
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

        <!-- =====================================================
             VOUCHERS
             ===================================================== -->
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
          @click="confirmAction('Reset all admin caches?', resetAllCaches)"
        >
          Reset caches
        </v-btn>
      </div>
    </v-sheet>
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

// ===================== SETUP =====================
const { t } = useI18n();
const userStore = useUserStore();
const dialog = useDialogStore();
const artefactsStore = useArtefactsStore();

const user = computed(() => userStore.user);
const tab = ref<"users" | "artefacts" | "payments" | "vouchers">("users");

// ===================== GRAPHQL =====================
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

// ===================== STATS =====================
const stats = computed(() => [
  {
    key: "users",
    label: t("admin.users"),
    value: users.total,
    icon: "mdi-account-multiple",
    color: "#1B4B66",
  },
  {
    key: "artefacts",
    label: t("artefacts.title"),
    value: artefacts.total,
    icon: "mdi-palette",
    color: "#3D8361",
  },
  {
    key: "payments",
    label: "Payments",
    value: payments.total,
    icon: "mdi-cash-multiple",
    color: "#016FB8",
  },
  {
    key: "vouchers",
    label: "Vouchers",
    value: vouchers.total,
    icon: "mdi-ticket-confirmation",
    color: "#B8860B",
  },
]);

// ===================== USERS STATE =====================
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

// ===================== ARTEFACTS STATE =====================
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

// ===================== PAYMENTS STATE =====================
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
    payments.items = data?.myPayments ?? [];
    payments.total = payments.items.length;
  } finally {
    payments.loading = false;
  }
}

// ===================== VOUCHERS STATE =====================
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
    vouchers.items = data?.myVoucherBatches ?? [];
    vouchers.total = vouchers.items.length;
  } finally {
    vouchers.loading = false;
  }
}

async function regenerateBatch(batchId: string) {
  await apolloClient.mutate({ mutation: REGEN_BATCH, variables: { batchId } });
  await loadVouchers();
}

// ===================== DIALOG DISPATCH =====================
function open(key: DialogKey, payload: DialogPayload = {}) {
  dialog.open(key, payload);
}

// ===================== SMALL HELPERS =====================
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

function confirmAction(message: string, action: () => void | Promise<void>) {
  if (window.confirm(message)) void action();
}

// ===================== DEBOUNCERS =====================
let usersTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedUsersLoad() {
  if (usersTimer) clearTimeout(usersTimer);
  usersTimer = setTimeout(loadUsers, 300);
}

let artefactsTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedArtefactsLoad() {
  if (artefactsTimer) clearTimeout(artefactsTimer);
  artefactsTimer = setTimeout(loadArtefacts, 300);
}

// ===================== RESET =====================
function resetAllCaches() {
  artefactsStore.reset();
  void loadUsers();
  void loadArtefacts();
  void loadPayments();
  void loadVouchers();
}

// ===================== MOUNT =====================
onMounted(() => {
  void loadUsers();
  void loadArtefacts();
  void loadPayments();
  void loadVouchers();
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1500px;
  margin: 0 auto;
}

.stat-card {
  border-color: rgba(27, 75, 102, 0.12) !important;
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

.danger-zone {
  border-color: rgba(211, 47, 47, 0.35) !important;
  background: rgba(211, 47, 47, 0.04) !important;
}
</style>
