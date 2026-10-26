// client/src/stores/userStore.ts
import { defineStore } from "pinia";
import { gql } from "graphql-tag";
import {
  apolloClient,
  setTokens,
  removeTokens,
  getAccessToken,
  getUser as getStoredUser,
  setUser as setStoredUser,
  isTokenValid,
  isTokenExpired,
  clearAuthAndReset,
} from "@/graphql/apolloClient";

// ============================================
// TYPES — aligned 1:1 with GraphQL schema
// ============================================

export type UserRole = "ADMIN" | "CREATOR" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  expiresAt: string;
}

export interface UserConnection {
  items: User[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UserFilterInput {
  role?: UserRole | null;
  isActive?: boolean | null;
  search?: string | null;
}

export type UserSortField =
  | "NAME"
  | "EMAIL"
  | "ROLE"
  | "CREATED_AT"
  | "UPDATED_AT";

export type SortDirection = "ASC" | "DESC";

export interface ListUsersInput {
  filter?: UserFilterInput | null;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
  limit?: number;
  offset?: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name?: string | null;
  email?: string | null;
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface AdminUpdateUserInput {
  name?: string | null;
  email?: string | null;
  role?: UserRole | null;
  isActive?: boolean | null;
}

// ============================================
// GRAPHQL DOCUMENTS
// ============================================

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    role
    isActive
    createdAt
    updatedAt
  }
`;

const AUTH_PAYLOAD_FIELDS = gql`
  ${USER_FIELDS}
  fragment AuthPayloadFields on AuthPayload {
    user { ...UserFields }
    accessToken
    expiresAt
  }
`;

const LOGIN = gql`
  ${AUTH_PAYLOAD_FIELDS}
  mutation Login($input: LoginInput!) {
    login(input: $input) { ...AuthPayloadFields }
  }
`;

const REGISTER = gql`
  ${AUTH_PAYLOAD_FIELDS}
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) { ...AuthPayloadFields }
  }
`;

const LOGOUT = gql`
  mutation Logout { logout }
`;

const ME = gql`
  ${USER_FIELDS}
  query Me { me { ...UserFields } }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

const UPDATE_PROFILE = gql`
  ${USER_FIELDS}
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) { ...UserFields }
  }
`;

const ADMIN_USER = gql`
  ${USER_FIELDS}
  query AdminUser($id: ID!) { user(id: $id) { ...UserFields } }
`;

const ADMIN_USER_BY_EMAIL = gql`
  ${USER_FIELDS}
  query AdminUserByEmail($email: String!) {
    userByEmail(email: $email) { ...UserFields }
  }
`;

const ADMIN_USERS = gql`
  ${USER_FIELDS}
  query AdminUsers($input: ListUsersInput) {
    users(input: $input) {
      items { ...UserFields }
      total
      limit
      offset
      hasMore
    }
  }
`;

const ADMIN_CREATE_USER = gql`
  ${USER_FIELDS}
  mutation AdminCreateUser($input: AdminCreateUserInput!) {
    adminCreateUser(input: $input) { ...UserFields }
  }
`;

const ADMIN_UPDATE_USER = gql`
  ${USER_FIELDS}
  mutation AdminUpdateUser($id: ID!, $input: AdminUpdateUserInput!) {
    adminUpdateUser(id: $id, input: $input) { ...UserFields }
  }
`;

const ADMIN_DEACTIVATE_USER = gql`
  ${USER_FIELDS}
  mutation AdminDeactivateUser($id: ID!) {
    adminDeactivateUser(id: $id) { ...UserFields }
  }
`;

const ADMIN_REACTIVATE_USER = gql`
  ${USER_FIELDS}
  mutation AdminReactivateUser($id: ID!) {
    adminReactivateUser(id: $id) { ...UserFields }
  }
`;

const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($id: ID!) { adminDeleteUser(id: $id) }
`;

// ============================================
// STORE
// ============================================

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
    tokenExpiry: null as Date | null,
    loading: false as boolean,
    initialised: false as boolean,
    error: null as string | null,

    // Admin list state
    users: [] as User[],
    usersTotal: 0,
    usersLimit: 20,
    usersOffset: 0,
    usersHasMore: false,
  }),

  getters: {
    isAuthenticated: (s): boolean =>
      !!s.user &&
      !!getAccessToken() &&
      isTokenValid(getAccessToken()) &&
      !isTokenExpired(),

    isAdmin: (s): boolean => s.user?.role === "ADMIN",
    isCreator: (s): boolean => s.user?.role === "CREATOR",
    isViewer: (s): boolean => s.user?.role === "VIEWER",
    isActive: (s): boolean => !!s.user?.isActive,

    /** Seconds until access token expires — 0 if expired or missing. */
    secondsRemaining(): number {
      const expiry = this.tokenExpiry;
      if (!expiry) return 0;
      return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
    },
  },

  actions: {
    // ============================================
    // Helpers
    // ============================================

    _setAuth(payload: AuthPayload) {
      setTokens({
        accessToken: payload.accessToken,
        expiresAt: payload.expiresAt,
        user: payload.user,
      });
      this.user = payload.user;
      this.tokenExpiry = new Date(payload.expiresAt);
      this.error = null;
    },

    _clearAuth() {
      removeTokens();
      this.user = null;
      this.tokenExpiry = null;
      this.users = [];
      this.usersTotal = 0;
      this.usersOffset = 0;
      this.usersHasMore = false;
    },

    _toError(err: unknown): string {
      const anyErr = err as any;
      const gqlMessage =
        anyErr?.graphQLErrors?.[0]?.message ||
        anyErr?.networkError?.message ||
        anyErr?.message;
      return typeof gqlMessage === "string" ? gqlMessage : "Unknown error";
    },

    // ============================================
    // Bootstrapping — hydrate from storage + validate
    // ============================================

    async init() {
      if (this.initialised) return;
      this.initialised = true;

      const storedUser = getStoredUser() as User | null;
      if (storedUser && getAccessToken() && isTokenValid(getAccessToken())) {
        this.user = storedUser;
        const raw = localStorage.getItem("tokenExpiry");
        this.tokenExpiry = raw ? new Date(raw) : null;

        // Refresh from server so role / isActive reflect backend state.
        try {
          await this.fetchMe();
        } catch {
          this._clearAuth();
        }
      } else {
        this._clearAuth();
      }
    },

    // ============================================
    // Auth mutations
    // ============================================

    async login(input: LoginInput): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { login: AuthPayload },
          { input: LoginInput }
        >({ mutation: LOGIN, variables: { input }, fetchPolicy: "no-cache" });

        if (!data?.login) throw new Error("Login failed");
        this._setAuth(data.login);
        await apolloClient.resetStore().catch(() => undefined);
        return data.login.user;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(input: RegisterInput): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { register: AuthPayload },
          { input: RegisterInput }
        >({ mutation: REGISTER, variables: { input }, fetchPolicy: "no-cache" });

        if (!data?.register) throw new Error("Registration failed");
        this._setAuth(data.register);
        await apolloClient.resetStore().catch(() => undefined);
        return data.register.user;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        if (this.isAuthenticated) {
          await apolloClient
            .mutate({ mutation: LOGOUT, fetchPolicy: "no-cache" })
            .catch(() => undefined);
        }
      } finally {
        this._clearAuth();
        await apolloClient.clearStore().catch(() => undefined);
        this.loading = false;
      }
    },

    // ============================================
    // Self queries / mutations
    // ============================================

    async fetchMe(): Promise<User | null> {
      if (!getAccessToken()) return null;
      this.loading = true;
      try {
        const { data } = await apolloClient.query<
          { me: User },
          Record<string, never>
        >({ query: ME, fetchPolicy: "network-only" });

        if (data?.me) {
          this.user = data.me;
          setStoredUser(data.me);
        }
        return data?.me ?? null;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async changePassword(input: ChangePasswordInput): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { changePassword: boolean },
          { input: ChangePasswordInput }
        >({ mutation: CHANGE_PASSWORD, variables: { input } });

        return data?.changePassword === true;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(input: UpdateProfileInput): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { updateProfile: User },
          { input: UpdateProfileInput }
        >({ mutation: UPDATE_PROFILE, variables: { input } });

        if (!data?.updateProfile) throw new Error("Update failed");
        this.user = data.updateProfile;
        setStoredUser(data.updateProfile);
        return data.updateProfile;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // Admin — single user
    // ============================================

    async fetchUser(id: string): Promise<User | null> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query<
          { user: User | null },
          { id: string }
        >({ query: ADMIN_USER, variables: { id }, fetchPolicy: "network-only" });
        return data?.user ?? null;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserByEmail(email: string): Promise<User | null> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query<
          { userByEmail: User | null },
          { email: string }
        >({
          query: ADMIN_USER_BY_EMAIL,
          variables: { email },
          fetchPolicy: "network-only",
        });
        return data?.userByEmail ?? null;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // Admin — list
    // ============================================

    async fetchUsers(input: ListUsersInput = {}): Promise<UserConnection> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.query<
          { users: UserConnection },
          { input: ListUsersInput }
        >({
          query: ADMIN_USERS,
          variables: { input },
          fetchPolicy: "network-only",
        });

        const conn = data?.users ?? {
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false,
        };

        this.users = conn.items;
        this.usersTotal = conn.total;
        this.usersLimit = conn.limit;
        this.usersOffset = conn.offset;
        this.usersHasMore = conn.hasMore;

        return conn;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // Admin — create / update / lifecycle
    // ============================================

    async adminCreateUser(input: AdminCreateUserInput): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { adminCreateUser: User },
          { input: AdminCreateUserInput }
        >({ mutation: ADMIN_CREATE_USER, variables: { input } });

        if (!data?.adminCreateUser) throw new Error("Create failed");
        return data.adminCreateUser;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async adminUpdateUser(
      id: string,
      input: AdminUpdateUserInput,
    ): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { adminUpdateUser: User },
          { id: string; input: AdminUpdateUserInput }
        >({ mutation: ADMIN_UPDATE_USER, variables: { id, input } });

        if (!data?.adminUpdateUser) throw new Error("Update failed");

        // Patch the list if this user is in it.
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx >= 0) this.users.splice(idx, 1, data.adminUpdateUser);

        // Patch self if the admin updated themselves.
        if (this.user?.id === id) {
          this.user = data.adminUpdateUser;
          setStoredUser(data.adminUpdateUser);
        }
        return data.adminUpdateUser;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async adminDeactivateUser(id: string): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { adminDeactivateUser: User },
          { id: string }
        >({ mutation: ADMIN_DEACTIVATE_USER, variables: { id } });

        if (!data?.adminDeactivateUser) throw new Error("Deactivate failed");
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx >= 0) this.users.splice(idx, 1, data.adminDeactivateUser);
        return data.adminDeactivateUser;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async adminReactivateUser(id: string): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { adminReactivateUser: User },
          { id: string }
        >({ mutation: ADMIN_REACTIVATE_USER, variables: { id } });

        if (!data?.adminReactivateUser) throw new Error("Reactivate failed");
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx >= 0) this.users.splice(idx, 1, data.adminReactivateUser);
        return data.adminReactivateUser;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async adminDeleteUser(id: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apolloClient.mutate<
          { adminDeleteUser: boolean },
          { id: string }
        >({ mutation: ADMIN_DELETE_USER, variables: { id } });

        if (data?.adminDeleteUser) {
          this.users = this.users.filter((u) => u.id !== id);
          this.usersTotal = Math.max(0, this.usersTotal - 1);
        }
        return data?.adminDeleteUser === true;
      } catch (err) {
        this.error = this._toError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // Force-logout (called by errorLink or router)
    // ============================================

    async forceLogout() {
      this._clearAuth();
      await clearAuthAndReset().catch(() => undefined);
    },
  },
});