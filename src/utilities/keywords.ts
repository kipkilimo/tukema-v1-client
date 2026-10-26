// client/src/utils/keywords.ts

/**
 * Lightweight keyword extraction for research clinic forms.
 *
 *   1. Normalise + lowercase all provided text.
 *   2. Split on non-letter boundaries.
 *   3. Drop a curated stopword list + short tokens.
 *   4. Count frequency, then weight title/objectives higher.
 *   5. Title-case the top N tokens for display.
 */

const STOPWORDS = new Set<string>([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "without",
  "from",
  "into",
  "onto",
  "over",
  "under",
  "between",
  "among",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "do",
  "does",
  "did",
  "doing",
  "have",
  "has",
  "had",
  "having",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "ought",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "there",
  "here",
  "where",
  "when",
  "why",
  "how",
  "which",
  "who",
  "whom",
  "whose",
  "what",
  "not",
  "no",
  "nor",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "only",
  "such",
  "own",
  "same",
  "any",
  "all",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "many",
  "much",
  "several",
  "via",
  "per",
  "study",
  "research",
  "aim",
  "objective",
  "objectives",
  "purpose",
  "method",
  "methods",
  "methodology",
  "approach",
  "analysis",
  "data",
  "results",
  "result",
  "paper",
  "project",
  "investigate",
  "investigation",
  "explore",
  "exploration",
  "assess",
  "assessment",
  "examine",
  "examination",
  "determine",
  "identify",
  "using",
  "used",
  "use",
  "based",
  "within",
  "across",
  "toward",
  "towards",
  "including",
  "include",
  "includes",
  "primary",
  "secondary",
  "current",
  "present",
  "future",
  "new",
  "novel",
  "existing",
  "potential",
  "possible",
  "selected",
  "chosen",
  "given",
  "various",
  "different",
  "similar",
  "specific",
  "general",
  "main",
  "key",
  "important",
  "significant",
  "relevant",
  "respective",
  "regarding",
  "concerning",
  "related",
  "associated",
  "whether",
  "however",
  "therefore",
  "thus",
  "hence",
  "moreover",
  "furthermore",
  "also",
  "yet",
  "et",
  "al",
  "etc",
  "eg",
  "ie",
  "vs",
]);

const MIN_TOKEN_LENGTH = 3;
const DEFAULT_MAX = 10;

function tokenise(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_TOKEN_LENGTH)
    .filter((t) => !STOPWORDS.has(t))
    .filter((t) => !/^\d+$/.test(t));
}

function titleCase(token: string): string {
  if (!token) return "";
  if (token.length <= 3) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1);
}

export interface KeywordExtractionInput {
  title?: string;
  purpose?: string;
  researchQuestion?: string;
  objectives?: string;
  methodology?: string;
  studyDesign?: string;
  researchArea?: string;
  /** Manual keywords already added by the user. Their casing wins. */
  existing?: string[];
  /** Max total keywords (default 10). */
  max?: number;
}

export interface KeywordExtractionResult {
  /** Final list: manual first, then auto; de-duplicated case-insensitively. */
  keywords: string[];
  /** Only the auto-generated ones (for preview chips / telemetry). */
  generated: string[];
}

export function extractKeywords(
  input: KeywordExtractionInput,
): KeywordExtractionResult {
  const {
    title = "",
    purpose = "",
    researchQuestion = "",
    objectives = "",
    methodology = "",
    studyDesign = "",
    researchArea = "",
    existing = [],
    max = DEFAULT_MAX,
  } = input;

  const weightedSources: Array<{ text: string; weight: number }> = [
    { text: title, weight: 3 },
    { text: researchQuestion, weight: 2 },
    { text: objectives, weight: 2 },
    { text: researchArea, weight: 2 },
    { text: studyDesign, weight: 2 },
    { text: purpose, weight: 1 },
    { text: methodology, weight: 1 },
  ];

  const scores = new Map<string, number>();
  const firstSeen = new Map<string, string>();

  for (const { text, weight } of weightedSources) {
    for (const token of tokenise(text)) {
      if (!firstSeen.has(token)) firstSeen.set(token, token);
      scores.set(token, (scores.get(token) ?? 0) + weight);
    }
  }

  const manualSet = new Set(existing.map((k) => k.trim().toLowerCase()));

  const ranked = [...scores.entries()]
    .filter(([token]) => !manualSet.has(token))
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      if (b[0].length !== a[0].length) return b[0].length - a[0].length;
      return a[0].localeCompare(b[0]);
    })
    .slice(0, Math.max(0, max - existing.length))
    .map(([token]) => titleCase(firstSeen.get(token) ?? token));

  const combined = [
    ...existing.map((k) => k.trim()).filter(Boolean),
    ...ranked,
  ];

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const k of combined) {
    const lower = k.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    deduped.push(k);
  }

  return { keywords: deduped, generated: ranked };
}
