class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.firstNameInput = page.locator("#first-name")
    this.lastNameInput = page.locator("#last-name")
    this.postalCodeInput = page.locator("#postal-code")
    this.continueButton = page.locator(".btn_primary.cart_button")
    this.cancelButton = page.locator(".cart_cancel_link")
    this.errorMessage = page.locator('[data-test="error"]')
    this.finishButton = page.locator(".btn_action.cart_button")
    this.summarySubtotal = page.locator(".summary_subtotal_label")
    this.summaryTax = page.locator(".summary_tax_label")
    this.summaryTotal = page.locator(".summary_total_label")
    this.completeHeader = page.locator(".complete-header")
    this.completeText = page.locator(".complete-text")
  }

  async gotoCheckoutStepOne() {
    await this.page.goto("https://www.saucedemo.com/v1/checkout-step-one.html")
  }

  async gotoCheckoutStepTwo() {
    await this.page.goto("https://www.saucedemo.com/v1/checkout-step-two.html")
  }

  async fillPersonalInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName)
    await this.lastNameInput.fill(lastName)
    await this.postalCodeInput.fill(postalCode)
  }

  async continue() {
    await this.continueButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }

  async finish() {
    await this.finishButton.click()
  }

  async getErrorMessage() {
    return this.errorMessage.textContent()
  }

  async isErrorMessageVisible() {
    return this.errorMessage.isVisible()
  }

  async getSubtotal() {
    const subtotalText = await this.summarySubtotal.textContent()
    return Number.parseFloat(subtotalText.replace("Item total: $", ""))
  }

  async getTax() {
    const taxText = await this.summaryTax.textContent()
    return Number.parseFloat(taxText.replace("Tax: $", ""))
  }

  async getTotal() {
    const totalText = await this.summaryTotal.textContent()
    return Number.parseFloat(totalText.replace("Total: $", ""))
  }

  async isOrderComplete() {
    return this.completeHeader.isVisible()
  }

  async getCompleteHeaderText() {
    return this.completeHeader.textContent()
  }
}

module.exports = { CheckoutPage }
