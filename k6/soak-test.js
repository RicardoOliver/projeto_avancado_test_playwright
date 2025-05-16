import http from "k6/http"
import { sleep, check } from "k6"
import { Counter } from "k6/metrics"

// Métricas personalizadas
const errors = new Counter("errors")

// Configuração do teste de soak (longa duração)
export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Rampa de subida para 50 usuários em 2 minutos
    { duration: "3h", target: 50 }, // Manter 50 usuários por 3 horas
    { duration: "2m", target: 0 }, // Rampa de descida para 0 usuários em 2 minutos
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% das requisições devem completar abaixo de 500ms
    errors: ["count<100"], // Menos de 100 erros durante todo o teste
  },
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"

  // Página inicial
  let res = http.get(`${baseUrl}/`)

  check(res, {
    "homepage status is 200": (r) => r.status === 200,
  }) || errors.add(1)

  sleep(Math.random() * 3 + 2) // Pausa aleatória entre 2-5 segundos

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
    sleep(Math.random() * 5 + 5) // Pausa aleatória entre 5-10 segundos

    // Página de inventário
    res = http.get(`${baseUrl}/inventory.html`)

    check(res, {
      "inventory page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(Math.random() * 10 + 5) // Pausa aleatória entre 5-15 segundos

    // Adicionar ao carrinho (simulação)
    res = http.post(`${baseUrl}/cart.html`, {
      "add-to-cart": "sauce-labs-backpack",
    })

    check(res, {
      "item added to cart": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(Math.random() * 5 + 2) // Pausa aleatória entre 2-7 segundos

    // Visualizar carrinho
    res = http.get(`${baseUrl}/cart.html`)

    check(res, {
      "cart page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(Math.random() * 5 + 3) // Pausa aleatória entre 3-8 segundos
  }

  sleep(Math.random() * 3 + 2) // Pausa aleatória entre 2-5 segundos
}
