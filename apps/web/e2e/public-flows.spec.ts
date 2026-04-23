import { expect, test } from "@playwright/test";

test("carrega a home pública com os elementos principais", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Descubra os botecos no mapa",
    })
  ).toBeVisible();
  await expect(page.getByText("3 botecos participando")).toBeVisible();
  await expect(page.locator('section[aria-label="Mapa de botecos"]')).toBeVisible();
});

test("navega da home para a listagem de botecos", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Ver botecos" }).click();

  await expect(page).toHaveURL(/\/butecos$/);
  await expect(page.getByRole("heading", { name: "Botecos" })).toBeVisible();
});

test("filtra a listagem por cidade", async ({ page }) => {
  await page.goto("/butecos");

  await page.locator('select[name="cidade"]').selectOption("Belo Horizonte");

  await expect(page).toHaveURL(/cidade=Belo(\+|%20)Horizonte/);
  await expect(page.getByText("2 resultados com 1 filtro")).toBeVisible();
  await expect(page.getByRole("link", { name: /Bar do Zeca/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cantin do João/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Esquina da Célia/i })).toHaveCount(0);
});

test("filtra a listagem por bairro dentro da cidade selecionada", async ({ page }) => {
  await page.goto("/butecos");

  await page.locator('select[name="cidade"]').selectOption("Belo Horizonte");
  await expect(page).toHaveURL(/cidade=Belo(\+|%20)Horizonte/);
  await page.locator('select[name="bairro"]').selectOption("Savassi");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/cidade=Belo(\+|%20)Horizonte/);
  await expect(page).toHaveURL(/bairro=Savassi/);
  await expect(page.getByText("1 resultado com 2 filtros")).toBeVisible();
  await expect(page.getByRole("link", { name: /Bar do Zeca/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cantin do João/i })).toHaveCount(0);
});

test("busca por nome do buteco ou petisco", async ({ page }) => {
  await page.goto("/butecos");

  await page.locator('input[name="q"]').fill("Torresmo");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/q=Torresmo/);
  await expect(page.getByText("1 resultado com 1 filtro")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cantin do João/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Bar do Zeca/i })).toHaveCount(0);
});

test("exibe estado vazio quando não há resultados", async ({ page }) => {
  await page.goto("/butecos");

  await page.locator('input[name="q"]').fill("Inexistente");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();

  await expect(page).toHaveURL(/q=Inexistente/);
  await expect(page.getByRole("heading", { name: "Nenhum boteco encontrado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Limpar filtros" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar para a home" })).toBeVisible();
});

test("navega da listagem para a página de detalhe", async ({ page }) => {
  await page.goto("/butecos");

  await page.getByRole("link", { name: /Bar do Zeca/i }).click();

  await expect(page).toHaveURL(/\/butecos\/bar-do-zeca$/);
  await expect(page.getByRole("heading", { name: "Bar do Zeca" })).toBeVisible();
});

test("renderiza os dados principais da página de detalhe", async ({ page }) => {
  await page.goto("/butecos/bar-do-zeca");

  await expect(page.getByRole("heading", { name: "Bar do Zeca" })).toBeVisible();
  await expect(page.getByText("Savassi, Belo Horizonte", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bolinho da Casa" })).toBeVisible();
  await expect(page.getByText("Rua dos Testes, 123 - Savassi, Belo Horizonte - MG")).toBeVisible();
  await expect(page.getByText("(31) 3333-1111")).toBeVisible();
});
