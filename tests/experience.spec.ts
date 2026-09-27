import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { retreat } from "../src/config/retreat";
import { cardIds } from "../src/config/share-cards";

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

test("opens directly, scrolls natively and only the silence pauses the story", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?ref=colegio");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "buscando",
  );
  await expect(page.locator(".preview-gate")).toHaveCount(0);
  // The scenes after the silence are not reachable yet.
  await expect(page.locator("#agustin")).toBeHidden();
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await expect(page.locator(".header-cta")).toHaveAttribute(
    "href",
    retreat.registrationUrl!,
  );
  // Notifications pile up while scrolling through the noise.
  const noise = page.locator("#ruido");
  await noise.evaluate((el: HTMLElement) =>
    scrollTo({
      top: el.offsetTop + el.offsetHeight - innerHeight,
      behavior: "instant",
    }),
  );
  await expect
    .poll(() =>
      page
        .locator("[data-notification]")
        .last()
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.9);
  // A quick tap is not enough.
  await page.locator("#silencio").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: retreat.copy.hold }).click();
  await page.waitForTimeout(400);
  await expect(page.locator("#agustin")).toBeHidden();
  await holdToSilence(page);
  await expect(page.locator(".pause-line")).toBeVisible();
  await expect(page.locator(".pause-line")).toBeFocused();
  for (const id of [
    "agustin",
    "historia",
    "corazon",
    "vos",
    "tres-dias",
    "jesus",
    "dudas",
    "invitacion",
  ])
    await expect(page.locator("#" + id)).toBeAttached();
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
  await page.getByRole("button", { name: "Seguir sin esperar" }).click();
  await expect(page.locator("#agustin")).toBeVisible();
});

test("the timeline moves sideways with the vertical scroll", async ({
  page,
}) => {
  await page.goto("/#historia");
  const timeline = page.locator("#historia");
  await expect(timeline).toBeVisible();
  // The runtime has measured the track once it reports progress.
  await expect(timeline).toHaveAttribute("data-p", /\d/);
  await expect(timeline).toHaveCSS("--dist", /px$/);
  const track = page.locator(".timeline-track");
  const x = () => track.evaluate((el) => el.getBoundingClientRect().x);
  await timeline.evaluate((el: HTMLElement) =>
    scrollTo({
      top: scrollY + el.getBoundingClientRect().top,
      behavior: "instant",
    }),
  );
  const progress = async () => Number(await timeline.getAttribute("data-p"));
  // Wait for the runtime to apply each scroll position before measuring.
  await expect.poll(progress).toBeLessThan(0.3);
  const startProgress = await progress();
  const start = await x();
  await timeline.evaluate((el: HTMLElement) =>
    scrollTo({
      top:
        scrollY +
        el.getBoundingClientRect().top +
        (el.offsetHeight - innerHeight) * 0.8,
      behavior: "instant",
    }),
  );
  await expect.poll(progress).toBeGreaterThan(startProgress + 0.4);
  expect(await x()).toBeLessThan(start - 100);
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

test("the noise grows with the notifications and goes to zero when holding for silence", async ({
  page,
}) => {
  // Record every volume target the soundscape sends to its gain nodes.
  await page.addInitScript(() => {
    const log: number[] = [];
    (window as unknown as { gains: number[] }).gains = log;
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
  await page.locator(".hero-title").click();
  await expect(page.locator(".sound-toggle")).toHaveText(/^Sonido$/);
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
  await page.mouse.down();
  await page.waitForTimeout(300);
  await clear();
  await page.waitForTimeout(800);
  // Only the master volume may stay up; every sound layer is sent to zero.
  const whileHolding = (await gains()).filter((value) => value !== 0.9);
  expect(whileHolding.length).toBeGreaterThan(0);
  expect(whileHolding.every((value) => value === 0)).toBe(true);
  await expect(page.locator("#agustin")).toBeVisible({ timeout: 6000 });
  await page.mouse.up();
  await clear();
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(800);
  expect(
    (await gains()).filter((value) => value !== 0.9).every((v) => v === 0),
  ).toBe(true);
});

test("sound starts on, plays after the first gesture and remembers being turned off", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.locator(".sound-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  // "Tocá para empezar" starts the story and the sound with the same tap.
  await page.getByRole("link", { name: /Tocá para empezar/ }).click();
  await expect(toggle).toHaveText(/^Sonido$/);
  await expect(page.locator("#ruido")).toBeInViewport();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveText("Activar sonido");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
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
  await page.goto("/#invitacion");
  await expect(page.locator("#invitacion")).toBeInViewport();
  await expect(
    page.getByRole("link", { name: retreat.copy.cta }),
  ).toHaveAttribute("href", retreat.registrationUrl!);
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
  await page.getByRole("button", { name: "Seguir sin esperar" }).click();
  await expect(page.locator("#agustin")).toBeVisible();
  expect(
    await page
      .locator(".timeline-track")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
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
  await expect(page.locator(".pause-line")).toBeVisible();
  await expect(page.locator(".hold-ring")).toBeHidden();
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
