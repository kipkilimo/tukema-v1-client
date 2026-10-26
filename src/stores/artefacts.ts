// stores/artefacts.ts
import { defineStore } from "pinia";
import { gql } from "graphql-tag";
import { apolloClient } from "@/graphql/apolloClient";

// ============================================
// TYPES — mirror artefactTypedefs.ts exactly
// ============================================

export type ArtefactStatus = "draft" | "published" | "archived";

/** Taxonomy slugs are plain strings (e.g. "rites-of-passage"). */
export type CategorySlug = string;
export type SubcategorySlug = string;

export interface TaxonomySubcategory {
  slug: SubcategorySlug;
  label: string;
}

export interface TaxonomyCategory {
  slug: CategorySlug;
  label: string;
  children: TaxonomySubcategory[];
}

export interface Artefact {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategorySlug;
  subcategory?: SubcategorySlug | null;
  communities: string[];
  region?: string | null;
  price: number;
  currency: string;
  mediaUrls: string[];
  createdBy?: string | null;
  status: ArtefactStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtefactConnection {
  edges: Artefact[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface ArtefactFilterInput {
  category?: CategorySlug | null;
  subcategory?: SubcategorySlug | null;
  /** Matches artefacts having ANY of these communities */
  communities?: string[] | null;
  region?: string | null;
  status?: ArtefactStatus | null;
  tags?: string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  currency?: string | null;
  search?: string | null;
}

export interface CreateArtefactInput {
  title: string;
  slug?: string | null;
  description: string;
  category: CategorySlug;
  subcategory?: SubcategorySlug | null;
  communities?: string[] | null;
  region?: string | null;
  price: number;
  currency?: string | null;
  mediaUrls?: string[] | null;
  status?: ArtefactStatus | null;
  tags?: string[] | null;
}

export interface UpdateArtefactInput {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  category?: CategorySlug | null;
  /** Send null explicitly to clear the subcategory. */
  subcategory?: SubcategorySlug | null;
  communities?: string[] | null;
  region?: string | null;
  price?: number | null;
  currency?: string | null;
  mediaUrls?: string[] | null;
  status?: ArtefactStatus | null;
  tags?: string[] | null;
}

export interface ListArtefactsArgs {
  filter?: ArtefactFilterInput;
  limit?: number;
  offset?: number;
}

export type ThumbItem = Pick<
  Artefact,
  "id" | "title" | "slug" | "category" | "subcategory" | "mediaUrls"
>;

// ============================================
// GRAPHQL DOCUMENTS
// ============================================

const ARTEFACT_FIELDS = gql`
  fragment ArtefactFields on Artefact {
    id
    title
    slug
    description
    category
    subcategory
    communities
    region
    price
    currency
    mediaUrls
    createdBy
    status
    tags
    createdAt
    updatedAt
  }
`;

const GET_TAXONOMY = gql`
  query GetTaxonomy {
    taxonomy {
      slug
      label
      children {
        slug
        label
      }
    }
  }
`;

const GET_ARTEFACT = gql`
  ${ARTEFACT_FIELDS}
  query GetArtefact($id: ID!) {
    artefact(id: $id) {
      ...ArtefactFields
    }
  }
`;

const GET_ARTEFACT_BY_SLUG = gql`
  ${ARTEFACT_FIELDS}
  query GetArtefactBySlug($slug: String!) {
    artefactBySlug(slug: $slug) {
      ...ArtefactFields
    }
  }
`;

const LIST_ARTEFACTS = gql`
  ${ARTEFACT_FIELDS}
  query ListArtefacts($filter: ArtefactFilterInput, $limit: Int, $offset: Int) {
    artefacts(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        ...ArtefactFields
      }
      totalCount
      hasNextPage
    }
  }
`;

const LIST_THUMBS = gql`
  query ListArtefactThumbs(
    $filter: ArtefactFilterInput
    $limit: Int
    $offset: Int
  ) {
    artefacts(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        title
        slug
        category
        subcategory
        mediaUrls
      }
      totalCount
      hasNextPage
    }
  }
`;

const LIST_MY_ARTEFACTS = gql`
  ${ARTEFACT_FIELDS}
  query ListMyArtefacts($creatorId: ID!, $limit: Int, $offset: Int) {
    myArtefacts(creatorId: $creatorId, limit: $limit, offset: $offset) {
      ...ArtefactFields
    }
  }
`;

const CREATE_ARTEFACT = gql`
  ${ARTEFACT_FIELDS}
  mutation CreateArtefact($input: CreateArtefactInput!) {
    createArtefact(input: $input) {
      ...ArtefactFields
    }
  }
`;

const UPDATE_ARTEFACT = gql`
  ${ARTEFACT_FIELDS}
  mutation UpdateArtefact($id: ID!, $input: UpdateArtefactInput!) {
    updateArtefact(id: $id, input: $input) {
      ...ArtefactFields
    }
  }
`;

const PUBLISH_ARTEFACT = gql`
  ${ARTEFACT_FIELDS}
  mutation PublishArtefact($id: ID!) {
    publishArtefact(id: $id) {
      ...ArtefactFields
    }
  }
`;

const ARCHIVE_ARTEFACT = gql`
  ${ARTEFACT_FIELDS}
  mutation ArchiveArtefact($id: ID!) {
    archiveArtefact(id: $id) {
      ...ArtefactFields
    }
  }
`;

const DELETE_ARTEFACT = gql`
  mutation DeleteArtefact($id: ID!) {
    deleteArtefact(id: $id)
  }
`;

// ============================================
// STORE
// ============================================

export const useArtefactsStore = defineStore("artefacts", {
  state: () => ({
    // Category / subcategory tree from the server (loaded once)
    taxonomy: [] as TaxonomyCategory[],
    taxonomyLoaded: false,
    currentArtefact: null as Artefact | null,

    // Cache of artefacts by id — single source of truth for detail + list items
    byId: {} as Record<string, Artefact>,

    // Currently-open artefact
    current: null as Artefact | null,

    // List query state
    list: [] as Artefact[],
    totalCount: 0,
    hasNextPage: false,

    // Last filter/limit/offset used, so `loadMore` can reuse them
    lastListArgs: {
      filter: undefined as ArtefactFilterInput | undefined,
      limit: 20,
      offset: 0,
    } as ListArtefactsArgs,

    // myArtefacts state (per-creator; only the signed-in creator matters)
    my: [] as Artefact[],
    myCreatorId: null as string | null,

    // Expanded state to fix NaN and pagination for the creator dashboard
    myTotalCount: 0,
    myHasNextPage: false,
    myLastArgs: {
      creatorId: null as string | null,
      limit: 20,
      offset: 0,
    },

    // UI status
    loading: false,
    saving: false,
    error: null as string | null,
  }),

  getters: {
    /** Artefacts from the current list, ordered as received from server. */
    items: (state): Artefact[] => state.list,

    /** Full artefacts for the current `myArtefacts` list. */
    myItems: (state): Artefact[] => state.my,

    /** Look up a cached artefact by id. */
    getById:
      (state) =>
      (id: string): Artefact | undefined =>
        state.byId[id],

    /** Whether more pages exist in the current list query. */
    canLoadMore: (state): boolean => state.hasNextPage,

    /** Whether more pages exist in the creator list. */
    canLoadMoreMy: (state): boolean => state.myHasNextPage,

    /** Convenience: number of items currently in memory. */
    count: (state): number => state.list.length,

    // ---------- taxonomy ----------

    /** Top-level categories, for filters and form dropdowns. */
    categories: (state): TaxonomyCategory[] => state.taxonomy,

    /** Subcategories of a category (empty array if unknown). */
    subcategoriesOf:
      (state) =>
      (category: CategorySlug | null | undefined): TaxonomySubcategory[] =>
        state.taxonomy.find((c) => c.slug === category)?.children ?? [],

    /** Human label for a category slug (falls back to the slug). */
    categoryLabel:
      (state) =>
      (slug: CategorySlug): string =>
        state.taxonomy.find((c) => c.slug === slug)?.label ?? slug,

    /** Human label for a subcategory slug (falls back to the slug). */
    subcategoryLabel:
      (state) =>
      (category: CategorySlug, slug: SubcategorySlug): string =>
        state.taxonomy
          .find((c) => c.slug === category)
          ?.children.find((s) => s.slug === slug)?.label ?? slug,

    /** True if `subcategory` belongs to `category` (client-side pre-check). */
    isValidSubcategory:
      (state) =>
      (category: CategorySlug, subcategory: SubcategorySlug): boolean =>
        !!state.taxonomy
          .find((c) => c.slug === category)
          ?.children.some((s) => s.slug === subcategory),

    // ---------- grouping ----------

    /** Group by status for admin dashboards. */
    byStatus: (state) => {
      const groups: Record<ArtefactStatus, Artefact[]> = {
        draft: [],
        published: [],
        archived: [],
      };
      for (const a of state.list) groups[a.status].push(a);
      return groups;
    },

    /**
     * Group the current list by top-level category slug.
     * Seeded with every known category (so empty ones still appear),
     * and tolerant of slugs the taxonomy doesn't know about.
     */
    byCategory: (state): Record<CategorySlug, Artefact[]> => {
      const groups: Record<CategorySlug, Artefact[]> = {};
      for (const c of state.taxonomy) groups[c.slug] = [];
      for (const a of state.list) (groups[a.category] ??= []).push(a);
      return groups;
    },

    /** Group the current list by subcategory slug (uncategorised -> "none"). */
    bySubcategory: (state): Record<SubcategorySlug | "none", Artefact[]> => {
      const groups: Record<string, Artefact[]> = {};
      for (const a of state.list) {
        (groups[a.subcategory ?? "none"] ??= []).push(a);
      }
      return groups;
    },

    /** Distinct communities present in the current list, sorted. */
    communitiesInList: (state): string[] => {
      const set = new Set<string>();
      for (const a of state.list) for (const c of a.communities) set.add(c);
      return [...set].sort((x, y) => x.localeCompare(y));
    },
  },

  actions: {
    // ---------- internal helpers ----------

    /** Merge artefacts into the byId cache (does not touch list/my). */
    _upsertMany(artefacts: Artefact[]) {
      for (const a of artefacts) this.byId[a.id] = a;
    },

    /** Replace an artefact inside `list`, `my`, `current` and `currentArtefact` if present. */
    _replaceInLists(artefact: Artefact) {
      const li = this.list.findIndex((a) => a.id === artefact.id);
      if (li >= 0) this.list.splice(li, 1, artefact);

      const mi = this.my.findIndex((a) => a.id === artefact.id);
      if (mi >= 0) this.my.splice(mi, 1, artefact);

      if (this.current?.id === artefact.id) this.current = artefact;
      if (this.currentArtefact?.id === artefact.id)
        this.currentArtefact = artefact;
    },

    /** Remove an artefact from all in-memory collections. */
    _removeFromAll(id: string) {
      this.list = this.list.filter((a) => a.id !== id);
      this.my = this.my.filter((a) => a.id !== id);
      delete this.byId[id];
      if (this.current?.id === id) this.current = null;
      if (this.currentArtefact?.id === id) this.currentArtefact = null;
    },

    /**
     * Promote a full artefact to the "active" slots.
     * Used whenever a single artefact is fetched in full.
     */
    _setCurrent(artefact: Artefact) {
      this.byId[artefact.id] = artefact;
      this.current = artefact;
      this.currentArtefact = artefact;
    },

    _clearError() {
      this.error = null;
    },

    _handleError(e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Unknown error";
      this.error = msg;
      // Re-throw so callers can show their own toast / dialog
      throw e instanceof Error ? e : new Error(msg);
    },

    // ---------- queries ----------

    /** Load the category tree once; pass force=true to refetch. */
    async fetchTaxonomy(force = false): Promise<TaxonomyCategory[]> {
      if (this.taxonomyLoaded && !force) return this.taxonomy;

      this._clearError();
      try {
        const { data } = await apolloClient.query({
          query: GET_TAXONOMY,
          fetchPolicy: force ? "network-only" : "cache-first",
        });
        this.taxonomy = data?.taxonomy ?? [];
        this.taxonomyLoaded = true;
        return this.taxonomy;
      } catch (e) {
        this._handleError(e);
        return [];
      }
    },

    /** Fetch a single artefact by id, with cache-first fallback to network. */
    async fetchArtefact(id: string, force = false): Promise<Artefact | null> {
      if (!force) {
        const cached = this.byId[id];
        if (cached) {
          // Cache-hit still counts as "fetched in full" for the UI.
          this._setCurrent(cached);
          return cached;
        }
      }

      this.loading = true;
      this._clearError();
      try {
        const { data } = await apolloClient.query({
          query: GET_ARTEFACT,
          variables: { id },
          fetchPolicy: force ? "network-only" : "cache-first",
        });
        const artefact: Artefact | null = data?.artefact ?? null;
        if (artefact) this._setCurrent(artefact);
        return artefact;
      } catch (e) {
        this._handleError(e);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /** Fetch a single artefact by slug (storefront lookup). */
    async fetchArtefactBySlug(
      slug: string,
      force = false,
    ): Promise<Artefact | null> {
      this.loading = true;
      this._clearError();
      try {
        const { data } = await apolloClient.query({
          query: GET_ARTEFACT_BY_SLUG,
          variables: { slug },
          fetchPolicy: force ? "network-only" : "cache-first",
        });
        const artefact: Artefact | null = data?.artefactBySlug ?? null;
        if (artefact) this._setCurrent(artefact);
        return artefact;
      } catch (e) {
        this._handleError(e);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch a page of artefacts.
     * - First call (or `reset=true`) replaces `list`.
     * - `append=true` appends (used by "load more").
     */
    async fetchArtefacts(
      args: ListArtefactsArgs = {},
      opts: { append?: boolean; reset?: boolean } = {},
    ): Promise<ArtefactConnection> {
      const filter = args.filter;
      const limit = args.limit ?? 20;
      const offset = args.offset ?? 0;

      this.lastListArgs = { filter, limit, offset };
      if (opts.reset) {
        this.list = [];
        this.byId = {};
      }

      this.loading = true;
      this._clearError();
      try {
        const { data } = await apolloClient.query({
          query: LIST_ARTEFACTS,
          variables: { filter, limit, offset },
          fetchPolicy: "network-only",
        });

        const conn: ArtefactConnection = data?.artefacts ?? {
          edges: [],
          totalCount: 0,
          hasNextPage: false,
        };

        this._upsertMany(conn.edges);

        if (opts.append) {
          // Deduplicate by id in case a page overlaps
          const seen = new Set(this.list.map((a) => a.id));
          for (const a of conn.edges) {
            if (!seen.has(a.id)) {
              this.list.push(a);
              seen.add(a.id);
            }
          }
        } else {
          this.list = conn.edges;
        }

        this.totalCount = conn.totalCount;
        this.hasNextPage = conn.hasNextPage;

        return conn;
      } catch (e) {
        this._handleError(e);
        return { edges: [], totalCount: 0, hasNextPage: false };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch a page of light artefact thumbnails for the filmstrip.
     */
    async fetchThumbs(args: {
      filter: ArtefactFilterInput;
      limit: number;
      offset: number;
    }): Promise<{
      edges: ThumbItem[];
      totalCount: number;
      hasNextPage: boolean;
    }> {
      const { data } = await apolloClient.query({
        query: LIST_THUMBS,
        variables: args,
        fetchPolicy: "network-only",
      });
      return (
        data?.artefacts ?? { edges: [], totalCount: 0, hasNextPage: false }
      );
    },

    /**
     * Convenience: browse by category (and optionally subcategory /
     * communities), starting from page one.
     */
    async browse(
      selection: {
        category?: CategorySlug | null;
        subcategory?: SubcategorySlug | null;
        communities?: string[] | null;
      } = {},
      extra: Omit<
        ArtefactFilterInput,
        "category" | "subcategory" | "communities"
      > = {},
      limit = 20,
    ): Promise<ArtefactConnection> {
      const filter: ArtefactFilterInput = { ...extra };
      if (selection.category) filter.category = selection.category;
      // A subcategory is only meaningful alongside its category
      if (selection.category && selection.subcategory) {
        filter.subcategory = selection.subcategory;
      }
      if (selection.communities?.length) {
        filter.communities = selection.communities;
      }
      return this.fetchArtefacts({ filter, limit, offset: 0 }, { reset: true });
    },

    /** Load the next page using the last filter/limit. */
    async loadMore(): Promise<ArtefactConnection> {
      if (!this.hasNextPage || this.loading) {
        return { edges: [], totalCount: this.totalCount, hasNextPage: false };
      }
      const nextOffset = this.list.length;
      return this.fetchArtefacts(
        {
          filter: this.lastListArgs.filter,
          limit: this.lastListArgs.limit,
          offset: nextOffset,
        },
        { append: true },
      );
    },

    /**
     * Fetch a page of the creator's own artefacts.
     * Supports resetting the list or appending (for "Load more").
     */
    async fetchMyArtefacts(
      creatorId: string,
      args: { limit?: number; offset?: number } = {},
      opts: { append?: boolean; reset?: boolean } = {},
    ): Promise<Artefact[]> {
      const limit = args.limit ?? 20;
      const offset = args.offset ?? 0;

      this.myCreatorId = creatorId;
      this.myLastArgs = { creatorId, limit, offset };

      if (opts.reset) {
        this.my = [];
      }

      this.loading = true;
      this._clearError();
      try {
        const { data } = await apolloClient.query({
          query: LIST_MY_ARTEFACTS,
          variables: { creatorId, limit, offset },
          fetchPolicy: "network-only",
        });

        const items: Artefact[] = data?.myArtefacts ?? [];
        this._upsertMany(items);

        if (opts.append) {
          const seen = new Set(this.my.map((a) => a.id));
          for (const a of items) {
            if (!seen.has(a.id)) {
              this.my.push(a);
              seen.add(a.id);
            }
          }
        } else {
          this.my = items;
        }

        // Since myArtefacts returns a flat array, infer pagination state
        this.myTotalCount = this.my.length;
        this.myHasNextPage = items.length === limit;

        return items;
      } catch (e) {
        this._handleError(e);
        return [];
      } finally {
        this.loading = false;
      }
    },

    /** Load the next page of the creator's own artefacts. */
    async loadMoreMy(): Promise<Artefact[]> {
      if (!this.myHasNextPage || this.loading) return [];
      const { creatorId, limit } = this.myLastArgs;
      if (!creatorId) return [];

      return this.fetchMyArtefacts(
        creatorId,
        { limit, offset: this.my.length },
        { append: true },
      );
    },

    // ---------- mutations ----------

    async createArtefact(input: CreateArtefactInput): Promise<Artefact> {
      this.saving = true;
      this._clearError();
      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_ARTEFACT,
          variables: { input },
        });
        const artefact: Artefact = data!.createArtefact;

        this.byId[artefact.id] = artefact;
        this.list.unshift(artefact);
        this.totalCount += 1;

        if (this.myCreatorId) {
          this.my.unshift(artefact);
          this.myTotalCount += 1;
        }

        // The freshly created artefact becomes the "active" one — the
        // artefact dialog and detail view read from these refs.
        this._setCurrent(artefact);

        return artefact;
      } catch (e) {
        this._handleError(e);
        throw e as Error;
      } finally {
        this.saving = false;
      }
    },

    async updateArtefact(
      id: string,
      input: UpdateArtefactInput,
    ): Promise<Artefact> {
      this.saving = true;
      this._clearError();
      try {
        const { data } = await apolloClient.mutate({
          mutation: UPDATE_ARTEFACT,
          variables: { id, input },
        });
        // The server may clear a subcategory when the category changes,
        // so always trust the returned document.
        const artefact: Artefact = data!.updateArtefact;
        this.byId[artefact.id] = artefact;
        this._replaceInLists(artefact);
        return artefact;
      } catch (e) {
        this._handleError(e);
        throw e as Error;
      } finally {
        this.saving = false;
      }
    },

    async publishArtefact(id: string): Promise<Artefact> {
      this.saving = true;
      this._clearError();
      try {
        const { data } = await apolloClient.mutate({
          mutation: PUBLISH_ARTEFACT,
          variables: { id },
        });
        const artefact: Artefact = data!.publishArtefact;
        this.byId[artefact.id] = artefact;
        this._replaceInLists(artefact);
        return artefact;
      } catch (e) {
        this._handleError(e);
        throw e as Error;
      } finally {
        this.saving = false;
      }
    },

    async archiveArtefact(id: string): Promise<Artefact> {
      this.saving = true;
      this._clearError();
      try {
        const { data } = await apolloClient.mutate({
          mutation: ARCHIVE_ARTEFACT,
          variables: { id },
        });
        const artefact: Artefact = data!.archiveArtefact;
        this.byId[artefact.id] = artefact;
        this._replaceInLists(artefact);
        return artefact;
      } catch (e) {
        this._handleError(e);
        throw e as Error;
      } finally {
        this.saving = false;
      }
    },

    async deleteArtefact(id: string): Promise<boolean> {
      this.saving = true;
      this._clearError();
      try {
        const { data } = await apolloClient.mutate({
          mutation: DELETE_ARTEFACT,
          variables: { id },
        });
        const ok = Boolean(data?.deleteArtefact);
        if (ok) {
          const wasInMy = this.my.some((a) => a.id === id);
          this._removeFromAll(id);
          this.totalCount = Math.max(0, this.totalCount - 1);
          if (wasInMy) this.myTotalCount = Math.max(0, this.myTotalCount - 1);
        }
        return ok;
      } catch (e) {
        this._handleError(e);
        throw e as Error;
      } finally {
        this.saving = false;
      }
    },

    // ---------- state utilities ----------

    clearCurrent() {
      this.current = null;
      this.currentArtefact = null;
    },

    clearList() {
      this.list = [];
      this.totalCount = 0;
      this.hasNextPage = false;
      this.lastListArgs = { filter: undefined, limit: 20, offset: 0 };
    },

    clearMy() {
      this.my = [];
      this.myCreatorId = null;
      this.myTotalCount = 0;
      this.myHasNextPage = false;
      this.myLastArgs = { creatorId: null, limit: 20, offset: 0 };
    },

    clearError() {
      this.error = null;
    },

    /**
     * Reset the entire store (e.g. on logout).
     * The taxonomy is public, static data, so it is intentionally kept.
     */
    reset() {
      this.byId = {};
      this.current = null;
      this.currentArtefact = null;
      this.list = [];
      this.totalCount = 0;
      this.hasNextPage = false;
      this.lastListArgs = { filter: undefined, limit: 20, offset: 0 };

      this.my = [];
      this.myCreatorId = null;
      this.myTotalCount = 0;
      this.myHasNextPage = false;
      this.myLastArgs = { creatorId: null, limit: 20, offset: 0 };

      this.loading = false;
      this.saving = false;
      this.error = null;
    },
  },
});

export default useArtefactsStore;
