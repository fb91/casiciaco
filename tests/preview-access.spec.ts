import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("unlocked story is never rendered to an anonymous visitor, even with a deep link or without JavaScript", async ({
  page,
  request,
  browser,
}) => {
  const response = await request.get("/#agustin");
  const html = await response.text();
  expect(html).not.toContain("agustin-title");
  expect(html).not.toContain("docs.google.com/forms");
  expect(html).not.toContain("saint-augustine-champaigne.webp");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  await page.goto("/#agustin");
  await expect(page.locator(".preview-gate")).toBeVisible();
  await expect(page.locator("[data-scene]")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await context.newPage();
  await nojs.goto("http://127.0.0.1:3000/#invitacion");
  await expect(nojs.locator("[data-scene]")).toHaveCount(0);
  expect(
    await nojs.locator("noscript").evaluate((el) => el.textContent),
  ).toContain("Activá JavaScript");
  await context.close();
});

test("177 unlocks the preview and persists through reload, a new tab and cookie removal", async ({
  page,
  context,
}) => {
  await page.goto("/#agustin");
  const code = page.getByLabel("Código de acceso", { exact: true });
  await code.fill("000");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator("#code-error")).toContainText("Ese código no es");
  await expect(page.locator("[data-scene]")).toHaveCount(0);
  await code.fill("177");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator("#agustin")).toHaveClass(/is-active/);
  expect(
    await page.evaluate(() => localStorage.getItem("casiciaco-preview-access")),
  ).toMatch(/^[a-f0-9]{64}$/);
  await page.reload();
  await expect(page.locator("#agustin")).toHaveClass(/is-active/);
  const tab = await context.newPage();
  await tab.goto("/");
  await expect(tab.locator("#inicio")).toHaveClass(/is-active/);
  await tab.close();
  await context.clearCookies();
  await page.reload();
  await expect(page.locator("#agustin")).toHaveClass(/is-active/);
  await page.evaluate(() =>
    localStorage.removeItem("casiciaco-preview-access"),
  );
  await context.clearCookies();
  await page.reload();
  await expect(page.locator(".preview-gate")).toBeVisible();
});

test("invalid credentials cannot create an access cookie or crash the endpoint", async ({
  request,
  context,
  page,
}) => {
  for (const data of [
    { code: "0177" },
    { code: 177 },
    { token: "true" },
    { token: "é".repeat(64) },
    null,
  ]) {
    const response = await request.post("/api/preview-access", { data });
    expect([400, 401]).toContain(response.status());
    expect(response.headers()["set-cookie"]).toBeUndefined();
  }
  const crossOrigin = await request.post("/api/preview-access", {
    data: { code: "177" },
    headers: { Origin: "https://example.com" },
  });
  expect(crossOrigin.status()).toBe(403);
  await context.addCookies([
    {
      name: "casiciaco-preview",
      value: "true",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/");
  await expect(page.locator(".preview-gate")).toBeVisible();
});

test("blocked localStorage still allows entry and remembers the device with the cookie", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page.getByLabel("Código de acceso", { exact: true }).fill("177");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.locator("#inicio")).toHaveClass(/is-active/);
  await page.reload();
  await expect(page.locator("#inicio")).toHaveClass(/is-active/);
});
