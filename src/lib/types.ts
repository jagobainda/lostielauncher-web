import type { CollectionEntry } from "astro:content";

export type PageData = CollectionEntry<"pages">["data"];
export type LandingData = NonNullable<PageData["landing"]>;
