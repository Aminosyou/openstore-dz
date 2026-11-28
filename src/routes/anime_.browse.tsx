import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/storefront/store-layout";
import { AnimeBrowsePage } from "@/components/storefront/anime-browse-page";
import { parseAnimeFilters } from "@/lib/anime-browse";
import { translate } from "@/lib/i18n";
import { universeFeedQuery } from "@/lib/universe-feed";

export const Route = createFileRoute("/anime_/browse")({
  validateSearch: parseAnimeFilters,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(universeFeedQuery()).catch(() => null);
  },
  head: ({ match }) => ({
    meta: [
      { title: translate(match.context.locale, "universe.anime.browseTitle") },
      {
        name: "description",
        content: translate(match.context.locale, "universe.anime.browseIntro"),
      },
    ],
  }),
  component: AnimeBrowseRoute,
});

function AnimeBrowseRoute() {
  const filters = Route.useSearch();
  return (
    <StoreLayout>
      <AnimeBrowsePage filters={filters} />
    </StoreLayout>
  );
}
