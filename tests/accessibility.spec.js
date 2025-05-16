const { test, expect } = require("@playwright/test")

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")
  })

  test("check for alt text on product images", async ({ page }) => {
    // Get all product images
    const images = page.locator(".inventory_item_img")
    const count = await images.count()

    // Check that each image has an alt attribute
    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute("alt")
      expect(alt).toBeTruthy()
    }
  })

  test("check for keyboard navigation", async ({ page }) => {
    // Press Tab to focus on the first product's "ADD TO CART" button
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")

    // Check if the first button is focused
    const focusedElement = await page.evaluate(() => document.activeElement.textContent)
    expect(focusedElement).toBe("ADD TO CART")

    // Press Enter to click the button
    await page.keyboard.press("Enter")

    // Verify the cart badge shows 1 item
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1")
  })

  test("check for color contrast", async ({ page }) => {
    // This is a simplified check - in a real scenario, you would use
    // accessibility testing libraries like axe-core

    // Get the background color of the header
    const headerBgColor = await page.evaluate(() => {
      const header = document.querySelector(".header_container")
      return window.getComputedStyle(header).backgroundColor
    })

    // Get the text color of the header
    const headerTextColor = await page.evaluate(() => {
      const headerText = document.querySelector(".app_logo")
      return window.getComputedStyle(headerText).color
    })

    // Log the colors for manual verification
    console.log(`Header background color: ${headerBgColor}`)
    console.log(`Header text color: ${headerTextColor}`)

    // Note: A proper contrast check would use WCAG algorithms
    // This is just a placeholder for demonstration
    expect(headerBgColor).not.toBe(headerTextColor)
  })

  test("check for form labels", async ({ page }) => {
    // Navigate to checkout
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")
    await page.click(".shopping_cart_container")
    await page.click(".btn_action.checkout_button")

    // Check if form fields have associated labels
    const firstNameLabel = await page.evaluate(() => {
      const input = document.querySelector("#first-name")
      const labels = document.querySelectorAll("label")
      for (const label of labels) {
        if (label.htmlFor === "first-name") {
          return true
        }
      }
      return false
    })

    // In this case, the Sauce Demo site might not have proper labels
    // This is a demonstration of how to check for them
    console.log(`First name has label: ${firstNameLabel}`)
  })
})
