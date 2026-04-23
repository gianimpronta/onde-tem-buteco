jest.mock("@/lib/public-butecos", () => ({
  listPublicButecoEntriesForSitemap: jest.fn(),
}));

describe("sitemap", () => {
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXTAUTH_URL = "https://www.ondetembuteco.com.br";
  });

  afterEach(() => {
    if (originalNextAuthUrl === undefined) {
      delete process.env.NEXTAUTH_URL;
      return;
    }

    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it("returns static and dynamic public URLs", async () => {
    const { listPublicButecoEntriesForSitemap } = jest.requireMock("@/lib/public-butecos") as {
      listPublicButecoEntriesForSitemap: jest.Mock;
    };

    const updatedAt = new Date("2026-04-23T12:00:00.000Z");
    listPublicButecoEntriesForSitemap.mockResolvedValue([
      { slug: "bar-do-zeca", updatedAt },
      { slug: "cantin-do-joao", updatedAt },
    ]);

    const sitemapModule = await import("@/app/sitemap");
    const entries = await sitemapModule.default();

    expect(entries).toEqual([
      {
        url: "https://www.ondetembuteco.com.br/",
      },
      {
        url: "https://www.ondetembuteco.com.br/butecos",
      },
      {
        url: "https://www.ondetembuteco.com.br/butecos/bar-do-zeca",
        lastModified: updatedAt,
      },
      {
        url: "https://www.ondetembuteco.com.br/butecos/cantin-do-joao",
        lastModified: updatedAt,
      },
    ]);
  });
});
