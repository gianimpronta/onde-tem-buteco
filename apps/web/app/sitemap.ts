import type { MetadataRoute } from "next";
import { listPublicButecoEntriesForSitemap } from "@/lib/public-butecos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = new URL(process.env.NEXTAUTH_URL ?? "https://onde-tem-buteco.vercel.app");
  const butecos = await listPublicButecoEntriesForSitemap();

  return [
    {
      url: new URL("/", baseUrl).toString(),
    },
    {
      url: new URL("/butecos", baseUrl).toString(),
    },
    ...butecos.map(({ slug, updatedAt }) => ({
      url: new URL(`/butecos/${slug}`, baseUrl).toString(),
      lastModified: updatedAt,
    })),
  ];
}
