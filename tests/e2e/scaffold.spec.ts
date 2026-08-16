import { expect, test } from "@playwright/test";

test("renders the responsive login page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("validates required login fields before authentication", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Password is required.")).toBeVisible();
});

test("opens the responsive forgot-password page from login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();

  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(
    page.getByRole("heading", { name: "Forgot password?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset password" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to login" })).toBeVisible();
});

test("validates reset email and explains deferred delivery", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page.getByText("Email is required.")).toBeVisible();

  await page.getByLabel("Email address").fill("person@example.com");
  await page.getByRole("button", { name: "Reset password" }).click();

  await expect(
    page.getByText(
      "Password reset email delivery is not available yet. Contact your FieldFlow administrator for access.",
    ),
  ).toBeVisible();
});
