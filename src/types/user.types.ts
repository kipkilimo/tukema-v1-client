// stores/user/types.ts
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  VIEWER = "VIEWER",
  OWNER = "OWNER",
  UNIT_LEAD = "UNIT_LEAD",
  MEMBER = "MEMBER",
}

export enum PlanType {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
  ENTERPRISE = "ENTERPRISE",
  STARTER = "STARTER",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  TRIAL = "TRIAL",
  PAST_DUE = "PAST_DUE",
}

export interface PlanFeature {
  name: string;
  enabled: boolean;
  limit?: number;
  description?: string;
}

export interface PlanLimits {
  maxSurveys: number;
  maxResponses: number;
  maxFileSizeMB: number;
  maxTeamMembers: number;
  maxAPIRequestsPerDay?: number;
  allowKoboDeployment: boolean;
  allowAPIExport: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  advancedAnalytics: boolean;
  webhookSupport: boolean;
}

export interface OrganizationMembership {
  organization: {
    id: string;
    name: string;
    shortName?: string;
    description?: string;
    logo?: string;
    website?: string;
    email?: string;
    phone?: string;
    country?: string;
    address?: string;
    status: string;
  };
  role: UserRole;
  joinedAt: string;
  active: boolean;
}

export interface MinimalUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  planExpiry?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullUser extends MinimalUser {
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    shortName?: string;
  };
  organizations: Array<{
    id: string;
    name: string;
    shortName?: string;
  }>;
  surveys: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  features: PlanFeature[];
  organizationMemberships: OrganizationMembership[];
  payments?: Array<{ id: string }>;
  currentPayment?: { id: string };
  invoices?: Array<{ id: string }>;
  inquiries?: Array<{ id: string }>;
}

export type User = MinimalUser | FullUser;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  organizationName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOTPLoginInput {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: MinimalUser;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
  message?: string;
}

export interface OTPSendResult {
  success: boolean;
  message: string;
  expiresAt?: string;
}

export interface ForgotPasswordPayload {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordPayload {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: FullUser;
}

export interface UpdateProfileInput {
  name?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
  timezone?: string;
  language?: string;
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: FullUser;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export interface IsAuthenticatedResponse {
  authenticated: boolean;
  user: FullUser | null;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  requiresVerification: boolean;
  requiresMFA: boolean;
  cooldownActive: boolean;
  cooldownSeconds: number;
  mfaToken: string | null;
}
