import { describe, expect, it } from "vitest";
import type { CatalogueProduct } from "./queries";
import {
  animeSeriesCounts,
  animeTypeCounts,
  animeTypeOf,
  EMPTY_ANIME_FILTERS,
  filterAnime,
  parseAnimeFilters,
  sortAnime,
} from "./anime-browse";

function product(overrides: Partial<CatalogueProduct> = {}): CatalogueProduct {
  const variant = {
    id: "v1",
    size: "M",
    color_name: "Noir",
    color_hex: "#000",
    sku: null,
    price: 2900,
    stock: 5,
    is_active: true,
    sort_order: 0,
    variant_images: [],
  };
  return {
    id: overrides.slug ?? "id",
    slug: "piece",
    name: "قطعة",
    name_fr: null,
    description: null,
    description_fr: null,
    kind: "single",
    status: "published",
    category_id: null,
    categories: null,
    published_at: "2026-01-01T00:00:00.000Z",
    product_variants: [variant],
    ...overrides,
  } as CatalogueProduct;
}

const tee = product({
  slug: "tee-naruto",
  name: "تي شيرت ناروتو أوفرسايز",
  product_variants: [{ ...product().product_variants[0], price: 2900 }],
});
const hoodie = product({
  slug: "hoodie-blue-lock",
  name: "hoodie blue lock",
  product_variants: [{ ...product().product_variants[0], price: 5400 }],
});
const otherSeries = product({
  slug: "hoodie-bleach",
  name: "hoodie bleach",
  product_variants: [{ ...product().product_variants[0], price: 4100 }],
});
const streetwear = product({ slug: "polo", name: "polo piqué" });

const all = [tee, hoodie, otherSeries, streetwear];
const animeOnly = [tee, hoodie, otherSeries];

describe("animeTypeOf", () => {
  it("files a hoodie that also mentions a tee as a hoodie", () => {
    expect(animeTypeOf(["tee", "hoodie"])).toBe("hoodie");
  });

  it("files a tee as a tee", () => {
    expect(animeTypeOf(["tee"])).toBe("tee");
  });

  it("files anything else as other", () => {
    expect(animeTypeOf(["other"])).toBe("other");
  });
});

describe("filterAnime", () => {
  it("keeps only anime pieces", () => {
    // Equal dates keep their input order, so the anime three keep theirs.
    expect(filterAnime(all, EMPTY_ANIME_FILTERS).map((p) => p.slug)).toEqual([
      "tee-naruto",
      "hoodie-blue-lock",
      "hoodie-bleach",
    ]);
  });

  it("filters by piece type", () => {
    expect(
      filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, type: "hoodie" }).map((p) => p.slug),
    ).toEqual(["hoodie-blue-lock", "hoodie-bleach"]);
    expect(
      filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, type: "tee" }).map((p) => p.slug),
    ).toEqual(["tee-naruto"]);
  });

  it("filters by series", () => {
    expect(
      filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, series: "naruto" }).map((p) => p.slug),
    ).toEqual(["tee-naruto"]);
  });

  it("puts pieces outside the nine in other anime", () => {
    expect(
      filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, series: "other" }).map((p) => p.slug),
    ).toEqual(["hoodie-bleach"]);
  });

  it("matches a search across the French name and the slug", () => {
    const fr = product({ slug: "hoodie-snk", name: "هودي", name_fr: "Hoodie Naruto" });
    expect(
      filterAnime([fr], { ...EMPTY_ANIME_FILTERS, query: "naruto" }).map((p) => p.slug),
    ).toEqual(["hoodie-snk"]);
    expect(
      filterAnime([fr], { ...EMPTY_ANIME_FILTERS, query: "hoodie snk" }).map((p) => p.slug),
    ).toEqual(["hoodie-snk"]);
  });

  it("ignores an empty query and a query nothing matches", () => {
    expect(filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, query: "   " })).toHaveLength(3);
    expect(filterAnime(animeOnly, { ...EMPTY_ANIME_FILTERS, query: "barcelone" })).toHaveLength(0);
  });
});

describe("sortAnime", () => {
  it("sorts by price in both directions", () => {
    expect(sortAnime(animeOnly, "price-asc").map((p) => p.slug)).toEqual([
      "tee-naruto",
      "hoodie-bleach",
      "hoodie-blue-lock",
    ]);
    expect(sortAnime(animeOnly, "price-desc").map((p) => p.slug)).toEqual([
      "hoodie-blue-lock",
      "hoodie-bleach",
      "tee-naruto",
    ]);
  });

  it("sorts newest first and puts an undated piece last", () => {
    const old = product({
      slug: "old",
      name: "تي شيرت ناروتو",
      published_at: "2025-01-01T00:00:00.000Z",
    });
    const undated = product({ slug: "undated", name: "تي شيرت ناروتو", published_at: null });
    expect(sortAnime([old, tee, undated], "newest").map((p) => p.slug)).toEqual([
      "tee-naruto",
      "old",
      "undated",
    ]);
  });
});

describe("counts", () => {
  it("counts the pieces of each type", () => {
    expect(animeTypeCounts(animeOnly)).toEqual({ tee: 1, hoodie: 2, other: 0 });
  });

  it("counts each promoted series and lumps the rest under other", () => {
    expect(animeSeriesCounts(animeOnly)).toEqual({ naruto: 1, "blue-lock": 1, other: 1 });
  });
});

describe("parseAnimeFilters", () => {
  it("keeps known values", () => {
    expect(
      parseAnimeFilters({ type: "hoodie", series: "naruto", q: "hx", sort: "price-asc" }),
    ).toEqual({ type: "hoodie", series: "naruto", query: "hx", sort: "price-asc" });
  });

  it("drops values it does not know", () => {
    expect(parseAnimeFilters({ type: "cap", series: "bleach", q: 5, sort: "random" })).toEqual(
      EMPTY_ANIME_FILTERS,
    );
  });

  it("keeps other anime", () => {
    expect(parseAnimeFilters({ series: "other" }).series).toBe("other");
  });
});
