// src/types/enums.ts

// ==================== SURVEY ENUMS ====================

export enum QuestionType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  DATE = "DATE",
  DATETIME = "DATETIME",
  TIME = "TIME",
  SELECT_ONE = "SELECT_ONE",
  SELECT_MULTIPLE = "SELECT_MULTIPLE",
  CASCADING_SELECT = "CASCADING_SELECT",
  INTEGER = "INTEGER",
  DECIMAL = "DECIMAL",
  BOOLEAN = "BOOLEAN",
  RATING = "RATING",
  LIKERT = "LIKERT",
  MATRIX = "MATRIX",
  REPEAT = "REPEAT",
  PHOTO = "PHOTO",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  FILE = "FILE",
  GEOPOINT = "GEOPOINT",
  GEOSHAPE = "GEOSHAPE",
  GEOTRACE = "GEOTRACE",
  RANK = "RANK",
  BARCODE = "BARCODE",
  NOTE = "NOTE",
  CALCULATE = "CALCULATE",
  GROUP = "GROUP",
  HIDDEN = "HIDDEN",
  RANGE = "RANGE",
}

export enum SurveyStatus {
  DRAFT = "DRAFT",
  DEPLOYED = "DEPLOYED",
  ARCHIVED = "ARCHIVED",
  PAUSED = "PAUSED",
}

export enum SkipAction {
  SKIP = "SKIP",
  SHOW = "SHOW",
  REQUIRE = "REQUIRE",
  HIDE = "HIDE",
  SKIP_TO = "SKIP_TO",
  JUMP_TO = "JUMP_TO",
}

export enum SurveySortField {
  NAME = "NAME",
  CREATED_AT = "CREATED_AT",
  UPDATED_AT = "UPDATED_AT",
  STATUS = "STATUS",
  RESPONSE_COUNT = "RESPONSE_COUNT",
  COMPLETION_RATE = "COMPLETION_RATE",
}

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

// ==================== RESPONSE ENUMS ====================

export enum ResponseStatus {
  SUBMITTED = "SUBMITTED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  VALIDATED = "VALIDATED",
  FLAGGED = "FLAGGED",
}

export enum ValidationStatus {
  PENDING = "PENDING",
  VALID = "VALID",
  INVALID = "INVALID",
  ON_HOLD = "ON_HOLD",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum FlagStatus {
  NONE = "NONE",
  FLAGGED = "FLAGGED",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
}

export enum SyncStatus {
  PENDING = "PENDING",
  SYNCING = "SYNCING",
  SYNCED = "SYNCED",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
}

// ==================== USER ENUMS ====================

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  UNIT_LEAD = "UNIT_LEAD",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
  SURVEYOR = "SURVEYOR",
  ANALYST = "ANALYST",
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZATION_MEMBER = "ORGANIZATION_MEMBER",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
}

// ==================== PAYMENT ENUMS ====================

export enum PlanType {
  FREE = "FREE",
  STARTER = "STARTER",
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

export enum PaymentMethod {
  MPESA = "MPESA",
  PAYPAL = "PAYPAL",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CRYPTO = "CRYPTO",
  CREDIT_CARD = "CREDIT_CARD",
  INVOICE = "INVOICE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  TRIAL = "TRIAL",
  SUSPENDED = "SUSPENDED",
}

export enum BillingPeriod {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
  CUSTOM = "CUSTOM",
}

// ==================== KOBO ENUMS ====================

export enum DeploymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export enum WebhookStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FAILED = "FAILED",
  ERROR = "ERROR",
  DISABLED = "DISABLED",
}

export enum WebhookEvent {
  SUBMIT = "SUBMIT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESPONSE_SUBMITTED = "RESPONSE_SUBMITTED",
}

// ==================== ORGANIZATION ENUMS ====================

export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED",
}

// ==================== GEO ENUMS ====================

export enum GeoType {
  POINT = "Point",
  LINESTRING = "LineString",
  POLYGON = "Polygon",
  MULTIPOINT = "MultiPoint",
  MULTILINESTRING = "MultiLineString",
  MULTIPOLYGON = "MultiPolygon",
}

// ==================== INQUIRY ENUMS ====================

export enum InquiryStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum InquiryPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// ==================== EXPORT ENUMS ====================

export enum ExportFormat {
  CSV = "CSV",
  JSON = "JSON",
  XLSX = "XLSX",
  GEOJSON = "GEOJSON",
}

// ==================== AI ENUMS ====================

export enum AICreditTransactionType {
  PURCHASE = "PURCHASE",
  USAGE = "USAGE",
  REFUND = "REFUND",
  BONUS = "BONUS",
  EXPIRATION = "EXPIRATION",
}

export enum OverageType {
  SURVEY = "SURVEY",
  RESPONSE = "RESPONSE",
  AI_REQUEST = "AI_REQUEST",
  STORAGE = "STORAGE",
  API = "API",
}

// ==================== SYSTEM ENUMS ====================

export enum Environment {
  DEVELOPMENT = "DEVELOPMENT",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
  TEST = "TEST",
}

// ==================== TYPE ALIASES FOR BACKWARD COMPATIBILITY ====================

// For backward compatibility with existing code that uses these names
export { InquiryStatus as ClientInquiry };
