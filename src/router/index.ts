import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("@/pages/auth/login.vue"),
        meta: { requiresGuest: true },
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/pages/auth/register.vue"),
        meta: { requiresGuest: true },
      },
      // {
      //   path: "verify-otp",
      //   name: "VerifyOTP",
      //   component: () => import("@/pages/auth/verify.vue"),
      //   meta: { requiresGuest: true },
      // },
      // {
      //   path: "forgot-password",
      //   name: "ForgotPassword",
      //   component: () => import("@/pages/auth/forgot.vue"),
      //   meta: { requiresGuest: true },
      // },
    ],
  },

  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("@/pages/welcome/index.vue"),
    meta: { requiresGuest: true, title: "Welcome" },
  },

  // ✅ Parent has no name; empty-path child carries the "Dashboard" name.
  // Any future sub-routes (settings, profile, etc.) go inside `children`.
{
  path: "/dashboard",
  component: () => import("@/layouts/DashboardLayout.vue"),
  meta: {
    requiresAuth: true,
    title: "Dashboard",
  },
  children: [
    {
      path: "",
      name: "Dashboard",
      component: () => import("@/pages/dashboard/index.vue"),
      meta: {
        title: "Dashboard",
      },
    },
  ],
},

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/not-found/index.vue"),
    meta: { title: "Page Not Found" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

// ------------------------------------------------------------
// USER STORE (memoized, matches actual file path)
// ------------------------------------------------------------
let userStorePromise: Promise<{ isAuthenticated?: boolean }> | null = null;

async function getUserStore(): Promise<{ isAuthenticated?: boolean }> {
  if (!userStorePromise) {
    // ⚠️ Ensure this path matches your actual store file name
    userStorePromise = import("@/stores/users")
      .then(({ useUserStore }) => useUserStore())
      .catch((error) => {
        // Reset so a transient import failure doesn't permanently break auth.
        userStorePromise = null;
        throw error;
      });
  }
  return userStorePromise;
}

// ------------------------------------------------------------
// NAVIGATION GUARD
// ------------------------------------------------------------
router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth === true);
  const requiresGuest = to.matched.some((r) => r.meta.requiresGuest === true);

  if (!requiresAuth && !requiresGuest) return true;

  let isAuthenticated = false;
  try {
    const userStore = await getUserStore();
    isAuthenticated = Boolean(userStore.isAuthenticated);
  } catch (error) {
    console.error("[Router] User store check failed:", error);
  }

  if (requiresAuth && !isAuthenticated) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
      replace: true,
    };
  }

  if (requiresGuest && isAuthenticated) {
    return { name: "Dashboard", replace: true };
  }

  return true;
});

// ------------------------------------------------------------
// PAGE TITLE
// ------------------------------------------------------------
router.afterEach((to, _from, failure) => {
  if (failure) return;
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} | tukema` : "tukema Cultural Museum";
});

// ------------------------------------------------------------
// ERROR HANDLING
// ------------------------------------------------------------
router.onError((error, to) => {
  console.error(`[Router] Navigation failed: ${to.fullPath}`, error);
});

export default router;