const { test, expect } = require("@playwright/test")

test.describe("Visual Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")
  })

  test("inventory page visual test", async ({ page }) => {
    // Wait for all images to load
    await page.waitForSelector(".inventory_item_img", { state: "visible" })
    await page.waitForTimeout(1000) // Additional wait to ensure all images are fully loaded

    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot("inventory-page.png", {
      fullPage: true,
      // Mask dynamic elements if needed
      mask: [page.locator(".shopping_cart_badge")],
    })
  })

  test("product details visual test", async ({ page }) => {
    // Take screenshot of the first product
    const firstProduct = page.locator(".inventory_item").first()
    await expect(firstProduct).toHaveScreenshot("product-item.png")
  })

  test("cart page visual test", async ({ page }) => {
    // Add an item to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Take screenshot of the cart page
    await expect(page).toHaveScreenshot("cart-page.png", {
      fullPage: true,
    })
  })

  test("checkout information page visual test", async ({ page }) => {
    // Add an item to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Take screenshot of the checkout information page
    await expect(page).toHaveScreenshot("checkout-step-one.png", {
      fullPage: true,
    })
  })

  test("checkout overview page visual test", async ({ page }) => {
    // Add an item to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Fill personal information
    await page.fill("#first-name", "John")
    await page.fill("#last-name", "Doe")
    await page.fill("#postal-code", "12345")

    // Continue to checkout step two
    await page.click(".btn_primary.cart_button")

    // Take screenshot of the checkout overview page
    await expect(page).toHaveScreenshot("checkout-step-two.png", {
      fullPage: true,
    })
  })

  test("checkout complete page visual test", async ({ page }) => {
    // Add an item to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Click checkout button
    await page.click(".btn_action.checkout_button")

    // Fill personal information
    await page.fill("#first-name", "John")
    await page.fill("#last-name", "Doe")
    await page.fill("#postal-code", "12345")

    // Continue to checkout step two
    await page.click(".btn_primary.cart_button")

    // Complete checkout
    await page.click(".btn_action.cart_button")

    // Take screenshot of the checkout complete page
    await expect(page).toHaveScreenshot("checkout-complete.png", {
      fullPage: true,
    })
  })
})
