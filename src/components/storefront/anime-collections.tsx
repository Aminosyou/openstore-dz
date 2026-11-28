import { useMemo, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import type { CatalogueProduct } from "@/lib/queries";
import { SERIES } from "@/lib/universe-series";
import { ANIME_COLLECTIONS } from "@/lib/universe-sections";
import { ANIME_COVERS } from "@/lib/anime-covers";
import { labelFor } from "@/lib/universe-taxonomy";
import { productFacets } from "@/lib/product-facets";
import { universeConfig } from "@/lib/universes";

/**
 * The Anime collections grid.
 *
 * Collection first: the Anime page opens on the nine series, each a full-bleed
 * cover with the live count printed on it. The cover is curated art, so the
 * grid holds its shape while the shelves are empty; the count is the honest
 * part, and a collection with nothing in stock still says zero.
 */
export function AnimeCollectionsGrid({ products }: { products: CatalogueProduct[] }) {
  const { t, locale } = useI18n();
  const accent = universeConfig("anime").accent;

  const cards = useMemo(() => {
    const facets = new Map(products.map((product) => [product.id, productFacets(product)]));
    return ANIME_COLLECTIONS.flatMap((key, index) => {
      const named = SERIES.find((series) => series.key === key);
      if (!named) return [];
      const count = products.filter((product) => {
        const facetsOf = facets.get(product.id);
        return facetsOf?.universes.includes("anime") && facetsOf.series.includes(key);
      }).length;
      return [{ key, named, index, count, cover: ANIME_COVERS[key] }];
    });
  }, [products]);

  return (
    <div className="anime-collection-grid">
      {cards.map((card) => {
        const name = labelFor(card.named, locale);
        return (
          <Link
            key={card.key}
            to="/anime/$series"
            params={{ series: card.key }}
            className={
              card.cover
                ? "store-collection-card anime-collection-card has-image"
                : "store-collection-card anime-collection-card no-image"
            }
            style={{ "--u-accent": accent } as CSSProperties}
          >
            {card.cover ? (
              <img
                src={card.cover.src}
                alt={`${name}: ${t("universe.anime.coverAltTee")}`}
                width={900}
                height={1125}
                sizes="(max-width: 479px) 100vw, (max-width: 1023px) 50vw, 33vw"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="a-watermark" aria-hidden="true">
                {String(card.index + 1).padStart(2, "0")}
              </span>
            )}
            <span className="a-top">
              <span className="c-index" dir="ltr">
                {String(card.index + 1).padStart(2, "0")}
              </span>
              <span className="c-count">{t("home.collections.pieces", { count: card.count })}</span>
            </span>
            <span className="a-body">
              <span className="a-alt" dir={locale === "ar" ? "ltr" : "rtl"}>
                {locale === "ar" ? card.named.en : card.named.ar}
              </span>
              <span className="c-name">{name}</span>
            </span>
            <span className="a-rule" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}
