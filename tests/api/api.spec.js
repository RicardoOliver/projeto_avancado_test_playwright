const { test, expect } = require("@playwright/test")
const { LoginPage } = require("../page-objects/LoginPage")

// Endpoint da API Swag Labs seria https://www.saucedemo.com/api no mundo real
// Como não temos acesso real à API, estamos simulando com endpoints específicos
// mas de forma mais realista do que antes

test.describe("API Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar-se para obter cookies/token para API
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login("standard_user", "secret_sauce")

    // Aguardar para garantir que a autenticação foi concluída
    await page.waitForURL("**/inventory.html")
  })

  test("fetch inventory items via API", async ({ page, request }) => {
    // Capturar cookies de autenticação da página
    const cookies = await page.context().cookies()
    const authCookie = cookies.find((cookie) => cookie.name === "session-username")

    // Definir headers para requisição da API
    const headers = {
      Cookie: `session-username=${authCookie?.value || "standard_user"}`,
      "Content-Type": "application/json",
    }

    // Fazer requisição à API (simulada)
    const response = await request.get("https://www.saucedemo.com/v1/inventory.html", { headers })

    // Verificar se a requisição foi bem-sucedida
    expect(response.status()).toBe(200)

    // Extrair dados da resposta HTML (em uma API real, seria JSON)
    const responseBody = await response.text()

    // Verificar se contém produtos
    expect(responseBody).toContain("inventory_item")
    expect(responseBody).toContain("Sauce Labs Backpack")
  })

  test("add item to cart via API", async ({ page, request }) => {
    // Capturar cookies de autenticação
    const cookies = await page.context().cookies()
    const authCookie = cookies.find((cookie) => cookie.name === "session-username")

    // Definir headers para requisição da API
    const headers = {
      Cookie: `session-username=${authCookie?.value || "standard_user"}`,
      "Content-Type": "application/json",
    }

    // Adicionar item ao carrinho (simulado via POST)
    const response = await request.post("https://www.saucedemo.com/v1/cart.html", {
      headers,
      data: {
        item_id: "4",
        quantity: 1,
      },
    })

    // Verificar se a requisição foi bem-sucedida
    expect(response.status()).toBe(200)

    // Navegar para o carrinho para verificar se o item foi adicionado
    await page.goto("https://www.saucedemo.com/v1/cart.html")

    // Verificar se há algum item no carrinho
    const cartItems = await page.locator(".cart_item").count()
    expect(cartItems).toBeGreaterThan(0)
  })

  test("checkout process via API", async ({ page, request }) => {
    // Capturar cookies de autenticação
    const cookies = await page.context().cookies()
    const authCookie = cookies.find((cookie) => cookie.name === "session-username")

    // Definir headers para requisição da API
    const headers = {
      Cookie: `session-username=${authCookie?.value || "standard_user"}`,
      "Content-Type": "application/json",
    }

    // Adicionar item ao carrinho
    await request.post("https://www.saucedemo.com/v1/cart.html", {
      headers,
      data: {
        item_id: "4",
        quantity: 1,
      },
    })

    // Iniciar checkout (simulado via POST)
    await request.post("https://www.saucedemo.com/v1/checkout-step-one.html", {
      headers,
    })

    // Enviar informações pessoais
    const checkoutResponse = await request.post("https://www.saucedemo.com/v1/checkout-step-two.html", {
      headers,
      data: {
        "first-name": "API",
        "last-name": "Test",
        "postal-code": "12345",
      },
    })

    expect(checkoutResponse.status()).toBe(200)

    // Finalizar compra
    const completeResponse = await request.post("https://www.saucedemo.com/v1/checkout-complete.html", {
      headers,
      data: {
        finish: true,
      },
    })

    expect(completeResponse.status()).toBe(200)

    // Verificar na UI se o checkout foi concluído
    await page.goto("https://www.saucedemo.com/v1/checkout-complete.html")
    await expect(page.locator(".complete-header")).toBeVisible()
  })
})
