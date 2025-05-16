class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.cartItems = page.locator(".cart_item")
    this.cartItemNames = page.locator(".inventory_item_name")
    this.cartItemPrices = page.locator(".inventory_item_price")
    this.removeButtons = page.locator(".btn_secondary.cart_button")
    this.checkoutButton = page.locator(".btn_action.checkout_button")
    this.continueShoppingButton = page.locator(".btn_secondary")
  }

  async goto() {
    await this.page.goto("https://www.saucedemo.com/v1/cart.html")
  }

  async getCartItemCount() {
    return this.cartItems.count()
  }

  async getCartItemNames() {
    return this.cartItemNames.allTextContents()
  }

  async getCartItemPrices() {
    const priceTexts = await this.cartItemPrices.allTextContents()
    return priceTexts.map((price) => Number.parseFloat(price.replace("$", "")))
  }

  async removeItem(index) {
    await this.removeButtons.nth(index).click()
  }

  async checkout() {
    await this.checkoutButton.click()
  }

  async continueShopping() {
    await this.continueShoppingButton.click()
  }
}

module.exports = { CartPage }
