import http from "k6/http"
import { sleep, check } from "k6"
import { Counter } from "k6/metrics"

// Métricas personalizadas
const errors = new Counter("errors")

// Configuração do teste de estresse
export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Rampa de subida para 100 usuários em 2 minutos
    { duration: "5m", target: 100 }, // Manter 100 usuários por 5 minutos
    { duration: "2m", target: 200 }, // Rampa de subida para 200 usuários em 2 minutos
    { duration: "5m", target: 200 }, // Manter 200 usuários por 5 minutos
    { duration: "2m", target: 0 }, // Rampa de descida para 0 usuários em 2 minutos
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% das requisições devem completar abaixo de 2s
    http_req_failed: ["rate<0.05"], // Menos de 5% das requisições podem falhar
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

  // Login (alternando entre usuários)
  const users = [
    { username: "standard_user", password: "secret_sauce" },
    { username: "problem_user", password: "secret_sauce" },
    { username: "performance_glitch_user", password: "secret_sauce" },
  ]

  const randomUser = users[Math.floor(Math.random() * users.length)]

  res = http.post(`${baseUrl}/`, {
    "user-name": randomUser.username,
    password: randomUser.password,
  })

  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  check(res, {
    "login successful": () => isLoginSuccessful,
  }) || errors.add(1)

  if (isLoginSuccessful) {
    sleep(1)

    // Página de inventário
    res = http.get(`${baseUrl}/inventory.html`)

    check(res, {
      "inventory page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(1)

    // Adicionar vários itens ao carrinho (simulação de uso intenso)
    for (let i = 0; i < 3; i++) {
      res = http.post(`${baseUrl}/cart.html`, {
        "add-to-cart": `item-${i}`,
      })

      check(res, {
        "item added to cart": (r) => r.status === 200,
      }) || errors.add(1)

      sleep(0.5)
    }

    // Visualizar carrinho
    res = http.get(`${baseUrl}/cart.html`)

    check(res, {
      "cart page loaded": (r) => r.status === 200,
    }) || errors.add(1)

    sleep(1)
  }

  sleep(1)
}
