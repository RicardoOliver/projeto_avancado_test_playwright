const { test, expect } = require("@playwright/test")

test.describe("Shopping Cart Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")

    // Verify we're on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")
  })

  test("should add item to cart", async ({ page }) => {
    // Add the first product to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Verify cart badge shows 1 item
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1")

    // Verify button text changed to REMOVE
    await expect(page.locator(".inventory_item:first-child .btn_secondary.btn_inventory")).toHaveText("REMOVE")
  })

  test("should remove item from cart on inventory page", async ({ page }) => {
    // Add the first product to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Verify cart badge shows 1 item
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1")

    // Remove the item
    await page.click(".inventory_item:first-child .btn_secondary.btn_inventory")

    // Verify cart badge is not visible
    await expect(page.locator(".shopping_cart_badge")).not.toBeVisible()

    // Verify button text changed back to ADD TO CART
    await expect(page.locator(".inventory_item:first-child .btn_primary.btn_inventory")).toHaveText("ADD TO CART")
  })

  test("should navigate to cart page", async ({ page }) => {
    // Click on cart icon
    await page.click(".shopping_cart_container")

    // Verify we're on the cart page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/cart.html")
    await expect(page.locator(".subheader")).toHaveText("Your Cart")
  })

  test("should display correct items in cart", async ({ page }) => {
    // Get the name of the first product
    const productName = await page.locator(".inventory_item:first-child .inventory_item_name").textContent()

    // Add the first product to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Verify the correct product is in the cart
    await expect(page.locator(".cart_item .inventory_item_name")).toHaveText(productName)

    // Verify there's only one item in the cart
    await expect(page.locator(".cart_item")).toHaveCount(1)
  })

  test("should remove item from cart page", async ({ page }) => {
    // Add the first product to cart
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Remove the item from cart
    await page.click(".btn_secondary.cart_button")

    // Verify there are no items in the cart
    await expect(page.locator(".cart_item")).toHaveCount(0)
    await expect(page.locator(".removed_cart_item")).toBeVisible()
  })

  test("should continue shopping from cart page", async ({ page }) => {
    // Navigate to cart
    await page.click(".shopping_cart_container")

    // Click continue shopping
    await page.click(".btn_secondary")

    // Verify we're back on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")
  })
})
