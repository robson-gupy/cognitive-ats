# Dockerfile para o backend NestJS
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "run", "start:prod"] 