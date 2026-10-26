// server/src/shared/constants/plans.ts

import {
  PlanType,
  BillingPeriod,
  PaymentMethod,
  SubscriptionStatus,
  QuestionType,
  AICreditTransactionType,
  OverageType,
} from "../types/enums";

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type PrioritySupport = "email" | "priority" | "dedicated";
export type PlanKey = "starter" | "enterprise" | "custom";

export interface FairUsagePolicy {
  maxSurveysPerMonth: number; // -1 = unlimited
  maxResponsesPerMonth: number; // -1 = unlimited
  maxAIRequestsPerMonth: number; // -1 = unlimited
  overageCostPerSurvey: number; // USD per additional survey upload
  overageCostPerResponse: number; // USD per additional response (per 1000)
  overageCostPerAIRequest: number; // USD per additional AI request
  overageCostPerGB: number; // USD per additional GB
  notificationThreshold: number; // percentage before reaching limit
  autoUpgradeAvailable: boolean;
  aiCreditCost?: number; // Cost per AI credit in USD
  includedAICredits?: number; // Number of AI credits included
}

export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  price: string;
  pricePeriod?: string;
  cta: string;
  popular?: boolean;
  color: string;
  featureLabel?: string;
  limits: string[];
  features: string[];
  // Subscription specific fields
  billingPeriod: BillingPeriod;
  maxSurveys: number; // -1 = unlimited
  maxResponses: number; // -1 = unlimited
  maxTeamMembers: number; // -1 = unlimited
  maxStorageGB: number; // -1 = unlimited
  maxAPIRequestsPerDay: number; // -1 = unlimited
  maxAIRequestsPerMonth: number; // -1 = unlimited
  prioritySupport: PrioritySupport;
  fairUsagePolicy: FairUsagePolicy;
  // Custom plan fields
  isCustom?: boolean;
  basePrice?: number;
  customFeaturePricing?: CustomFeaturePricing[];
}

export interface CustomFeaturePricing {
  id: string;
  name: string;
  description: string;
  price: number; // Annual price in USD
  category: "limits" | "features" | "addons";
  selected?: boolean;
  popular?: boolean;
}

// ============================================================
// ENVIRONMENT HELPERS - UPDATED FOR VITE
// ============================================================

/**
 * Get environment variable with fallback
 * Supports Vite (import.meta.env) and Node.js (process.env)
 */
const getEnvVar = (key: string, fallback: string = ""): string => {
  // Check for Vite environment variables (import.meta.env)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const viteKey = key.startsWith("VITE_") ? key : `VITE_${key}`;
    const value = import.meta.env[viteKey];
    if (value !== undefined && value !== "") {
      return String(value);
    }
  }

  // Check for Node.js environment variables
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value !== undefined && value !== "") {
      return String(value);
    }
  }

  return fallback;
};

/**
 * Get numeric environment variable with fallback
 */
const getEnvNumber = (key: string, fallback: number): number => {
  const value = getEnvVar(key, String(fallback));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Get boolean environment variable with fallback
 */
const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = getEnvVar(key, String(fallback));
  return value.toLowerCase() === "true" || value === "1";
};

/**
 * Get environment variable for plan pricing
 */
const getStarterPrice = (): string => {
  const rate = getEnvVar("VITE_PER_DEPLOY_RATE");
  if (rate) {
    return `$${Number(rate).toFixed(2)}`;
  }

  // Fallback to process.env for server-side
  const serverRate = getEnvVar("PER_DEPLOY_RATE");
  if (serverRate) {
    return `$${Number(serverRate).toFixed(2)}`;
  }

  return "$20";
};

const getEnterprisePrice = (): string => {
  const price = getEnvVar("VITE_ENTERPRISE_PRICING");
  if (price) {
    return `$${Number(price).toFixed(2)}`;
  }

  // Fallback to process.env for server-side
  const serverPrice = getEnvVar("ENTERPRISE_PRICING");
  if (serverPrice) {
    return `$${Number(serverPrice).toFixed(2)}`;
  }

  return "$1,950";
};

// ============================================================
// CUSTOM FEATURES FOR PLAN BUILDER
// ============================================================

export const CUSTOM_FEATURES: CustomFeaturePricing[] = [
  // Limits
  {
    id: "limit-1",
    name: "250 Active Deployments",
    description: "Run up to 250 simultaneous survey deployments",
    price: 3000,
    category: "limits",
  },
  {
    id: "limit-2",
    name: "500 Active Deployments",
    description: "Run up to 500 simultaneous survey deployments",
    price: 8000,
    category: "limits",
  },
  {
    id: "limit-3",
    name: "5M Submissions/Year",
    description: "Collect up to 5,000,000 survey responses annually",
    price: 8000,
    category: "limits",
  },
  {
    id: "limit-4",
    name: "10M Submissions/Year",
    description: "Collect up to 10,000,000 survey responses annually",
    price: 15000,
    category: "limits",
  },
  {
    id: "limit-5",
    name: "2 TB Storage",
    description: "Store up to 2 TB of survey data",
    price: 4000,
    category: "limits",
  },
  {
    id: "limit-6",
    name: "5 TB Storage",
    description: "Store up to 5 TB of survey data",
    price: 8000,
    category: "limits",
  },
  // Features
  {
    id: "feature-1",
    name: "Advanced AI Analytics",
    description: "Custom AI models and predictive analytics",
    price: 8000,
    category: "features",
    popular: true,
  },
  {
    id: "feature-2",
    name: "Real-time Data Streaming",
    description: "Live data streaming and real-time dashboards",
    price: 5000,
    category: "features",
  },
  {
    id: "feature-3",
    name: "Advanced Security & Compliance",
    description: "SOC2, HIPAA, GDPR compliance features",
    price: 6000,
    category: "features",
  },
  {
    id: "feature-4",
    name: "Custom Report Builder",
    description: "Build custom branded reports and dashboards",
    price: 4000,
    category: "features",
  },
  {
    id: "feature-5",
    name: "Advanced Workflow Automation",
    description: "Automated survey workflows and triggers",
    price: 5000,
    category: "features",
  },
  {
    id: "feature-6",
    name: "Multi-language Support",
    description: "Support for 50+ languages in surveys",
    price: 3000,
    category: "features",
  },
  // Add-ons
  {
    id: "addon-1",
    name: "White-Label Platform",
    description: "Complete branding removal and custom domain",
    price: 8000,
    category: "addons",
  },
  {
    id: "addon-2",
    name: "Dedicated Infrastructure",
    description: "Dedicated servers and infrastructure",
    price: 12000,
    category: "addons",
  },
  {
    id: "addon-3",
    name: "Custom AI Models",
    description: "Develop custom AI models for your use case",
    price: 15000,
    category: "addons",
  },
  {
    id: "addon-4",
    name: "Implementation Support",
    description: "Dedicated implementation and onboarding team",
    price: 10000,
    category: "addons",
  },
  {
    id: "addon-5",
    name: "Multi-Country Deployments",
    description: "Support for deployments across multiple countries",
    price: 8000,
    category: "addons",
  },
  {
    id: "addon-6",
    name: "Custom SLA",
    description: "Custom Service Level Agreement with guaranteed uptime",
    price: 10000,
    category: "addons",
  },
];

// ============================================================
// PLAN DEFINITIONS
// ============================================================

export const PLANS: Record<PlanKey, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    subtitle: "Ideal for researchers, NGOs, consultants & small teams",
    icon: "mdi-rocket",
    price: getStarterPrice(),
    pricePeriod: "/survey deployment",
    cta: "Start Free Trial",
    color: "#2563eb",
    featureLabel: "Includes",
    limits: [
      "One active deployed survey",
      "10,000 submissions per deployment",
      "5 team members",
      "5 GB storage",
      "30 AI analyses/month",
    ],
    features: [
      "KoboToolbox integration",
      "Real-time synchronization",
      "Interactive dashboards",
      "Data exports (CSV, Excel, PDF)",
      "Basic GIS mapping",
      "Data quality checks",
      "Email support",
    ],
    billingPeriod: BillingPeriod.MONTHLY,
    maxSurveys: 1,
    maxResponses: 10000,
    maxTeamMembers: 5,
    maxStorageGB: 5,
    maxAPIRequestsPerDay: 1000,
    maxAIRequestsPerMonth: 30,
    prioritySupport: "email",
    fairUsagePolicy: {
      maxSurveysPerMonth: 1,
      maxResponsesPerMonth: 10000,
      maxAIRequestsPerMonth: 30,
      overageCostPerSurvey: getEnvNumber("VITE_OVERAGE_COST_PER_SURVEY", 5),
      overageCostPerResponse: getEnvNumber(
        "VITE_OVERAGE_COST_PER_RESPONSE",
        0.01,
      ),
      overageCostPerAIRequest: getEnvNumber(
        "VITE_OVERAGE_COST_PER_AI_REQUEST",
        0.35,
      ),
      overageCostPerGB: getEnvNumber("VITE_OVERAGE_COST_PER_GB", 1),
      notificationThreshold: getEnvNumber("VITE_NOTIFICATION_THRESHOLD", 80),
      autoUpgradeAvailable: getEnvBoolean("VITE_AUTO_UPGRADE_AVAILABLE", true),
      includedAICredits: getEnvNumber("VITE_INCLUDED_AI_CREDITS", 30),
      aiCreditCost: getEnvNumber("VITE_AI_CREDIT_COST", 0.35),
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Advanced analytics & governance for organizations",
    icon: "mdi-office-building",
    price: getEnterprisePrice(),
    pricePeriod: "/year (or custom term)",
    cta: "Get Started",
    popular: true,
    color: "#16a34a",
    featureLabel: "Everything in Starter, plus",
    limits: [
      "100 active deployments",
      "25,000 submissions per month",
      "Unlimited team members",
      "250 GB storage",
      "1,000 AI analyses/month",
    ],
    features: [
      "AI-powered reporting",
      "Cross-survey analytics",
      "Survey governance workflows",
      "API access",
      "Power BI & Tableau integration",
      "SSO authentication",
      "Priority support",
    ],
    billingPeriod: BillingPeriod.YEARLY,
    maxSurveys: 25,
    maxResponses: 25000,
    maxTeamMembers: -1,
    maxStorageGB: 250,
    maxAPIRequestsPerDay: 25000,
    maxAIRequestsPerMonth: 1000,
    prioritySupport: "priority",
    fairUsagePolicy: {
      maxSurveysPerMonth: 25,
      maxResponsesPerMonth: 25000,
      maxAIRequestsPerMonth: 1000,
      overageCostPerSurvey: getEnvNumber(
        "VITE_ENTERPRISE_OVERAGE_COST_PER_SURVEY",
        10,
      ),
      overageCostPerResponse: getEnvNumber(
        "VITE_ENTERPRISE_OVERAGE_COST_PER_RESPONSE",
        0.01,
      ),
      overageCostPerAIRequest: getEnvNumber(
        "VITE_ENTERPRISE_OVERAGE_COST_PER_AI_REQUEST",
        0.3,
      ),
      overageCostPerGB: getEnvNumber("VITE_ENTERPRISE_OVERAGE_COST_PER_GB", 1),
      notificationThreshold: getEnvNumber(
        "VITE_ENTERPRISE_NOTIFICATION_THRESHOLD",
        70,
      ),
      autoUpgradeAvailable: getEnvBoolean(
        "VITE_ENTERPRISE_AUTO_UPGRADE_AVAILABLE",
        true,
      ),
      includedAICredits: getEnvNumber(
        "VITE_ENTERPRISE_INCLUDED_AI_CREDITS",
        1000,
      ),
      aiCreditCost: getEnvNumber("VITE_ENTERPRISE_AI_CREDIT_COST", 0.3),
    },
  },
  custom: {
    id: "custom",
    name: "Custom",
    subtitle: "White-label & enterprise-scale deployments",
    icon: "mdi-cog",
    price: "Custom",
    cta: "Build Your Plan",
    color: "#7c3aed",
    featureLabel: "Everything in Enterprise, plus",
    limits: [
      "50+ active deployments",
      "50,000+ submissions per month",
      "Unlimited team members",
      "500+ GB storage",
      "2,500+ AI analyses/month",
    ],
    features: [
      "White-label platform",
      "Dedicated infrastructure",
      "Custom integrations",
      "Custom AI models",
      "Implementation support",
      "Multi-country deployments",
    ],
    billingPeriod: BillingPeriod.CUSTOM,
    maxSurveys: -1,
    maxResponses: -1,
    maxTeamMembers: -1,
    maxStorageGB: -1,
    maxAPIRequestsPerDay: -1,
    maxAIRequestsPerMonth: -1,
    prioritySupport: "dedicated",
    fairUsagePolicy: {
      maxSurveysPerMonth: -1,
      maxResponsesPerMonth: -1,
      maxAIRequestsPerMonth: -1,
      overageCostPerSurvey: getEnvNumber(
        "VITE_CUSTOM_OVERAGE_COST_PER_SURVEY",
        15,
      ),
      overageCostPerResponse: getEnvNumber(
        "VITE_CUSTOM_OVERAGE_COST_PER_RESPONSE",
        0.016,
      ),
      overageCostPerAIRequest: getEnvNumber(
        "VITE_CUSTOM_OVERAGE_COST_PER_AI_REQUEST",
        0.25,
      ),
      overageCostPerGB: getEnvNumber("VITE_CUSTOM_OVERAGE_COST_PER_GB", 2),
      notificationThreshold: getEnvNumber(
        "VITE_CUSTOM_NOTIFICATION_THRESHOLD",
        65,
      ),
      autoUpgradeAvailable: getEnvBoolean(
        "VITE_CUSTOM_AUTO_UPGRADE_AVAILABLE",
        false,
      ),
      includedAICredits: getEnvNumber("VITE_CUSTOM_INCLUDED_AI_CREDITS", 2500),
      aiCreditCost: getEnvNumber("VITE_CUSTOM_AI_CREDIT_COST", 0.25),
    },
    isCustom: true,
    basePrice: getEnvNumber("VITE_CUSTOM_BASE_PRICE", 2250),
    customFeaturePricing: CUSTOM_FEATURES,
  },
} as const;

// ============================================================
// RECOMMENDED USAGE PER PLAN
// ============================================================

export interface RecommendedUsage {
  planKey: PlanKey;
  monthlyPrice: number;
  annualPrice: number;
  includedAIRequests: number;
  aiCostPerRequest: number;
  aiBudgetPercent: number;
  includedResponses: number;
  includedSurveys: number;
  storageGB: number;
  teamMembers: number;
}

export const RECOMMENDED_USAGE: Record<PlanKey, RecommendedUsage> = {
  starter: {
    planKey: "starter",
    monthlyPrice: getEnvNumber("VITE_STARTER_MONTHLY_PRICE", 20),
    annualPrice: getEnvNumber("VITE_STARTER_ANNUAL_PRICE", 348),
    includedAIRequests: getEnvNumber("VITE_STARTER_INCLUDED_AI_REQUESTS", 30),
    aiCostPerRequest: getEnvNumber("VITE_STARTER_AI_COST_PER_REQUEST", 0.16),
    aiBudgetPercent: getEnvNumber("VITE_STARTER_AI_BUDGET_PERCENT", 16.5),
    includedResponses: getEnvNumber("VITE_STARTER_INCLUDED_RESPONSES", 10000),
    includedSurveys: getEnvNumber("VITE_STARTER_INCLUDED_SURVEYS", 1),
    storageGB: getEnvNumber("VITE_STARTER_STORAGE_GB", 5),
    teamMembers: getEnvNumber("VITE_STARTER_TEAM_MEMBERS", 5),
  },
  enterprise: {
    planKey: "enterprise",
    monthlyPrice: getEnvNumber("VITE_ENTERPRISE_MONTHLY_PRICE", 187.5),
    annualPrice: getEnvNumber("VITE_ENTERPRISE_ANNUAL_PRICE", 1950),
    includedAIRequests: getEnvNumber(
      "VITE_ENTERPRISE_INCLUDED_AI_REQUESTS",
      1000,
    ),
    aiCostPerRequest: getEnvNumber("VITE_ENTERPRISE_AI_COST_PER_REQUEST", 0.16),
    aiBudgetPercent: getEnvNumber("VITE_ENTERPRISE_AI_BUDGET_PERCENT", 21.3),
    includedResponses: getEnvNumber(
      "VITE_ENTERPRISE_INCLUDED_RESPONSES",
      25000,
    ),
    includedSurveys: getEnvNumber("VITE_ENTERPRISE_INCLUDED_SURVEYS", 25),
    storageGB: getEnvNumber("VITE_ENTERPRISE_STORAGE_GB", 250),
    teamMembers: getEnvNumber("VITE_ENTERPRISE_TEAM_MEMBERS", -1),
  },
  custom: {
    planKey: "custom",
    monthlyPrice: getEnvNumber("VITE_CUSTOM_MONTHLY_PRICE", 0),
    annualPrice: getEnvNumber("VITE_CUSTOM_ANNUAL_PRICE", 0),
    includedAIRequests: getEnvNumber("VITE_CUSTOM_INCLUDED_AI_REQUESTS", 2500),
    aiCostPerRequest: getEnvNumber("VITE_CUSTOM_AI_COST_PER_REQUEST", 0.16),
    aiBudgetPercent: getEnvNumber("VITE_CUSTOM_AI_BUDGET_PERCENT", 0),
    includedResponses: getEnvNumber("VITE_CUSTOM_INCLUDED_RESPONSES", 50000),
    includedSurveys: getEnvNumber("VITE_CUSTOM_INCLUDED_SURVEYS", 50),
    storageGB: getEnvNumber("VITE_CUSTOM_STORAGE_GB", 500),
    teamMembers: getEnvNumber("VITE_CUSTOM_TEAM_MEMBERS", -1),
  },
};

// ============================================================
// SUBSCRIPTION TYPES (Aligned with Shared Enums)
// ============================================================

export interface SubscriptionLimits {
  maxSurveys: number;
  maxResponses: number;
  maxTeamMembers: number;
  maxStorageGB: number;
  maxAPIRequestsPerDay: number;
  maxAIRequestsPerMonth: number;
}

export interface SubscriptionUsage {
  activeSurveys: number;
  totalResponses: number;
  currentMonthResponses: number;
  teamMembers: number;
  storageUsedGB: number;
  apiRequestsToday: number;
  surveysUploadedThisMonth: number;
  aiRequestsThisMonth: number;
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
}

export interface OverageUsage {
  extraSurveys: number;
  extraResponses: number;
  extraGB: number;
  extraAIRequests: number;
  totalOverageCost: number;
  billedOverage: number;
  pendingOverage: number;
}

export interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: string;
  invoiceNumber: string;
  description: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planKey: PlanKey;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  trialEndDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  billingCycle: BillingPeriod;
  paymentMethod: PaymentMethod;
  features: string[];
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  overage: OverageUsage;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  paymentHistory: PaymentHistory[];
  customFeatures?: string[];
}

// ============================================================
// TYPE GUARDS & VALIDATION
// ============================================================

export function isPlanKey(value: string): value is PlanKey {
  return value in PLANS;
}

export function isPrioritySupport(value: string): value is PrioritySupport {
  return ["email", "priority", "dedicated"].includes(value);
}

export function isBillingPeriod(value: string): value is BillingPeriod {
  return Object.values(BillingPeriod).includes(value as BillingPeriod);
}

export function isPaymentMethod(value: string): value is PaymentMethod {
  return Object.values(PaymentMethod).includes(value as PaymentMethod);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getPlanByKey(key: string): Plan | null {
  if (isPlanKey(key)) {
    return PLANS[key];
  }
  return null;
}

export function getPlanByType(planType: PlanType): Plan | null {
  const key = planType.toLowerCase() as PlanKey;
  return getPlanByKey(key);
}

export function extractAmountFromPrice(price: string): number {
  if (price === "Custom" || !price) return 0;
  const match = price.match(/\$([\d,]+)/);
  if (match?.[1]) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  return 0;
}

export interface PlanDetails extends Plan {
  amount: number;
  isYearly: boolean;
  isMonthly: boolean;
  isCustom: boolean;
  annualCost: number;
  monthlyEquivalent: number;
  planType: PlanType;
}

export function getPlanDetails(planKey: PlanKey): PlanDetails {
  const plan = PLANS[planKey];
  const amount = extractAmountFromPrice(plan.price);

  return {
    ...plan,
    amount,
    isYearly: plan.billingPeriod === BillingPeriod.YEARLY,
    isMonthly: plan.billingPeriod === BillingPeriod.MONTHLY,
    isCustom: plan.billingPeriod === BillingPeriod.CUSTOM,
    annualCost:
      plan.billingPeriod === BillingPeriod.MONTHLY ? amount * 12 : amount,
    monthlyEquivalent:
      plan.billingPeriod === BillingPeriod.YEARLY ? amount / 12 : amount,
    planType: planKey.toUpperCase() as PlanType,
  };
}

export function calculateOverage(
  usage: SubscriptionUsage,
  limits: SubscriptionLimits,
  fairUsagePolicy: FairUsagePolicy,
): OverageUsage {
  const extraSurveys = Math.max(
    0,
    usage.surveysUploadedThisMonth - limits.maxSurveys,
  );
  const extraResponses = Math.max(
    0,
    usage.currentMonthResponses - limits.maxResponses,
  );
  const extraGB = Math.max(0, usage.storageUsedGB - limits.maxStorageGB);
  const extraAIRequests = Math.max(
    0,
    usage.aiRequestsThisMonth - limits.maxAIRequestsPerMonth,
  );

  const surveyCost = fairUsagePolicy.overageCostPerSurvey * extraSurveys;
  const responseCost =
    fairUsagePolicy.overageCostPerResponse * (extraResponses / 1000);
  const storageCost = fairUsagePolicy.overageCostPerGB * extraGB;
  const aiCost = fairUsagePolicy.overageCostPerAIRequest * extraAIRequests;

  return {
    extraSurveys,
    extraResponses,
    extraGB,
    extraAIRequests,
    totalOverageCost: surveyCost + responseCost + storageCost + aiCost,
    billedOverage: 0,
    pendingOverage: surveyCost + responseCost + storageCost + aiCost,
  };
}

export interface ThresholdResult {
  isNearLimit: boolean;
  percentageUsed: number;
  limits: string[];
}

export function checkUsageThreshold(
  usage: SubscriptionUsage,
  limits: SubscriptionLimits,
  threshold: number,
): ThresholdResult {
  const limitsReached: string[] = [];

  const checkLimit = (current: number, max: number, label: string): number => {
    if (max === -1) return 0;
    const usagePercent = (current / max) * 100;
    if (usagePercent >= threshold) {
      limitsReached.push(`${label} (${Math.round(usagePercent)}%)`);
    }
    return usagePercent;
  };

  const surveyUsage = checkLimit(
    usage.surveysUploadedThisMonth,
    limits.maxSurveys,
    "Surveys",
  );
  const responseUsage = checkLimit(
    usage.currentMonthResponses,
    limits.maxResponses,
    "Responses",
  );
  const storageUsage = checkLimit(
    usage.storageUsedGB,
    limits.maxStorageGB,
    "Storage",
  );
  const aiUsage = checkLimit(
    usage.aiRequestsThisMonth,
    limits.maxAIRequestsPerMonth,
    "AI Requests",
  );

  const maxUsage = Math.max(surveyUsage, responseUsage, storageUsage, aiUsage);

  return {
    isNearLimit: limitsReached.length > 0,
    percentageUsed: Math.round(maxUsage),
    limits: limitsReached,
  };
}

export function getNextBillingDate(planKey: PlanKey, startDate: Date): Date {
  const plan = PLANS[planKey];
  const nextDate = new Date(startDate);

  switch (plan.billingPeriod) {
    case BillingPeriod.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case BillingPeriod.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case BillingPeriod.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case BillingPeriod.CUSTOM:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

export function getAnnualCost(planKey: PlanKey): number {
  const plan = PLANS[planKey];
  const amount = extractAmountFromPrice(plan.price);
  return plan.billingPeriod === BillingPeriod.MONTHLY ? amount * 12 : amount;
}

export function getProratedPrice(planKey: PlanKey, months: number): number {
  const annualCost = getAnnualCost(planKey);
  return (annualCost / 12) * months;
}

export function getCustomPlanPrice(selectedFeatures: string[]): number {
  const basePrice = PLANS.custom.basePrice || 2250;
  const featurePrices = selectedFeatures
    .map((id) => CUSTOM_FEATURES.find((f) => f.id === id))
    .filter((f): f is CustomFeaturePricing => f !== undefined)
    .reduce((sum, f) => sum + f.price, 0);
  return basePrice + featurePrices;
}

export function getPlanMaxSurveys(planKey: PlanKey): number {
  return PLANS[planKey].maxSurveys;
}

export function getPlanMaxResponses(planKey: PlanKey): number {
  return PLANS[planKey].maxResponses;
}

export function getPlanMaxAIRequests(planKey: PlanKey): number {
  return PLANS[planKey].maxAIRequestsPerMonth;
}

export function getPlanMaxStorage(planKey: PlanKey): number {
  return PLANS[planKey].maxStorageGB;
}

export function getPlanFairUsagePolicy(planKey: PlanKey): FairUsagePolicy {
  return PLANS[planKey].fairUsagePolicy;
}

export function getPlanFeatures(planKey: PlanKey): string[] {
  return PLANS[planKey].features;
}

export function getPlanLimits(planKey: PlanKey): string[] {
  return PLANS[planKey].limits;
}

export function isPlanUnlimited(value: number): boolean {
  return value === -1;
}

export function formatPlanLimit(value: number): string {
  return isPlanUnlimited(value) ? "Unlimited" : value.toString();
}

export function getPlanDisplayName(planKey: PlanKey): string {
  return PLANS[planKey].name;
}

export function getPlanByBillingPeriod(
  billingPeriod: BillingPeriod,
): PlanKey[] {
  return Object.keys(PLANS).filter(
    (key) => PLANS[key as PlanKey].billingPeriod === billingPeriod,
  ) as PlanKey[];
}

// ============================================================
// EXPORTS
// ============================================================

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export const PLAN_NAMES = PLAN_KEYS.map((key) => ({
  key,
  name: PLANS[key].name,
  type: key.toUpperCase() as PlanType,
}));

export const SUBSCRIPTION_PLANS = PLAN_KEYS.map((key) => ({
  id: key,
  name: PLANS[key].name,
  price: PLANS[key].price,
  billingPeriod: PLANS[key].billingPeriod,
  popular: PLANS[key].popular || false,
  planType: key.toUpperCase() as PlanType,
}));

export const PLAN_LIMITS = PLAN_KEYS.map((key) => ({
  key,
  maxSurveys: PLANS[key].maxSurveys,
  maxResponses: PLANS[key].maxResponses,
  maxTeamMembers: PLANS[key].maxTeamMembers,
  maxStorageGB: PLANS[key].maxStorageGB,
  maxAIRequestsPerMonth: PLANS[key].maxAIRequestsPerMonth,
  maxAPIRequestsPerDay: PLANS[key].maxAPIRequestsPerDay,
}));

// Plan type to key mapping
export const PLAN_TYPE_TO_KEY: Record<PlanType, PlanKey> = {
  [PlanType.STARTER]: "starter",
  [PlanType.ENTERPRISE]: "enterprise",
  [PlanType.CUSTOM]: "custom",
};

// Key to plan type mapping
export const PLAN_KEY_TO_TYPE: Record<PlanKey, PlanType> = {
  starter: PlanType.STARTER,
  enterprise: PlanType.ENTERPRISE,
  custom: PlanType.CUSTOM,
};

// Default plan limits for new users
export const DEFAULT_PLAN_LIMITS = {
  maxSurveys: getEnvNumber("VITE_DEFAULT_MAX_SURVEYS", 1),
  maxResponses: getEnvNumber("VITE_DEFAULT_MAX_RESPONSES", 10000),
  maxTeamMembers: getEnvNumber("VITE_DEFAULT_MAX_TEAM_MEMBERS", 5),
  maxStorageGB: getEnvNumber("VITE_DEFAULT_MAX_STORAGE_GB", 5),
  maxAPIRequestsPerDay: getEnvNumber("VITE_DEFAULT_MAX_API_REQUESTS", 1000),
  maxAIRequestsPerMonth: getEnvNumber("VITE_DEFAULT_MAX_AI_REQUESTS", 30),
};
