class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.productItems = page.locator(".inventory_item")
    this.productNames = page.locator(".inventory_item_name")
    this.productPrices = page.locator(".inventory_item_price")
    this.productDescriptions = page.locator(".inventory_item_desc")
    this.addToCartButtons = page.locator(".btn_primary.btn_inventory")
    this.removeButtons = page.locator(".btn_secondary.btn_inventory")
    this.sortDropdown = page.locator(".product_sort_container")
    this.cartBadge = page.locator(".shopping_cart_badge")
    this.cartIcon = page.locator(".shopping_cart_container")
  }

  async goto() {
    await this.page.goto("https://www.saucedemo.com/v1/inventory.html")
  }

  async getProductCount() {
    return this.productItems.count()
  }

  async getProductNames() {
    return this.productNames.allTextContents()
  }

  async getProductPrices() {
    const priceTexts = await this.productPrices.allTextContents()
    return priceTexts.map((price) => Number.parseFloat(price.replace("$", "")))
  }

  async sortProducts(option) {
    await this.sortDropdown.selectOption(option)
  }

  async addProductToCart(index) {
    await this.addToCartButtons.nth(index).click()
  }

  async removeProductFromCart(index) {
    await this.removeButtons.nth(index).click()
  }

  async getCartCount() {
    if (await this.cartBadge.isVisible()) {
      return Number.parseInt(await this.cartBadge.textContent())
    }
    return 0
  }

  async goToCart() {
    await this.cartIcon.click()
  }
}

module.exports = { InventoryPage }
