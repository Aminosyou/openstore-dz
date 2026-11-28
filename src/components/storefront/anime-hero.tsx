import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { ANIME_HERO_FRAMES } from "@/lib/anime-covers";
import { universeConfig } from "@/lib/universes";

/**
 * The Anime universe opening.
 *
 * A three-frame lookbook band sits behind the copy: two real graphic tees and
 * the ELITEWEAR studio campaign shot. The band is full bleed and the copy sits
 * on an ink wash so the type stays readable over the photographs. The nine
 * collections exist whether or not anything is in stock, so the call to view
 * them is always present and the piece count is printed honestly.
 */
export function AnimeHero({
  seriesCount,
  pieceCount,
}: {
  seriesCount: number;
  pieceCount: number;
}) {
  const { t } = useI18n();
  const config = universeConfig("anime");

  return (
    <section className="anime-hero" style={{ "--u-accent": config.accent } as CSSProperties}>
      <div className="anime-hero-gallery" aria-hidden="true">
        {ANIME_HERO_FRAMES.map((frame, index) => (
          <figure key={frame.src} className="anime-hero-frame">
            <img
              src={frame.src}
              alt=""
              width={frame.width}
              height={frame.height}
              loading="eager"
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
          </figure>
        ))}
        <span className="anime-hero-mark">ANIME — {config.index}</span>
      </div>

      <div className="anime-hero-inner container-page">
        <div className="anime-hero-copy">
          <p className="store-eyebrow">
            {config.index} — {t(config.kickerKey)}
          </p>
          <h1 className="anime-hero-title">{t(config.titleKey)}</h1>
          <p className="anime-hero-intro">{t(config.introKey)}</p>

          <dl className="anime-hero-stats">
            <div>
              <dt>{t("universe.series")}</dt>
              <dd>{String(seriesCount).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>{t("universe.statPieces")}</dt>
              <dd>{String(pieceCount).padStart(2, "0")}</dd>
            </div>
          </dl>

          <a href="#pieces" className="store-btn store-btn--accent anime-hero-cta">
            {t("universe.anime.viewCollections")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
