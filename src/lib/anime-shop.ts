import type { CatalogueProduct } from "./queries";
import { productFacets } from "./product-facets";

/**
 * The Anime shop, in one flat list.
 *
 * A buyer opens Anime, sees every anime piece, and narrows to one of three
 * shapes if they want. There is no second axis, no collection page and no
 * filter drawer: the shop sells tees, hoodies and sets, and that is what the
 * tabs say. Membership of a shape is read from the piece types the catalogue
 * already carries, so nothing here needs a database change.
 */

export type AnimeTab = "all" | "hoodie" | "sets" | "tee";

/** The tabs, in the order they are drawn. */
export const ANIME_TABS: readonly AnimeTab[] = ["all", "hoodie", "sets", "tee"];

export type AnimeShape = Exclude<AnimeTab, "all">;

function isAnimeTab(value: string): value is AnimeTab {
  return value === "all" || value === "hoodie" || value === "sets" || value === "tee";
}

/**
 * Older addresses that mean a canonical tab.
 *
 * The shapes were named once as "tracksuit" and "t-shirt"; a link already
 * shared or bookmarked has to keep landing on the right shelf, so the old
 * spellings are read as the canonical ones.
 */
const TAB_ALIASES: Record<string, AnimeTab> = {
  tracksuit: "sets",
  tshirt: "tee",
  "t-shirt": "tee",
  tees: "tee",
};

/** An unknown or missing tab is the default: every piece. */
export function parseAnimeTab(value: unknown): AnimeTab {
  if (typeof value !== "string") return "all";
  const key = value.trim().toLowerCase();
  if (isAnimeTab(key)) return key;
  return TAB_ALIASES[key] ?? "all";
}

/** Whether a piece is shown under one shape. A set can also be a hoodie set. */
export function inShape(types: readonly string[], shape: AnimeShape): boolean {
  if (shape === "hoodie") return types.includes("hoodie");
  if (shape === "tee") return types.includes("tee");
  // "Sets" covers ensembles, tracksuits and joggers, plus a two-piece pack.
  return types.includes("tracksuit") || types.includes("pack");
}

/** The Anime universe's members, whatever their shape. */
function animeProducts(products: readonly CatalogueProduct[]): CatalogueProduct[] {
  return products.filter((product) => productFacets(product).universes.includes("anime"));
}

export function filterAnime(
  products: readonly CatalogueProduct[],
  tab: AnimeTab,
): CatalogueProduct[] {
  const members = animeProducts(products);
  if (tab === "all") return members;
  return members.filter((product) => inShape(productFacets(product).types, tab));
}

/** How many pieces each tab would show. */
export function animeCounts(products: readonly CatalogueProduct[]): Record<AnimeTab, number> {
  const members = animeProducts(products);
  const counts: Record<AnimeTab, number> = { all: members.length, hoodie: 0, sets: 0, tee: 0 };
  for (const product of members) {
    const types = productFacets(product).types;
    for (const shape of ["hoodie", "sets", "tee"] as const) {
      if (inShape(types, shape)) counts[shape] += 1;
    }
  }
  return counts;
}
