import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/storefront/store-layout";
import { AnimeShop } from "@/components/storefront/anime-shop";
import { parseAnimeTab, type AnimeTab } from "@/lib/anime-shop";
import { translate } from "@/lib/i18n";
import { universeFeedQuery } from "@/lib/universe-feed";

export const Route = createFileRoute("/anime")({
  // The tab is optional: a plain link to /anime opens the default shelf.
  validateSearch: (search: Record<string, unknown>): { type?: AnimeTab } => ({
    type: parseAnimeTab(search.type),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(universeFeedQuery()).catch(() => null);
  },
  head: ({ match }) => ({
    meta: [
      { title: translate(match.context.locale, "anime.shop.title") },
      { name: "description", content: translate(match.context.locale, "anime.shop.intro") },
    ],
  }),
  component: AnimeRoute,
});

function AnimeRoute() {
  const { type = "all" } = Route.useSearch();
  return (
    <StoreLayout>
      <AnimeShop tab={type} />
    </StoreLayout>
  );
}
