import http from "k6/http"
import { sleep, check } from "k6"
import { Counter } from "k6/metrics"

// Métricas personalizadas
const errors = new Counter("errors")

// Configuração do teste de spike (picos de carga)
export const options = {
  stages: [
    { duration: "10s", target: 10 }, // Nível base: 10 usuários
    { duration: "1m", target: 10 }, // Manter nível base
    { duration: "10s", target: 200 }, // Spike para 200 usuários
    { duration: "3m", target: 200 }, // Manter no pico
    { duration: "10s", target: 10 }, // Voltar ao nível base
    { duration: "3m", target: 10 }, // Manter nível base
    { duration: "10s", target: 0 }, // Rampa de descida para 0
  ],
  thresholds: {
    http_req_duration: ["p(99)<3000"], // 99% das requisições devem completar abaixo de 3s
    http_req_failed: ["rate<0.1"], // Menos de 10% das requisições podem falhar durante o spike
  },
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"

  // Página inicial
  let res = http.get(`${baseUrl}/`)

  check(res, {
    "homepage status is 200": (r) => r.status === 200,
  }) || errors.add(1)

  sleep(1)

  // Login
  res = http.post(`${baseUrl}/`, {
    "user-name": "standard_user",
    password: "secret_sauce",
  })

  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  check(res, {
    "login successful": () => isLoginSuccessful,
  }) || errors.add(1)

  if (isLoginSuccessful) {
    sleep(1)

    // Página de inventário com ordenação aleatória
    const sortOptions = ["az", "za", "lohi", "hilo"]
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)]

    res = http.get(`${baseUrl}/inventory.html?sort=${randomSort}`)

    check(res, {
      "inventory page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(1)

    // Adicionar ao carrinho (simulação)
    res = http.post(`${baseUrl}/cart.html`, {
      "add-to-cart": "sauce-labs-backpack",
    })

    check(res, {
      "item added to cart": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(1)

    // Visualizar carrinho
    res = http.get(`${baseUrl}/cart.html`)

    check(res, {
      "cart page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(1)
  }

  sleep(1)
}
