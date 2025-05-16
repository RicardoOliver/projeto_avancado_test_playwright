import http from "k6/http"
import { sleep, check, group } from "k6"
import { Counter, Trend } from "k6/metrics"

// Métricas personalizadas para fluxos de negócio
const scenarioErrors = new Counter("scenario_errors")
const scenarioResponseTime = new Trend("scenario_response_time")
const scenarioSuccess = new Counter("scenario_success")

// Configuração dos testes de cenários de negócio
export const options = {
  scenarios: {
    // Cenário completo de compra
    complete_purchase: {
      executor: "per-vu-iterations",
      vus: 10,
      iterations: 5,
      maxDuration: "10m",
      exec: "completePurchaseScenario",
      env: { SCENARIO: "purchase" },
    },
    // Cenário de navegação e comparação
    browse_and_compare: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 8,
      maxDuration: "10m",
      exec: "browseAndCompareScenario",
      env: { SCENARIO: "browse" },
    },
    // Cenário de abandono de carrinho
    cart_abandonment: {
      executor: "per-vu-iterations",
      vus: 15,
      iterations: 6,
      maxDuration: "10m",
      exec: "cartAbandonmentScenario",
      env: { SCENARIO: "abandon" },
    },
  },
  thresholds: {
    scenario_response_time: ["p(95)<1000"],
    scenario_errors: ["count<20"],
    scenario_success: ["count>100"],
  },
}

// Função auxiliar para autenticação
function authenticate() {
  const res = http.post("https://www.saucedemo.com/v1/", {
    "user-name": "standard_user",
    password: "secret_sauce",
  })

  return {
    success: res.status === 200,
    cookies: res.cookies,
  }
}

// Cenário 1: Fluxo completo de compra
export function completePurchaseScenario() {
  const scenarioStartTime = new Date()
  let success = true

  group("Complete Purchase Flow", () => {
    // Login
    const auth = authenticate()
    if (!auth.success) {
      console.log("Login failed in purchase scenario")
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 3 + 2)

    // Navegar para inventário e verificar produtos
    let res = http.get("https://www.saucedemo.com/v1/inventory.html")
    if (!check(res, { "inventory page loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 5 + 3)

    // Ordenar produtos (simulando interação do usuário)
    http.get("https://www.saucedemo.com/v1/inventory.html?sort=lohi")

    sleep(Math.random() * 3 + 2)

    // Adicionar múltiplos produtos ao carrinho
    for (let i = 0; i < 3; i++) {
      res = http.post("https://www.saucedemo.com/v1/cart.html", {
        "add-to-cart": `item-${i}`,
      })

      if (!check(res, { "product added to cart": (r) => r.status === 200 })) {
        scenarioErrors.add(1)
        success = false
        return
      }

      sleep(Math.random() * 2 + 1)
    }

    // Navegar para o carrinho
    res = http.get("https://www.saucedemo.com/v1/cart.html")
    if (!check(res, { "cart page loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 3 + 2)

    // Iniciar checkout
    res = http.get("https://www.saucedemo.com/v1/checkout-step-one.html")
    if (!check(res, { "checkout step one loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 2 + 3)

    // Preencher informações pessoais
    res = http.post("https://www.saucedemo.com/v1/checkout-step-two.html", {
      "first-name": "Complete",
      "last-name": "Purchase",
      "postal-code": "12345",
    })

    if (!check(res, { "checkout info submitted": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 3 + 2)

    // Revisar e finalizar pedido
    res = http.post("https://www.saucedemo.com/v1/checkout-complete.html", {
      finish: true,
    })

    if (!check(res, { "checkout completed": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    // Verificar página de confirmação
    res = http.get("https://www.saucedemo.com/v1/checkout-complete.html")
    check(res, { "order confirmed": (r) => r.body.includes("THANK YOU FOR YOUR ORDER") })
  })

  // Registrar métricas do cenário
  const scenarioDuration = new Date() - scenarioStartTime
  scenarioResponseTime.add(scenarioDuration)

  if (success) {
    scenarioSuccess.add(1)
  }

  sleep(Math.random() * 5 + 5)
}

// Cenário 2: Navegação e comparação de produtos
export function browseAndCompareScenario() {
  const scenarioStartTime = new Date()
  let success = true

  group("Browse and Compare Products", () => {
    // Login
    const auth = authenticate()
    if (!auth.success) {
      console.log("Login failed in browse scenario")
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 2 + 1)

    // Navegar para inventário
    let res = http.get("https://www.saucedemo.com/v1/inventory.html")
    if (!check(res, { "inventory page loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    // Comparar diferentes visualizações ordenadas
    const sortOptions = ["az", "za", "lohi", "hilo"]

    for (const sortOption of sortOptions) {
      sleep(Math.random() * 4 + 3)

      res = http.get(`https://www.saucedemo.com/v1/inventory.html?sort=${sortOption}`)
      if (!check(res, { [`sorted by ${sortOption}`]: (r) => r.status === 200 })) {
        scenarioErrors.add(1)
        success = false
        return
      }
    }

    // Visualizar detalhes de alguns produtos aleatórios
    for (let i = 0; i < 3; i++) {
      const productId = Math.floor(Math.random() * 6)

      sleep(Math.random() * 5 + 3)

      res = http.get(`https://www.saucedemo.com/v1/inventory-item.html?id=${productId}`)
      if (!check(res, { "product details loaded": (r) => r.status === 200 })) {
        scenarioErrors.add(1)
        success = false
        return
      }

      // Voltar para inventário
      sleep(Math.random() * 3 + 2)
      http.get("https://www.saucedemo.com/v1/inventory.html")
    }
  })

  // Registrar métricas do cenário
  const scenarioDuration = new Date() - scenarioStartTime
  scenarioResponseTime.add(scenarioDuration)

  if (success) {
    scenarioSuccess.add(1)
  }

  sleep(Math.random() * 5 + 5)
}

// Cenário 3: Abandono de carrinho
export function cartAbandonmentScenario() {
  const scenarioStartTime = new Date()
  let success = true

  group("Cart Abandonment", () => {
    // Login
    const auth = authenticate()
    if (!auth.success) {
      console.log("Login failed in abandonment scenario")
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 3 + 2)

    // Navegar para inventário
    let res = http.get("https://www.saucedemo.com/v1/inventory.html")
    if (!check(res, { "inventory page loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 4 + 3)

    // Adicionar produtos ao carrinho
    for (let i = 0; i < 2; i++) {
      res = http.post("https://www.saucedemo.com/v1/cart.html", {
        "add-to-cart": `item-${i}`,
      })

      if (!check(res, { "product added to cart": (r) => r.status === 200 })) {
        scenarioErrors.add(1)
        success = false
        return
      }

      sleep(Math.random() * 3 + 2)
    }

    // Navegar para o carrinho
    res = http.get("https://www.saucedemo.com/v1/cart.html")
    if (!check(res, { "cart page loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 5 + 5)

    // Iniciar checkout
    res = http.get("https://www.saucedemo.com/v1/checkout-step-one.html")
    if (!check(res, { "checkout step one loaded": (r) => r.status === 200 })) {
      scenarioErrors.add(1)
      success = false
      return
    }

    sleep(Math.random() * 8 + 7)

    // Abandonar checkout voltando para o inventário ou fechando a sessão
    const abandonActions = [
      { action: "inventory", url: "https://www.saucedemo.com/v1/inventory.html" },
      { action: "home", url: "https://www.saucedemo.com/v1/" },
    ]

    const selectedAction = abandonActions[Math.floor(Math.random() * abandonActions.length)]

    res = http.get(selectedAction.url)
    check(res, { [`abandoned to ${selectedAction.action}`]: (r) => r.status === 200 })
  })

  // Registrar métricas do cenário
  const scenarioDuration = new Date() - scenarioStartTime
  scenarioResponseTime.add(scenarioDuration)

  if (success) {
    scenarioSuccess.add(1)
  }

  sleep(Math.random() * 5 + 5)
}
