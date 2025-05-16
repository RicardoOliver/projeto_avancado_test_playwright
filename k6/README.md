# Testes de Carga com k6

Este diretório contém scripts para testes de carga do site Sauce Demo utilizando o k6.

## Tipos de Testes

### 1. Teste de Carga (load-test.js)

Simula um aumento gradual de usuários para avaliar o comportamento do sistema sob carga normal.

- Rampa de subida para 20 usuários em 30 segundos
- Mantém 20 usuários por 1 minuto
- Rampa de descida para 0 usuários em 30 segundos

Thresholds:
- 95% das requisições devem completar abaixo de 500ms
- Menos de 1% das requisições podem falhar
- Menos de 5 erros de login
- Menos de 5 erros ao adicionar ao carrinho

### 2. Teste de Estresse (stress-test.js)

Avalia os limites do sistema aumentando a carga além do esperado em produção.

- Rampa de subida para 100 usuários em 2 minutos
- Mantém 100 usuários por 5 minutos
- Rampa de subida para 200 usuários em 2 minutos
- Mantém 200 usuários por 5 minutos
- Rampa de descida para 0 usuários em 2 minutos

Thresholds:
- 95% das requisições devem completar abaixo de 2 segundos
- Menos de 5% das requisições podem falhar

### 3. Teste de Longa Duração (soak-test.js)

Avalia o comportamento do sistema durante um longo período de tempo para detectar vazamentos de memória e outros problemas.

- Rampa de subida para 50 usuários em 2 minutos
- Mantém 50 usuários por 3 horas
- Rampa de descida para 0 usuários em 2 minutos

Thresholds:
- 95% das requisições devem completar abaixo de 500ms
- Menos de 100 erros durante todo o teste

### 4. Teste de Picos de Carga (spike-test.js)

Avalia como o sistema reage a picos repentinos de carga.

- Nível base: 10 usuários
- Spike para 200 usuários
- Retorno ao nível base

Thresholds:
- 99% das requisições devem completar abaixo de 3 segundos
- Menos de 10% das requisições podem falhar durante o spike

### 5. Teste com Métricas Personalizadas (custom-metrics.js)

Utiliza métricas personalizadas para análise detalhada do desempenho.

Métricas:
- Duração do login
- Duração do carregamento da página de inventário
- Duração da adição ao carrinho
- Duração do checkout
- Taxa de sucesso de login
- Taxa de sucesso de adição ao carrinho
- Taxa de sucesso de checkout

## Executando os Testes

\`\`\`bash
# Executar teste de carga básico
k6 run load-test.js

# Executar teste de estresse
k6 run stress-test.js

# Executar teste de longa duração
k6 run soak-test.js

# Executar teste de picos de carga
k6 run spike-test.js

# Executar teste com métricas personalizadas
k6 run custom-metrics.js

# Gerar relatório em formato JSON
k6 run --out json=results.json load-test.js
\`\`\`

## Interpretando os Resultados

Após a execução, o k6 exibirá um resumo dos resultados no terminal, incluindo:

- Métricas de duração das requisições (min, max, média, p90, p95)
- Taxa de requisições por segundo
- Taxa de falhas
- Métricas personalizadas definidas nos scripts

Os thresholds definidos em cada teste serão verificados automaticamente, e o k6 indicará se foram atendidos ou não.

## Visualizando Resultados

Para uma análise mais detalhada, você pode exportar os resultados para formatos como JSON, CSV ou InfluxDB e visualizá-los em ferramentas como Grafana.

\`\`\`bash
# Exportar para JSON
k6 run --out json=results.json load-test.js

# Exportar para InfluxDB (requer InfluxDB configurado)
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
