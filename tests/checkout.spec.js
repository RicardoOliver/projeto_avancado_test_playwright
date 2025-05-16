const { test, expect } = require("@playwright/test")

test.describe("Checkout Process", () => {
  test.beforeEach(async ({ page }) => {
    // Login and add an item to cart before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Add the first product to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Verify we're on the cart page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/cart.html")
  })

  test("should proceed to checkout information page", async ({ page }) => {
    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Verify we're on the checkout step one page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/checkout-step-one.html")
    await expect(page.locator(".subheader")).toHaveText("Checkout: Your Information")
  })

  test("should require all personal information fields", async ({ page }) => {
    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Try to continue without filling any fields
    await page.click(".btn_primary.cart_button")

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible()
    await expect(page.locator('[data-test="error"]')).toContainText("First Name is required")

    // Fill only first name and try to continue
    await page.fill("#first-name", "John")
    await page.click(".btn_primary.cart_button")

    // Verify error message for last name
    await expect(page.locator('[data-test="error"]')).toContainText("Last Name is required")

    // Fill first and last name and try to continue
    await page.fill("#last-name", "Doe")
    await page.click(".btn_primary.cart_button")

    // Verify error message for postal code
    await expect(page.locator('[data-test="error"]')).toContainText("Postal Code is required")
  })

  test("should complete checkout process", async ({ page }) => {
    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Fill personal information
    await page.fill("#first-name", "John")
    await page.fill("#last-name", "Doe")
    await page.fill("#postal-code", "12345")

    // Continue to checkout step two
    await page.click(".btn_primary.cart_button")

    // Verify we're on the checkout step two page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/checkout-step-two.html")
    await expect(page.locator(".subheader")).toHaveText("Checkout: Overview")

    // Verify item information is displayed
    await expect(page.locator(".cart_item")).toHaveCount(1)
    await expect(page.locator(".summary_subtotal_label")).toBeVisible()
    await expect(page.locator(".summary_tax_label")).toBeVisible()
    await expect(page.locator(".summary_total_label")).toBeVisible()

    // Complete checkout
    await page.click(".btn_action.cart_button")

    // Verify checkout is complete
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/checkout-complete.html")
    await expect(page.locator(".complete-header")).toHaveText("THANK YOU FOR YOUR ORDER")
    await expect(page.locator(".complete-text")).toBeVisible()
  })

  test("should cancel checkout and return to inventory", async ({ page }) => {
    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Click cancel button
    await page.click(".cart_cancel_link")

    // Verify we're back on the cart page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/cart.html")

    // Go back to checkout step one
    await page.click(".btn_action.checkout_button")

    // Fill personal information
    await page.fill("#first-name", "John")
    await page.fill("#last-name", "Doe")
    await page.fill("#postal-code", "12345")

    // Continue to checkout step two
    await page.click(".btn_primary.cart_button")

    // Click cancel button on step two
    await page.click(".cart_cancel_link")

    // Verify we're back on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")
  })
})
