const { test, expect } = require("@playwright/test")
const { LoginPage } = require("./page-objects/LoginPage")
const { InventoryPage } = require("./page-objects/InventoryPage")
const { CartPage } = require("./page-objects/CartPage")
const { CheckoutPage } = require("./page-objects/CheckoutPage")

test.describe("Page Object Model Tests", () => {
  test("complete purchase flow using POM", async ({ page }) => {
    // Initialize page objects
    const loginPage = new LoginPage(page)
    const inventoryPage = new InventoryPage(page)
    const cartPage = new CartPage(page)
    const checkoutPage = new CheckoutPage(page)

    // Login
    await loginPage.goto()
    await loginPage.login("standard_user", "secret_sauce")

    // Verify we're on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html")

    // Add first product to cart
    await inventoryPage.addProductToCart(0)

    // Verify cart count
    expect(await inventoryPage.getCartCount()).toBe(1)

    // Go to cart
    await inventoryPage.goToCart()

    // Verify cart item count
    expect(await cartPage.getCartItemCount()).toBe(1)

    // Proceed to checkout
    await cartPage.checkout()

    // Fill personal information
    await checkoutPage.fillPersonalInfo("John", "Doe", "12345")
    await checkoutPage.continue()

    // Verify we're on checkout step two
    await expect(page).toHaveURL("https://www.saucedemo.com/v1/checkout-step-two.html")

    // Verify subtotal, tax, and total are visible and have values
    expect(await checkoutPage.getSubtotal()).toBeGreaterThan(0)
    expect(await checkoutPage.getTax()).toBeGreaterThan(0)
    expect(await checkoutPage.getTotal()).toBeGreaterThan(0)

    // Complete checkout
    await checkoutPage.finish()

    // Verify order is complete
    expect(await checkoutPage.isOrderComplete()).toBeTruthy()
    expect(await checkoutPage.getCompleteHeaderText()).toBe("THANK YOU FOR YOUR ORDER")
  })
})
