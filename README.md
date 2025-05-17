# Sauce Demo Advanced Testing Project

Este é um projeto avançado de testes automatizados para o site Sauce Demo (https://www.saucedemo.com/v1/) utilizando Playwright, JavaScript e k6 para testes de carga, tudo containerizado com Docker.

## A explicação do resultado dos testes esta na pasta .github/workflows | README-CI.md

## Novos Recursos Implementados

1. **Docker** - Ambiente completo containerizado com:
   - Container para testes Playwright
   - Container para testes k6
   - InfluxDB para armazenamento de métricas
   - Grafana para visualização de resultados

2. **CI/CD**
   - Configuração de GitHub Actions para execução automática de testes
   - Agendamento de testes diários
   - Armazenamento de artefatos de teste

3. **Testes de API Reais**
   - Testes utilizando o módulo `request` do Playwright
   - Simulação de requisições de API reais
   - Teste de fluxos completos via API

4. **Testes de Acessibilidade Avançados**
   - Integração com Axe-core
   - Verificação de conformidade com WCAG 2.0/2.1
   - Testes específicos para navegação por teclado
   - Verificação de contraste de cores

5. **Relatórios Personalizados**
   - Reporter HTML personalizado
   - Métricas detalhadas de execução
   - Exportação de resultados em formatos para integração

6. **Testes de Carga Distribuídos**
   - Testes distribuídos com k6
   - Múltiplos cenários em paralelo
   - Métricas personalizadas de desempenho

7. **Integração k6 com Grafana**
   - Dashboard personalizado para visualização
   - Armazenamento de resultados em InfluxDB
   - Monitoramento em tempo real

8. **Testes de Carga para APIs**
   - Testes específicos para APIs por endpoint
   - Simulação de diferentes padrões de carga
   - Validação de SLAs de performance

9. **Testes de Carga para Cenários de Negócio**
   - Fluxos completos de negócio simulados
   - Diferentes perfis de usuário
   - Simulação de comportamentos reais

## Estrutura do Projeto

```bash
sauce-demo-tests/
├── tests/
│   ├── login.spec.js
│   ├── inventory.spec.js
│   ├── cart.spec.js
│   ├── checkout.spec.js
│   ├── visual.spec.js
│   ├── performance.spec.js
│   ├── api/
│   │   └── api.spec.js
│   ├── accessibility/
│   │   └── advanced-a11y.spec.js
│   ├── reporting/
│   │   ├── custom-reporter.js
│   │   └── generate-report.js
│   ├── pom.spec.js
│   ├── api-simulation.spec.js
│   └── page-objects/
│       ├── LoginPage.js
│       ├── InventoryPage.js
│       ├── CartPage.js
│       └── CheckoutPage.js
├── k6/
│   ├── load-test.js
│   ├── stress-test.js
│   ├── soak-test.js
│   ├── spike-test.js
│   ├── distributed-load-test.js
│   ├── api-load-test.js
│   ├── business-scenarios.js
│   ├── custom-metrics.js
│   └── README.md
├── grafana/
│   ├── provisioning/
│   │   └── datasources/
│   │       └── influxdb.yml
│   └── dashboards/
│       └── k6-dashboard.json
├── .github/
│   └── workflows/
│       └── main.yml
├── Dockerfile.playwright
├── Dockerfile.k6
├── docker-compose.yml
├── playwright.config.js
├── package.json
└── README.md
```

## Requisitos

- Docker e Docker Compose
- Node.js (v14 ou superior) para execução local
- k6 (para execução local de testes de carga)

## Usando com Docker

## 🐳 Usando com Docker

### Comandos Básicos

```bash
# Iniciar todos os serviços em background
docker-compose up -d

# Executar apenas os testes Playwright
docker-compose run playwright npx playwright test

# Executar apenas testes de carga k6
docker-compose run k6 k6 run /app/k6/load-test.js

# Parar todos os serviços
docker-compose down

## Gerenciamento de Containers com Portainer

Este projeto utiliza o [Portainer](https://www.portainer.io/) para facilitar o gerenciamento dos containers Docker através de uma interface web intuitiva.

### O que é o Portainer?

Portainer é uma interface gráfica de gerenciamento para Docker que permite visualizar e administrar containers, imagens, volumes e redes através de um painel web amigável, sem necessidade de usar comandos CLI.

### Acessando o Portainer

1. Inicie os containers do projeto com:
   ```bash
   docker-compose up -d

###Acesse o Portainer em seu navegador:

http://localhost:9000

### Acessando os Dashboards

- **Grafana**: http://localhost:3000 (usuário e senha: admin/admin)
- **Relatório Playwright**: Disponível em ./playwright-report após execução

## Instalação Local

\`\`\`bash
# Clonar o repositório
git clone https://github.com/seu-usuario/sauce-demo-tests.git
cd sauce-demo-tests

# Instalar dependências
npm install

# Instalar navegadores do Playwright
npx playwright install
\`\`\`

## Executando os Testes Localmente

### Testes Playwright

\`\`\`bash
# Executar todos os testes
npm test

# Executar testes com interface visual
npm run test:ui

# Executar testes de API
npm run test:api

# Executar testes de acessibilidade
npm run test:a11y

# Gerar relatório personalizado
npm run report:custom
\`\`\`

### Testes de Carga k6

\`\`\`bash
# Executar teste de carga básico
npm run k6:load

# Executar teste distribuído
npm run k6:distributed

# Executar testes de API
npm run k6:api

# Executar cenários de negócio
npm run k6:business

# Executar com integração ao Grafana
npm run k6:grafana
\`\`\`

## CI/CD

O projeto está configurado com GitHub Actions para execução automática de testes:

- Execução em cada push para main/master
- Execução em pull requests
- Execução diária automatizada à meia-noite
- Armazenamento de relatórios como artefatos

## Recursos Avançados Implementados

1. **Containerização Completa**
   - Todo o ambiente de testes isolado e reproduzível
   - Configuração Multi-Container com Docker Compose
   - Volumes compartilhados para persistência de dados

2. **Testes de Acessibilidade WCAG Completos**
   - Verificação automática contra padrões WCAG 2.0/2.1 A, AA
   - Testes para navegação por teclado
   - Testes de contraste de cor
   - Verificação de atributos ARIA

3. **Sistema de Monitoramento Visual**
   - Dashboard Grafana para métricas em tempo real
   - Visualização de tendências de performance
   - Alertas para degradação de performance

4. **Testes de Carga Realistas**
   - Simulação de comportamento real de usuários
   - Padrões de navegação aleatórios
   - Tempos de espera realistas entre ações

5. **Testes Distribuídos**
   - Execução paralela de cenários
   - Simulação de carga de diferentes regiões
   - Métricas agregadas de execuções distribuídas
