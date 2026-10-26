/* ------------------------------------------------------------------ *
 *  Mirrors the GraphQL schema exactly.
 *  Copy of the enums the resolver exposes so the client is fully typed
 *  without codegen (add codegen later if you want).
 * ------------------------------------------------------------------ */

export type ContentType =
  | "ARTICLE"
  | "OPPORTUNITY"
  | "EVENT"
  | "POLL"
  | "PODCAST"
  | "VIDEO"
  | "GALLERY";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Section =
  | "RESEARCH_ARTICLES"
  | "NEWS"
  | "OPINION"
  | "RESEARCH_ANALYSIS"
  | "CAREERS"
  | "BOOKS_CULTURE"
  | "PODCASTS"
  | "VIDEOS"
  | "CURRENT_ISSUE"
  | "BROWSE_ISSUES"
  | "COLLECTIONS"
  | "SUBJECTS";

export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO" | "GALLERY";

export type EmbedProvider = "YOUTUBE" | "VIMEO" | "SOUNDCLOUD";

export type BodyBlockKind =
  "PARAGRAPH" | "HEADING" | "QUOTE" | "IMAGE" | "EMBED" | "LIST";

export interface Author {
  name: string;
  affiliation?: string | null;
  avatarUrl?: string | null;
}

export interface MediaAsset {
  kind: MediaKind;
  url: string;
  poster?: string | null;
  alt?: string | null;
  caption?: string | null;
  durationSec?: number | null;
}

export interface BodyBlock {
  kind: BodyBlockKind;
  text?: string | null;
  attribution?: string | null;
  url?: string | null;
  caption?: string | null;
  provider?: EmbedProvider | null;
  ordered?: boolean | null;
  items?: string[] | null;
}

export interface NewsArticle {
  _id: string;
  slug: string;
  type: ContentType;
  section: Section;
  status: ContentStatus;

  title: string;
  standfirst?: string | null;
  excerpt?: string | null;

  author?: Author | null;
  publishedAt: string;
  updatedAt?: string | null;
  readingTime?: number | null;

  image?: MediaAsset | null;
  media?: MediaAsset | null;

  tags: string[];
  featured: boolean;
  hasBody: boolean;

  body: BodyBlock[];
  references: string[];
  related: NewsArticle[];
}

export interface NewsArticleFilter {
  type?: ContentType | null;
  section?: Section | null;
  status?: ContentStatus | null;
  tag?: string | null;
  featured?: boolean | null;
  search?: string | null;
  authorName?: string | null;
}

export interface PaginatedNewsArticles {
  items: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NewsArticleInput {
  slug: string;
  type: ContentType;
  section: Section;
  status?: ContentStatus;

  title: string;
  standfirst?: string;
  excerpt?: string;

  authorName?: string;
  authorAffiliation?: string;
  authorAvatarUrl?: string;

  publishedAt: string;
  readingTime?: number;

  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;

  mediaKind?: MediaKind;
  mediaUrl?: string;
  mediaPoster?: string;
  mediaDurationSec?: number;

  tags?: string[];
  featured?: boolean;

  body?: Partial<BodyBlock>[];
  references?: string[];
}
