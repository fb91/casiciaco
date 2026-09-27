import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { retreat } from "../src/config/retreat";

test("mobile narrative is navigable, has no overflow and ends in an honest invitation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?ref=colegio");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "buscando",
  );
  const scenes = page.locator("[data-scene]");
  expect(await scenes.count()).toBe(8); // Unapproved testimonials and FAQs stay unpublished.
  for (const scene of await scenes.all()) {
    await scene.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "QUIERO VIVIR CASICIACO" }).click();
  await expect(page.locator("#registration-info")).toContainText(
    "estará disponible",
  );
  await page.locator(".practical summary").click();
  await expect(page.locator(".practical")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
  expect(errors).toEqual([]);
});

test("personal choice is reversible and no tracker loads without a project ID", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (req) => requests.push(req.url()));
  await page.goto("/?ref=colegio");
  const choice = page.getByRole("button", { name: /Un poco de calma/ });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".choice-response")).toContainText(
    "hacer una pausa",
  );
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".choice-response")).toContainText(
    "Podés cambiar de idea",
  );
  expect(requests.filter((url) => url.includes("clarity.ms"))).toEqual([]);
});

test("share fallback removes incoming identifiers and supports copying", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
      configurable: true,
    });
  });
  await page.goto("/?ref=colegio&private=do-not-share");
  await page.getByRole("button", { name: "Compartir", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Enviar por WhatsApp/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("Enlace copiado");
  const copied = await page.evaluate(
    () => (window as unknown as { copied: string }).copied,
  );
  expect(copied).toBe("http://127.0.0.1:3000/?ref=whatsapp");
});

test("canceling native share does not open a fallback", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new DOMException("Canceled", "AbortError");
      },
      configurable: true,
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Compartir", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Enviar por WhatsApp/ }),
  ).toHaveCount(0);
});

test("reduced motion and WCAG checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollSnapType,
    ),
  ).toBe("none");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("content and invitation remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator(".practical summary").click();
  await expect(page.locator(".practical")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
  await context.close();
});

test("chapter controls scroll through the full story and back", async ({
  page,
}) => {
  await page.goto("/");
  const previous = page.getByRole("button", { name: "Capítulo anterior" });
  await expect(previous).toBeDisabled();
  const chapters = await page
    .locator("[data-scene]")
    .evaluateAll((elements) => elements.map((el) => el.id));
  for (const id of chapters.slice(1)) {
    const before = await page.evaluate(() => scrollY);
    await page.getByRole("button", { name: "Capítulo siguiente" }).click();
    await expect
      .poll(() =>
        page
          .locator("#" + id)
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(3);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before);
    await expect(page.locator(".journey-count")).toContainText(
      String(chapters.indexOf(id) + 1).padStart(2, "0"),
    );
  }
  await previous.click();
  await expect
    .poll(() =>
      page
        .locator("#jesus")
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(3);
  await page.getByRole("button", { name: "Capítulo siguiente" }).click();
  await expect(
    page.getByRole("button", { name: "Volver al primer capítulo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Volver al primer capítulo" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
});

test("native scrolling moves the composition and reduced motion stops it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".journey-nav")).toBeVisible();
  const media = page.locator(".hero-media");
  const before = await media.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy({ top: 200, behavior: "instant" }));
  await expect
    .poll(() => media.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  expect(await page.evaluate(() => scrollY)).toBe(200);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => media.evaluate((el) => getComputedStyle(el).transform))
    .toBe("none");
  await expect
    .poll(() =>
      page
        .locator(".hero-panel")
        .evaluate((el) => getComputedStyle(el).position),
    )
    .toBe("relative");
});
