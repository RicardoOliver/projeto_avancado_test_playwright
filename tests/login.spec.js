const { test, expect } = require("@playwright/test")

test.describe("Login Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.saucedemo.com/v1/")
  })

  test("should login with standard user", async ({ page }) => {
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")
    await page.waitForURL("**/inventory.html")

    // Verify redirect to inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")
    await expect(page.locator(".product_label")).toHaveText("Products")
  })

  test("should show error for locked out user", async ({ page }) => {
    await page.fill("#user-name", "locked_out_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Verify error message
    const errorMsg = page.locator('[data-test="error"]')
    await expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText("Sorry, this user has been locked out")
  })

  test("should show error for empty credentials", async ({ page }) => {
    await page.click("#login-button")

    // Verify error message
    const errorMsg = page.locator('[data-test="error"]')
    await expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText("Username is required")
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.fill("#user-name", "invalid_user")
    await page.fill("#password", "wrong_password")
    await page.click("#login-button")

    // Verify error message
    const errorMsg = page.locator('[data-test="error"]')
    await expect(errorMsg).toBeVisible()
    await expect(errorMsg).toContainText("Username and password do not match")
  })
})
