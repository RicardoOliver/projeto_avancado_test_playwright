FROM mcr.microsoft.com/playwright:latest

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar o código fonte
COPY . .

# Comando padrão
CMD ["npm", "test"]
