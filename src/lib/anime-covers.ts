import type { ANIME_COLLECTIONS } from "./universe-sections";

/**
 * Cover art for the nine declared Anime collections.
 *
 * Eight covers are local files under `public/anime`, so the grid never hotlinks
 * a stock service. Seven are ELITEWEAR DZ product photography; Blue Lock is a
 * supplied detail shot cropped to the garment, with the source mark out of
 * frame. If a cover is ever missing, the card falls back to a grey studio plate
 * instead of a broken image. Every card still prints the live count, so an empty
 * shelf reads as empty.
 *
 * The hoodie rail uses ELITEWEAR hoodie photography for the six series that have
 * one. Blue Lock, Dragon Ball and Hunter x Hunter have no ELITEWEAR hoodie photo
 * and are deliberately absent rather than filled with a borrowed image.
 */

type AnimeCover = { src: string };
type AnimeCollectionKey = (typeof ANIME_COLLECTIONS)[number];

export const ANIME_COVERS: Partial<Record<AnimeCollectionKey, AnimeCover>> = {
  "attack-on-titan": { src: "/anime/attack-on-titan.webp" },
  "blue-lock": { src: "/anime/blue-lock.webp" },
  dandadan: { src: "/anime/dandadan.webp" },
  "demon-slayer": { src: "/anime/demon-slayer.webp" },
  "dragon-ball": { src: "/anime/dragon-ball.webp" },
  "hunter-x-hunter": { src: "/anime/hunter-x-hunter.webp" },
  "jujutsu-kaisen": { src: "/anime/jujutsu-kaisen.webp" },
  naruto: { src: "/anime/naruto.webp" },
  "one-piece": { src: "/anime/one-piece.webp" },
};

/**
 * Three frames for the cinematic band behind the Anime hero. They are the same
 * files the grid uses, so the browser caches one copy for both. The centre frame
 * is the Zoro T-shirt; the campaign shot was removed.
 */
export const ANIME_HERO_FRAMES = [
  { src: "/anime/jujutsu-kaisen.webp", width: 900, height: 1125 },
  { src: "/anime/zoro.webp", width: 900, height: 1125 },
  { src: "/anime/one-piece.webp", width: 900, height: 1125 },
] as const;

type AnimeHoodie = { collection: AnimeCollectionKey; src: string };

/**
 * The hoodie side of the drop, one real ELITEWEAR photograph per series that has
 * one. The rail never prints a price or a stock claim; the collection link shows
 * the live count on the catalogue.
 */
export const ANIME_HOODIES: AnimeHoodie[] = [
  { collection: "attack-on-titan", src: "/anime/hoodie-attack-on-titan.webp" },
  { collection: "jujutsu-kaisen", src: "/anime/hoodie-jujutsu-kaisen.webp" },
  { collection: "naruto", src: "/anime/hoodie-naruto.webp" },
  { collection: "one-piece", src: "/anime/hoodie-one-piece.webp" },
  { collection: "demon-slayer", src: "/anime/hoodie-demon-slayer.webp" },
  { collection: "dandadan", src: "/anime/hoodie-dandadan.webp" },
];
