import http from "k6/http"
import { sleep, check } from "k6"
import { Counter, Trend } from "k6/metrics"

// Métricas personalizadas
const apiErrors = new Counter("api_errors")
const apiResponseTime = new Trend("api_response_time")

// Configuração do teste para APIs
export const options = {
  scenarios: {
    // Teste de carga para API de inventário
    inventory_api: {
      executor: "constant-arrival-rate",
      rate: 20,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 10,
      maxVUs: 50,
      exec: "inventoryApiTest",
      env: { API_TYPE: "inventory" },
    },
    // Teste de carga para API de carrinho
    cart_api: {
      executor: "constant-arrival-rate",
      rate: 10,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 10,
      maxVUs: 30,
      exec: "cartApiTest",
      env: { API_TYPE: "cart" },
    },
    // Teste de carga para API de checkout
    checkout_api: {
      executor: "ramping-arrival-rate",
      startRate: 5,
      timeUnit: "1s",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 0 },
      ],
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: "checkoutApiTest",
      env: { API_TYPE: "checkout" },
    },
  },
  thresholds: {
    api_response_time: ["p(95)<300"],
    api_errors: ["count<50"],
    http_req_failed: ["rate<0.01"],
  },
}

// Autenticação para obter tokens/cookies
function getAuthToken() {
  const loginResponse = http.post("https://www.saucedemo.com/v1/", {
    "user-name": "standard_user",
    password: "secret_sauce",
  })

  check(loginResponse, {
    "login successful": (r) => r.status === 200,
  })

  // Em um cenário real, extrairíamos o token aqui
  // Como estamos simulando, criaremos um token fictício
  const simulatedToken = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  return {
    token: simulatedToken,
    cookies: loginResponse.cookies,
    success: loginResponse.status === 200,
  }
}

// Teste para API de inventário
export function inventoryApiTest() {
  const auth = getAuthToken()

  if (!auth.success) {
    apiErrors.add(1)
    return
  }

  const headers = {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  }

  // Simulação de diferentes endpoints de API para inventário
  const inventoryEndpoints = [
    "/api/v1/inventory",
    "/api/v1/inventory/filter?sort=price_low",
    "/api/v1/inventory/filter?sort=price_high",
    "/api/v1/inventory/filter?sort=az",
    "/api/v1/inventory/filter?sort=za",
    "/api/v1/inventory/product/4",
  ]

  // Selecionar endpoint aleatório
  const endpoint = inventoryEndpoints[Math.floor(Math.random() * inventoryEndpoints.length)]

  // Fazer requisição
  const startTime = new Date()
  const res = http.get(`https://www.saucedemo.com${endpoint}`, {
    headers,
    tags: { name: "InventoryAPI", endpoint },
  })
  const responseTime = new Date() - startTime

  // Registrar métricas
  apiResponseTime.add(responseTime)

  // Verificações
  const isSuccess = check(res, {
    "API status is 200": (r) => r.status === 200,
    "Response time is acceptable": () => responseTime < 500,
  })

  if (!isSuccess) {
    apiErrors.add(1)
  }

  sleep(Math.random() * 2 + 1)
}

// Teste para API de carrinho
export function cartApiTest() {
  const auth = getAuthToken()

  if (!auth.success) {
    apiErrors.add(1)
    return
  }

  const headers = {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  }

  // Operações de carrinho
  const cartOperations = [
    { method: "GET", url: "/api/v1/cart", payload: null, name: "GetCart" },
    { method: "POST", url: "/api/v1/cart", payload: { productId: 4, quantity: 1 }, name: "AddToCart" },
    { method: "PUT", url: "/api/v1/cart/item/4", payload: { quantity: 2 }, name: "UpdateCartItem" },
    { method: "DELETE", url: "/api/v1/cart/item/4", payload: null, name: "RemoveFromCart" },
  ]

  // Selecionar operação aleatória
  const operation = cartOperations[Math.floor(Math.random() * cartOperations.length)]

  // Fazer requisição
  const startTime = new Date()
  let res

  if (operation.method === "GET") {
    res = http.get(`https://www.saucedemo.com${operation.url}`, {
      headers,
      tags: { name: operation.name },
    })
  } else if (operation.method === "POST") {
    res = http.post(`https://www.saucedemo.com${operation.url}`, JSON.stringify(operation.payload), {
      headers,
      tags: { name: operation.name },
    })
  } else if (operation.method === "PUT") {
    res = http.put(`https://www.saucedemo.com${operation.url}`, JSON.stringify(operation.payload), {
      headers,
      tags: { name: operation.name },
    })
  } else if (operation.method === "DELETE") {
    res = http.del(`https://www.saucedemo.com${operation.url}`, null, { headers, tags: { name: operation.name } })
  }

  const responseTime = new Date() - startTime

  // Registrar métricas
  apiResponseTime.add(responseTime)

  // Verificações
  const isSuccess = check(res, {
    "API operation successful": (r) => r.status >= 200 && r.status < 300,
    "Response time is acceptable": () => responseTime < 400,
  })

  if (!isSuccess) {
    apiErrors.add(1)
  }

  sleep(Math.random() * 1 + 0.5)
}

// Teste para API de checkout
export function checkoutApiTest() {
  const auth = getAuthToken()

  if (!auth.success) {
    apiErrors.add(1)
    return
  }

  const headers = {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  }

  // Simular fluxo completo de checkout via API
  let startTime, res, responseTime

  // 1. Adicionar item ao carrinho
  startTime = new Date()
  res = http.post("https://www.saucedemo.com/api/v1/cart", JSON.stringify({ productId: 4, quantity: 1 }), {
    headers,
    tags: { name: "CheckoutAPI_AddToCart" },
  })
  responseTime = new Date() - startTime
  apiResponseTime.add(responseTime)

  if (res.status !== 200 && res.status !== 201) {
    apiErrors.add(1)
    return
  }

  sleep(0.5)

  // 2. Iniciar checkout
  startTime = new Date()
  res = http.post("https://www.saucedemo.com/api/v1/checkout/start", null, {
    headers,
    tags: { name: "CheckoutAPI_StartCheckout" },
  })
  responseTime = new Date() - startTime
  apiResponseTime.add(responseTime)

  if (res.status !== 200) {
    apiErrors.add(1)
    return
  }

  sleep(0.5)

  // 3. Enviar informações pessoais
  startTime = new Date()
  res = http.post(
    "https://www.saucedemo.com/api/v1/checkout/info",
    JSON.stringify({
      firstName: "API",
      lastName: "Test",
      postalCode: "12345",
    }),
    { headers, tags: { name: "CheckoutAPI_Info" } },
  )
  responseTime = new Date() - startTime
  apiResponseTime.add(responseTime)

  if (res.status !== 200) {
    apiErrors.add(1)
    return
  }

  sleep(0.5)

  // 4. Confirmar pedido
  startTime = new Date()
  res = http.post("https://www.saucedemo.com/api/v1/checkout/confirm", null, {
    headers,
    tags: { name: "CheckoutAPI_Confirm" },
  })
  responseTime = new Date() - startTime
  apiResponseTime.add(responseTime)

  // Verificações
  const isSuccess = check(res, {
    "Checkout API flow completed": (r) => r.status === 200 || r.status === 201,
    "Response time is acceptable": () => responseTime < 600,
  })

  if (!isSuccess) {
    apiErrors.add(1)
  }

  sleep(Math.random() * 2 + 1)
}
