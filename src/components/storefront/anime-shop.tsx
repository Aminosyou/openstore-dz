import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ErrorState, ProductSkeleton } from "@/components/ui/feedback";
import { useI18n } from "@/lib/i18n-context";
import { useUniverseFeed } from "@/lib/universe-feed";
import { ANIME_TABS, animeCounts, filterAnime, type AnimeTab } from "@/lib/anime-shop";
import { ProductGrid } from "./product-card";

const TAB_LABEL = {
  all: "anime.tab.all",
  hoodie: "anime.tab.hoodies",
  sets: "anime.tab.sets",
  tee: "anime.tab.tees",
} as const;

/**
 * The Anime shop.
 *
 * One page, one grid, four tabs: everything, hoodies, sets and tees. A buyer who
 * wants a hoodie taps Hoodies; a buyer who wants to browse sees the whole shelf
 * first. Nothing here nests, and nothing asks the buyer to learn a second
 * navigation.
 */
export function AnimeShop({ tab }: { tab: AnimeTab }) {
  const { t } = useI18n();
  const feed = useUniverseFeed();

  const members = useMemo(() => feed.data ?? [], [feed.data]);
  const products = useMemo(() => filterAnime(members, tab), [members, tab]);
  const counts = useMemo(() => animeCounts(members), [members]);

  if (feed.isPending && !feed.data) {
    return (
      <div className="container-page py-12">
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
      <div className="container-page py-12">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <ErrorState message={feed.error.message} onRetry={() => void feed.refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="anime-shop-head">
        <p className="store-eyebrow">{t("universe.anime.kicker")}</p>
        <h1 className="store-page-title">{t("anime.shop.title")}</h1>
        <p className="store-section-lede">{t("anime.shop.intro")}</p>
      </header>

      <nav className="anime-tabs" aria-label={t("anime.shop.tabsAria")}>
        {ANIME_TABS.map((key) => (
          <Link
            key={key}
            to="/anime"
            search={{ type: key }}
            className="anime-tab"
            data-active={tab === key || undefined}
            aria-current={tab === key ? "page" : undefined}
          >
            {t(TAB_LABEL[key])}
            <span className="anime-tab-count">{counts[key]}</span>
          </Link>
        ))}
      </nav>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="anime-empty">
          <h2>{t("anime.empty.title")}</h2>
          <p>{t(tab === "all" ? "anime.empty.bodyAll" : "anime.empty.body")}</p>
          {tab !== "all" && (
            <Link to="/anime" search={{ type: "all" }} className="store-btn store-btn--fill">
              {t("anime.tab.all")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
