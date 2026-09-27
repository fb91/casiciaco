import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { retreat } from "../src/config/retreat";

test.beforeEach(async ({ context }) => {
  const response = await context.request.post("/api/preview-access", {
    data: { code: "177" },
  });
  expect(response.ok()).toBe(true);
});

async function settled(page: Page, id: string) {
  await expect(page.locator("#" + id)).toHaveClass(/is-active/);
  await expect(page.locator(".slide-stage")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
}
async function openSlide(page: Page, id: string) {
  await page.goto("/#" + id);
  await settled(page, id);
}

test("only each slide CTA advances the complete story, with visible controls and no floating menu", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?ref=colegio");
  await settled(page, "inicio");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "para vos",
  );
  await expect(page.locator(".journey-nav")).toHaveCount(0);
  await expect(page.locator(".site-header a, .site-header button")).toHaveCount(
    0,
  );
  const ids = await page
    .locator("[data-scene]")
    .evaluateAll((elements) => elements.map((el) => el.id));
  expect(ids).toHaveLength(8);
  for (const [index, id] of ids.entries()) {
    await settled(page, id);
    await expect(
      page.getByRole("heading", { level: id === "inicio" ? 1 : 2 }),
    ).toHaveCount(1);
    await expect(page.locator(".step-counter")).toHaveAttribute(
      "aria-label",
      `Pantalla ${index + 1} de 8`,
    );
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const action = page.locator(
      "#" + id + (index < ids.length - 1 ? " .next-cta" : " .button-primary"),
    );
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(65);
    expect(box!.y + box!.height).toBeLessThanOrEqual(
      page.viewportSize()!.height,
    );
    if (index < ids.length - 1) await action.click();
  }
  for (let index = ids.length - 1; index > 0; index--) {
    await page
      .getByRole("link", { name: "Volver a la pantalla anterior" })
      .click();
    await settled(page, ids[index - 1]);
  }
  await openSlide(page, "invitacion");
  await expect(
    page.getByRole("link", { name: retreat.copy.cta }),
  ).toHaveAttribute("href", retreat.registrationUrl!);
  await page.getByRole("button", { name: "Ver detalles del retiro" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("link", { name: "Volver a empezar" }).click();
  await settled(page, "inicio");
  expect(errors).toEqual([]);
});

test("wheel, touch and scroll keys cannot advance; the words move without scrolling", async ({
  page,
}) => {
  await openSlide(page, "ruido");
  const words = page.locator(".row-0 .marquee-track");
  const initial = await words.evaluate((el) => el.getBoundingClientRect().x);
  await expect
    .poll(() => words.evaluate((el) => el.getBoundingClientRect().x))
    .not.toBe(initial);
  await page.mouse.wheel(0, 1500);
  await page.keyboard.press("PageDown");
  await page.keyboard.press("End");
  await page.evaluate(() => scrollTo(0, 2000));
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y: 400 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 180, y: 130 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await client.detach();
  await settled(page, "ruido");
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator("#ruido .next-cta").focus();
  await page.keyboard.press("Enter");
  await settled(page, "agustin");
  await expect(page.locator("#agustin-title")).toBeFocused();
});

test("personal choice is optional, reversible and private", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (req) => requests.push(req.url()));
  await openSlide(page, "vos");
  const choice = page.getByRole("button", { name: /Un poco de calma/ });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".choice-response")).toContainText(
    "bajar un cambio",
  );
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".choice-response")).toContainText(
    "Podés cambiar de idea",
  );
  await page.locator("#vos .next-cta").click();
  await settled(page, "tres-dias");
  expect(requests.filter((url) => url.includes("clarity.ms"))).toEqual([]);
});

test("share fallback removes identifiers, copies and restores focus on closing", async ({
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
  await page.goto("/?ref=colegio&private=do-not-share#invitacion");
  await settled(page, "invitacion");
  await page.getByRole("button", { name: "Compartir", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Enviar por WhatsApp/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("Enlace copiado");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe("http://127.0.0.1:3000/?ref=whatsapp");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Compartir", exact: true }),
  ).toBeFocused();
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
  await openSlide(page, "invitacion");
  await page.getByRole("button", { name: "Compartir", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("reduced motion keeps CTA navigation and accessibility across all slides and dialogs", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const id of [
    "inicio",
    "ruido",
    "agustin",
    "casiciaco",
    "vos",
    "tres-dias",
    "jesus",
    "invitacion",
  ]) {
    await settled(page, id);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    if (id === "ruido")
      expect(
        await page
          .locator(".marquee-track")
          .first()
          .evaluate((el) => getComputedStyle(el).animationName),
      ).toBe("none");
    if (id !== "invitacion")
      await page.locator("#" + id + " .next-cta").click();
  }
  await page.getByRole("button", { name: "Ver detalles del retiro" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("browser history returns to the previous slide without unlocking scroll", async ({
  page,
}) => {
  await page.goto("/");
  await settled(page, "inicio");
  await page.locator("#inicio .next-cta").click();
  await settled(page, "ruido");
  await page.goBack();
  await settled(page, "inicio");
  await page.goForward();
  await settled(page, "ruido");
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("without JavaScript the story and practical information remain readable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await context.request.post("http://127.0.0.1:3000/api/preview-access", {
    data: { code: "177" },
  });
  await page.goto("http://127.0.0.1:3000");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator(".no-js-info summary").click();
  await expect(page.locator(".no-js-info")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
  await context.close();
});
