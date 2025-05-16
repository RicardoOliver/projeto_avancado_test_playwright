const fs = require("fs")
const path = require("path")
const CustomHTMLReporter = require("./custom-reporter")

// Simula a geração de um relatório a partir de resultados existentes
async function generateReport() {
  try {
    // Lê resultados do relatório padrão do Playwright
    const jsonReportPath = path.join(process.cwd(), "playwright-report", "results.json")

    if (!fs.existsSync(jsonReportPath)) {
      console.error("No Playwright test results found. Run tests first.")
      process.exit(1)
    }

    const results = JSON.parse(fs.readFileSync(jsonReportPath, "utf8"))

    // Cria instância do reporter customizado
    const reporter = new CustomHTMLReporter()

    // Simula início do teste
    reporter.onBegin(
      { reportSlowTests: { max: 5, threshold: 5000 } },
      { allTests: () => results.suites.flatMap((s) => s.specs) },
    )

    // Processa resultados de teste
    for (const suite of results.suites) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          const result = test.results[0]

          reporter.onTestEnd(
            { title: spec.title, location: { file: spec.file, line: 1, column: 1 } },
            {
              status: result.status,
              duration: result.duration,
              retry: 0,
              error: result.error ? { message: result.error.message, stack: result.error.stack } : null,
              attachments: result.attachments || [],
            },
          )
        }
      }
    }

    // Finaliza o relatório
    reporter.onEnd({ status: "passed" })

    console.log("Custom report generated successfully!")
  } catch (error) {
    console.error("Error generating custom report:", error)
    process.exit(1)
  }
}

generateReport().catch(console.error)
