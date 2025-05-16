import http from "k6/http"
import { sleep } from "k6"
import { Trend, Counter, Rate } from "k6/metrics"

// Métricas personalizadas
const loginDuration = new Trend("login_duration")
const inventoryLoadDuration = new Trend("inventory_load_duration")
const addToCartDuration = new Trend("add_to_cart_duration")
const checkoutDuration = new Trend("checkout_duration")

const failedLogins = new Counter("failed_logins")
const failedAddToCart = new Counter("failed_add_to_cart")
const failedCheckouts = new Counter("failed_checkouts")

const loginSuccessRate = new Rate("login_success_rate")
const addToCartSuccessRate = new Rate("add_to_cart_success_rate")
const checkoutSuccessRate = new Rate("checkout_success_rate")

// Configuração do teste
export const options = {
  vus: 10,
  duration: "1m",
  thresholds: {
    login_duration: ["p(95)<1000"],
    inventory_load_duration: ["p(95)<800"],
    add_to_cart_duration: ["p(95)<500"],
    checkout_duration: ["p(95)<1500"],
    failed_logins: ["count<5"],
    failed_add_to_cart: ["count<3"],
    failed_checkouts: ["count<3"],
    login_success_rate: ["rate>0.95"],
    add_to_cart_success_rate: ["rate>0.98"],
    checkout_success_rate: ["rate>0.95"],
  },
}

export default function () {
  const baseUrl = "https://www.saucedemo.com/v1"

  // Página inicial
  http.get(`${baseUrl}/`)

  sleep(1)

  // Login - medindo duração
  const loginStart = new Date()
  let res = http.post(`${baseUrl}/`, {
    "user-name": "standard_user",
    password: "secret_sauce",
  })
  const loginTime = new Date() - loginStart
  loginDuration.add(loginTime)

  const isLoginSuccessful =
    res.status === 200 && (res.url.includes("/inventory.html") || res.body.includes("inventory_container"))

  loginSuccessRate.add(isLoginSuccessful ? 1 : 0)

  if (!isLoginSuccessful) {
    failedLogins.add(1)
    return
  }

  sleep(1)

  // Página de inventário - medindo duração
  const inventoryStart = new Date()
  res = http.get(`${baseUrl}/inventory.html`)
  const inventoryTime = new Date() - inventoryStart
  inventoryLoadDuration.add(inventoryTime)

  sleep(1)

  // Adicionar ao carrinho - medindo duração
  const addToCartStart = new Date()
  res = http.post(`${baseUrl}/cart.html`, {
    "add-to-cart": "sauce-labs-backpack",
  })
  const addToCartTime = new Date() - addToCartStart
  addToCartDuration.add(addToCartTime)

  const isAddToCartSuccessful = res.status === 200
  addToCartSuccessRate.add(isAddToCartSuccessful ? 1 : 0)

  if (!isAddToCartSuccessful) {
    failedAddToCart.add(1)
  }

  sleep(1)

  // Checkout - medindo duração
  const checkoutStart = new Date()

  // Visualizar carrinho
  res = http.get(`${baseUrl}/cart.html`)

  // Checkout - Passo 1
  res = http.get(`${baseUrl}/checkout-step-one.html`)

  // Enviar informações pessoais
  res = http.post(`${baseUrl}/checkout-step-two.html`, {
    "first-name": "Test",
    "last-name": "User",
    "postal-code": "12345",
  })

  // Checkout - Passo 2
  res = http.get(`${baseUrl}/checkout-step-two.html`)

  // Finalizar compra
  res = http.post(`${baseUrl}/checkout-complete.html`, {
    finish: true,
  })

  const checkoutTime = new Date() - checkoutStart
  checkoutDuration.add(checkoutTime)

  const isCheckoutSuccessful = res.status === 200
  checkoutSuccessRate.add(isCheckoutSuccessful ? 1 : 0)

  if (!isCheckoutSuccessful) {
    failedCheckouts.add(1)
  }

  sleep(1)
}
