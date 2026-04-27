import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function checkA11y(
  page: import("@playwright/test").Page,
  { waitForMap = false }: { waitForMap?: boolean } = {}
) {
  if (waitForMap) {
    // Aguarda o container do Leaflet estar presente antes de auditar
    await page
      .locator(".leaflet-container")
      .waitFor({ timeout: 10000 })
      .catch(() => null);
  }

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Leaflet não tem controle sobre alt das imagens de tile; excluímos o container do mapa
    .exclude(".leaflet-container")
    .analyze();
  expect(results.violations).toEqual([]);
}

async function enableDarkMode(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("theme", "dark");
  });
}

test.describe("acessibilidade — tema claro", () => {
  test("home passa nos critérios WCAG AA", async ({ page }) => {
    await page.goto("/");
    await checkA11y(page, { waitForMap: true });
  });

  test("listagem de botecos passa nos critérios WCAG AA", async ({ page }) => {
    await page.goto("/butecos");
    await checkA11y(page);
  });

  test("detalhe do buteco passa nos critérios WCAG AA", async ({ page }) => {
    await page.goto("/butecos/bar-do-zeca");
    await checkA11y(page);
  });

  test("login passa nos critérios WCAG AA", async ({ page }) => {
    await page.goto("/login");
    await checkA11y(page);
  });
});

test.describe("acessibilidade — tema escuro", () => {
  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
  });

  test("home passa nos critérios WCAG AA no dark mode", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await checkA11y(page, { waitForMap: true });
  });

  test("listagem de botecos passa nos critérios WCAG AA no dark mode", async ({ page }) => {
    await page.goto("/butecos");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await checkA11y(page);
  });

  test("detalhe do buteco passa nos critérios WCAG AA no dark mode", async ({ page }) => {
    await page.goto("/butecos/bar-do-zeca");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await checkA11y(page);
  });

  test("login passa nos critérios WCAG AA no dark mode", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await checkA11y(page);
  });
});
