// src/types/consultation.ts

/* ============================================================
 * SCALARS
 * ============================================================ */

export type DateTime = string;
export type JSONValue =
  string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

/* ============================================================
 * ENUMS
 * ============================================================ */

export type ConsultationStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "READY_TO_CLOSE"
  | "CLOSED"
  | "AUTO_CLOSED"
  | "CANCELLED";

export type ReviewerSeatStatus =
  "AVAILABLE" | "INTERESTED" | "TAKEN" | "SUBMITTED" | "RELEASED";

export type ReviewerSeatColour = "GREEN" | "ORANGE" | "PURPLE";

export type ConsultationReviewStatus =
  "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";

export type ConsultationAnnotationType =
  "HIGHLIGHT" | "COMMENT" | "UNDERLINE" | "STRIKEOUT" | "DRAWING" | "TEXT";

export type ConsultationAnnotationVisibility =
  "PRIVATE" | "STUDENT" | "ALL_REVIEWERS";

export type ConsultationCloseReason =
  "REVIEWS_COMPLETED" | "AUTO_EXPIRED" | "CANCELLED" | "ADMIN_CLOSED";

export type ConsultationStage =
  | "IDEA"
  | "CONCEPT"
  | "PROTOCOL"
  | "PROPOSAL"
  | "ETHICS"
  | "DATA_COLLECTION"
  | "ANALYSIS"
  | "MANUSCRIPT"
  | "DEFENSE"
  | "PUBLICATION";

/* ============================================================
 * USER / INSTITUTION
 * ────────────────────────────────────────────────────────────
 * Mirrors the server SDL. NOTE:
 *   • `User` has NO top-level `name` and NO `bio` on the server.
 *     Display name comes from `personalInfo.fullName`.
 *   • `name` here is a *synthetic* field that the Pinia store's
 *     `normaliseUser()` fills in from `personalInfo` so every
 *     Vue template can keep using `user.name` unchanged.
 *   • `Institution` has NO `slug`.
 * ============================================================ */

export interface ConsultationPersonalInfo {
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
}

export interface ConsultationUser {
  id: string;

  /**
   * Synthesised by `normaliseUser()` in
   * `src/stores/consultation.ts` from `personalInfo.fullName`
   * (with fallbacks to `personalInfo.username`, `username`,
   * `email`). Always populated by the time a component reads it,
   * even though the server SDL doesn't expose a top-level `name`.
   *
   * Treat as read-only. To set a display name, patch the server's
   * `personalInfo.fullName` — never this field directly.
   */
  name: string;

  email?: string | null;
  username?: string | null;
  role?: string | null;
  avatar?: string | null;

  /** Full profile payload from the server. Optional — may be unset. */
  personalInfo?: ConsultationPersonalInfo | null;
}

export interface ConsultationInstitution {
  id: string;
  name: string;
  country?: string | null;
  // `slug` removed — server does not expose it
}

/* ============================================================
 * USER HELPERS
 * ============================================================
 * The store guarantees `name` is populated. These helpers are
 * for the rare case where you're handling a user before it has
 * passed through the store's normaliser (e.g. optimistic UI,
 * localStorage hydration, test fixtures).
 * ============================================================ */

/** Resolve a display name with full fallback chain. */
export function userDisplayName(
  user:
    | Pick<ConsultationUser, "name" | "email" | "username" | "personalInfo">
    | null
    | undefined,
  fallback = "Unknown",
): string {
  if (!user) return fallback;
  return (
    user.name?.trim() ||
    user.personalInfo?.fullName?.trim() ||
    user.personalInfo?.username?.trim() ||
    user.username?.trim() ||
    user.email?.trim() ||
    fallback
  );
}

/** Resolve up to two initials for avatars. */
export function userInitials(
  user:
    | Pick<ConsultationUser, "name" | "email" | "username" | "personalInfo">
    | null
    | undefined,
  fallback = "?",
): string {
  const name = userDisplayName(user, "");
  if (!name) return fallback;

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ============================================================
 * PDF DOCUMENT
 * ============================================================ */

export interface ConsultationDocument {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  storageKey?: string | null;
  pages?: number | null;
  uploadedAt: DateTime;
  uploadedBy: ConsultationUser;
}

/* ============================================================
 * PDF GEOMETRY
 * ============================================================ */

export interface ConsultationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConsultationRectInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ============================================================
 * REVIEWER INTEREST
 * ============================================================ */

export interface ConsultationReviewerInterest {
  mentor: ConsultationUser;
  expressedAt: DateTime;
}

/* ============================================================
 * REVIEW
 * ============================================================ */

export interface ConsultationReview {
  seatNumber: number;
  mentor: ConsultationUser | null;
  status: ConsultationReviewStatus;
  startedAt?: DateTime | null;
  submittedAt?: DateTime | null;
  summary?: string | null;
  strengths: string[];
  limitations: string[];
  requiredChanges: string[];
  comments?: string | null;
  annotationCount: number;
  hasFeedback: boolean;
}

/* ============================================================
 * REVIEWER SEAT
 * ============================================================ */

export interface ConsultationReviewerSeat {
  seatNumber: number;
  colour: ReviewerSeatColour;
  status: ReviewerSeatStatus;
  mentor?: ConsultationUser | null;
  expressedInterestAt?: DateTime | null;
  takenAt?: DateTime | null;
  submittedAt?: DateTime | null;
  reminder14SentAt?: DateTime | null;
  reminder21SentAt?: DateTime | null;
  releasedAt?: DateTime | null;
  review?: ConsultationReview | null;
}

/* ============================================================
 * PDF ANNOTATION
 * ============================================================ */

export interface ConsultationAnnotation {
  id: string;
  mentor: ConsultationUser;
  seatNumber: number;
  colour: ReviewerSeatColour;
  type: ConsultationAnnotationType;
  page: number;
  rect: ConsultationRect;
  selectedText?: string | null;
  comment?: string | null;
  visibility: ConsultationAnnotationVisibility;
  resolved: boolean;
  resolvedAt?: DateTime | null;
  resolvedBy?: ConsultationUser | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}

/* ============================================================
 * MAIN RESEARCH CLINIC
 * ============================================================ */

export interface Consultation {
  id: string;
  student: ConsultationUser;
  title: string;
  purpose: string;
  researchQuestion: string;
  objectives: string;
  methodology?: string | null;
  studyDesign?: string | null;
  researchArea?: string | null;
  researchStage: ConsultationStage;
  keywords: string[];
  tags: string[];
  institution?: ConsultationInstitution | null;
  department?: string | null;
  supervisor?: string | null;
  principalInvestigator?: string | null;
  document: ConsultationDocument;
  status: ConsultationStatus;
  requestedAt: DateTime;
  expiresAt: DateTime;
  closedAt?: DateTime | null;
  autoClosedAt?: DateTime | null;
  cancelledAt?: DateTime | null;
  closeReason?: ConsultationCloseReason | null;
  reviewerInterests: ConsultationReviewerInterest[];
  interestCount: number;
  seats: ConsultationReviewerSeat[];
  takenSeatCount: number;
  availableSeatCount: number;
  submittedSeatCount: number;
  annotations: ConsultationAnnotation[];
  annotationCount: number;
  canClose: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

/* ============================================================
 * CONNECTION / LIST RESULT
 * ============================================================ */

export interface ConsultationConnection {
  items: Consultation[];
  total: number;
  hasMore: boolean;
}

/* ============================================================
 * SEAT RESULT
 * ============================================================ */

export interface ConsultationSeatResult {
  clinic: Consultation;
  seat: ConsultationReviewerSeat;
}

/* ============================================================
 * LIFECYCLE PROCESSING RESULT
 * ============================================================ */

export interface ConsultationLifecycleResult {
  autoClosedCount: number;
  reminder14Count: number;
  reminder21Count: number;
  releasedSeatCount: number;
}

/* ============================================================
 * INPUTS
 * ============================================================ */

export interface ConsultationDocumentInput {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  storageKey?: string | null;
  pages?: number | null;
}

export interface CreateConsultationInput {
  title: string;
  purpose: string;
  researchQuestion: string;
  objectives: string;
  methodology?: string | null;
  studyDesign?: string | null;
  researchArea?: string | null;
  researchStage: ConsultationStage;
  keywords?: string[] | null;
  tags?: string[] | null;
  institutionId?: string | null;
  department?: string | null;
  supervisor?: string | null;
  principalInvestigator?: string | null;
}

export interface UpdateConsultationInput {
  title?: string | null;
  purpose?: string | null;
  researchQuestion?: string | null;
  objectives?: string | null;
  methodology?: string | null;
  studyDesign?: string | null;
  researchArea?: string | null;
  researchStage?: ConsultationStage | null;
  keywords?: string[] | null;
  tags?: string[] | null;
  institutionId?: string | null;
  department?: string | null;
  supervisor?: string | null;
  principalInvestigator?: string | null;
}

export interface CreateConsultationAnnotationInput {
  clinicId: string;
  type: ConsultationAnnotationType;
  page: number;
  rect: ConsultationRectInput;
  selectedText?: string | null;
  comment?: string | null;
  visibility?: ConsultationAnnotationVisibility | null;
}

export interface UpdateConsultationAnnotationInput {
  annotationId: string;
  comment?: string | null;
  visibility?: ConsultationAnnotationVisibility | null;
  resolved?: boolean | null;
}

export interface SubmitConsultationReviewInput {
  summary?: string | null;
  strengths?: string[] | null;
  limitations?: string[] | null;
  requiredChanges?: string[] | null;
  comments?: string | null;
}

/* ============================================================
 * FILTERS
 * ============================================================ */

export interface ConsultationFilters {
  status: ConsultationStatus | null;
  researchStage: ConsultationStage | null;
  search: string;
}

/* ============================================================
 * ENUM SANITISER SETS
 * ============================================================ */

export const CONSULTATION_STATUS_VALUES: readonly ConsultationStatus[] = [
  "OPEN",
  "IN_REVIEW",
  "READY_TO_CLOSE",
  "CLOSED",
  "AUTO_CLOSED",
  "CANCELLED",
] as const;

export const CONSULTATION_STAGE_VALUES: readonly ConsultationStage[] = [
  "IDEA",
  "CONCEPT",
  "PROTOCOL",
  "PROPOSAL",
  "ETHICS",
  "DATA_COLLECTION",
  "ANALYSIS",
  "MANUSCRIPT",
  "DEFENSE",
  "PUBLICATION",
] as const;

export const REVIEWER_SEAT_COLOUR_VALUES: readonly ReviewerSeatColour[] = [
  "GREEN",
  "ORANGE",
  "PURPLE",
] as const;

export const CONSULTATION_ANNOTATION_TYPE_VALUES: readonly ConsultationAnnotationType[] =
  [
    "HIGHLIGHT",
    "COMMENT",
    "UNDERLINE",
    "STRIKEOUT",
    "DRAWING",
    "TEXT",
  ] as const;

export const CONSULTATION_ANNOTATION_VISIBILITY_VALUES: readonly ConsultationAnnotationVisibility[] =
  ["PRIVATE", "STUDENT", "ALL_REVIEWERS"] as const;
