import http from "k6/http"
import { sleep, check } from "k6"
import { Counter } from "k6/metrics"

// Métricas personalizadas
const loginErrors = new Counter("login_errors")
const addToCartErrors = new Counter("add_to_cart_errors")

// Configuração do teste de carga
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Rampa de subida para 20 usuários em 30 segundos
    { duration: "1m", target: 20 }, // Manter 20 usuários por 1 minuto
    { duration: "30s", target: 0 }, // Rampa de descida para 0 usuários em 30 segundos
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% das requisições devem completar abaixo de 500ms
    http_req_failed: ["rate<0.01"], // Menos de 1% das requisições podem falhar
    login_errors: ["count<5"], // Menos de 5 erros de login
    add_to_cart_errors: ["count<5"], // Menos de 5 erros ao adicionar ao carrinho
  },
}

// Função auxiliar para gerar um ID de sessão único
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"
  const sessionId = generateSessionId()

  // Página inicial
  let res = http.get(`${baseUrl}/`, {
    tags: { name: "HomePage" },
    cookies: { session_id: sessionId },
  })

  check(res, {
    "homepage status is 200": (r) => r.status === 200,
    "homepage has login form": (r) => r.body.includes("login-button"),
  }) || loginErrors.add(1)

  sleep(Math.random() * 3 + 1) // Pausa aleatória entre 1-4 segundos

  // Login
  res = http.post(
    `${baseUrl}/`,
    {
      "user-name": "standard_user",
      password: "secret_sauce",
    },
    {
      tags: { name: "Login" },
      cookies: { session_id: sessionId },
    },
  )

  // Verificar redirecionamento para a página de inventário após o login
  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  check(res, {
    "login successful": () => isLoginSuccessful,
  }) || loginErrors.add(1)

  if (isLoginSuccessful) {
    sleep(Math.random() * 3 + 1)

    // Página de inventário
    res = http.get(`${baseUrl}/inventory.html`, {
      tags: { name: "InventoryPage" },
      cookies: { session_id: sessionId },
    })

    check(res, {
      "inventory page loaded": (r) => r.status === 200 && r.body.includes("inventory_container"),
      "products are displayed": (r) => r.body.includes("inventory_item"),
    })

    sleep(Math.random() * 3 + 1)

    // Adicionar ao carrinho (simulação)
    res = http.post(
      `${baseUrl}/cart.html`,
      {
        "add-to-cart": "sauce-labs-backpack",
      },
      {
        tags: { name: "AddToCart" },
        cookies: { session_id: sessionId },
      },
    )

    check(res, {
      "item added to cart": (r) => r.status === 200,
    }) || addToCartErrors.add(1)

    sleep(Math.random() * 2 + 1)

    // Visualizar carrinho
    res = http.get(`${baseUrl}/cart.html`, {
      tags: { name: "CartPage" },
      cookies: { session_id: sessionId },
    })

    check(res, {
      "cart page loaded": (r) => r.status === 200 && r.body.includes("cart_contents_container"),
    })

    sleep(Math.random() * 2 + 1)

    // Checkout - Passo 1
    res = http.get(`${baseUrl}/checkout-step-one.html`, {
      tags: { name: "CheckoutStep1" },
      cookies: { session_id: sessionId },
    })

    check(res, {
      "checkout step 1 loaded": (r) => r.status === 200 && r.body.includes("checkout_info_container"),
    })

    sleep(Math.random() * 2 + 1)

    // Enviar informações pessoais
    res = http.post(
      `${baseUrl}/checkout-step-two.html`,
      {
        "first-name": "Test",
        "last-name": "User",
        "postal-code": "12345",
      },
      {
        tags: { name: "CheckoutInfo" },
        cookies: { session_id: sessionId },
      },
    )

    check(res, {
      "checkout info submitted": (r) => r.status === 200,
    })

    sleep(Math.random() * 2 + 1)

    // Checkout - Passo 2
    res = http.get(`${baseUrl}/checkout-step-two.html`, {
      tags: { name: "CheckoutStep2" },
      cookies: { session_id: sessionId },
    })

    check(res, {
      "checkout step 2 loaded": (r) => r.status === 200 && r.body.includes("checkout_summary_container"),
    })

    sleep(Math.random() * 2 + 1)

    // Finalizar compra
    res = http.post(
      `${baseUrl}/checkout-complete.html`,
      {
        finish: true,
      },
      {
        tags: { name: "FinishCheckout" },
        cookies: { session_id: sessionId },
      },
    )

    check(res, {
      "checkout completed": (r) => r.status === 200,
    })

    sleep(Math.random() * 2 + 1)

    // Página de confirmação
    res = http.get(`${baseUrl}/checkout-complete.html`, {
      tags: { name: "CheckoutComplete" },
      cookies: { session_id: sessionId },
    })

    check(res, {
      "confirmation page loaded": (r) => r.status === 200 && r.body.includes("complete-header"),
    })
  }

  sleep(Math.random() * 3 + 1)
}
