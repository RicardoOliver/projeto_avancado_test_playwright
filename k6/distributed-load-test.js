import http from "k6/http"
import { sleep, check } from "k6"
import { Counter, Trend } from "k6/metrics"
import exec from "k6/execution"

// Métricas personalizadas
const errors = new Counter("errors")
const processingTime = new Trend("processing_time")

// Definir ID de execução para identificar instâncias distribuídas
const executionId = __ENV.EXECUTION_ID || "default"

// Configuração do teste distribuído
export const options = {
  scenarios: {
    // Teste de carga constante
    constant_load: {
      executor: "constant-vus",
      vus: 50,
      duration: "1m",
      startTime: "0s",
      env: { SCENARIO: "constant" },
      tags: { scenario: "constant_load" },
    },
    // Teste com rampa de subida para pico
    ramp_up: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 100 },
        { duration: "30s", target: 0 },
      ],
      startTime: "1m30s",
      env: { SCENARIO: "ramp" },
      tags: { scenario: "ramp_up" },
    },
    // Teste de pico de carga
    spike: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      preAllocatedVUs: 200,
      maxVUs: 300,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "10s", target: 100 },
        { duration: "1m", target: 100 },
        { duration: "10s", target: 10 },
        { duration: "30s", target: 0 },
      ],
      startTime: "3m30s",
      env: { SCENARIO: "spike" },
      tags: { scenario: "spike" },
    },
  },
  thresholds: {
    // Menos de 1% das requisições podem falhar
    http_req_failed: ["rate<0.01"],
    // 95% das requisições devem completar abaixo de 500ms
    http_req_duration: ["p(95)<500"],
    // Menos de 100 erros totais
    errors: ["count<100"],
    // Tempo médio de processamento abaixo de 300ms
    processing_time: ["avg<300"],
  },
}

// Função para gerar strings aleatórias para dados de teste
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Função principal para teste de carga distribuído
export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"

  // Identificar a instância de execução para logs distribuídos
  const instanceTag = `${executionId}_${exec.scenario.name}_${exec.vu.idInTest}`

  // Log de início para instância específica
  console.log(`Instance ${instanceTag} starting test iteration`)

  // Página inicial
  let startTime = new Date()
  let res = http.get(`${baseUrl}/`, {
    tags: { name: "HomePage", instance: instanceTag },
  })
  let loadTime = new Date() - startTime
  processingTime.add(loadTime)

  check(res, {
    "homepage status is 200": (r) => r.status === 200,
    "homepage has login form": (r) => r.body.includes("login-button"),
  }) || errors.add(1)

  sleep(Math.random() * 2 + 1) // Pausa realista entre 1-3 segundos

  // Login
  const users = [
    { username: "standard_user", password: "secret_sauce" },
    { username: "problem_user", password: "secret_sauce" },
    { username: "performance_glitch_user", password: "secret_sauce" },
  ]

  const selectedUser = users[Math.floor(Math.random() * users.length)]

  startTime = new Date()
  res = http.post(
    `${baseUrl}/`,
    {
      "user-name": selectedUser.username,
      password: selectedUser.password,
    },
    {
      tags: { name: "Login", instance: instanceTag, user: selectedUser.username },
    },
  )
  loadTime = new Date() - startTime
  processingTime.add(loadTime)

  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  check(res, {
    "login successful": () => isLoginSuccessful,
  }) || errors.add(1)

  if (isLoginSuccessful) {
    sleep(Math.random() * 3 + 2) // Navegação realista

    // Página de inventário
    startTime = new Date()
    res = http.get(`${baseUrl}/inventory.html`, {
      tags: { name: "InventoryPage", instance: instanceTag },
    })
    loadTime = new Date() - startTime
    processingTime.add(loadTime)

    check(res, {
      "inventory page loaded": (r) => r.status === 200 && r.body.includes("inventory_container"),
    }) || errors.add(1)

    sleep(Math.random() * 5 + 2) // Usuário navegando pelos produtos

    // Adicionar produtos aleatórios ao carrinho
    const numProductsToAdd = Math.floor(Math.random() * 3) + 1 // 1-3 produtos

    for (let i = 0; i < numProductsToAdd; i++) {
      const productId = Math.floor(Math.random() * 6) // 6 produtos disponíveis

      startTime = new Date()
      res = http.post(
        `${baseUrl}/cart.html`,
        {
          "add-to-cart": `sauce-labs-product-${productId}`,
        },
        {
          tags: { name: "AddToCart", instance: instanceTag, productId },
        },
      )
      loadTime = new Date() - startTime
      processingTime.add(loadTime)

      check(res, {
        "product added to cart": (r) => r.status === 200,
      }) || errors.add(1)

      sleep(Math.random() * 2 + 1)
    }

    // Visualizar carrinho
    startTime = new Date()
    res = http.get(`${baseUrl}/cart.html`, {
      tags: { name: "CartPage", instance: instanceTag },
    })
    loadTime = new Date() - startTime
    processingTime.add(loadTime)

    check(res, {
      "cart page loaded": (r) => r.status === 200 && r.body.includes("cart_contents_container"),
    }) || errors.add(1)

    sleep(Math.random() * 3 + 2)

    // Checkout
    startTime = new Date()
    res = http.get(`${baseUrl}/checkout-step-one.html`, {
      tags: { name: "CheckoutStepOne", instance: instanceTag },
    })
    loadTime = new Date() - startTime
    processingTime.add(loadTime)

    // Enviar informações pessoais com dados aleatórios
    startTime = new Date()
    res = http.post(
      `${baseUrl}/checkout-step-two.html`,
      {
        "first-name": `Test${generateRandomString(5)}`,
        "last-name": `User${generateRandomString(5)}`,
        "postal-code": `${Math.floor(Math.random() * 90000) + 10000}`, // 5 dígitos
      },
      {
        tags: { name: "SubmitUserInfo", instance: instanceTag },
      },
    )
    loadTime = new Date() - startTime
    processingTime.add(loadTime)

    // Finalizar checkout
    if (res.status === 200) {
      startTime = new Date()
      res = http.post(
        `${baseUrl}/checkout-complete.html`,
        {
          finish: true,
        },
        {
          tags: { name: "CompleteCheckout", instance: instanceTag },
        },
      )
      loadTime = new Date() - startTime
      processingTime.add(loadTime)

      check(res, {
        "checkout completed": (r) => r.status === 200,
      }) || errors.add(1)
    }
  }

  // Log de conclusão para instância específica
  console.log(`Instance ${instanceTag} completed test iteration`)

  // Pausa variável entre iterações
  sleep(Math.random() * 5 + 5)
}
