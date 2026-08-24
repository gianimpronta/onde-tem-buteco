import type { MetadataRoute } from "next";
import { listPublicButecoEntriesForSitemap } from "@/lib/public-butecos";

// Gerado a cada request, nao no build. Sem isto o Next tenta pre-renderizar
// /sitemap.xml durante `next build` e o build passa a exigir acesso ao banco
// de producao -- que existia quando o banco era o Supabase (internet
// publica), mas nao existe desde a migracao pro Postgres local, que so
// responde na rede docker interna. O build quebrava com DatabaseNotReachable.
export const dynamic = "force-dynamic";

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
