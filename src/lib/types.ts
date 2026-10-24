import type { CollectionEntry } from "astro:content";

export type PageData = CollectionEntry<"pages">["data"];
export type LandingData = NonNullable<PageData["landing"]>;
export type DashboardData = NonNullable<PageData["dashboard"]>;
export type DesktopCopy = CollectionEntry<"launcherDesktop">["data"];
export type AndroidCopy = CollectionEntry<"launcherAndroid">["data"];
