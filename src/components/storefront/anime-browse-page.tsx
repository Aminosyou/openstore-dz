import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ErrorState, ProductSkeleton } from "@/components/ui/feedback";
import { useI18n } from "@/lib/i18n-context";
import { useUniverseFeed } from "@/lib/universe-feed";
import { buildUniverse } from "@/lib/universes";
import { SERIES } from "@/lib/universe-series";
import { ANIME_COLLECTIONS } from "@/lib/universe-sections";
import { labelFor } from "@/lib/universe-taxonomy";
import {
  ANIME_SORTS,
  animeSeriesCounts,
  animeTypeCounts,
  EMPTY_ANIME_FILTERS,
  filterAnime,
  type AnimeFilters,
  type AnimeSort,
  type AnimeType,
} from "@/lib/anime-browse";
import { AnimeBreadcrumb } from "./anime-breadcrumb";
import { ProductGrid } from "./product-card";

/**
 * The whole Anime catalogue, filtered in the browser.
 *
 * The collection pages answer "what is in this series"; this page answers "show
 * me the hoodies" or "is there anything else", across the nine series at once.
 * Filters live in the URL so a filtered shelf can be linked or reloaded, and the
 * counts on the chips come from the same list the grid renders.
 */
export function AnimeBrowsePage({ filters }: { filters: AnimeFilters }) {
  const { t } = useI18n();
  const feed = useUniverseFeed();
  const { type, series, query, sort } = filters;

  const catalog = useMemo(() => buildUniverse(feed.data ?? [], "anime"), [feed.data]);
  const results = useMemo(
    () => filterAnime(catalog.members, { type, series, query, sort }),
    [catalog.members, type, series, query, sort],
  );
  const typeCounts = useMemo(() => animeTypeCounts(catalog.members), [catalog.members]);
  const seriesCounts = useMemo(() => animeSeriesCounts(catalog.members), [catalog.members]);

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

  return (
    <div>
      <div className="container-page">
        <AnimeBreadcrumb current={t("universe.anime.browseTitle")} />
        <header className="anime-browse-head">
          <p className="store-eyebrow">{t("universe.anime.kicker")}</p>
          <h1 className="store-page-title">{t("universe.anime.browseTitle")}</h1>
          <p className="store-section-lede">{t("universe.anime.browseIntro")}</p>
        </header>
      </div>

      <div className="container-page pb-16">
        <AnimeFilterBar filters={filters} typeCounts={typeCounts} seriesCounts={seriesCounts} />
        <p className="anime-browse-count" data-testid="anime-results">
          {t("universe.count", { count: results.length })}
        </p>

        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <div className="store-universe-empty">
            <h2>{t("universe.anime.browseEmptyTitle")}</h2>
            <p>{t("universe.anime.browseEmptyBody")}</p>
            <Link
              to="/anime/browse"
              search={EMPTY_ANIME_FILTERS}
              className="store-btn store-btn--fill"
            >
              {t("universe.anime.clearFilters")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

type Bar = {
  filters: AnimeFilters;
  typeCounts: Record<AnimeType, number>;
  seriesCounts: Record<string, number>;
};

const PROMOTED = new Set<string>(ANIME_COLLECTIONS);

function AnimeFilterBar({ filters, typeCounts, seriesCounts }: Bar) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const href = (patch: Partial<AnimeFilters>) => ({ ...filters, ...patch });

  const typeChips: { key: AnimeFilters["type"]; label: string; count?: number }[] = [
    { key: "all", label: t("universe.anime.allTypes") },
    { key: "tee", label: t("universe.type.tee"), count: typeCounts.tee },
    { key: "hoodie", label: t("universe.type.hoodie"), count: typeCounts.hoodie },
    { key: "other", label: t("universe.type.other"), count: typeCounts.other },
  ];

  return (
    <div className="anime-filters">
      <form
        className="anime-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("q");
          void navigate({
            to: "/anime/browse",
            search: href({ query: typeof value === "string" ? value : "" }),
            replace: true,
          });
        }}
      >
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          name="q"
          defaultValue={filters.query}
          key={filters.query}
          placeholder={t("universe.anime.searchPlaceholder")}
          aria-label={t("universe.anime.searchPlaceholder")}
          className="anime-search-input"
        />
        <button type="submit" className="store-btn store-btn--sm store-btn--fill">
          {t("common.search")}
        </button>
      </form>

      <div className="anime-filter-row" role="group" aria-label={t("universe.anime.filtersType")}>
        <span className="anime-filter-label">{t("universe.anime.filtersType")}</span>
        {typeChips.map((chip) => (
          <Link
            key={chip.key}
            to="/anime/browse"
            search={href({ type: chip.key })}
            className="store-chip"
            data-active={filters.type === chip.key || undefined}
            aria-pressed={filters.type === chip.key}
          >
            {chip.label}
            {typeof chip.count === "number" && <b>{chip.count}</b>}
          </Link>
        ))}
      </div>

      <div className="anime-filter-row" role="group" aria-label={t("universe.anime.filtersSeries")}>
        <span className="anime-filter-label">{t("universe.anime.filtersSeries")}</span>
        <Link
          to="/anime/browse"
          search={href({ series: "all" })}
          className="store-chip"
          data-active={filters.series === "all" || undefined}
          aria-pressed={filters.series === "all"}
        >
          {t("universe.anime.allSeries")}
        </Link>
        {SERIES.filter((entry) => PROMOTED.has(entry.key)).map((entry) => (
          <Link
            key={entry.key}
            to="/anime/browse"
            search={href({ series: entry.key })}
            className="store-chip"
            data-active={filters.series === entry.key || undefined}
            aria-pressed={filters.series === entry.key}
          >
            {labelFor(entry, locale)}
            <b>{seriesCounts[entry.key] ?? 0}</b>
          </Link>
        ))}
        <Link
          to="/anime/browse"
          search={href({ series: "other" })}
          className="store-chip"
          data-active={filters.series === "other" || undefined}
          aria-pressed={filters.series === "other"}
        >
          {t("universe.otherAnime")}
          <b>{seriesCounts.other ?? 0}</b>
        </Link>
      </div>

      <label className="anime-sort">
        <span className="anime-filter-label">{t("universe.anime.sortLabel")}</span>
        <select
          className="form-select form-select-compact"
          value={filters.sort}
          onChange={(event) =>
            void navigate({
              to: "/anime/browse",
              search: href({ sort: event.target.value as AnimeSort }),
              replace: true,
            })
          }
        >
          {ANIME_SORTS.map((key) => (
            <option key={key} value={key}>
              {t(SORT_KEYS[key])}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

const SORT_KEYS: Record<
  AnimeSort,
  "universe.anime.sort.newest" | "universe.anime.sort.priceAsc" | "universe.anime.sort.priceDesc"
> = {
  newest: "universe.anime.sort.newest",
  "price-asc": "universe.anime.sort.priceAsc",
  "price-desc": "universe.anime.sort.priceDesc",
};
