import http from "k6/http"
import { sleep, check } from "k6"
import { Counter, Trend } from "k6/metrics"
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js"

// Métricas personalizadas
const errors = new Counter("errors")
const loginTrend = new Trend("login_trend")

// Configuração do teste distribuído
export const options = {
  scenarios: {
    shared_iter_scenario: {
      executor: "shared-iterations",
      vus: 50,
      iterations: 1000,
      maxDuration: "10m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% das requisições devem completar abaixo de 2s
    http_req_failed: ["rate<0.05"], // Menos de 5% das requisições podem falhar
    login_trend: ["p(95)<1500"], // 95% dos logins devem completar abaixo de 1.5s
  },
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"
  const testId = uuidv4() // Identificador único para cada execução de teste

  // Página inicial
  let res = http.get(`${baseUrl}/`, {
    tags: { testId: testId, name: "HomePage" },
  })

  check(res, {
    "homepage status is 200": (r) => r.status === 200,
  }) || errors.add(1)

  sleep(Math.random() * 2 + 1)

  // Login com diferentes usuários
  const users = [
    { username: "standard_user", password: "secret_sauce" },
    { username: "problem_user", password: "secret_sauce" },
    { username: "performance_glitch_user", password: "secret_sauce" },
  ]

  const randomUser = users[Math.floor(Math.random() * users.length)]

  const loginStart = new Date()
  res = http.post(
    `${baseUrl}/`,
    {
      "user-name": randomUser.username,
      password: randomUser.password,
    },
    {
      tags: { testId: testId, name: "Login", user: randomUser.username },
    },
  )
  const loginDuration = new Date() - loginStart
  loginTrend.add(loginDuration)

  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  check(res, {
    "login successful": () => isLoginSuccessful,
  }) || errors.add(1)

  if (isLoginSuccessful) {
    sleep(Math.random() * 2 + 1)

    // Página de inventário com diferentes ordenações
    const sortOptions = ["az", "za", "lohi", "hilo"]
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)]

    res = http.get(`${baseUrl}/inventory.html?sort=${randomSort}`, {
      tags: { testId: testId, name: "InventoryPage", sort: randomSort },
    })

    check(res, {
      "inventory page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(Math.random() * 2 + 1)

    // Adicionar produtos aleatórios ao carrinho
    const numProducts = Math.floor(Math.random() * 3) + 1 // 1 a 3 produtos
    for (let i = 0; i < numProducts; i++) {
      res = http.post(
        `${baseUrl}/cart.html`,
        {
          "add-to-cart": `item-${i}`,
        },
        {
          tags: { testId: testId, name: "AddToCart", productId: `item-${i}` },
        },
      )

      check(res, {
        "item added to cart": (r) => r.status === 200,
      }) || errors.add(1)

      sleep(Math.random() * 1 + 0.5)
    }

    // Visualizar carrinho
    res = http.get(`${baseUrl}/cart.html`, {
      tags: { testId: testId, name: "CartPage" },
    })

    check(res, {
      "cart page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    // Checkout apenas para alguns usuários (30% de chance)
    if (Math.random() < 0.3) {
      sleep(Math.random() * 2 + 1)

      // Checkout - Passo 1
      res = http.get(`${baseUrl}/checkout-step-one.html`, {
        tags: { testId: testId, name: "CheckoutStep1" },
      })

      // Enviar informações pessoais
      res = http.post(
        `${baseUrl}/checkout-step-two.html`,
        {
          "first-name": `Test${Math.floor(Math.random() * 1000)}`,
          "last-name": `User${Math.floor(Math.random() * 1000)}`,
          "postal-code": `${Math.floor(Math.random() * 90000) + 10000}`,
        },
        {
          tags: { testId: testId, name: "CheckoutInfo" },
        },
      )

      // Checkout - Passo 2
      res = http.get(`${baseUrl}/checkout-step-two.html`, {
        tags: { testId: testId, name: "CheckoutStep2" },
      })

      // Finalizar compra
      res = http.post(
        `${baseUrl}/checkout-complete.html`,
        {
          finish: true,
        },
        {
          tags: { testId: testId, name: "FinishCheckout" },
        },
      )

      check(res, {
        "checkout completed": (r) => r.status === 200,
      }) || errors.add(1)
    }
  }

  sleep(Math.random() * 3 + 1)
}
