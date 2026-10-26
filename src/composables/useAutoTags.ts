// composables/useAutoTags.ts

/**
 * Auto-tag generation for artefacts.
 *
 * Pipeline:
 *   1. Split the artefact into "documents": title, each description
 *      sentence, and a synthetic taxonomy document (category + subcategory
 *      + region + communities).
 *   2. Build a TF-IDF vector per document over stemmed unigrams.
 *   3. Build a weighted "whole artefact" vector by summing those per-doc
 *      vectors.
 *   4. Enumerate candidate tags as unigrams + adjacent-word bigrams,
 *      keeping each candidate's document-context vector.
 *   5. Score each candidate by cosine to the whole-artefact vector,
 *      multiplied by log-frequency, a title boost, and a bigram boost.
 *   6. Pick the top `max` (default 5) with MMR (cosine diversity) so the
 *      output isn't five near-synonyms of each other.
 *
 * Category and subcategory labels are always prepended to the output so
 * the tags reflect the taxonomy even when the title and description are
 * thin. The function is pure and unit-testable.
 */

export interface TagInput {
  title: string;
  description: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  region?: string;
  communities?: string[];
}

// --------------------------------------------------------------
// Stopwords
// --------------------------------------------------------------

/**
 * General English stopwords plus a handful of artefact-domain filler
 * ("piece", "item", "handmade", "traditional") that would otherwise
 * dominate TF-IDF for short descriptions.
 */
const STOP = new Set(
  `a an and are as at be by for from has have in is it its of on or that the this to was were will with
   into over under about after before between made make using used use via each their our your his her they
   them these those which who whom than then also can may more most other some such only own same so too very
   one two three new old piece item handmade traditional`.split(/\s+/),
);

// --------------------------------------------------------------
// Vector type — sparse maps keep memory small on long descriptions
// --------------------------------------------------------------

type Vec = Map<string, number>;

// --------------------------------------------------------------
// Text utilities
// --------------------------------------------------------------

const norm = (t: string): string =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

const tokenize = (t: string): string[] =>
  norm(t)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * Very light suffix stripping. We only handle the two most common English
 * plural forms; a full Porter stemmer would be overkill here and would
 * merge unrelated domain terms ("beads" → "bead" is wanted, but
 * "weaves" → "weave" should not collide with "weaving" in a way that
 * hurts similarity). Keeping it minimal avoids surprising merges.
 */
const stem = (w: string): string => {
  if (w.length > 3 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss"))
    return w.slice(0, -1);
  return w;
};

const usable = (w: string): boolean =>
  w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w);

// --------------------------------------------------------------
// Cosine similarity on sparse vectors
// --------------------------------------------------------------

function cosine(a: Vec, b: Vec): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    const o = b.get(k);
    if (o) dot += v * o;
  }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function addTo(target: Vec, src: Vec, w = 1): void {
  for (const [k, v] of src) target.set(k, (target.get(k) ?? 0) + v * w);
}

// --------------------------------------------------------------
// Internal document representation
// --------------------------------------------------------------

interface Doc {
  tokens: string[];
  weight: number;
  isTitle: boolean;
}

interface Cand {
  key: string; // stemmed key used for dedupe ("beaded necklace")
  surface: string; // surface form for display ("beaded necklace")
  ctx: Vec; // accumulated TF-IDF context across docs
  freq: number; // how often the surface form occurred
  inTitle: boolean;
  n: number; // 1 = unigram, 2 = bigram
  stems: string[]; // per-word stems for overlap checks
}

// --------------------------------------------------------------
// Public API
// --------------------------------------------------------------

/**
 * Generate up to `max` tags for an artefact.
 *
 * Always returns the category label and subcategory label first (if
 * provided), then up to `max - seeds.length` data-driven tags. The result
 * is de-duplicated and trimmed to `max`.
 */
export function generateTags(input: TagInput, max = 5): string[] {
  const seeds = [input.categoryLabel, input.subcategoryLabel]
    .map((s) => s?.trim().toLowerCase())
    .filter((s): s is string => !!s);

  // ---- 1. documents ----
  const docs: Doc[] = [];

  if (input.title) {
    docs.push({ tokens: tokenize(input.title), weight: 3, isTitle: true });
  }

  input.description
    .split(/[.!?\n;]+/)
    .filter((s) => s.trim())
    .forEach((s) =>
      docs.push({ tokens: tokenize(s), weight: 1, isTitle: false }),
    );

  const taxo = [
    input.categoryLabel,
    input.subcategoryLabel,
    input.region,
    ...(input.communities ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  if (taxo) {
    docs.push({ tokens: tokenize(taxo), weight: 2, isTitle: false });
  }

  if (!docs.length) return seeds.slice(0, max);

  // ---- 2. TF-IDF per doc ----
  const df = new Map<string, number>();
  const tfs = docs.map((d) => {
    const tf: Vec = new Map();
    for (const t of d.tokens) {
      if (!usable(t)) continue;
      const s = stem(t);
      tf.set(s, (tf.get(s) ?? 0) + 1);
    }
    for (const k of tf.keys()) df.set(k, (df.get(k) ?? 0) + 1);
    return tf;
  });

  const N = docs.length;
  const vecs = tfs.map((tf) => {
    const v: Vec = new Map();
    for (const [k, c] of tf) {
      v.set(k, c * (Math.log(1 + N / df.get(k)!) + 1));
    }
    return v;
  });

  // Whole-artefact vector: weighted sum of the per-doc vectors.
  const global: Vec = new Map();
  vecs.forEach((v, i) => addTo(global, v, docs[i].weight));

  // ---- 3. candidate enumeration ----
  const cands = new Map<string, Cand>();
  const seen = new Set<string>(); // per-doc dedupe of ctx accumulation

  docs.forEach((d, di) => {
    seen.clear();

    const add = (words: string[]) => {
      const stems = words.map(stem);
      const key = stems.join(" ");
      let c = cands.get(key);
      if (!c) {
        c = {
          key,
          surface: words.join(" "),
          ctx: new Map(),
          freq: 0,
          inTitle: false,
          n: words.length,
          stems,
        };
        cands.set(key, c);
      }
      c.freq++;
      if (d.isTitle) c.inTitle = true;
      // Only accumulate ctx once per (doc, candidate) pair so a repeated
      // word in one sentence doesn't get double-counted.
      if (!seen.has(key)) {
        seen.add(key);
        addTo(c.ctx, vecs[di], d.weight);
      }
    };

    for (let i = 0; i < d.tokens.length; i++) {
      const w = d.tokens[i];
      if (!usable(w)) continue;

      add([w]);

      const nx = d.tokens[i + 1];
      if (nx && usable(nx)) add([w, nx]);
    }
  });

  // ---- 4. score ----
  const seedKeys = new Set(seeds.map((s) => tokenize(s).map(stem).join(" ")));

  const scored = [...cands.values()]
    .filter((c) => !seedKeys.has(c.key))
    // A bigram that only ever appears once is almost always noise (e.g.
    // "using traditional" from a throwaway phrase). Keep bigrams that
    // recur or appear in the title.
    .filter((c) => c.n === 1 || c.freq > 1 || c.inTitle)
    .map((c) => ({
      c,
      score:
        cosine(c.ctx, global) *
        (1 + Math.log(1 + c.freq)) *
        (c.inTitle ? 1.5 : 1) *
        (c.n === 2 ? 1.15 : 1),
    }))
    .sort((a, b) => b.score - a.score);

  // ---- 5. MMR selection ----
  const picked: typeof scored = [];
  const pool = scored.slice(0, 40);
  const top = pool[0]?.score || 1;
  const lambda = 0.7;

  const overlaps = (a: Cand, b: Cand): boolean =>
    a.stems.every((s) => b.stems.includes(s)) ||
    b.stems.every((s) => a.stems.includes(s));

  const want = Math.max(0, max - seeds.length);

  while (picked.length < want && pool.length) {
    let best = -1;
    let bestVal = -Infinity;

    pool.forEach((p, i) => {
      // Skip anything that's a token-superset/subset of an already-picked
      // candidate — otherwise "bead" and "beaded necklace" both get in.
      if (picked.some((q) => overlaps(p.c, q.c))) return;

      const redundancy = picked.length
        ? Math.max(...picked.map((q) => cosine(p.c.ctx, q.c.ctx)))
        : 0;
      const val = lambda * (p.score / top) - (1 - lambda) * redundancy;

      if (val > bestVal) {
        bestVal = val;
        best = i;
      }
    });

    if (best < 0) break;
    picked.push(pool.splice(best, 1)[0]);
  }

  // ---- 6. combine and trim ----
  return [...new Set([...seeds, ...picked.map((p) => p.c.surface)])].slice(
    0,
    max,
  );
}
