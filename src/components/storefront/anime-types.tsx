import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { EMPTY_ANIME_FILTERS, type AnimeType } from "@/lib/anime-browse";
import { universeConfig } from "@/lib/universes";

/**
 * The two things the Anime drop is made of.
 *
 * Tees and hoodies are the shop's own categories, so they get a shelf each
 * instead of a decorative mention: the count is live, and the card opens the
 * browse page already filtered to that type. A type with nothing in stock still
 * shows, saying zero, because the structure is a promise.
 */
export function AnimeTypes({ counts }: { counts: Record<AnimeType, number> }) {
  const { t } = useI18n();
  const accent = universeConfig("anime").accent;
  const cards = [
    { key: "tee", labelKey: "universe.type.tee", bodyKey: "universe.anime.teeBody" },
    { key: "hoodie", labelKey: "universe.type.hoodie", bodyKey: "universe.anime.hoodieBody" },
  ] as const;

  return (
    <section
      className="anime-types"
      style={{ "--u-accent": accent } as CSSProperties}
      aria-label={t("universe.anime.shopByType")}
    >
      <div className="container-page">
        <div className="store-section-head">
          <div>
            <p className="store-eyebrow">{t("universe.anime.shopByType")}</p>
            <h2 className="store-section-title">{t("universe.anime.shopByTypeTitle")}</h2>
            <p className="store-section-lede">{t("universe.anime.shopByTypeBody")}</p>
          </div>
          <Link
            to="/anime/browse"
            search={EMPTY_ANIME_FILTERS}
            className="store-btn store-btn--ghost store-btn--sm"
          >
            {t("universe.anime.browseAll")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="anime-type-grid">
          {cards.map((card, index) => (
            <Link
              key={card.key}
              to="/anime/browse"
              search={{ ...EMPTY_ANIME_FILTERS, type: card.key }}
              className="anime-type-card"
            >
              <span className="anime-type-index" dir="ltr">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="anime-type-name">{t(card.labelKey)}</span>
              <span className="anime-type-body">{t(card.bodyKey)}</span>
              <span className="anime-type-count">
                {t("home.collections.pieces", { count: counts[card.key] })}
              </span>
              <ArrowUpRight className="anime-type-arrow" size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
