const { test, expect } = require("@playwright/test")
const AxeBuilder = require("@axe-core/playwright").default

test.describe("Advanced Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("https://www.saucedemo.com/v1/")
    await page.fill("#user-name", "standard_user")
    await page.fill("#password", "secret_sauce")
    await page.click("#login-button")
  })

  test("inventory page should not have accessibility violations", async ({ page }) => {
    await page.goto("https://www.saucedemo.com/v1/inventory.html")

    // Analisar acessibilidade usando axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(".inventory_container") // Focar em uma área específica
      .withTags(["wcag2a", "wcag2aa"]) // Verificar conformidade com WCAG 2.0 A e AA
      .analyze()

    // Verificar se não há violações críticas
    expect(accessibilityScanResults.violations.length).toBe(0)
  })

  test("checkout form should be accessible", async ({ page }) => {
    // Adicionar item ao carrinho
    await page.click(".inventory_item:first-child .btn_primary.btn_inventory")

    // Ir para o carrinho
    await page.click(".shopping_cart_container")

    // Ir para o checkout
    await page.click(".btn_action.checkout_button")

    // Analisar acessibilidade do formulário
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(".checkout_info") // Focar no formulário
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]) // Verificar WCAG 2.1 também
      .analyze()

    // Agrupa violações por tipo para análise mais detalhada
    const groupedViolations = {}
    accessibilityScanResults.violations.forEach((violation) => {
      if (!groupedViolations[violation.id]) {
        groupedViolations[violation.id] = {
          description: violation.description,
          impact: violation.impact,
          count: 0,
        }
      }
      groupedViolations[violation.id].count += violation.nodes.length
    })

    console.log("Accessibility violations by type:", JSON.stringify(groupedViolations, null, 2))

    // Verificar violações críticas específicas
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    )

    expect(criticalViolations.length).toBe(
      0,
      `Found ${criticalViolations.length} critical accessibility violations: ${JSON.stringify(criticalViolations)}`,
    )
  })

  test("navigation should be keyboard accessible", async ({ page }) => {
    // Testar navegação por teclado
    await page.keyboard.press("Tab") // Foca no primeiro item

    for (let i = 0; i < 6; i++) {
      // Pressionar Tab para navegar entre botões "ADD TO CART"
      await page.keyboard.press("Tab")
    }

    // Pressionar Enter para adicionar item ao carrinho
    await page.keyboard.press("Enter")

    // Verificar se item foi adicionado
    await expect(page.locator(".shopping_cart_badge")).toBeVisible()

    // Continuar navegação por teclado até o carrinho
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab")
    }

    // Clicar no carrinho usando teclado
    await page.keyboard.press("Enter")

    // Verificar se está na página do carrinho
    await expect(page.locator(".subheader")).toHaveText("Your Cart")
  })

  test("color contrast meets WCAG standards", async ({ page }) => {
    // Verificar contraste de cores
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"]) // WCAG 2.0 AA inclui requisitos de contraste
      .options({
        rules: {
          "color-contrast": { enabled: true },
        },
      })
      .analyze()

    // Filtrar apenas problemas de contraste
    const contrastIssues = accessibilityScanResults.violations.filter((violation) => violation.id === "color-contrast")

    // Relatório detalhado de problemas de contraste
    if (contrastIssues.length > 0) {
      console.log("Contrast issues:", JSON.stringify(contrastIssues, null, 2))
    }

    expect(contrastIssues.length).toBe(
      0,
      `Found ${contrastIssues.length} contrast issues that don't meet WCAG standards`,
    )
  })

  test("screen reader compatibility with aria attributes", async ({ page }) => {
    // Verificar atributos ARIA
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "aria"]).analyze()

    // Filtrar problemas relacionados a ARIA
    const ariaIssues = accessibilityScanResults.violations.filter((violation) => violation.id.startsWith("aria"))

    expect(ariaIssues.length).toBe(0, `Found ${ariaIssues.length} ARIA issues that affect screen readers`)
  })
})
