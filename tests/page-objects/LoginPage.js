class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.usernameInput = page.locator("#user-name")
    this.passwordInput = page.locator("#password")
    this.loginButton = page.locator("#login-button")
    this.errorMessage = page.locator('[data-test="error"]')
  }

  async goto() {
    await this.page.goto("https://www.saucedemo.com/v1/")
  }

  async login(username, password) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async getErrorMessage() {
    return this.errorMessage.textContent()
  }

  async isErrorMessageVisible() {
    return this.errorMessage.isVisible()
  }
}

module.exports = { LoginPage }
