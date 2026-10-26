// src/types/index.ts

// ==================== ENUMS ====================

export enum QuestionType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  DATE = "DATE",
  DATETIME = "DATETIME",
  TIME = "TIME",
  SELECT_ONE = "SELECT_ONE",
  SELECT_MULTIPLE = "SELECT_MULTIPLE",
  RATING = "RATING",
  PHOTO = "PHOTO",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  FILE = "FILE",
  GEOPOINT = "GEOPOINT",
  GEOSHAPE = "GEOSHAPE",
  GEOTRACE = "GEOTRACE",
  BARCODE = "BARCODE",
  NOTE = "NOTE",
  CALCULATE = "CALCULATE",
}

export enum SurveyStatus {
  DRAFT = "DRAFT",
  DEPLOYED = "DEPLOYED",
  ARCHIVED = "ARCHIVED",
}

export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
  SURVEYOR = "SURVEYOR",
  ANALYST = "ANALYST",
  MANAGER = "MANAGER",
  OWNER = "OWNER",
  UNIT_LEAD = "UNIT_LEAD",
  MEMBER = "MEMBER",
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZATION_MEMBER = "ORGANIZATION_MEMBER",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
}

export enum ValidationStatus {
  PENDING = "PENDING",
  VALID = "VALID",
  INVALID = "INVALID",
  ON_HOLD = "ON_HOLD",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ResponseStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
  VALIDATED = "VALIDATED",
  FLAGGED = "FLAGGED",
}

export enum DeploymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export enum PlanType {
  FREE = "FREE",
  STARTER = "STARTER",
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  TRIAL = "TRIAL",
  SUSPENDED = "SUSPENDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  MPESA = "MPESA",
  PAYPAL = "PAYPAL",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CRYPTO = "CRYPTO",
  CREDIT_CARD = "CREDIT_CARD",
}

export enum GeoType {
  POINT = "Point",
  POLYGON = "Polygon",
  LINESTRING = "LineString",
  MULTIPOINT = "MultiPoint",
  MULTIPOLYGON = "MultiPolygon",
  MULTILINESTRING = "MultiLineString",
}

export enum SkipAction {
  SKIP = "SKIP",
  SHOW = "SHOW",
  REQUIRE = "REQUIRE",
  HIDE = "HIDE",
  SKIP_TO = "SKIP_TO",
  JUMP_TO = "JUMP_TO",
}

export enum WebhookEvent {
  SUBMIT = "SUBMIT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESPONSE_SUBMITTED = "RESPONSE_SUBMITTED",
}

export enum WebhookStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FAILED = "FAILED",
  ERROR = "ERROR",
  DISABLED = "DISABLED",
}

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

export enum SyncStatus {
  PENDING = "PENDING",
  SYNCING = "SYNCING",
  SYNCED = "SYNCED",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
}

export enum FlagStatus {
  NONE = "NONE",
  FLAGGED = "FLAGGED",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
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

export enum ExportFormat {
  CSV = "CSV",
  JSON = "JSON",
  XLSX = "XLSX",
  GEOJSON = "GEOJSON",
}

// ==================== CORE INTERFACES ====================

export interface IChoice {
  id?: string;
  name: string;
  label: string;
  order?: number;
  parentValue?: string;
  filter?: string;
}

export interface ISkipLogic {
  id?: string;
  condition: string;
  value?: string;
  action: SkipAction;
  targetQuestionId: string;
}

export interface ICascadingSelect {
  parentQuestionId: string;
  filterExpression?: string;
}

export interface IQuestionValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string;
  message?: string;
}

export interface IMediaConfig {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  required?: boolean;
}

export interface IQuestion {
  id?: string;
  variableName: string;
  label: string;
  type: QuestionType;
  choices?: IChoice[];
  required: boolean;
  requiredMessage?: string;
  hint?: string;
  appearance?: string;
  relevant?: string;
  constraint?: string;
  constraintMessage?: string;
  defaultValue?: unknown;
  order: number;
  skipLogic?: ISkipLogic[];
  cascadingSelect?: ICascadingSelect;
  validation?: IQuestionValidation;
  mediaConfig?: IMediaConfig;
  readOnly?: boolean;
  calculation?: string;
}

// ==================== SURVEY ====================

export interface ISurveyVersion {
  id?: string;
  version: number;
  questions: IQuestion[];
  xlsFormUrl?: string;
  deployedAt?: Date;
  deployedToKobo: boolean;
  koboAssetId?: string;
  koboFormId?: string;
  createdBy: string;
  createdByUser?: IUser;
  changelog?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  submittedCount?: number;
  completionRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISurveyPermissions {
  owner: string;
  admins: string[];
  editors: string[];
  reviewers: string[];
  collectors: string[];
  viewers: string[];
  public: boolean;
  publicView: boolean;
  publicCollect: boolean;
}

export interface ISurvey {
  id: string;
  name: string;
  description?: string;
  slug: string;
  status: SurveyStatus;
  currentVersion: number;
  versions: ISurveyVersion[];
  kobo: IKoboMetadata;
  responseCount: number;
  totalResponses: number;
  completionRate: number;
  averageTimeToComplete?: number;
  createdBy: string;
  createdByUser?: IUser;
  organizationId?: string;
  organization?: IOrganization;
  isPublic: boolean;
  clonedFrom?: string;
  clonedFromSurvey?: ISurvey;
  sharedWith: string[];
  sharedWithUsers?: IUser[];
  permissions: ISurveyPermissions;
  settings?: ISurveySettings;
  webhookConfig?: IWebhookConfig;
  tags: string[];
  categories: string[];
  updatedBy?: string;
  updatedByUser?: IUser;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== KOBO ====================

export interface IKoboStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  lastSubmissionAt?: Date;
  averageCompletionTime?: number;
  geoDataCount: number;
  mediaCount: number;
}

export interface IKoboUrls {
  webForm: string;
  singleSubmission: string;
  offline: string;
  preview: string;
  exports: string;
  edit: string;
  manage: string;
  data: string;
  editData?: string;
  dashboard?: string;
  api?: string;
  smartLink?: string;
}

export interface IKoboQR {
  pngUrl: string;
  pdfUrl: string;
  svgUrl: string;
  smartQrUrl: string;
  respondentQrUrl: string;
  singleQrUrl: string;
}

export interface IKoboMetadata {
  assetId?: string;
  deploymentId?: string;
  formId?: string;
  webhookId?: string;
  webhookSecret: string;
  webhookStatus?: WebhookStatus;
  endpoint?: string;
  xlsFormHash?: string;
  deployedVersion?: string;
  lastSyncAt?: Date;
  lastDeploymentStatus?: DeploymentStatus;
  lastDeploymentAttempt?: Date;
  lastError?: string;
  stats?: IKoboStats;
  urls?: IKoboUrls;
}

// ==================== WEBHOOK ====================

export interface IWebhookRetryConfig {
  maxAttempts: number;
  retryDelayMs: number;
  backoffMultiplier: number;
}

export interface IWebhookConfig {
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  retryConfig: IWebhookRetryConfig;
  timeoutMs: number;
}

export interface IWebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  statusCode?: number;
  duration: number;
  success: boolean;
  error?: string;
  createdAt: Date;
}

// ==================== ORGANIZATION ====================

export interface IBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
  customJs?: string;
}

export interface IOrganizationSettings {
  defaultPrivacy: boolean;
  allowTeamInvites: boolean;
  maxTeamMembers?: number;
  customDomain?: string;
  branding?: IBranding;
  webhookEndpoint?: string;
  webhookSecret?: string;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  settings: IOrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== USER ====================

export interface IPlanFeature {
  name: string;
  enabled: boolean;
  limit?: number;
  description?: string;
}

export interface IPlanLimits {
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

export interface ISubscription {
  id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  features: IPlanFeature[];
  limits: IPlanLimits;
  metadata?: Record<string, unknown>;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organization?: IOrganization;
  surveys?: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  isMFAEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  planExpiry?: Date;
  features: IPlanFeature[];
  limits: IPlanLimits;
  subscription?: ISubscription;
}

// ==================== SURVEY SETTINGS ====================

export interface ISurveyBehaviorSettings {
  allowBack: boolean;
  autoSave: boolean;
  offline: boolean;
  autosubmit: boolean;
  limitResponses?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ISurveyAppearanceSettings {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  font: string;
  customCss?: string;
}

export interface ISurveyValidationSettings {
  strict: boolean;
  allowIncomplete: boolean;
  requireCaptcha: boolean;
  maxAttempts?: number;
}

export interface ISurveySecuritySettings {
  encrypt: boolean;
  requireLogin: boolean;
  requireSignature: boolean;
  ipRestriction?: string[];
}

export interface ISurveyNotificationSettings {
  onSubmission: string[];
  onCompletion: string[];
  onRejection: string[];
}

export interface ISurveySettings {
  allowAnonymous?: boolean;
  allowMultipleResponses?: boolean;
  showProgressBar?: boolean;
  requireLogin?: boolean;
  redirectUrl?: string;
  thankYouMessage?: string;
  webhookUrl?: string;
  notificationEmails?: string[];
  survey?: ISurveyBehaviorSettings;
  appearance?: ISurveyAppearanceSettings;
  validation?: ISurveyValidationSettings;
  security?: ISurveySecuritySettings;
  notifications?: ISurveyNotificationSettings;
  permissions?: ISurveyPermissions;
}

// ==================== RESPONSE ====================

export interface IGeoLocation {
  type: GeoType;
  coordinates: [number, number] | number[];
  accuracy?: number;
  altitude?: number;
  properties?: Record<string, unknown>;
  lat?: number;
  lng?: number;
}

export interface IAnswerValidation {
  questionId: string;
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface IResponseAnswer {
  questionId: string;
  value: unknown;
  validatedAt?: Date;
  validationErrors?: string[];
}

export interface IResponseMetadata {
  koboUuid?: string;
  deviceId?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
  receivedAt?: Date;
  submittedAtDevice?: Date;
  receivedAtServer?: Date;
  submissionTime: number;
  formVersion: number;
  geoAccuracy?: number;
  geoLocation?: IGeoLocation;
  edited: boolean;
  editedAt?: Date;
  editReason?: string;
  validationStatus: ValidationStatus;
  synced?: boolean;
  processingDuration?: number;
}

export interface ISurveyResponse {
  id: string;
  surveyId: string;
  surveyVersion: number;
  answers: IResponseAnswer[];
  metadata: IResponseMetadata;
  geoLocation?: IGeoLocation;
  validations?: IAnswerValidation[];
  processedAt?: Date;
  completionTime?: number;
  skippedQuestions?: string[];
  flagged: boolean;
  flagReason?: string;
  flagStatus?: FlagStatus;
  status: ResponseStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PAYMENTS ====================

export interface IInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  status: PaymentStatus;
  description?: string;
  lineItems?: IInvoiceLineItem[];
  metadata?: Record<string, unknown>;
  downloadUrl?: string;
}

export interface IInquiry {
  id: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  priority?: InquiryPriority;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  response?: string;
  metadata?: Record<string, unknown>;
}

export interface IPayment {
  id: string;
  userId: string;
  plan: PlanType;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  subscriptionId?: string;
  status: PaymentStatus;
  invoices: IInvoice[];
  inquiries: IInquiry[];
  paymentDate: Date;
  planExpiry?: Date;
  receiptUrl?: string;
  refundAmount?: number;
  refundDate?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== ANALYTICS ====================

export interface IResponseStatistic {
  totalResponses: number;
  todayResponses: number;
  weekResponses: number;
  monthResponses: number;
  completionRate: number;
  uniqueRespondents?: number;
  averageCompletionTime?: number;
  dropoffRate?: number;
}

export interface IAnswerValue {
  value: string;
  count: number;
  percentage: number;
  label?: string;
}

export interface IQuestionAggregation {
  questionId: string;
  questionText: string;
  type: QuestionType;
  totalResponses: number;
  values: IAnswerValue[];
  skippedCount: number;
  averageValue?: number;
  medianValue?: number;
  minValue?: number;
  maxValue?: number;
  standardDeviation?: number;
}

export interface ITimelinePoint {
  date: Date;
  count: number;
  cumulative?: number;
  completionRate?: number;
}

export interface IVersionBreakdown {
  version: number;
  count: number;
  percentage: number;
  completionRate?: number;
  averageTime?: number;
}

export interface IGeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface IGeoDistribution {
  totalPoints: number;
  bounds?: IGeoBounds;
  clusterData?: unknown;
  heatmapData?: unknown;
}

export interface IMediaTypeSummary {
  images: number;
  audio: number;
  video: number;
  files: number;
}

export interface IMediaSummary {
  totalMedia: number;
  byType: IMediaTypeSummary;
  totalSizeMB: number;
  missingMedia?: number;
}

export interface ISurveyAnalytics {
  surveyId: string;
  surveyName: string;
  statistics: IResponseStatistic;
  questionAggregations: IQuestionAggregation[];
  timeline: ITimelinePoint[];
  versionBreakdown: IVersionBreakdown[];
  geoDistribution?: IGeoDistribution;
  mediaSummary?: IMediaSummary;
}

// ==================== VALIDATION ====================

export interface IValidationError {
  field: string;
  message: string;
  code?: string;
  path?: string[];
}

export interface IValidationResult {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: IValidationError[];
  warnings: IValidationError[];
}

// ==================== PAGINATION ====================

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount: number;
}

export interface IPaginationOptions {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  skip?: number;
  limit?: number;
}

export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IPaginatedResult<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

// ==================== AUTH ====================

export interface IAuthPayload {
  token: string;
  refreshToken?: string;
  user: IUser;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
  message?: string;
}

export interface IJwtPayload {
  userId: string;
  role: UserRole;
  sessionId?: string;
  exp?: number;
  iat?: number;
  email?: string;
  name?: string;
}

export interface IGraphQLContext {
  userId?: string;
  userRole?: UserRole;
  user?: IUser;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

// ==================== KOBO SPECIFIC ====================

export interface IKoboDeploymentOptions {
  surveyName: string;
  idString: string;
  questions: IQuestion[];
  logicRules?: ISkipLogic[];
  cascadingSelects?: ICascadingSelect[];
  constraints?: Record<string, IQuestionValidation>;
  settings?: Record<string, unknown>;
}

export interface IKoboDeploymentResult {
  assetId: string;
  deploymentId: string;
  formId: string;
  url: string;
  webFormUrl: string;
  singleUrl: string;
  offlineUrl: string;
  previewUrl: string;
  exportUrl: string;
  urls: IKoboUrls;
  qr: IKoboQR;
  validation: IValidationResult;
  version: {
    deployedVersion: string;
    xlsFormHash: string;
    deployedAt: Date;
  };
  xlsFormValidation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
      questionCount: number;
      selectCount: number;
      cascadingCount: number;
    };
  };
}

// ==================== EXPORT ====================

export interface IExportOptions {
  format: ExportFormat;
  includeMedia?: boolean;
  groupSeparator?: string;
  fieldsFromAllVersions?: boolean;
  language?: string;
  dateFrom?: Date;
  dateTo?: Date;
  filters?: Record<string, unknown>;
}

export interface IExportResult {
  success: boolean;
  downloadUrl: string;
  fileSize: number;
  recordCount: number;
  expiresAt: Date;
  format: ExportFormat;
  checksum?: string;
}

// ==================== SYSTEM ====================

export interface ISystemStatus {
  healthy: boolean;
  version: string;
  uptime: number;
  services: IServiceStatus[];
}

export interface IServiceStatus {
  name: string;
  healthy: boolean;
  message?: string;
  lastCheck: Date;
}

// ==================== BULK OPERATIONS ====================

export interface IBulkDeleteResult {
  success: boolean;
  deletedCount: number;
  failedIds: string[];
  errors?: string[];
}

// ==================== TEMPLATES ====================

export interface ITemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  surveyCount: number;
  featured?: boolean;
  order?: number;
}

// ==================== XLSX ROW TYPES ====================

export type SurveyRow = {
  type?: string;
  name?: string;
  label?: string;
  required?: string | boolean;
  requiredMessage?: string;
  required_message?: string;
  hint?: string;
  appearance?: string;
  relevant?: string;
  constraint?: string;
  constraintMessage?: string;
  constraint_message?: string;
  default?: any;
  defaultValue?: any;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: string;
  [key: string]: any;
};

export type ChoicesRow = {
  list_name?: string;
  listname?: string;
  name?: string;
  label?: string;
  parentValue?: string;
  [key: string]: any;
};

export type SettingsRow = {
  form_title?: string;
  form_id?: string;
  version?: string;
  default_language?: string;
  [key: string]: any;
};

// ==================== MAPPING HELPERS ====================

export type GraphQLToInternal<T> = {
  [K in keyof T]: T[K] extends Date ? Date : T[K];
};

export type InternalToGraphQL<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
