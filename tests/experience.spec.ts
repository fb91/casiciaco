import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { retreat } from "../src/config/retreat";
import { cardIds } from "../src/config/share-cards";
import { testimonials } from "../src/config/testimonials";

const startButton = (page: Page) =>
  page.getByRole("link", { name: /Tocá para empezar/ });
/** Scrolls to a point (0..1) of a pinned scene. */
async function scrollThrough(page: Page, selector: string, progress: number) {
  await page.locator(selector).evaluate(
    (el: HTMLElement, progress) =>
      scrollTo({
        top: el.offsetTop + (el.offsetHeight - innerHeight) * progress,
        behavior: "instant",
      }),
    progress,
  );
}

async function holdToSilence(page: Page) {
  await page.locator("#silencio").scrollIntoViewIfNeeded();
  const ring = page.getByRole("button", { name: retreat.copy.hold });
  const box = (await ring.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator("#agustin")).toBeVisible({ timeout: 6000 });
  await page.mouse.up();
}
async function axe(page: Page) {
  return (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
  ).violations;
}

test("the story starts only with «Tocá para empezar», which also turns the sound on", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "buscando",
  );
  await expect(startButton(page)).toBeInViewport();
  // Nothing scrolls and there is no sound button until the visitor starts.
  await page.mouse.wheel(0, 900);
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator(".sound-toggle")).toHaveCount(0);
  await startButton(page).click();
  await expect(page.locator(".sound-toggle")).toHaveText(/^Sonido$/);
  await expect(page.locator(".sound-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator("#ruido")
        .evaluate((el: HTMLElement) => Math.abs(el.offsetTop - scrollY)),
    )
    .toBeLessThan(5);
});

test("a nudge invites to keep scrolling after a few still seconds in the noise", async ({
  page,
}) => {
  await page.goto("/");
  await startButton(page).click();
  const noise = page.locator("#ruido");
  await expect(noise).not.toHaveAttribute("data-idle");
  await expect(noise).toHaveAttribute("data-idle", "", { timeout: 6000 });
  await expect(page.locator(".scroll-nudge")).toBeVisible();
  await page.mouse.wheel(0, 300);
  await expect(noise).not.toHaveAttribute("data-idle");
});

test("the end of the page restarts the whole experience", async ({ page }) => {
  await page.goto("/?de=Juli#compartir");
  await expect(page.locator("#agustin")).toBeAttached();
  await page
    .getByRole("link", { name: "Vivirlo de nuevo desde el principio" })
    .click();
  // Back to the still first screen, waiting for «Tocá para empezar».
  await expect(page).toHaveURL(/\/\?de=Juli$/);
  await expect(startButton(page)).toBeInViewport();
  await expect(page.locator("#agustin")).toBeHidden();
  await expect(page.locator(".sound-toggle")).toHaveCount(0);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("the start button stays on screen on small and landscape phones", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(startButton(page)).toBeInViewport({ ratio: 1 });
  }
});

test("scrolls natively after starting and only the silence pauses the story", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?ref=colegio");
  await expect(page.locator(".preview-gate")).toHaveCount(0);
  // The scenes after the silence are not reachable yet.
  await expect(page.locator("#agustin")).toBeHidden();
  await startButton(page).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await expect(page.locator(".header-cta")).toHaveAttribute(
    "href",
    retreat.registrationUrl!,
  );
  // Notifications pile up while scrolling through the noise…
  await scrollThrough(page, "#ruido", 0.66);
  await expect
    .poll(() =>
      page
        .locator("[data-notification]")
        .last()
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.9);
  // …and then everything goes, so the last line can be read on its own.
  await scrollThrough(page, "#ruido", 1);
  await expect
    .poll(() =>
      page
        .locator(".notifications")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeLessThan(0.05);
  await expect(page.locator(".noise-end em")).toHaveText(
    retreat.copy.noiseEnd.emphasis,
  );
  await expect
    .poll(() =>
      page
        .locator(".noise-end em")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.9);
  // The silence asks its questions; a quick tap is not enough.
  await page.locator("#silencio").scrollIntoViewIfNeeded();
  for (const question of retreat.copy.questions)
    await expect(page.locator(".silence-questions")).toContainText(question);
  await page.getByRole("button", { name: retreat.copy.hold }).click();
  await page.waitForTimeout(400);
  await expect(page.locator("#agustin")).toBeHidden();
  await holdToSilence(page);
  await expect(page.locator(".silence-reply")).toBeVisible();
  await expect(page.locator(".silence-reply")).toBeFocused();
  await expect(page.locator(".silence-reply")).toContainText(
    retreat.copy.missing.lead,
  );
  for (const id of [
    "agustin",
    "vos",
    "tres-dias",
    "secreto",
    "jesus",
    "conocerlo",
    "dudas",
    "invitacion",
    "compartir",
    "historias",
  ])
    await expect(page.locator("#" + id)).toBeAttached();
  // The timeline and the quote are gone.
  await expect(page.locator("#historia, #corazon")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  // The silence stays open after reloading.
  await page.reload();
  await expect(page.locator("#agustin")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the silence can be held with the keyboard or skipped", async ({
  page,
}) => {
  await page.goto("/#silencio");
  await page.getByRole("button", { name: retreat.copy.hold }).focus();
  await page.keyboard.down(" ");
  await expect(page.locator("#agustin")).toBeVisible({ timeout: 6000 });
  await page.keyboard.up(" ");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/");
  await page.reload();
  await expect(page.locator("#agustin")).toBeHidden();
  await startButton(page).click();
  await page.getByRole("button", { name: "Seguir sin esperar" }).click();
  await expect(page.locator("#agustin")).toBeVisible();
});

test("a floating testimonial opens as a story, and all of them can be browsed like stories", async ({
  page,
}) => {
  await page.goto("/#invitacion");
  // A chat bubble with someone who already went, next to the registration button.
  // It only rotates while on screen.
  await page.locator(".bubble-zone").scrollIntoViewIfNeeded();
  const bubble = page.locator(".bubble");
  await expect(bubble).toBeVisible({ timeout: 6000 });
  // Hovering pauses the rotation; the bubble keeps floating, so the click is forced.
  await bubble.hover({ force: true });
  const name = (await bubble.locator("strong").textContent())!;
  expect(testimonials.map((item) => item.name)).toContain(name);
  await bubble.click({ force: true });
  const dialog = page.getByRole("dialog", { name: "Testimonios" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".stories-head strong")).toHaveText(name);
  const index = testimonials.findIndex((item) => item.name === name);
  await expect(
    dialog.getByRole("group", {
      name: `${index + 1} de ${testimonials.length}: ${name}`,
    }),
  ).toBeInViewport();
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialog).toBeHidden();
  // The full repository at the end: tap the right side to move on.
  await page.goto("/#historias");
  const stories = page.locator("#historias .stories");
  await expect(stories.locator(".story")).toHaveCount(testimonials.length);
  await stories.scrollIntoViewIfNeeded();
  await expect(stories.locator(".stories-head strong")).toHaveText(
    testimonials[0].name,
  );
  await stories
    .getByRole("button", { name: "Testimonio siguiente" })
    .first()
    .click();
  await expect(stories.locator(".stories-head strong")).toHaveText(
    testimonials[1].name,
  );
  await stories
    .getByRole("button", { name: "Testimonio anterior" })
    .first()
    .click();
  await expect(stories.locator(".stories-head strong")).toHaveText(
    testimonials[0].name,
  );
  // Placeholders say so.
  if (testimonials[0].placeholder)
    await expect(stories.locator(".stories-head .example-badge")).toBeVisible();
});

test("the choice is optional, reversible and shapes the invitation", async ({
  page,
}) => {
  await page.goto("/#vos");
  const choice = page.getByRole("button", { name: /Un poco de calma/ });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".choice-response")).toContainText(
    "bajar un cambio",
  );
  await expect(page.locator(".invitation-line")).toHaveText(
    retreat.copy.invitationBy[0],
  );
  await page.getByRole("button", { name: "Me voy a Casiciaco" }).click();
  await expect(page.getByTestId("share-message")).toContainText(
    retreat.copy.storyBy[0],
  );
  await expect(
    page.getByRole("button", { name: retreat.copy.storyBy[0] }),
  ).toHaveAttribute("aria-pressed", "true");
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".invitation-line")).toHaveText(
    retreat.copy.invitationDefault,
  );
});

test("personal invitations greet the friend and sanitize the name", async ({
  page,
}) => {
  await page.goto("/?de=Juli%3Cscript%3E");
  await expect(page.locator(".inviter")).toHaveText(/Juliscript te invita/);
  await expect(page).toHaveTitle(/Juliscript te invita a CASICIACO/);
  await page.goto("/?de=x");
  await expect(page.locator(".inviter")).toHaveCount(0);
});

test("anyone can share an invitation: story cards, personal link and ready message", async ({
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
  const copied = () =>
    page.evaluate(() => (window as unknown as { copied: string }).copied);
  await page.goto("/?ref=colegio&private=do-not-share#compartir");
  await expect(page.locator("#compartir")).toBeInViewport();
  // Invitation cards are the default, for people who are not going themselves.
  const cards = page.locator(".card-picker button");
  await expect(cards).toHaveCount(3);
  await cards.nth(1).click();
  await expect(cards.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: /Descargar imagen/ }),
  ).toHaveAttribute("href", "/historia/scrolleando");
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  expect(await copied()).toBe("http://127.0.0.1:3000/?ref=historia");
  await page.getByLabel(/Tu nombre/).fill("Juli");
  const message = page.getByTestId("share-message");
  await expect(message).toContainText("13, 14 y 15 de noviembre");
  await expect(message).toContainText(
    "http://127.0.0.1:3000/?de=Juli&ref=invitacion",
  );
  await expect(
    page.getByRole("link", { name: /Enviar por WhatsApp/ }),
  ).toHaveAttribute("href", /wa\.me\/\?text=.*de%3DJuli/);
  await page.getByRole("button", { name: "Copiar mensaje" }).click();
  await expect(page.getByRole("status")).toContainText("Mensaje copiado");
  expect(await copied()).toContain("?de=Juli&ref=invitacion");
  expect(await copied()).not.toContain("private");
  // Without Web Share, the story card is downloaded.
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Compartir en tu historia" }).click();
  expect((await download).suggestedFilename()).toBe(
    "casiciaco-scrolleando.png",
  );
});

test("canceling native share opens nothing else", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new DOMException("Canceled", "AbortError");
      },
      configurable: true,
    }),
  );
  await page.goto("/#compartir");
  await page.getByRole("button", { name: "Otras apps" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("");
});

test("the noise grows, fades little by little while holding and gives way to a calm loop", async ({
  page,
}) => {
  // Record every volume target the soundscape sends to its gain nodes.
  await page.addInitScript(() => {
    const log: number[] = [];
    const audio = window as unknown as { gains: number[]; oscillators: number };
    audio.gains = log;
    audio.oscillators = 0;
    const oscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function (this: AudioContext) {
      audio.oscillators++;
      return oscillator.call(this);
    };
    const create = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function (this: AudioContext) {
      const node = create.call(this);
      const set = node.gain.setTargetAtTime.bind(node.gain);
      node.gain.setTargetAtTime = (value: number, at: number, time: number) => {
        log.push(value);
        return set(value, at, time);
      };
      return node;
    };
  });
  const gains = () =>
    page.evaluate(() => (window as unknown as { gains: number[] }).gains);
  const clear = () =>
    page.evaluate(() => {
      (window as unknown as { gains: number[] }).gains.length = 0;
    });
  // 0.9 is the master volume; the rest are the noise layers.
  const loudest = async () =>
    Math.max(0, ...(await gains()).filter((value) => value !== 0.9));
  await page.goto("/");
  await startButton(page).click();
  await expect(page.locator(".sound-toggle")).toHaveText(/^Sonido$/);
  // Calm at the start of the noise, once the glide down has finished.
  await page.waitForTimeout(1500);
  await clear();
  await page.waitForTimeout(300);
  const calmStart = await loudest();
  await clear();
  await page.locator("#ruido").evaluate((el: HTMLElement) =>
    scrollTo({
      top: el.offsetTop + el.offsetHeight - innerHeight,
      behavior: "instant",
    }),
  );
  await expect.poll(loudest).toBeGreaterThan(calmStart + 0.2);
  await page.locator("#silencio").scrollIntoViewIfNeeded();
  const ring = page.getByRole("button", { name: retreat.copy.hold });
  const box = (await ring.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  // Holding fades the noise little by little instead of cutting it.
  await page.mouse.down();
  await page.waitForTimeout(200);
  await clear();
  await page.waitForTimeout(500);
  const early = await loudest();
  await page.waitForTimeout(1600);
  await clear();
  await page.waitForTimeout(500);
  const late = await loudest();
  expect(early).toBeGreaterThan(0.3);
  expect(late).toBeGreaterThan(0);
  expect(late).toBeLessThan(early / 2);
  await expect(page.locator("#agustin")).toBeVisible({ timeout: 6000 });
  await page.mouse.up();
  // After the silence the noise is gone for good…
  await clear();
  await page.evaluate(() => {
    (window as unknown as { oscillators: number }).oscillators = 0;
  });
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(2500);
  expect(
    (await gains()).filter((value) => value !== 0.9).every((v) => v === 0),
  ).toBe(true);
  // …and a slow, quiet loop takes its place.
  expect(
    await page.evaluate(
      () => (window as unknown as { oscillators: number }).oscillators,
    ),
  ).toBeGreaterThan(0);
});

test("the sound button appears after starting and remembers being turned off", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.locator(".sound-toggle");
  await expect(toggle).toHaveCount(0);
  await startButton(page).click();
  await expect(toggle).toHaveText(/^Sonido$/);
  await expect(page.locator("#ruido")).toBeInViewport();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveText("Activar sonido");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  // «Tocá para empezar» turns it on again.
  await startButton(page).click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test("story cards are prerendered 9:16 images for inviting and for going", async ({
  request,
}) => {
  for (const option of cardIds) {
    const response = await request.get("/historia/" + option);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const png = await response.body();
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1920);
  }
  expect((await request.get("/historia/9")).status()).toBe(404);
});

test("deep links reach the invitation with registration and practical details", async ({
  page,
}) => {
  await page
    .context()
    .route("https://docs.google.com/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "Formulario" }),
    );
  await page.goto("/#invitacion");
  await expect(page.locator("#invitacion")).toBeInViewport();
  const cta = page.getByRole("link", { name: retreat.copy.cta });
  // Without JavaScript the link goes straight to the form.
  await expect(cta).toHaveAttribute("href", retreat.registrationUrl!);
  // First a notice that it is a Google Form; it opens in a new tab only on confirming.
  await cta.click();
  const notice = page.getByRole("dialog", { name: "¡Qué bueno que te sumes!" });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("formulario de Google");
  await notice.getByRole("button", { name: "Ahora no" }).click();
  await expect(notice).toBeHidden();
  await cta.click();
  const form = notice.getByRole("link", { name: /Ir al formulario/ });
  await expect(form).toHaveAttribute("target", "_blank");
  const popup = page.waitForEvent("popup");
  await form.click();
  expect((await popup).url()).toBe(retreat.registrationUrl);
  await expect(notice).toBeHidden();
  await page.getByText("Lo que necesitás saber").click();
  await expect(page.locator(".practical")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
});

test("reduced motion keeps the whole story accessible without scroll-driven motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await axe(page)).toEqual([]);
  await startButton(page).click();
  await page.getByRole("button", { name: "Seguir sin esperar" }).click();
  await expect(page.locator("#agustin")).toBeVisible();
  // The noise is read at once: notifications and its last line.
  await expect(page.locator(".noise-end")).toBeVisible();
  expect(
    await page
      .locator(".notifications")
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe("1");
  expect(
    await page
      .locator(".noise-content")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.locator(".practical summary").click();
  expect(await axe(page)).toEqual([]);
});

test("without JavaScript the full story and practical information remain readable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#agustin")).toBeVisible();
  await expect(page.locator(".noise-end")).toBeVisible();
  await expect(page.locator(".silence-reply")).toBeVisible();
  await expect(page.locator(".hold-ring")).toBeHidden();
  // Nothing locks the page without JavaScript.
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await page.locator(".practical summary").click();
  await expect(page.locator(".practical")).toContainText(
    `De ${retreat.age.min} a ${retreat.age.max} años`,
  );
  await context.close();
});

test("stays out of search engines until it is marked indexable", async ({
  request,
  page,
}) => {
  test.skip(retreat.indexable, "The page is public for search engines.");
  const response = await request.get("/");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
