const { test, expect } = require("@playwright/test")

test.describe("Performance Testing", () => {
  test("measure page load time", async ({ page }) => {
    // Start measuring time
    const startTime = Date.now()

    // Navigate to the login page
    await page.goto("https://www.saucedemo.com/v1/")

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle")

    // Calculate load time
    const loadTime = Date.now() - startTime
    console.log(`Login page load time: ${loadTime}ms`)

    // Assert that the page loads within a reasonable time (e.g., 3 seconds)
    expect(loadTime).toBeLessThan(3000)
  })

  test("measure inventory page load time", async ({ page }) => {
    // Login
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")

    // Start measuring time
    const startTime = Date.now()

    // Click login and wait for navigation
    await page.click("#login-button")
    await page.waitForURL("https://www.saucedemo.com/v1/inventory.html")
    await page.waitForLoadState("networkidle")

    // Calculate load time
    const loadTime = Date.now() - startTime
    console.log(`Inventory page load time: ${loadTime}ms`)

    // Assert that the page loads within a reasonable time (e.g., 3 seconds)
    expect(loadTime).toBeLessThan(3000)
  })

  test("measure add to cart response time", async ({ page }) => {
    // Login and navigate to inventory
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle")

    // Start measuring time
    const startTime = Date.now()

    // Add item to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Wait for the cart badge to appear
    await page.waitForSelector(".shopping_cart_badge")

    // Calculate response time
    const responseTime = Date.now() - startTime
    console.log(`Add to cart response time: ${responseTime}ms`)

    // Assert that the action completes within a reasonable time (e.g., 1 second)
    expect(responseTime).toBeLessThan(1000)
  })
})
