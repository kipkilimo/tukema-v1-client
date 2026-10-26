// types/computing-article.ts

// ============================================
// ENUMS
// ============================================

export enum ArticleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  SCHEDULED = "SCHEDULED",
}

export enum ArticleVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED",
}

export enum ArticleCategory {
  EPIDEMIOLOGY = "EPIDEMIOLOGY",
  BIOSTATISTICS = "BIOSTATISTICS",
  COMPUTATIONAL_METHODS = "COMPUTATIONAL_METHODS",
  MATHEMATICAL_MODELING = "MATHEMATICAL_MODELING",
  INFECTIOUS_DISEASE_MODELING = "INFECTIOUS_DISEASE_MODELING",
  CAUSAL_INFERENCE = "CAUSAL_INFERENCE",
  DATA_SCIENCE = "DATA_SCIENCE",
  SYSTEMS_MODELING = "SYSTEMS_MODELING",
  SPATIAL_EPIDEMIOLOGY = "SPATIAL_EPIDEMIOLOGY",
  GENOMIC_EPIDEMIOLOGY = "GENOMIC_EPIDEMIOLOGY",
  TUTORIAL = "TUTORIAL",
  SOFTWARE_REVIEW = "SOFTWARE_REVIEW",
  CASE_STUDY = "CASE_STUDY",
}

export enum LearningLevel {
  BASIC = "BASIC",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum SoftwareType {
  R = "R",
  STATA = "STATA",
  PYTHON = "PYTHON",
  JULIA = "JULIA",
  MATLAB = "MATLAB",
  SAS = "SAS",
}

export enum CodeBlockLanguage {
  R = "R",
  PYTHON = "PYTHON",
  STATA = "STATA",
  JULIA = "JULIA",
  MATLAB = "MATLAB",
  SAS = "SAS",
  BASH = "BASH",
  SQL = "SQL",
  JAVASCRIPT = "JAVASCRIPT",
  TYPESCRIPT = "TYPESCRIPT",
  HTML = "HTML",
  CSS = "CSS",
  JSON = "JSON",
  YAML = "YAML",
  MARKDOWN = "MARKDOWN",
  TEXT = "TEXT",
}

export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  INSIGHTFUL = "INSIGHTFUL",
  CURIOUS = "CURIOUS",
  THANK_YOU = "THANK_YOU",
  DISAGREE = "DISAGREE",
}

export enum ArticleOrderBy {
  NEWEST = "NEWEST",
  OLDEST = "OLDEST",
  MOST_VIEWED = "MOST_VIEWED",
  MOST_LIKED = "MOST_LIKED",
  MOST_COMMENTED = "MOST_COMMENTED",
  TRENDING = "TRENDING",
  READING_TIME = "READING_TIME",
}

// ============================================
// CORE TYPES
// ============================================

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

export interface CodeBlock {
  language: CodeBlockLanguage;
  code: string;
  caption?: string;
  highlightedLines?: number[];
  output?: string;
  filename?: string;
}

export interface ImageContent {
  url: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface EmbedContent {
  type: string;
  url: string;
  embedId?: string;
  title?: string;
}

export interface ContentStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlight?: boolean;
  textColor?: string;
  backgroundColor?: string;
  alignment?: string;
  fontSize?: string;
}

export interface RichTextContent {
  type: string; // "paragraph", "heading", "code", "list", "quote", "image", "embed"
  content?: string;
  level?: number; // For headings (1-6)
  codeBlock?: CodeBlock;
  items?: string[]; // For lists
  image?: ImageContent;
  embed?: EmbedContent;
  styles?: ContentStyles;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
  count: number;
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
  articles: Article[];
  articleCount: number;
}

export interface ArticleReadingStats {
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

export interface ArticleComment {
  id: string;
  content: string;
  author: ArticleAuthor;
  createdAt: string;
  updatedAt?: string;
  replies: ArticleComment[];
  parentId?: string;
  isPinned: boolean;
  reactions: ArticleReaction[];
}

export interface ArticleReaction {
  id: string;
  type: ReactionType;
  author: ArticleAuthor;
  createdAt: string;
}

export interface ArticleView {
  id: string;
  sessionId: string;
  viewedAt: string;
  readTimeSeconds: number;
  scrollDepth: number;
  referrer?: string;
  userAgent?: string;
}

export interface ArticleReference {
  id: string;
  title: string;
  url: string;
  authors?: string;
  year?: number;
  journal?: string;
  doi?: string;
  note?: string;
}

// ============================================
// MAIN ARTICLE TYPE
// ============================================

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: RichTextContent[];
  plainTextContent: string;
  excerpt: string;
  coverImage?: ImageContent;
  author: ArticleAuthor;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  categories: ArticleCategoryInfo[];
  tags: ArticleTag[];
  learningLevel?: LearningLevel;
  software?: SoftwareType[];
  topics?: string[]; // Topic references from computational epidemiology catalogue

  // Series
  series?: ArticleSeries;

  // Stats
  readingStats: ArticleReadingStats;
  analytics: ArticleAnalytics;
  comments: ArticleComment[];

  // Dates
  publishedAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  createdAt: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;

  // Related
  relatedArticles: Article[];
  references: ArticleReference[];

  // Versioning
  version: number;
  previousVersionId?: string;
  changelog?: string;
}

export interface AuthorAnalytics {
  authorId: string;
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgReadingTime: number;
  engagementScore: number;
  topPerformingArticles: Article[];
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateArticleInput {
  title: string;
  subtitle?: string;
  content: RichTextContent[];
  excerpt: string;
  coverImage?: ImageContent;
  categories: string[];
  tags: string[];
  learningLevel?: LearningLevel;
  software?: SoftwareType[];
  topics?: string[];
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  references?: ArticleReference[];
  seriesId?: string;
  isPartOfSeries?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  subtitle?: string;
  content?: RichTextContent[];
  excerpt?: string;
  coverImage?: ImageContent;
  categories?: string[];
  tags?: string[];
  learningLevel?: LearningLevel;
  software?: SoftwareType[];
  topics?: string[];
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  references?: ArticleReference[];
  changelog?: string;
}

export interface ArticlePagination {
  articles: Article[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface ArticleSearchResult {
  article: Article;
  relevance: number;
  matchedFields: string[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function calculateReadingTime(content: RichTextContent[]): number {
  const textContent = content
    .filter((block) => block.type === "paragraph" || block.type === "heading")
    .map((block) => block.content || "")
    .join(" ");

  const words = textContent.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function countCodeBlocks(content: RichTextContent[]): number {
  return content.filter((block) => block.type === "code").length;
}

export function getPlainText(content: RichTextContent[]): string {
  return content
    .map((block) => {
      if (block.type === "paragraph" || block.type === "heading") {
        return block.content || "";
      }
      if (block.type === "code" && block.codeBlock) {
        return `\n\`\`\`${block.codeBlock.language}\n${block.codeBlock.code}\n\`\`\`\n`;
      }
      if (block.type === "list" && block.items) {
        return block.items.map((item) => `• ${item}`).join("\n");
      }
      if (block.type === "quote") {
        return `> ${block.content || ""}`;
      }
      return "";
    })
    .join("\n")
    .trim();
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================
// TYPE GUARDS
// ============================================

export function isArticle(obj: any): obj is Article {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.slug === "string" &&
    typeof obj.content === "object" &&
    Array.isArray(obj.content) &&
    typeof obj.excerpt === "string"
  );
}

export function isCodeBlock(obj: any): obj is CodeBlock {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.language === "string" &&
    typeof obj.code === "string"
  );
}
