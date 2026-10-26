// src/types/computingArticle.ts

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
export type ArticleVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";
export type LearningLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";
export type SoftwareType =
  "R" | "PYTHON" | "STATA" | "MATLAB" | "JULIA" | "SQL" | "BASH";
export type CodeBlockLanguage =
  | "R"
  | "PYTHON"
  | "STATA"
  | "JULIA"
  | "MATLAB"
  | "SAS"
  | "BASH"
  | "SQL"
  | "JAVASCRIPT"
  | "TYPESCRIPT"
  | "HTML"
  | "CSS"
  | "JSON"
  | "YAML"
  | "MARKDOWN"
  | "TEXT";

export type ContentBlockType =
  | "PARAGRAPH"
  | "HEADING"
  | "CODE"
  | "LIST"
  | "QUOTE"
  | "CALLOUT"
  | "IMAGE"
  | "FIGURE"
  | "TABLE"
  | "EQUATION"
  | "EMBED"
  | "DIVIDER";

export type ReactionType =
  "LIKE" | "LOVE" | "INSIGHTFUL" | "CURIOUS" | "THANK_YOU" | "DISAGREE";

export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  youtube?: string;
}

export interface ArticleAuthor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  socialLinks?: SocialLinks;
}

export interface ReadingStats {
  readingTimeMinutes: number;
  wordCount: number;
  codeBlockCount: number;
  lastReadAt?: string;
}

export interface ArticleAnalytics {
  views: number;
  uniqueViews: number;
  likes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  readingTimeAverage?: number;
  engagementScore?: number;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface ArticleCategoryInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ArticleSeries {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  articles?: IComputingArticle[];
}

export interface IArticleReference {
  id: string;
  title: string;
  url: string;
  description?: string;
  type?: string;
  authors?: string;
  year?: number;
  journal?: string;
  doi?: string;
  note?: string;
}

export interface IArticleReaction {
  id: string;
  type: ReactionType;
  author: ArticleAuthor;
  createdAt: string;
}

export interface IArticleComment {
  id: string;
  content: string;
  author: ArticleAuthor;
  parentId?: string;
  isPinned: boolean;
  isEdited?: boolean;
  replies?: IArticleComment[];
  reactions?: IArticleReaction[];
  createdAt: string;
  updatedAt?: string;
}

export interface IArticleView {
  id: string;
  sessionId: string;
  readTimeSeconds: number;
  scrollDepth: number;
  referrer?: string;
  userAgent?: string;
  viewedAt: string;
}

export interface IComputingArticle {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: any[];
  plainTextContent?: string;
  excerpt: string;
  coverImage?: { url: string; alt: string; caption?: string };
  author: ArticleAuthor;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  categories: ArticleCategoryInfo[];
  tags: ArticleTag[];
  learningLevel: LearningLevel;
  software: SoftwareType[];
  topics?: string[];
  primaryTopic?: { id: string; title: string };
  relatedTopics?: Array<{ id: string; title: string }>;
  series?: ArticleSeries;
  readingStats?: ReadingStats;
  analytics: ArticleAnalytics;
  references?: IArticleReference[];
  comments?: IArticleComment[];
  reactions?: IArticleReaction[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  relatedArticles?: string[];
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  previousVersionId?: string;
  changelog?: string;
}

export interface CreateArticleInput {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: any[];
  coverImage?: { url: string; alt: string; caption?: string };
  primaryTopicId: string;
  relatedTopicIds?: string[];
  categories: string[];
  tags?: string[];
  software?: SoftwareType[];
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  references?: Array<{
    title: string;
    url: string;
    authors?: string;
    year?: number;
    journal?: string;
    doi?: string;
    note?: string;
  }>;
  seriesId?: string;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  changelog?: string;
}

export interface ArticleListResponse {
  articles: IComputingArticle[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface SearchArticlesResponse {
  articles: IComputingArticle[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface ArticleAnalyticsResponse {
  views: number;
  uniqueViews: number;
  likes: number;
  bookmarks: number;
  shares: number;
  comments: number;
  readingTimeAverage?: number;
  engagementScore?: number;
}

export interface AuthorAnalyticsResponse {
  authorId: string;
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgReadingTime: number;
  engagementScore: number;
  topPerformingArticles: IComputingArticle[];
}

export interface AddCommentInput {
  content: string;
  parentId?: string;
}

export interface AddReactionInput {
  articleId: string;
  type: ReactionType;
}
