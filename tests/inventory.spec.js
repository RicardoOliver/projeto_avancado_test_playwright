const { test, expect } = require("@playwright/test")

test.describe("Inventory Page Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Verify we're on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")
  })

  test("should display correct number of products", async ({ page }) => {
    const products = page.locator(".inventory_item")
    await expect(products).toHaveCount(6)
  })

  test("should sort products by name (A to Z)", async ({ page }) => {
    await page.selectOption(".product_sort_container", "az")

    // Get all product names
    const productNames = await page.$$eval(".inventory_item_name", (elements) => elements.map((el) => el.textContent))

    // Create a copy and sort it alphabetically
    const sortedNames = [...productNames].sort()

    // Compare the actual list with the expected sorted list
    expect(productNames).toEqual(sortedNames)
  })

  test("should sort products by name (Z to A)", async ({ page }) => {
    await page.selectOption(".product_sort_container", "za")

    // Get all product names
    const productNames = await page.$$eval(".inventory_item_name", (elements) => elements.map((el) => el.textContent))

    // Create a copy and sort it in reverse alphabetical order
    const sortedNames = [...productNames].sort().reverse()

    // Compare the actual list with the expected sorted list
    expect(productNames).toEqual(sortedNames)
  })

  test("should sort products by price (low to high)", async ({ page }) => {
    await page.selectOption(".product_sort_container", "lohi")

    // Get all product prices
    const productPrices = await page.$$eval(".inventory_item_price", (elements) =>
      elements.map((el) => Number.parseFloat(el.textContent.replace("$", ""))),
    )

    // Create a copy and sort it numerically
    const sortedPrices = [...productPrices].sort((a, b) => a - b)

    // Compare the actual list with the expected sorted list
    expect(productPrices).toEqual(sortedPrices)
  })

  test("should sort products by price (high to low)", async ({ page }) => {
    await page.selectOption(".product_sort_container", "hilo")

    // Get all product prices
    const productPrices = await page.$$eval(".inventory_item_price", (elements) =>
      elements.map((el) => Number.parseFloat(el.textContent.replace("$", ""))),
    )

    // Create a copy and sort it numerically in descending order
    const sortedPrices = [...productPrices].sort((a, b) => b - a)

    // Compare the actual list with the expected sorted list
    expect(productPrices).toEqual(sortedPrices)
  })

  test("should have working product images", async ({ page }) => {
    // Check that all product images are loaded
    const images = page.locator(".inventory_item_img")
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      await expect(image).toBeVisible()

      // Check that the image has a valid src attribute
      const src = await image.getAttribute("src")
      expect(src).toBeTruthy()
      expect(src).not.toContain("null")
      expect(src).not.toContain("undefined")
    }
  })

  test("should display correct product details", async ({ page }) => {
    // Check details for the first product (Sauce Labs Backpack)
    const firstProduct = page.locator(".inventory_item").first()

    await expect(firstProduct.locator(".inventory_item_name")).toHaveText("Sauce Labs Backpack")
    await expect(firstProduct.locator(".inventory_item_desc")).toContainText("laptop and tablet protection")
    await expect(firstProduct.locator(".inventory_item_price")).toHaveText("$29.99")
    await expect(firstProduct.locator(".btn_primary")).toHaveText("ADD TO CART")
  })
})
