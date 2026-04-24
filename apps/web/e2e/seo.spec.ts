import { expect, test } from "@playwright/test";

test("expõe metadata SEO na página pública de detalhe", async ({ page, baseURL }) => {
  await page.goto("/butecos/bar-do-zeca");

  await expect(page).toHaveTitle("Bar do Zeca | Onde Tem Buteco");
  await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
    "content",
    /Bolinho da Casa/
  );
  await expect(page.locator('link[rel="canonical"]').first()).toHaveAttribute(
    "href",
    `${baseURL}/butecos/bar-do-zeca`
  );
  await expect(page.locator('meta[property="og:title"]').first()).toHaveAttribute(
    "content",
    "Bar do Zeca"
  );
});

test("marca detalhe inexistente como noindex", async ({ page }) => {
  await page.goto("/butecos/inexistente");

  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/i);
});

test("serve sitemap.xml com rotas públicas e detalhes", async ({ request, baseURL }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.ok()).toBe(true);

  const body = await response.text();

  expect(body).toContain(`${baseURL}/`);
  expect(body).toContain(`${baseURL}/butecos`);
  expect(body).toContain(`${baseURL}/butecos/bar-do-zeca`);
});
