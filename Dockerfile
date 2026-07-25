# Trocando para a versão slim (baseada em Debian) para evitar travamentos de compilação
FROM node:22-slim

WORKDIR /app

# Instala o pnpm
RUN npm install -g pnpm

# Agora o COPY vai respeitar o .dockerignore e ignorar a sua pasta node_modules local
COPY . .

# Instala as dependências (agora vai rodar liso!)
RUN pnpm install

# Faz o build do projeto
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
