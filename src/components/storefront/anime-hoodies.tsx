import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { ANIME_HOODIES } from "@/lib/anime-covers";
import { SERIES } from "@/lib/universe-series";
import { labelFor } from "@/lib/universe-taxonomy";
import { universeConfig } from "@/lib/universes";

/**
 * The hoodie side of the Anime drop.
 *
 * One real ELITEWEAR photograph per series that has one. The rail prints no
 * price and no stock claim, only the collection name and a "Hoodie" label; the
 * collection link carries the buyer to the live catalogue count.
 */
export function AnimeHoodies() {
  const { t, locale } = useI18n();
  const accent = universeConfig("anime").accent;

  return (
    <section
      className="anime-hoodies"
      style={{ "--u-accent": accent } as CSSProperties}
      aria-label={t("universe.anime.hoodiesTitle")}
    >
      <div className="container-page">
        <div className="store-section-head anime-hoodies-head">
          <div>
            <p className="store-eyebrow">{t("universe.anime.hoodiesEyebrow")}</p>
            <h2 className="store-section-title">{t("universe.anime.hoodiesTitle")}</h2>
            <p className="store-section-lede">{t("universe.anime.hoodiesBody")}</p>
          </div>
          <p className="anime-grid-meta" aria-hidden="true">
            <span>{String(ANIME_HOODIES.length).padStart(2, "0")}</span>
            {t("universe.anime.hoodiesTitle")}
          </p>
        </div>

        <div className="anime-hoodies-rail">
          {ANIME_HOODIES.map((hoodie, index) => {
            const series = SERIES.find((entry) => entry.key === hoodie.collection);
            if (!series) return null;
            const name = labelFor(series, locale);
            return (
              <Link
                key={hoodie.collection}
                to="/anime/$series"
                params={{ series: hoodie.collection }}
                className="store-collection-card anime-collection-card anime-hoodie-card has-image"
              >
                <img
                  src={hoodie.src}
                  alt={`${name}: ${t("universe.anime.hoodieAlt")}`}
                  width={900}
                  height={1125}
                  sizes="(max-width: 767px) 72vw, 300px"
                  loading="lazy"
                  decoding="async"
                />
                <span className="a-top">
                  <span className="c-index" dir="ltr">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="c-count">{t("universe.anime.hoodieLabel")}</span>
                </span>
                <span className="a-body">
                  <span className="a-alt" dir={locale === "ar" ? "ltr" : "rtl"}>
                    {locale === "ar" ? series.en : series.ar}
                  </span>
                  <span className="c-name">{name}</span>
                </span>
                <span className="a-rule" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
