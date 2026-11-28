import { describe, expect, it } from "vitest";
import type { CatalogueProduct } from "./queries";
import { animeCounts, filterAnime, inShape, parseAnimeTab } from "./anime-shop";

function product(overrides: Partial<CatalogueProduct> = {}): CatalogueProduct {
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
    product_variants: [],
    ...overrides,
  } as CatalogueProduct;
}

const hoodie = product({ slug: "hoodie-naruto", name: "هودي ناروتو" });
const tee = product({ slug: "tee-naruto", name: "تي شيرت ناروتو" });
const set = product({ slug: "set-naruto", name: "طقم رياضي ناروتو" });
const jogger = product({ slug: "jogger-naruto", name: "jogger naruto" });
const polo = product({ slug: "polo", name: "polo piqué" });
const all = [hoodie, tee, set, jogger, polo];

describe("anime shop tabs", () => {
  it("shows every anime piece under all products", () => {
    expect(filterAnime(all, "all").map((p) => p.slug)).toEqual([
      "hoodie-naruto",
      "tee-naruto",
      "set-naruto",
      "jogger-naruto",
    ]);
  });

  it("narrows to hoodies", () => {
    expect(filterAnime(all, "hoodie").map((p) => p.slug)).toEqual(["hoodie-naruto"]);
  });

  it("narrows to tees", () => {
    expect(filterAnime(all, "tee").map((p) => p.slug)).toEqual(["tee-naruto"]);
  });

  it("files ensembles and joggers under sets", () => {
    expect(filterAnime(all, "sets").map((p) => p.slug)).toEqual(["set-naruto", "jogger-naruto"]);
  });

  it("keeps a non-anime piece out of every tab", () => {
    for (const tab of ["all", "hoodie", "sets", "tee"] as const) {
      expect(filterAnime(all, tab).some((p) => p.slug === "polo")).toBe(false);
    }
  });

  it("counts each tab", () => {
    expect(animeCounts(all)).toEqual({ all: 4, hoodie: 1, sets: 2, tee: 1 });
  });

  it("treats an unknown shape as a piece with no shape", () => {
    expect(inShape(["other"], "hoodie")).toBe(false);
    expect(inShape(["other"], "sets")).toBe(false);
    expect(inShape(["other"], "tee")).toBe(false);
  });

  it("falls back to the default tab", () => {
    expect(parseAnimeTab("hoodie")).toBe("hoodie");
    expect(parseAnimeTab("collections")).toBe("all");
    expect(parseAnimeTab(undefined)).toBe("all");
  });
});

describe("tab addresses", () => {
  it("accepts the canonical tabs", () => {
    expect(parseAnimeTab("hoodie")).toBe("hoodie");
    expect(parseAnimeTab("sets")).toBe("sets");
    expect(parseAnimeTab("tee")).toBe("tee");
    expect(parseAnimeTab("all")).toBe("all");
  });

  it("reads the older spellings of each shape", () => {
    expect(parseAnimeTab("tracksuit")).toBe("sets");
    expect(parseAnimeTab("tshirt")).toBe("tee");
    expect(parseAnimeTab("t-shirt")).toBe("tee");
    expect(parseAnimeTab("T-Shirt")).toBe("tee");
    expect(parseAnimeTab("tees")).toBe("tee");
    expect(parseAnimeTab("tracksuit ")).toBe("sets");
  });

  it("falls back to every piece on anything else", () => {
    expect(parseAnimeTab("collections")).toBe("all");
    expect(parseAnimeTab("")).toBe("all");
    expect(parseAnimeTab(null)).toBe("all");
    expect(parseAnimeTab(42)).toBe("all");
  });

  it("filters with the tab its address resolves to", () => {
    expect(filterAnime(all, parseAnimeTab("tracksuit")).map((p) => p.slug)).toEqual([
      "set-naruto",
      "jogger-naruto",
    ]);
    expect(filterAnime(all, parseAnimeTab("tshirt")).map((p) => p.slug)).toEqual(["tee-naruto"]);
    expect(filterAnime(all, parseAnimeTab("t-shirt")).map((p) => p.slug)).toEqual(["tee-naruto"]);
    expect(filterAnime(all, parseAnimeTab("sets")).map((p) => p.slug)).toEqual([
      "set-naruto",
      "jogger-naruto",
    ]);
    expect(filterAnime(all, parseAnimeTab("tee")).map((p) => p.slug)).toEqual(["tee-naruto"]);
    expect(filterAnime(all, parseAnimeTab("nonsense"))).toHaveLength(4);
  });
});
