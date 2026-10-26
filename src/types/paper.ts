// types/paper.ts

// ============================================================
// ENUMS
// ============================================================

export enum PaperRegistrationStatusEnum {
  PENDING = "PENDING",
  WAITING = "WAITING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum PaperStatusEnum {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export enum PaperVisibilityEnum {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED",
}

export enum ParticipantStatusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  JOINED = "JOINED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ============================================================
// CORE TYPES
// ============================================================

export interface PaperRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaperAuthorInfo {
  id: string;
  name: string;
  email: string;
}

export interface PaperReaction {
  id: string;
  type: string;
  text?: string;
  author: PaperAuthorInfo;
  createdAt: string;
}

export interface PaperAnnotation {
  id: string;
  page: number;
  rect: PaperRect;
  title?: string;
  text: string;
  author: PaperAuthorInfo;
  reactions: PaperReaction[];
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// USER TYPE (minimal for paper context)
// ============================================================

export interface PaperUser {
  id: string;
  name: string;
  email: string;
  personalInfo?: {
    fullName?: string;
    email?: string;
  };
}

// ============================================================
// REGISTRATION TYPE
// ============================================================

export interface PaperRegistration {
  id: string;
  sessionId: string;
  userId?: string;
  name: string;
  emailAddress: string;
  courseTaken?: string;
  level?: string;
  registeredAt: string;
  responses?: string;
  status: PaperRegistrationStatusEnum;
  approvalToken: string;
  registeredVia?: string;
  approvedAt?: string;
  rejectedAt?: string;
  lastTokenIssuedAt?: string;
  lastToken?: string;
  joinToken?: string;
  joinUrl?: string;
  joinUrlGenerated?: boolean;
  joinUrlGeneratedAt?: string;
  joinQrUrl?: string;
  joinQrSignedUrl?: string;
  joinQrProcessed?: boolean;
  joinQrProcessedAt?: string;
  joinEmailSent?: boolean;
  joinEmailSentAt?: string;
  confirmedAt?: string;
}

// ============================================================
// PARTICIPANT TYPE
// ============================================================

export interface PaperParticipant {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  joinedAt: string;
  status: ParticipantStatusEnum;
  joinToken?: string;
  joinQrUrl?: string;
  joinedVia?: string;
  leftAt?: string;
  completedAt?: string;
}

// ============================================================
// MAIN PAPER TYPE
// ============================================================

export interface Paper {
  id: string;
  title: string;
  objective: string;
  sessionId: string;
  accessKey: string;
  createdBy: PaperUser | string;
  qrCodeUrl?: string;
  qrCodeSignedUrl?: string;
  qrCodeGeneratedAt?: string;
  sessionStartTime: string;
  sessionEndTime: string;
  url?: string;

  // NEW FIELDS
  authors?: string;
  publicationYear?: number;
  doi?: string;
  visibility: PaperVisibilityEnum;
  tags: string[];
  category?: string;
  language: string;
  version: string;
  isArchived: boolean;
  archivedAt?: string;

  // Registrations
  registrations: PaperRegistration[];

  // Participants
  participants: PaperParticipant[];

  // Virtual fields
  waitingList: PaperRegistration[];
  pending: PaperRegistration[];
  participantCount: number;
  availableSpots?: number;
  isFull: boolean;

  // Session settings
  maxParticipants?: number;
  isSessionOpen: boolean;
  status: PaperStatusEnum;

  // Annotations
  annotations: PaperAnnotation[];
  annotationCount: number;

  // Timestamps
  createdAt: string;
  updatedAt?: string;

  // Optional fields from GraphQL
  _id?: string;
  __v?: number;
}

// ============================================================
// INPUT TYPES
// ============================================================

export interface CreatePaperInput {
  title: string;
  objective: string;
  createdBy: string;
  url?: string;
  sessionStartTime: string;
  sessionEndTime?: string;
  maxParticipants?: number;
  isSessionOpen?: boolean;

  // NEW FIELDS
  authors?: string;
  publicationYear?: number;
  doi?: string;
  visibility?: PaperVisibilityEnum;
  tags?: string[];
  category?: string;
  language?: string;
  version?: string;
}

export interface UpdatePaperInput {
  title?: string;
  objective?: string;
  url?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  maxParticipants?: number;
  isSessionOpen?: boolean;

  // NEW FIELDS
  authors?: string;
  publicationYear?: number;
  doi?: string;
  visibility?: PaperVisibilityEnum;
  tags?: string[];
  category?: string;
  language?: string;
  version?: string;
  isArchived?: boolean;
}

export interface RegisterForPaperSessionInput {
  sessionId: string;
  email: string;
  name?: string;
  courseTaken?: string;
  level?: string;
}

export interface JoinPaperSessionInput {
  sessionId: string;
  registrationId: string;
  token: string;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface PaperRegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: string;
  status?: PaperRegistrationStatusEnum;
  approvalToken?: string;
  paperId?: string;
  sessionId?: string;
  joinUrl?: string;
  joinQrUrl?: string;
}

export interface PaperRegistrationManageResponse {
  success: boolean;
  message: string;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

export interface TokenRenewalResponse {
  success: boolean;
  token: string;
  expiresAt: string;
}

export interface JoinPaperSessionResponse {
  success: boolean;
  message: string;
  paperId?: string;
  sessionId?: string;
  participant?: PaperParticipant;
  paper?: Paper;
}

export interface GenerateQRResponse {
  success: boolean;
  message: string;
  qrCodeUrl?: string;
  signedUrl?: string;
  registrationUrl?: string;
}

export interface ProcessRegistrationResponse {
  success: boolean;
  message: string;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface PaperFilters {
  status: PaperStatusEnum | null;
  isFull: boolean | null;
  hasAnnotations: boolean | null;
  isArchived: boolean | null;
  search: string;
}

export interface FetchPapersOptions {
  includePublic?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================
// SUBSCRIPTION PAYLOAD TYPES
// ============================================================

export interface PaperAnnotationCreatedPayload {
  paperAnnotationCreated: PaperAnnotation;
}

export interface PaperReactionAddedPayload {
  paperReactionAdded: {
    annotationId: string;
    reaction: PaperReaction;
  };
}

export interface PaperRegistrationUpdatedPayload {
  paperRegistrationUpdated: PaperRegistration;
}

// ============================================================
// UTILITY TYPE GUARDS
// ============================================================

export function isPaper(obj: any): obj is Paper {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.objective === "string" &&
    typeof obj.sessionId === "string" &&
    typeof obj.accessKey === "string"
  );
}

export function isPaperRegistration(obj: any): obj is PaperRegistration {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.emailAddress === "string" &&
    typeof obj.status === "string"
  );
}

export function isPaperParticipant(obj: any): obj is PaperParticipant {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.registrationId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
}

export function isPaperAnnotation(obj: any): obj is PaperAnnotation {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.page === "number" &&
    typeof obj.text === "string" &&
    typeof obj.author === "object"
  );
}
