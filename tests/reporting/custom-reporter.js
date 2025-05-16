const fs = require("fs")
const path = require("path")

class CustomHTMLReporter {
  constructor() {
    this.results = {
      passes: [],
      failures: [],
      skipped: [],
      startTime: new Date(),
      endTime: null,
      duration: 0,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flakyTests: 0,
      },
    }
  }

  onBegin(config, suite) {
    this.results.startTime = new Date()
    this.results.summary.total = suite.allTests().length
    console.log(`Starting the run with ${this.results.summary.total} tests`)
  }

  onTestBegin(test) {
    console.log(`Running ${test.title}`)
  }

  onTestEnd(test, result) {
    const testInfo = {
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      column: test.location.column,
      duration: result.duration,
      status: result.status,
      retry: result.retry,
      error: result.error ? result.error.message : null,
      errorStack: result.error ? result.error.stack : null,
      attachments: result.attachments.map((a) => ({
        name: a.name,
        contentType: a.contentType,
        path: a.path,
      })),
    }

    if (result.status === "passed") {
      this.results.passes.push(testInfo)
      this.results.summary.passed++
    } else if (result.status === "failed") {
      this.results.failures.push(testInfo)
      this.results.summary.failed++
    } else if (result.status === "skipped") {
      this.results.skipped.push(testInfo)
      this.results.summary.skipped++
    }

    if (result.retry > 0) {
      this.results.summary.flakyTests++
    }
  }

  onEnd(result) {
    this.results.endTime = new Date()
    this.results.duration = this.results.endTime - this.results.startTime

    // Calcular taxas de sucesso e métricas de qualidade
    this.results.summary.successRate = (this.results.summary.passed / this.results.summary.total) * 100
    this.results.summary.flakyRate = (this.results.summary.flakyTests / this.results.summary.total) * 100

    // Gerar relatório HTML
    this._generateHTMLReport()

    // Gerar relatório JSON para integração com outras ferramentas
    this._generateJSONReport()

    console.log(`Finished the run: ${this.results.summary.passed}/${this.results.summary.total} tests passed`)
  }

  _generateHTMLReport() {
    const reportDir = path.join(process.cwd(), "custom-report")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportPath = path.join(reportDir, "custom-report.html")

    // Conteúdo do relatório HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Custom Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .summary { display: flex; background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .summary div { flex: 1; text-align: center; }
          .summary h2 { margin: 0; font-size: 18px; }
          .summary p { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .test-section { margin: 20px 0; }
          .test-list { list-style-type: none; padding: 0; }
          .test-item { background: #fff; border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 5px; }
          .test-title { font-weight: bold; font-size: 16px; }
          .test-file { color: #666; margin-top: 5px; font-size: 14px; }
          .test-duration { font-size: 14px; color: #666; }
          .test-error { background: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; }
          .success { color: #28a745; }
          .fail { color: #dc3545; }
          .skip { color: #ffc107; }
          .flaky { color: #fd7e14; }
        </style>
      </head>
      <body>
        <h1>Custom Test Report</h1>
        
        <div class="summary">
          <div>
            <h2>Total</h2>
            <p>${this.results.summary.total}</p>
          </div>
          <div>
            <h2>Passed</h2>
            <p class="success">${this.results.summary.passed}</p>
          </div>
          <div>
            <h2>Failed</h2>
            <p class="fail">${this.results.summary.failed}</p>
          </div>
          <div>
            <h2>Skipped</h2>
            <p class="skip">${this.results.summary.skipped}</p>
          </div>
          <div>
            <h2>Flaky</h2>
            <p class="flaky">${this.results.summary.flakyTests}</p>
          </div>
          <div>
            <h2>Success Rate</h2>
            <p>${this.results.summary.successRate.toFixed(2)}%</p>
          </div>
        </div>
        
        <div class="test-section">
          <h2 class="fail">Failed Tests (${this.results.failures.length})</h2>
          <ul class="test-list">
            ${this.results.failures
              .map(
                (test) => `
              <li class="test-item">
                <div class="test-title">${test.title}</div>
                <div class="test-file">${test.file}:${test.line}:${test.column}</div>
                <div class="test-duration">Duration: ${test.duration}ms</div>
                ${test.error ? `<div class="test-error">${test.error}\n\n${test.errorStack || ""}</div>` : ""}
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
        
        <div class="test-section">
          <h2 class="success">Passed Tests (${this.results.passes.length})</h2>
          <ul class="test-list">
            ${this.results.passes
              .map(
                (test) => `
              <li class="test-item">
                <div class="test-title">${test.title}</div>
                <div class="test-file">${test.file}:${test.line}:${test.column}</div>
                <div class="test-duration">Duration: ${test.duration}ms</div>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
        
        <div class="test-section">
          <h2 class="skip">Skipped Tests (${this.results.skipped.length})</h2>
          <ul class="test-list">
            ${this.results.skipped
              .map(
                (test) => `
              <li class="test-item">
                <div class="test-title">${test.title}</div>
                <div class="test-file">${test.file}:${test.line}:${test.column}</div>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
        
        <footer>
          <p>Report generated at: ${this.results.endTime.toISOString()}</p>
          <p>Total duration: ${(this.results.duration / 1000).toFixed(2)} seconds</p>
        </footer>
      </body>
      </html>
    `

    fs.writeFileSync(reportPath, htmlContent)
    console.log(`Custom HTML report generated at: ${reportPath}`)
  }

  _generateJSONReport() {
    const reportDir = path.join(process.cwd(), "custom-report")
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const jsonReportPath = path.join(reportDir, "custom-report.json")
    fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2))
    console.log(`Custom JSON report generated at: ${jsonReportPath}`)
  }
}

module.exports = CustomHTMLReporter
