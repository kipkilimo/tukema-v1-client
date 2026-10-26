<template>
  <!-- Loading: user not yet fetched -->
  <div v-if="!userLoaded" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="#1B4B66" size="48" />
  </div>

  <!-- Unauthenticated: no user object -->
  <v-alert
    v-else-if="!user"
    type="warning"
    variant="tonal"
    class="ma-4"
    prominent
  >
    <div class="d-flex align-center ga-3 flex-wrap">
      <v-icon size="32">mdi-account-alert-outline</v-icon>

      <div>
        <div class="font-weight-bold">Not signed in</div>
        <div class="text-body-2">Please sign in to view your dashboard.</div>
      </div>

      <v-spacer />

      <v-btn color="#1B4B66" variant="flat" to="auth/login"> Sign in </v-btn>
    </div>
  </v-alert>

  <!-- Role-based dashboard -->
  <component v-else-if="dashboard" :is="dashboard" />

  <!-- Should never hit now that Viewer is the fallback -->
  <v-alert v-else type="error" variant="tonal" class="ma-4">
    <div class="font-weight-bold">Dashboard unavailable</div>
    <div class="text-body-2">
      Your account does not have a recognised dashboard role. Please contact an
      administrator.
    </div>
    <v-btn color="#1B4B66" variant="flat" to="/welcome"> Home </v-btn>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/users";

import AdminDashboard from "@/components/dashboard/views/AdminDashboard.vue";
import CreatorDashboard from "@/components/dashboard/views/CreatorDashboard.vue";
import ViewerDashboard from "@/components/dashboard/views/ViewerDashboard.vue";

const userStore = useUserStore();

const user = computed(() => userStore.user);

const userLoaded = computed(() => {
  const store = userStore as unknown as {
    loaded?: boolean;
    initialized?: boolean;
    fetching?: boolean;
  };
  if (typeof store.loaded === "boolean") return store.loaded;
  if (typeof store.initialized === "boolean") return store.initialized;
  if (typeof store.fetching === "boolean") return !store.fetching;
  return true;
});

/**
 * Route by role. `ADMIN` and `CREATOR` have their own dashboards;
 * every other signed-in role (USER, VIEWER, undefined-but-signed-in)
 * falls back to the Viewer dashboard.
 */
const dashboard = computed(() => {
  switch (user.value?.role) {
    case "ADMIN":
      return AdminDashboard;
    case "CREATOR":
      return CreatorDashboard;
    case "USER":
    case "VIEWER":
      return ViewerDashboard;
    default:
      // Signed in with no role → still show the viewer experience.
      return user.value ? ViewerDashboard : null;
  }
});
</script>
