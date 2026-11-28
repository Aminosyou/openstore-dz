import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";

/**
 * Where the buyer is inside Anime.
 *
 * Draws the trail with the storefront's own breadcrumb classes, so the universe
 * pages and the product page speak the same visual language instead of each
 * inventing a back link.
 */
export function AnimeBreadcrumb({ current }: { current?: string }) {
  const { t } = useI18n();

  return (
    <nav className="store-breadcrumb" aria-label={t("nav.shop")}>
      <Link to="/">{t("store.breadcrumbHome")}</Link>
      <span aria-hidden="true">/</span>
      {current ? (
        <>
          <Link to="/anime">{t("universe.anime.title")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{current}</span>
        </>
      ) : (
        <span aria-current="page">{t("universe.anime.title")}</span>
      )}
    </nav>
  );
}
