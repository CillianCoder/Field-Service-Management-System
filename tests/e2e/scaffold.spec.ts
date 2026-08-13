import { expect, test } from "@playwright/test";

test("renders the project scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "FieldFlow project scaffold" }),
  ).toBeVisible();
  await expect(page.getByText("Architecture boundaries")).toBeVisible();
});
