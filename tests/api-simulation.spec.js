const { test, expect } = require("@playwright/test")

// This test simulates API testing by intercepting network requests
test.describe("API Simulation Tests", () => {
  test("intercept and modify product data", async ({ page }) => {
    // Set up request interception for the inventory data
    await page.route("**/inventory.html", async (route) => {
      const response = await route.fetch()
      let html = await response.text()

      // Modify the product name and price in the HTML
      html = html.replace("Sauce Labs Backpack", "Modified Backpack (Intercepted)")
      html = html.replace("$29.99", "$99.99")

      route.fulfill({
        status: 200,
        body: html,
        headers: response.headers(),
      })
    })

    // Login
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Verify the modified product data
    const firstProductName = await page.locator(".inventory_item:first-child .inventory_item_name").textContent()
    const firstProductPrice = await page.locator(".inventory_item:first-child .inventory_item_price").textContent()

    expect(firstProductName).toBe("Modified Backpack (Intercepted)")
    expect(firstProductPrice).toBe("$99.99")
  })

  test("simulate network error on checkout", async ({ page }) => {
    // Login and add item to cart
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")
    await page.click(".shopping_cart_container")

    // Set up request interception for the checkout step one page
    await page.route("**/checkout-step-one.html", (route) => {
      route.abort("failed")
    })

    // Try to proceed to checkout and expect it to fail
    const checkoutPromise = page.click(".btn_action.checkout_button")

    // Wait for the navigation to fail
    await expect(checkoutPromise).rejects.toThrow()

    // Verify we're still on the cart page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/cart.html")
  })

  test("simulate slow network response", async ({ page }) => {
    // Set up request interception to delay all responses
    await page.route("**/*", async (route) => {
      // Delay all responses by 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))
      route.continue()
    })

    // Measure the time it takes to load the login page
    const startTime = Date.now()
    await page.goto("https://www.saucedemo.com/v1/")
    const loadTime = Date.now() - startTime

    // Verify that the page load took at least 2 seconds
    expect(loadTime).toBeGreaterThanOrEqual(2000)
  })
})
