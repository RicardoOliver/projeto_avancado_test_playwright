import http from "k6/http"
import { sleep, check, group } from "k6"
import { Rate } from "k6/metrics"

// Métricas personalizadas
const failRate = new Rate("failed_requests")

// Configuração do teste
export const options = {
  vus: 10,
  duration: "1m",
  thresholds: {
    "http_req_duration{endpoint:login}": ["p(95)<1000"],
    "http_req_duration{endpoint:inventory}": ["p(95)<800"],
    "http_req_duration{endpoint:cart}": ["p(95)<600"],
    "http_req_duration{endpoint:checkout}": ["p(95)<1200"],
    failed_requests: ["rate<0.05"],
  },
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"

  group("API - Login", () => {
    const res = http.post(
      `${baseUrl}/`,
      {
        "user-name": "standard_user",
        password: "secret_sauce",
      },
      {
        tags: { endpoint: "login" },
      },
    )

    const success = check(res, {
      "login status is 200": (r) => r.status === 200,
      "redirected to inventory": (r) => r.url.includes("/inventory.html") || r.body.includes("inventory_container"),
    })

    failRate.add(!success)
    sleep(1)
  })

  group("API - Inventory", () => {
    const res = http.get(`${baseUrl}/inventory.html`, {
      tags: { endpoint: "inventory" },
    })

    const success = check(res, {
      "inventory status is 200": (r) => r.status === 200,
      "products are displayed": (r) => r.body.includes("inventory_item"),
    })

    failRate.add(!success)
    sleep(1)
  })

  group("API - Add to Cart", () => {
    const res = http.post(
      `${baseUrl}/cart.html`,
      {
        "add-to-cart": "sauce-labs-backpack",
      },
      {
        tags: { endpoint: "cart" },
      },
    )

    const success = check(res, {
      "add to cart status is 200": (r) => r.status === 200,
    })

    failRate.add(!success)
    sleep(1)
  })

  group("API - Cart", () => {
    const res = http.get(`${baseUrl}/cart.html`, {
      tags: { endpoint: "cart" },
    })

    const success = check(res, {
      "cart status is 200": (r) => r.status === 200,
      "cart page contains cart list": (r) => r.body.includes("cart_list"),
    })

    failRate.add(!success)
    sleep(1)
  })

  group("API - Checkout", () => {
    // Checkout - Passo 1
    let res = http.get(`${baseUrl}/checkout-step-one.html`, {
      tags: { endpoint: "checkout" },
    })

    // Enviar informações pessoais
    res = http.post(
      `${baseUrl}/checkout-step-two.html`,
      {
        "first-name": "Test",
        "last-name": "User",
        "postal-code": "12345",
      },
      {
        tags: { endpoint: "checkout" },
      },
    )

    const success = check(res, {
      "checkout info status is 200": (r) => r.status === 200,
    })

    failRate.add(!success)
    sleep(1)
  })
}
