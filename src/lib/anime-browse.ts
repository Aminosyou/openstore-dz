import type { CatalogueProduct } from "./queries";
import { productFacets } from "./product-facets";
import { ANIME_COLLECTIONS } from "./universe-sections";
import { normalize } from "./universe-taxonomy";

/**
 * Browsing the Anime universe.
 *
 * The Anime catalogue is read whole for the universe pages, so these filters run
 * in memory: a shop this size answers them instantly, and they can use rules the
 * database does not know about, such as "the hoodies of one series". The rules
 * live here rather than in the components so they can be tested, and so the
 * landing page, the collection pages and the browse page all count the same way.
 */

export type AnimeType = "tee" | "hoodie" | "other";
export type AnimeSort = "newest" | "price-asc" | "price-desc";

export type AnimeFilters = {
  /** One piece type, or every type. */
  type: AnimeType | "all";
  /** A series key, "other" for pieces outside the nine, or "all". */
  series: string;
  /** Free text, matched against the name, the slug and the description. */
  query: string;
  sort: AnimeSort;
};

export const ANIME_SORTS: readonly AnimeSort[] = ["newest", "price-asc", "price-desc"];

export const EMPTY_ANIME_FILTERS: AnimeFilters = {
  type: "all",
  series: "all",
  query: "",
  sort: "newest",
};

/** The nine curated series; everything else is "other anime". */
const PROMOTED_SERIES: readonly string[] = ANIME_COLLECTIONS;

/** The type a piece is filed under, from the piece types it already matched. */
export function animeTypeOf(types: readonly string[]): AnimeType {
  if (types.includes("hoodie")) return "hoodie";
  if (types.includes("tee")) return "tee";
  return "other";
}

/** The cheapest active variant, so a card and the sort agree on one number. */
function animePrice(product: CatalogueProduct): number {
  const active = product.product_variants.filter((variant) => variant.is_active);
  const prices = (active.length > 0 ? active : product.product_variants).map(
    (variant) => variant.price,
  );
  return prices.length > 0 ? Math.min(...prices) : 0;
}

function searchText(product: CatalogueProduct): string {
  return normalize(
    [product.name, product.name_fr, product.slug, product.description, product.description_fr]
      .filter(Boolean)
      .join(" "),
  );
}

function stamp(value: string | null): number {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Filter a catalogue down to the Anime universe and the chosen facets. */
export function filterAnime(
  products: readonly CatalogueProduct[],
  filters: AnimeFilters,
): CatalogueProduct[] {
  const query = normalize(filters.query);
  const rows = products.filter((product) => {
    const facets = productFacets(product);
    // The caller usually passes the Anime members already; checking again costs
    // one comparison and keeps a mixed list from leaking another universe in.
    if (!facets.universes.includes("anime")) return false;
    if (filters.type !== "all" && animeTypeOf(facets.types) !== filters.type) return false;
    if (filters.series === "other") {
      // "Other anime" is the pieces no curated series claims.
      if (facets.series.some((key) => PROMOTED_SERIES.includes(key))) return false;
    } else if (filters.series !== "all" && !facets.series.includes(filters.series)) {
      return false;
    }
    if (query && !searchText(product).includes(query)) return false;
    return true;
  });
  return sortAnime(rows, filters.sort);
}

export function sortAnime(
  products: readonly CatalogueProduct[],
  sort: AnimeSort,
): CatalogueProduct[] {
  const rows = [...products];
  if (sort === "price-asc") return rows.sort((a, b) => animePrice(a) - animePrice(b));
  if (sort === "price-desc") return rows.sort((a, b) => animePrice(b) - animePrice(a));
  // Newest first; a draft without a date sorts last rather than first.
  return rows.sort((a, b) => stamp(b.published_at) - stamp(a.published_at));
}

export function animeTypeCounts(products: readonly CatalogueProduct[]): Record<AnimeType, number> {
  const counts: Record<AnimeType, number> = { tee: 0, hoodie: 0, other: 0 };
  for (const product of products) counts[animeTypeOf(productFacets(product).types)] += 1;
  return counts;
}

/** Counts per series key, with `other` for the pieces outside the nine. */
export function animeSeriesCounts(products: readonly CatalogueProduct[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    const facets = productFacets(product).series;
    const keys = facets.filter((key) => PROMOTED_SERIES.includes(key));
    if (keys.length === 0) counts.other = (counts.other ?? 0) + 1;
    for (const key of keys) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function asType(value: unknown): AnimeFilters["type"] {
  return value === "tee" || value === "hoodie" || value === "other" ? value : "all";
}

function asSort(value: unknown): AnimeSort {
  return value === "price-asc" || value === "price-desc" ? value : "newest";
}

function asSeries(value: unknown): string {
  if (typeof value !== "string" || value === "" || value === "all") return "all";
  if (value === "other") return "other";
  return PROMOTED_SERIES.includes(value) ? value : "all";
}

/**
 * Validate and normalise the browse page's search params.
 *
 * Both `q` and `query` are read: the router writes the field under its own name,
 * and a hand-typed link may carry the short form.
 */
export function parseAnimeFilters(search: Record<string, unknown>): AnimeFilters {
  const raw = typeof search.query === "string" ? search.query : search.q;
  return {
    type: asType(search.type),
    series: asSeries(search.series),
    query: typeof raw === "string" ? raw.slice(0, 60) : "",
    sort: asSort(search.sort),
  };
}
