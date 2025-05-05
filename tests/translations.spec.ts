import { expect, test } from "@playwright/test";

test("El Sidebar debería cambiar el idioma y actualizar los textos de navegación", async ({
  page,
}) => {
  await page.goto("http://localhost:5000");

  const navSection = page.locator("nav");

  const homeLinkEs = navSection.getByRole("link", { name: "Home" });

  await expect(homeLinkEs).toBeVisible();
  await expect(homeLinkEs).toHaveText("Home");

  const onboardLinkEs = navSection.getByRole("link", { name: "Onboard User" });

  await expect(onboardLinkEs).toBeVisible();
  await expect(onboardLinkEs).toHaveText("Onboard User");

  const languageSwitcherButtonEn = page.getByRole("button", {
    name: "Español",
  });
  await expect(languageSwitcherButtonEn).toBeVisible();

  await languageSwitcherButtonEn.click();

  const homeLinkEn = navSection.getByRole("link", { name: "Inicio" });

  await expect(homeLinkEn).toBeVisible({ timeout: 10000 });
  await expect(homeLinkEn).toHaveText("Inicio");

  const onboardLinkEn = navSection.getByRole("link", {
    name: "Onboard Usuario",
  });
  await expect(onboardLinkEn).toBeVisible();
  await expect(onboardLinkEn).toHaveText("Onboard Usuario");
  const languageSwitcherButtonEs = page.getByRole("button", {
    name: "English",
  });
  await expect(languageSwitcherButtonEs).toBeVisible();
});
