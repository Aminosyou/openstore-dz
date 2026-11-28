import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ErrorState, ProductSkeleton } from "@/components/ui/feedback";
import { useI18n } from "@/lib/i18n-context";
import { productImage } from "@/lib/queries";
import { useUniverseFeed } from "@/lib/universe-feed";
import { productFacets } from "@/lib/product-facets";
import {
  animeTypeCounts,
  animeTypeOf,
  EMPTY_ANIME_FILTERS,
  type AnimeType,
} from "@/lib/anime-browse";
import { SERIES } from "@/lib/universe-series";
import { ANIME_COLLECTIONS } from "@/lib/universe-sections";
import { labelFor } from "@/lib/universe-taxonomy";
import { universeConfig } from "@/lib/universes";
import { AnimeBreadcrumb } from "./anime-breadcrumb";
import { ProductGrid } from "./product-card";
import { CrossUniverses } from "./universe-hero";

/**
 * One Anime collection's catalogue.
 *
 * Only pieces filed under this series are shown, and the shape filter keeps the
 * tees and the hoodies of that series one tap apart. The shelves of the other
 * eight collections stay at the bottom, the browse page carries a series link
 * with every filter, and the hero photograph is the first real product photo of
 * the series, never a stock image.
 */
export function AnimeCollectionPage({ seriesKey }: { seriesKey: string }) {
  const { t, locale } = useI18n();
  const feed = useUniverseFeed();
  const series = SERIES.find((entry) => entry.key === seriesKey);
  const [shape, setShape] = useState<AnimeType | "all">("all");

  const members = useMemo(
    () =>
      (feed.data ?? []).filter((product) => {
        const facets = productFacets(product);
        return facets.universes.includes("anime") && facets.series.includes(seriesKey);
      }),
    [feed.data, seriesKey],
  );
  const counts = useMemo(() => animeTypeCounts(members), [members]);
  const products = useMemo(
    () =>
      shape === "all"
        ? members
        : members.filter((product) => animeTypeOf(productFacets(product).types) === shape),
    [members, shape],
  );

  if (!series) return null;

  if (feed.isPending && !feed.data) {
    return (
      <div className="container-page py-16">
        <div className="product-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (feed.isError) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <ErrorState message={feed.error.message} onRetry={() => void feed.refetch()} />
        </div>
      </div>
    );
  }

  const position = ANIME_COLLECTIONS.indexOf(seriesKey as (typeof ANIME_COLLECTIONS)[number]) + 1;
  const index = String(position).padStart(2, "0");
  const image = members.map((product) => productImage(product)).find(Boolean) ?? null;
  const name = labelFor(series, locale);

  return (
    <div>
      <CollectionHero name={name} index={index} image={image} count={members.length} />
      <section
        id="pieces"
        className="container-page scroll-mt-24 py-12"
        aria-label={t("universe.piecesAria")}
      >
        {members.length > 0 && (
          <ShapeFilter value={shape} onChange={setShape} counts={counts} total={members.length} />
        )}

        {members.length > 0 && (
          <div className="anime-pieces-head">
            <p className="anime-browse-count">{t("universe.count", { count: products.length })}</p>
            <Link
              to="/anime/browse"
              search={{ ...EMPTY_ANIME_FILTERS, series: seriesKey }}
              className="store-btn store-btn--ghost store-btn--sm"
            >
              {t("universe.anime.browseAll")}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : members.length === 0 ? (
          <div className="store-universe-empty">
            <h2>{t("universe.collectionEmptyTitle")}</h2>
            <p>{t("universe.collectionEmptyBody")}</p>
            <Link to="/anime" className="store-btn store-btn--fill">
              {t("universe.anime.backToCollections")}
            </Link>
          </div>
        ) : (
          <div className="store-universe-empty">
            <h2>{t("universe.anime.browseEmptyTitle")}</h2>
            <p>{t("universe.anime.browseEmptyBody")}</p>
            <button
              type="button"
              className="store-btn store-btn--fill"
              onClick={() => setShape("all")}
            >
              {t("universe.anime.clearFilters")}
            </button>
          </div>
        )}
      </section>

      <SeriesChips current={seriesKey} />

      <div className="container-page">
        <CrossUniverses universe="anime" />
      </div>
    </div>
  );
}

/** Breadcrumb and hero band: the collection's name, count and first photo. */
function CollectionHero({
  name,
  index,
  image,
  count,
}: {
  name: string;
  index: string;
  image: string | null;
  count: number;
}) {
  const { t } = useI18n();
  const config = universeConfig("anime");

  return (
    <>
      <div className="container-page">
        <AnimeBreadcrumb current={name} />
      </div>

      <section
        className="store-universe-hero"
        style={{ "--u-accent": config.accent } as CSSProperties}
      >
        <div className="store-universe-hero-inner container-page">
          <div className="store-universe-hero-copy">
            <Link to="/anime" className="store-back-link">
              <ArrowLeft size={15} aria-hidden="true" />
              {t("universe.anime.backToCollections")}
            </Link>
            <p className="store-eyebrow">
              {config.index} — {t("universe.anime.kicker")}
            </p>
            <h1 className="store-universe-title">{name}</h1>
            <p className="store-universe-intro">{t("universe.count", { count })}</p>
          </div>

          <div className="store-universe-hero-media">
            {image ? (
              <img src={image} alt="" loading="eager" fetchPriority="high" decoding="async" />
            ) : (
              <div className="store-hero-fallback">
                <strong>{index}</strong>
                <span>{t("home.hero.fallback")}</span>
              </div>
            )}
            <span className="u-mark">ANIME — {index}</span>
          </div>
        </div>
      </section>
    </>
  );
}

/** The tees and the hoodies of this series, with live counts. */
function ShapeFilter({
  value,
  onChange,
  counts,
  total,
}: {
  value: AnimeType | "all";
  onChange: (next: AnimeType | "all") => void;
  counts: Record<AnimeType, number>;
  total: number;
}) {
  const { t } = useI18n();
  const chips: { key: AnimeType | "all"; label: string; count: number }[] = [
    { key: "all", label: t("universe.anime.allTypes"), count: total },
    { key: "tee", label: t("universe.type.tee"), count: counts.tee },
    { key: "hoodie", label: t("universe.type.hoodie"), count: counts.hoodie },
  ];

  return (
    <div className="anime-filter-row" role="group" aria-label={t("universe.anime.filtersType")}>
      <span className="anime-filter-label">{t("universe.anime.filtersType")}</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="store-chip"
          data-active={value === chip.key || undefined}
          aria-pressed={value === chip.key}
          onClick={() => onChange(chip.key)}
        >
          {chip.label}
          <b>{chip.count}</b>
        </button>
      ))}
    </div>
  );
}

/** The other eight collections, always one tap away. */
function SeriesChips({ current }: { current: string }) {
  const { t, locale } = useI18n();

  return (
    <nav className="container-page pb-12" aria-label={t("universe.series")}>
      <p className="store-eyebrow">{t("universe.series")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ANIME_COLLECTIONS.filter((key) => key !== current).map((key) => {
          const entry = SERIES.find((item) => item.key === key);
          if (!entry) return null;
          return (
            <Link key={key} to="/anime/$series" params={{ series: key }} className="store-chip">
              {labelFor(entry, locale)}
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
